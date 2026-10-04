import type { IDataObject, IExecuteFunctions, JsonObject } from 'n8n-workflow';

import { USER_AGENT } from './constants';

const CREDENTIAL_TYPE = 'webzNewsSearchApi';

type HttpResponse = {
	statusCode?: number;
	body?: unknown;
};

export class WebzApiError extends Error {
	readonly statusCode?: number;

	constructor(message: string, statusCode?: number) {
		super(message);
		this.name = 'WebzApiError';
		this.statusCode = statusCode;
	}
}

function errorDetail(body: unknown, statusCode: number): string {
	if (body && typeof body === 'object') {
		const record = body as Record<string, unknown>;
		const detail = record.detail ?? record.message ?? record.error ?? record.error_description;
		if (typeof detail === 'string' && detail.trim()) return detail.trim();
		if (detail !== undefined) return JSON.stringify(detail).slice(0, 500);
	}
	if (typeof body === 'string' && body.trim()) return body.trim().slice(0, 500);
	return `News Search API request failed with status ${statusCode}.`;
}

export async function searchNews(
	ctx: IExecuteFunctions,
	url: string,
	body: IDataObject,
): Promise<JsonObject> {
	const response = (await ctx.helpers.httpRequestWithAuthentication.call(ctx, CREDENTIAL_TYPE, {
		method: 'POST',
		url,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			'User-Agent': USER_AGENT,
		},
		body,
		json: true,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	})) as HttpResponse;

	const statusCode = response.statusCode ?? 0;
	if (statusCode >= 400 || statusCode === 0) {
		throw new WebzApiError(errorDetail(response.body, statusCode), statusCode || undefined);
	}

	if (!response.body || typeof response.body !== 'object' || Array.isArray(response.body)) {
		throw new WebzApiError('News Search API response was not a JSON object.');
	}

	return response.body as JsonObject;
}
