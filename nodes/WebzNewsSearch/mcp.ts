import {
	NodeApiError,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestOptions,
	type JsonObject,
} from 'n8n-workflow';

import { MCP_PROTOCOL_VERSION, PACKAGE_NAME, PACKAGE_VERSION } from './constants';

const CREDENTIAL_TYPE = 'webzNewsSearchApi';

type JsonRpcResponse = {
	jsonrpc?: string;
	id?: number | string | null;
	result?: JsonObject;
	error?: {
		code?: number;
		message?: string;
		data?: unknown;
	};
};

type McpContentBlock = {
	type?: string;
	text?: string;
};

type McpCallResult = {
	content?: McpContentBlock[];
	structuredContent?: JsonObject;
	isError?: boolean;
};

type HttpResponse = {
	statusCode?: number;
	headers?: Record<string, string | string[] | undefined>;
	body?: unknown;
};

function normalizeHeaderValue(value: string | string[] | undefined): string | undefined {
	if (Array.isArray(value)) return value[0];
	return value;
}

function getSessionId(response: HttpResponse): string {
	const headers = response.headers ?? {};
	const sessionId =
		normalizeHeaderValue(headers['mcp-session-id']) ??
		normalizeHeaderValue(headers['Mcp-Session-Id']);

	if (!sessionId) {
		throw new NodeApiError(
			{ name: 'WebzNewsSearch' } as never,
			{ message: 'MCP server did not return a session id.' },
		);
	}

	return sessionId;
}

export function parseJsonRpcBody(body: unknown): JsonRpcResponse {
	if (typeof body === 'string') {
		const trimmed = body.trim();
		if (trimmed.startsWith('{')) {
			return JSON.parse(trimmed) as JsonRpcResponse;
		}

		const dataLines = trimmed
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.startsWith('data:'))
			.map((line) => line.slice(5).trim())
			.filter(Boolean);

		if (dataLines.length === 0) {
			throw new Error('Unexpected MCP response body.');
		}

		return JSON.parse(dataLines[dataLines.length - 1]) as JsonRpcResponse;
	}

	if (body && typeof body === 'object') {
		return body as JsonRpcResponse;
	}

	throw new Error('Unexpected MCP response body.');
}

function flattenToolContent(result: McpCallResult): string {
	const parts: string[] = [];

	for (const item of result.content ?? []) {
		if (typeof item?.text === 'string' && item.text.length > 0) {
			parts.push(item.text);
		}
	}

	if (parts.length > 0) return parts.join('\n');

	const structured = result.structuredContent?.result;
	if (typeof structured === 'string') return structured;

	return '';
}

async function mcpRequest(
	ctx: IExecuteFunctions,
	url: string,
	payload: JsonObject | undefined,
	sessionId?: string,
	method: 'POST' | 'DELETE' = 'POST',
): Promise<HttpResponse> {
	const headers: Record<string, string> = {
		Accept: 'application/json, text/event-stream',
		'Content-Type': 'application/json',
		'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
	};

	if (sessionId) headers['Mcp-Session-Id'] = sessionId;

	const options: IHttpRequestOptions = {
		method,
		url,
		headers,
		json: true,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	};

	if (method === 'POST' && payload !== undefined) {
		options.body = payload;
	}

	return (await ctx.helpers.httpRequestWithAuthentication.call(
		ctx,
		CREDENTIAL_TYPE,
		options,
	)) as HttpResponse;
}

function assertJsonRpcSuccess(response: HttpResponse, ctx: IExecuteFunctions): JsonRpcResponse {
	const statusCode = response.statusCode ?? 0;
	if (statusCode >= 400) {
		const body = response.body;
		const message =
			body && typeof body === 'object' && 'error_description' in body
				? String((body as JsonObject).error_description)
				: `MCP request failed with status ${statusCode}.`;
		throw new NodeApiError(ctx.getNode(), { message, statusCode });
	}

	const parsed = parseJsonRpcBody(response.body);
	if (parsed.error) {
		throw new NodeApiError(ctx.getNode(), {
			message: parsed.error.message ?? 'MCP request failed.',
			...(parsed.error.code !== undefined ? { code: parsed.error.code } : {}),
		});
	}

	return parsed;
}

export async function openSession(ctx: IExecuteFunctions, url: string): Promise<string> {
	const initResponse = await mcpRequest(ctx, url, {
		jsonrpc: '2.0',
		id: 1,
		method: 'initialize',
		params: {
			protocolVersion: MCP_PROTOCOL_VERSION,
			capabilities: {},
			clientInfo: {
				name: PACKAGE_NAME,
				version: PACKAGE_VERSION,
			},
		},
	});

	const initParsed = assertJsonRpcSuccess(initResponse, ctx);
	if (!initParsed.result) {
		throw new NodeApiError(ctx.getNode(), { message: 'MCP initialize returned no result.' });
	}

	const sessionId = getSessionId(initResponse);

	await mcpRequest(
		ctx,
		url,
		{
			jsonrpc: '2.0',
			method: 'notifications/initialized',
		},
		sessionId,
	);

	return sessionId;
}

export async function callTool(
	ctx: IExecuteFunctions,
	url: string,
	sessionId: string,
	toolName: string,
	args: IDataObject,
): Promise<string> {
	const response = await mcpRequest(
		ctx,
		url,
		{
			jsonrpc: '2.0',
			id: Date.now(),
			method: 'tools/call',
			params: {
				name: toolName,
				arguments: args as JsonObject,
			},
		},
		sessionId,
	);

	const parsed = assertJsonRpcSuccess(response, ctx);
	const result = parsed.result as McpCallResult | undefined;

	if (!result) {
		throw new NodeApiError(ctx.getNode(), { message: 'MCP tools/call returned no result.' });
	}

	if (result.isError) {
		throw new NodeApiError(ctx.getNode(), {
			message: flattenToolContent(result) || 'MCP tool call failed.',
		});
	}

	return flattenToolContent(result);
}

export async function closeSession(
	ctx: IExecuteFunctions,
	url: string,
	sessionId: string,
): Promise<void> {
	try {
		await mcpRequest(ctx, url, undefined, sessionId, 'DELETE');
	} catch {
		// Best-effort session cleanup.
	}
}
