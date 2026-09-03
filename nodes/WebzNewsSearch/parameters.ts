import type { INodeProperties } from 'n8n-workflow';

import {
	CATEGORY_OPTIONS,
	POLITICAL_BIAS_OPTIONS,
	SENTIMENT_OPTIONS,
	SORT_BY_OPTIONS,
	SOURCE_TYPE_OPTIONS,
	TRUST_CATEGORY_OPTIONS,
} from './data';

const optionalFilters: INodeProperties['options'] = [
	{
		displayName: 'Allow Multiple Chunks Per Article',
		name: 'allow_multiple_chunks_per_article',
		type: 'boolean',
		default: false,
		description:
			'Whether to return multiple chunks from the same article. When disabled, one chunk per article is returned.',
	},
	{
		displayName: 'Category',
		name: 'category',
		type: 'multiOptions',
		default: [],
		description: 'Filter by IPTC category labels',
		options: [...CATEGORY_OPTIONS],
	},
	{
		displayName: 'Country',
		name: 'country',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Country',
		},
		placeholder: 'US',
		description: 'ISO-2 country codes in uppercase, for example US, GB, IL',
	},
	{
		displayName: 'Days',
		name: 'days',
		type: 'number',
		default: 0,
		description:
			'Lookback window in days. Leave at 0 to use the server default (last 7 days) unless Search All Dates is enabled.',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Domain',
		},
		placeholder: 'cnn.com',
		description: 'Include only articles from these source domains',
	},
	{
		displayName: 'Domain Rank Greater Than or Equal',
		name: 'domain_rank_gte',
		type: 'number',
		default: 0,
		description: 'Minimum source domain rank (1-1,000,000; lower is more popular)',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Domain Rank Less Than or Equal',
		name: 'domain_rank_lte',
		type: 'number',
		default: 0,
		description: 'Maximum source domain rank (1-1,000,000; lower is more popular)',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'Exclude Domain',
		name: 'exclude_domain',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Domain',
		},
		placeholder: 'example.com',
		description: 'Exclude articles from these source domains',
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Language',
		},
		placeholder: 'english',
		description: 'Full language names, for example english, french, arabic',
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Location',
		},
		placeholder: 'paris',
		description: 'Places mentioned in articles',
	},
	{
		displayName: 'Organization',
		name: 'organization',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Organization',
		},
		placeholder: 'nvidia',
		description: 'Organizations mentioned in articles',
	},
	{
		displayName: 'Person',
		name: 'person',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Person',
		},
		placeholder: 'elon musk',
		description: 'People mentioned in articles',
	},
	{
		displayName: 'Political Bias',
		name: 'political_bias',
		type: 'multiOptions',
		default: [],
		description: 'Political bias label from trust metadata',
		options: [...POLITICAL_BIAS_OPTIONS],
	},
	{
		displayName: 'Score Greater Than or Equal',
		name: 'score_gte',
		type: 'number',
		default: 0,
		description: 'Minimum match score on a 0-10 scale. Leave at 0 to use the server default (4).',
		typeOptions: {
			minValue: 0,
			maxValue: 10,
		},
	},
	{
		displayName: 'Score Less Than or Equal',
		name: 'score_lte',
		type: 'number',
		default: 0,
		description: 'Maximum match score on a 0-10 scale',
		typeOptions: {
			minValue: 0,
			maxValue: 10,
		},
	},
	{
		displayName: 'Search All Dates',
		name: 'allow_all_dates',
		type: 'boolean',
		default: false,
		description:
			'Whether to search the full indexed coverage window instead of the default lookback period',
	},
	{
		displayName: 'Sentiment',
		name: 'sentiment',
		type: 'multiOptions',
		default: [],
		description: 'Article sentiment',
		options: [...SENTIMENT_OPTIONS],
	},
	{
		displayName: 'Sort By',
		name: 'sort_by',
		type: 'options',
		default: 'best_score',
		description: 'How to sort results',
		options: [...SORT_BY_OPTIONS],
	},
	{
		displayName: 'Source Type',
		name: 'source_type',
		type: 'multiOptions',
		default: [],
		description: 'Publisher source type from trust metadata',
		options: [...SOURCE_TYPE_OPTIONS],
	},
	{
		displayName: 'Ticker',
		name: 'ticker',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Ticker',
		},
		placeholder: 'NVDA',
		description: 'Stock ticker symbols mentioned in articles',
	},
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'string',
		default: [],
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add Topic',
		},
		placeholder: 'climate change',
		description:
			'News API topic tags. This is not the main search subject; put the search subject in Query.',
	},
	{
		displayName: 'Trust Category',
		name: 'trust_category',
		type: 'multiOptions',
		default: [],
		description: 'Trust category labels from source metadata',
		options: [...TRUST_CATEGORY_OPTIONS],
	},
	{
		displayName: 'Trust Greater Than or Equal',
		name: 'trust_gte',
		type: 'number',
		default: 0,
		description: 'Minimum trust score between 0.0 and 1.0',
		typeOptions: {
			minValue: 0,
			maxValue: 1,
		},
	},
	{
		displayName: 'Additional Fields (JSON)',
		name: 'additionalFieldsJson',
		type: 'json',
		default: {},
		description:
			'Extra MCP tool arguments merged last. Use this for new server-side filters without waiting for a node update.',
	},
];

export const PROPERTIES: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Search News',
				value: 'search',
				description: 'Search global news using Webz.io',
				action: 'Search news',
			},
		],
		default: 'search',
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		required: true,
		description:
			'Natural language search query. Put the search subject here, not in the Topic filter.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description:
			'Whether to split the MCP text response into one item per article with title, URL, published date, score, and excerpt fields',
	},
	{
		displayName: 'Additional Filters',
		name: 'additionalFilters',
		type: 'collection',
		default: {},
		placeholder: 'Add Filter',
		options: optionalFilters,
	},
];
