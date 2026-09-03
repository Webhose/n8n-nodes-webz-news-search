import type { GenericValue, IDataObject } from 'n8n-workflow';

function isEmptyValue(value: unknown): boolean {
	if (value === undefined || value === null) return true;
	if (typeof value === 'string') return value.trim().length === 0;
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

function isUnsetNumber(value: unknown): boolean {
	return value === undefined || value === null || value === 0;
}

function normalizeValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		const filtered = value.filter((item) => !isEmptyValue(item));
		return filtered.length > 0 ? filtered : undefined;
	}
	return value;
}

function mergeAdditionalFilters(filters: IDataObject): IDataObject {
	const args: IDataObject = {};
	const numericDefaults = new Set([
		'days',
		'domain_rank_gte',
		'domain_rank_lte',
		'score_gte',
		'score_lte',
		'trust_gte',
	]);

	for (const [key, value] of Object.entries(filters)) {
		if (key === 'additionalFieldsJson') continue;
		const normalized = normalizeValue(value);
		if (numericDefaults.has(key) && isUnsetNumber(normalized)) continue;
		if (isEmptyValue(normalized)) continue;
		args[key] = normalized as GenericValue;
	}

	const rawJson = filters.additionalFieldsJson;
	if (rawJson && typeof rawJson === 'object' && !Array.isArray(rawJson)) {
		for (const [key, value] of Object.entries(rawJson as IDataObject)) {
			if (isEmptyValue(value)) continue;
			args[key] = value;
		}
	}

	return args;
}

export function buildArguments(
	query: string,
	limit: number,
	additionalFilters: IDataObject = {},
): IDataObject {
	return {
		query,
		k: limit,
		...mergeAdditionalFilters(additionalFilters),
	};
}
