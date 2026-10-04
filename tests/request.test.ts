import { describe, expect, it } from 'vitest';

import { buildRequestBody, publishedFromForDays } from '../nodes/WebzNewsSearch/buildRequest';
import { mapArticles } from '../nodes/WebzNewsSearch/mapResults';

const NOW = new Date(Date.UTC(2026, 8, 30, 1, 0, 0));

const SAMPLE = {
	query: 'Nvidia earnings analyst reaction',
	total_results: 2,
	results: [
		{
			score: 8.6,
			article: {
				title: 'Michael Burry sends another Nvidia stock verdict to investors',
				url: 'https://finance.yahoo.com/example',
				published_at: '2026-08-30T20:33:00.000+03:00',
			},
			chunk: { text: 'Nvidia earnings beat and August 27 stock reaction' },
		},
		{
			score: 8.5,
			article: {
				title: 'The Week That Was',
				url: 'https://markets.businessinsider.com/example',
				published_at: '2026-08-30T11:53:00.000+03:00',
			},
			chunk: { text: 'Adjusted earnings came in at $2.22 per share.' },
		},
	],
};

describe('mapArticles', () => {
	it('maps REST results to one article per item', () => {
		const parsed = mapArticles(SAMPLE, 'fallback query');
		expect(parsed).toHaveLength(2);
		expect(parsed[0]).toEqual({
			title: 'Michael Burry sends another Nvidia stock verdict to investors',
			url: 'https://finance.yahoo.com/example',
			published: '2026-08-30T20:33:00.000+03:00',
			score: 8.6,
			excerpt: 'Nvidia earnings beat and August 27 stock reaction',
			query: 'Nvidia earnings analyst reaction',
			resultIndex: 1,
		});
	});

	it('returns an empty list when the response has no results', () => {
		expect(mapArticles({ results: [] }, 'q')).toEqual([]);
		expect(mapArticles('not json', 'q')).toEqual([]);
	});
});

describe('buildRequestBody', () => {
	it('maps query and limit to the REST body', () => {
		expect(buildRequestBody('climate policy', 5, {})).toEqual({
			query: 'climate policy',
			k: 5,
		});
	});

	it('nests list filters and drops empty values', () => {
		expect(
			buildRequestBody('climate policy', 10, {
				days: 0,
				score_gte: 0,
				language: ['english'],
				country: [],
				topic: [''],
			}),
		).toEqual({
			query: 'climate policy',
			k: 10,
			filters: {
				language: ['english'],
			},
		});
	});

	it('turns days into published_from and keeps top-level score bounds', () => {
		expect(
			buildRequestBody(
				'climate policy',
				10,
				{
					days: 7,
					language: 'english',
					additionalFieldsJson: {
						ticker: ['NVDA'],
						score_gte: 6,
					},
				},
				NOW,
			),
		).toEqual({
			query: 'climate policy',
			k: 10,
			score_gte: 6,
			filters: {
				language: ['english'],
				ticker: ['NVDA'],
				published_from: '2026-09-23',
			},
		});
	});

	it('sends source_type as a single value', () => {
		expect(
			buildRequestBody('climate policy', 5, {
				source_type: 'newsroom',
				trust_category: 'trusted_news',
			}),
		).toEqual({
			query: 'climate policy',
			k: 5,
			filters: {
				source_type: 'newsroom',
				trust_category: 'trusted_news',
			},
		});
	});

	it('rejects days together with published_from', () => {
		expect(() =>
			buildRequestBody('climate policy', 5, {
				days: 7,
				additionalFieldsJson: { published_from: '2026-09-01' },
			}),
		).toThrow(/either days or published_from/);
	});

	it('rejects a domain listed in both filters', () => {
		expect(() =>
			buildRequestBody('climate policy', 5, {
				domain: ['cnn.com'],
				exclude_domain: ['cnn.com', 'example.com'],
			}),
		).toThrow(/cnn.com/);
	});
});

describe('publishedFromForDays', () => {
	it('uses the UTC date', () => {
		expect(publishedFromForDays(7, NOW)).toBe('2026-09-23');
		expect(publishedFromForDays(0, NOW)).toBe('2026-09-30');
		expect(() => publishedFromForDays(-1, NOW)).toThrow(/non-negative/);
	});
});
