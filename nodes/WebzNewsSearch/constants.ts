export const DEFAULT_MCP_URL = 'https://news-search-mcp.webz.io/mcp';
export const PREFERRED_TOOL_NAME = 'news_search_by_webz';
export const MCP_PROTOCOL_VERSION = '2025-06-18';
export const PACKAGE_NAME = '@webz.io/n8n-nodes-news-search';
export const PACKAGE_VERSION = '0.1.0';

export function resolveMcpUrl(value: unknown, fallback: string = DEFAULT_MCP_URL): string {
	const trimmed = typeof value === 'string' ? value.trim() : '';
	return (trimmed || fallback).replace(/\/+$/, '');
}
