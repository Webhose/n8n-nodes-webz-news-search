import { describe, expect, it } from 'vitest';

import { buildArguments } from '../nodes/WebzNewsSearch/buildArguments';
import { parseResults } from '../nodes/WebzNewsSearch/parse';

const SAMPLE = `Query: Nvidia earnings analyst reaction
Total results: 2

--- Result 1 ---
Title: Michael Burry sends another Nvidia stock verdict to investors
URL: https://finance.yahoo.com/markets/stocks/articles/michael-burry-sends-another-nvidia-173300389.html
Published: 2026-08-30T20:33:00.000+03:00
Score: 8.6
Excerpt: Nvidia earnings beat and August 27 stock reaction The timing of Burry's move lined up with one of the most closely watched earnings reports of the year.

--- Result 2 ---
Title: The Week That Was, The Week Ahead: Macro and Markets, August 30
URL: https://markets.businessinsider.com/news/stocks/the-week-that-was-the-week-ahead-macro-and-markets-august-30-1036505004
Published: 2026-08-30T11:53:00.000+03:00
Score: 8.5
Excerpt: Adjusted earnings came in at $2.22 per share, while Nvidia forecast roughly $108 billion in revenue for the current quarter.`;

describe('parseResults', () => {
	it('parses article blocks from MCP text', () => {
		const parsed = parseResults(SAMPLE);
		expect(parsed).not.toBeNull();
		expect(parsed).toHaveLength(2);
		expect(parsed?.[0]).toMatchObject({
			title: 'Michael Burry sends another Nvidia stock verdict to investors',
			url: 'https://finance.yahoo.com/markets/stocks/articles/michael-burry-sends-another-nvidia-173300389.html',
			score: 8.6,
			query: 'Nvidia earnings analyst reaction',
			resultIndex: 1,
		});
		expect(parsed?.[0].excerpt).toContain('Nvidia earnings beat');
	});

	it('returns null for unrecognized text', () => {
		expect(parseResults('No structured results here')).toBeNull();
	});
});

describe('buildArguments', () => {
	it('maps query and limit to MCP arguments', () => {
		expect(buildArguments('climate policy', 5, {})).toEqual({
			query: 'climate policy',
			k: 5,
		});
	});

	it('omits empty filters and zero numeric defaults', () => {
		expect(
			buildArguments('climate policy', 10, {
				days: 0,
				score_gte: 0,
				language: ['english'],
				country: [],
				topic: [''],
			}),
		).toEqual({
			query: 'climate policy',
			k: 10,
			language: ['english'],
		});
	});

	it('merges additional JSON fields last', () => {
		expect(
			buildArguments('climate policy', 10, {
				language: ['english'],
				additionalFieldsJson: {
					ticker: ['NVDA'],
					score_gte: 6,
				},
			}),
		).toEqual({
			query: 'climate policy',
			k: 10,
			language: ['english'],
			ticker: ['NVDA'],
			score_gte: 6,
		});
	});
});
