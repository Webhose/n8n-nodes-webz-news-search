import { describe, expect, it } from 'vitest';

import type { IExecuteFunctions, IHttpRequestOptions, INodeExecutionData } from 'n8n-workflow';

import { DEFAULT_API_URL } from '../nodes/WebzNewsSearch/constants';
import { WebzNewsSearch } from '../nodes/WebzNewsSearch/WebzNewsSearch.node';

const token = process.env.WEBZ_API_TOKEN?.trim();

type Captured = { url?: string; body?: unknown };

function createContext(
	parameters: Record<string, unknown>,
	apiToken: string,
	captured: Captured,
): IExecuteFunctions {
	return {
		getInputData: () => [{ json: {} }],
		getNodeParameter(name: string, _index: number, fallback?: unknown) {
			return parameters[name] ?? fallback;
		},
		async getCredentials() {
			return { apiToken, apiUrl: DEFAULT_API_URL };
		},
		getNode() {
			return { name: 'WebzNewsSearch' } as never;
		},
		continueOnFail: () => false,
		helpers: {
			async httpRequestWithAuthentication(_credentialType: string, options: IHttpRequestOptions) {
				captured.url = options.url;
				captured.body = options.body;
				const response = await fetch(String(options.url), {
					method: options.method ?? 'GET',
					headers: {
						...(options.headers as Record<string, string>),
						Authorization: `Bearer ${apiToken}`,
					},
					body: options.body ? JSON.stringify(options.body) : undefined,
				});
				const bodyText = await response.text();
				let body: unknown = bodyText;
				try {
					body = JSON.parse(bodyText);
				} catch {
					// Keep the raw body when the response is not JSON.
				}
				return { statusCode: response.status, body };
			},
		},
	} as unknown as IExecuteFunctions;
}

describe.skipIf(!token)('live node execute', () => {
	const node = new WebzNewsSearch();

	it('returns one item per article from the REST API', async () => {
		const captured: Captured = {};
		const ctx = createContext(
			{
				query: 'Nvidia earnings analyst reaction',
				limit: 2,
				simplify: true,
				additionalFilters: { days: 7, language: ['english'] },
			},
			token as string,
			captured,
		);

		const [items] = (await node.execute.call(ctx)) as INodeExecutionData[][];
		const body = captured.body as { k?: number; filters?: { published_from?: string; language?: string[] } };

		expect(captured.url).toBe(DEFAULT_API_URL);
		expect(body.k).toBe(2);
		expect(body.filters?.language).toEqual(['english']);
		expect(body.filters?.published_from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(items.length).toBeGreaterThan(0);
		expect(items.length).toBeLessThanOrEqual(2);
		expect(items[0].json).toMatchObject({
			query: 'Nvidia earnings analyst reaction',
			resultIndex: 1,
		});
		expect(String(items[0].json.title).length).toBeGreaterThan(0);
		expect(String(items[0].json.url)).toMatch(/^https?:\/\//);
		expect(items[0].json.published).toEqual(expect.any(String));
		expect(items[0].json.score).toEqual(expect.any(Number));
		expect(String(items[0].json.excerpt).length).toBeGreaterThan(0);
	});

	it('returns the API JSON when Simplify is off', async () => {
		const captured: Captured = {};
		const ctx = createContext(
			{
				query: 'EU AI regulation',
				limit: 1,
				simplify: false,
				additionalFilters: {},
			},
			token as string,
			captured,
		);

		const [items] = (await node.execute.call(ctx)) as INodeExecutionData[][];

		expect(items).toHaveLength(1);
		expect(Array.isArray(items[0].json.results)).toBe(true);
		expect(items[0].json.query).toBe('EU AI regulation');
	});

	it('fails a bad token before returning articles', async () => {
		const captured: Captured = {};
		const ctx = createContext(
			{
				query: 'news',
				limit: 1,
				simplify: true,
				additionalFilters: {},
			},
			'not-a-real-token',
			captured,
		);

		await expect(node.execute.call(ctx)).rejects.toThrow();
	});
});
