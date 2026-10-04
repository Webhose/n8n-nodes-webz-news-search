export const DEFAULT_API_URL = 'https://api.webz.io/api/news/context';
export const PACKAGE_NAME = 'n8n-nodes-webz-news-search';
export const PACKAGE_VERSION = '0.2.0';
export const USER_AGENT = `${PACKAGE_NAME}/${PACKAGE_VERSION}`;

export const MAX_QUERY_CHARS = 750;
export const MAX_QUERY_WORDS = 100;
export const MAX_K = 100;

export const TOP_LEVEL_KEYS = [
	'k',
	'score_gte',
	'score_lte',
	'allow_multiple_chunks_per_article',
] as const;

export const LIST_FILTERS = [
	'language',
	'country',
	'category',
	'sentiment',
	'domain',
	'exclude_domain',
	'topic',
	'person',
	'organization',
	'location',
	'ticker',
	'political_bias',
] as const;

export const SCALAR_FILTERS = [
	'published_from',
	'published_to',
	'trust_category',
	'source_type',
	'domain_rank_gte',
	'domain_rank_lte',
] as const;

const TOP_LEVEL = new Set<string>(TOP_LEVEL_KEYS);
const LIST = new Set<string>(LIST_FILTERS);
const SCALAR = new Set<string>(SCALAR_FILTERS);

export function resolveApiUrl(value: unknown, fallback: string = DEFAULT_API_URL): string {
	const trimmed = typeof value === 'string' ? value.trim() : '';
	return (trimmed || fallback).replace(/\/+$/, '');
}

export function isTopLevelKey(key: string): boolean {
	return TOP_LEVEL.has(key);
}

export function isListFilter(key: string): boolean {
	return LIST.has(key);
}

export function isScalarFilter(key: string): boolean {
	return SCALAR.has(key);
}
