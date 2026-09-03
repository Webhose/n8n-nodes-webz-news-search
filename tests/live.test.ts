import { describe, expect, it } from 'vitest';

import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

import { DEFAULT_MCP_URL, PREFERRED_TOOL_NAME } from '../nodes/WebzNewsSearch/constants';
import { buildArguments } from '../nodes/WebzNewsSearch/buildArguments';
import { callTool, closeSession, openSession } from '../nodes/WebzNewsSearch/mcp';

const token = process.env.WEBZ_API_TOKEN?.trim();

function createLiveContext(): IExecuteFunctions {
	return {
		getNode() {
			return { name: 'WebzNewsSearch' } as never;
		},
		helpers: {
			async httpRequestWithAuthentication(
				_credentialType: string,
				options: IHttpRequestOptions,
			): Promise<unknown> {
				const response = await fetch(options.url, {
					method: options.method ?? 'GET',
					headers: {
						...(options.headers as Record<string, string>),
						Authorization: `Bearer ${token}`,
					},
					body: options.body ? JSON.stringify(options.body) : undefined,
				});

				const bodyText = await response.text();
				let body: unknown = bodyText;
				try {
					body = JSON.parse(bodyText);
				} catch {
					// Keep raw text for SSE fallback tests.
				}

				const headers: Record<string, string> = {};
				response.headers.forEach((value, key) => {
					headers[key] = value;
				});

				return {
					statusCode: response.status,
					headers,
					body,
				};
			},
		},
	} as unknown as IExecuteFunctions;
}

describe.skipIf(!token)('live MCP smoke', () => {
	it('opens a session, searches news, and closes the session', async () => {
		const ctx = createLiveContext();
		const sessionId = await openSession(ctx, DEFAULT_MCP_URL);

		try {
			const text = await callTool(
				ctx,
				DEFAULT_MCP_URL,
				sessionId,
				PREFERRED_TOOL_NAME,
				buildArguments('Nvidia earnings analyst reaction', 2, {
					days: 7,
					language: ['english'],
				}),
			);

			expect(text).toContain('Query:');
			expect(text.length).toBeGreaterThan(20);
		} finally {
			await closeSession(ctx, DEFAULT_MCP_URL, sessionId);
		}
	});
});
