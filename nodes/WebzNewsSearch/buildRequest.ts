import type { IDataObject } from 'n8n-workflow';

import { isListFilter, isScalarFilter, isTopLevelKey, MAX_K, MAX_QUERY_CHARS, MAX_QUERY_WORDS } from './constants';

const UNSET_NUMBERS = new Set(['days', 'domain_rank_gte', 'domain_rank_lte', 'score_gte', 'score_lte']);

function isEmptyValue(value: unknown): boolean {
	if (value === undefined || value === null) return true;
	if (typeof value === 'string') return value.trim().length === 0;
	if (Array.isArray(value)) return value.length === 0 || value.every((item) => isEmptyValue(item));
	return false;
}

function asStringList(value: unknown): string[] {
	const source = Array.isArray(value) ? value : [value];
	return source.map((item) => String(item).trim()).filter((item) => item.length > 0);
}

function asScalar(key: string, value: unknown): unknown {
	if (Array.isArray(value)) {
		const items = asStringList(value);
		if (items.length > 1) {
			throw new Error(`${key} accepts a single value.`);
		}
		return items[0];
	}
	if (typeof value === 'string') return value.trim();
	return value;
}

export function normalizeQuery(query: string): string {
	const text = (query || '').trim();
	if (!text) {
		throw new Error('query is required.');
	}
	if (text.length > MAX_QUERY_CHARS) {
		throw new Error(`query is too long: ${text.length} characters (max ${MAX_QUERY_CHARS}).`);
	}
	const words = text.split(/\s+/).length;
	if (words > MAX_QUERY_WORDS) {
		throw new Error(`query is too long: ${words} words (max ${MAX_QUERY_WORDS}).`);
	}
	return text;
}

export function publishedFromForDays(days: number, now: Date = new Date()): string {
	if (!Number.isInteger(days) || days < 0) {
		throw new Error('days must be a non-negative integer.');
	}
	const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
	utc.setUTCDate(utc.getUTCDate() - days);
	return utc.toISOString().slice(0, 10);
}

function normalizeIncoming(key: string, value: unknown): unknown {
	if (isListFilter(key)) return asStringList(value);
	if (isScalarFilter(key)) return asScalar(key, value);
	if (Array.isArray(value)) return asStringList(value);
	if (typeof value === 'string') return value.trim();
	return value;
}

function collectFilters(filters: IDataObject): IDataObject {
	const args: IDataObject = {};

	const apply = (key: string, value: unknown, omitZero: boolean) => {
		if (omitZero && UNSET_NUMBERS.has(key) && (value === 0 || value === null || value === undefined)) return;
		if (isEmptyValue(value)) return;
		const normalized = normalizeIncoming(key, value);
		if (isEmptyValue(normalized)) return;
		args[key] = normalized as IDataObject[string];
	};

	for (const [key, value] of Object.entries(filters)) {
		if (key === 'additionalFieldsJson') continue;
		apply(key, value, true);
	}

	const rawJson = filters.additionalFieldsJson;
	if (rawJson && typeof rawJson === 'object' && !Array.isArray(rawJson)) {
		for (const [key, value] of Object.entries(rawJson as IDataObject)) {
			apply(key, value, false);
		}
	}

	return args;
}

function overlappingDomains(domain: unknown, excludeDomain: unknown): string[] {
	const left = new Set(asStringList(domain));
	return asStringList(excludeDomain).filter((item) => left.has(item));
}

export function buildRequestBody(
	query: string,
	limit: number,
	additionalFilters: IDataObject = {},
	now?: Date,
): IDataObject {
	const flat = collectFilters(additionalFilters);
	let days: number | undefined;
	if ('days' in flat) {
		days = flat.days as number;
		delete flat.days;
	}

	const body: IDataObject = {
		query: normalizeQuery(query),
		k: limit,
	};
	const filters: IDataObject = {};

	for (const [key, value] of Object.entries(flat)) {
		if (key === 'filters' && value && typeof value === 'object' && !Array.isArray(value)) {
			Object.assign(filters, value);
			continue;
		}
		if (isTopLevelKey(key)) {
			body[key] = value as IDataObject[string];
			continue;
		}
		filters[key] = value as IDataObject[string];
	}

	if (days !== undefined) {
		if ('published_from' in filters) {
			throw new Error('pass either days or published_from, not both.');
		}
		filters.published_from = publishedFromForDays(days, now);
	}

	if ('domain' in filters && 'exclude_domain' in filters) {
		const overlap = overlappingDomains(filters.domain, filters.exclude_domain);
		if (overlap.length > 0) {
			throw new Error(`a domain cannot be in both domain and exclude_domain: ${overlap.sort().join(', ')}`);
		}
	}

	const k = body.k;
	if (typeof k !== 'number' || !Number.isInteger(k) || k < 1 || k > MAX_K) {
		throw new Error(`k must be an integer from 1 to ${MAX_K}.`);
	}

	const scoreGte = body.score_gte;
	const scoreLte = body.score_lte;
	if (typeof scoreGte === 'number' && typeof scoreLte === 'number' && scoreGte > scoreLte) {
		throw new Error('score_gte cannot be greater than score_lte.');
	}

	if (Object.keys(filters).length > 0) {
		body.filters = filters;
	}

	return body;
}
