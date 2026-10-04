import { describe, expect, it } from 'vitest';

import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';

import { searchNews } from '../nodes/WebzNewsSearch/api';
import { buildRequestBody } from '../nodes/WebzNewsSearch/buildRequest';
import { DEFAULT_API_URL } from '../nodes/WebzNewsSearch/constants';
import { mapArticles } from '../nodes/WebzNewsSearch/mapResults';

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
					// Keep the raw body when the response is not JSON.
				}

				return {
					statusCode: response.status,
					body,
				};
			},
		},
	} as unknown as IExecuteFunctions;
}

describe.skipIf(!token)('live News Search API smoke', () => {
	it('posts a search and maps articles', async () => {
		const ctx = createLiveContext();
		const body = buildRequestBody('Nvidia earnings analyst reaction', 2, {
			days: 7,
			language: ['english'],
		});
		const response = await searchNews(ctx, DEFAULT_API_URL, body);
		const articles = mapArticles(response, 'Nvidia earnings analyst reaction');

		expect(Array.isArray(response.results)).toBe(true);
		expect(articles.length).toBeGreaterThan(0);
		expect(articles[0].title.length).toBeGreaterThan(0);
		expect(articles[0].url).toMatch(/^https?:\/\//);
	});
});
