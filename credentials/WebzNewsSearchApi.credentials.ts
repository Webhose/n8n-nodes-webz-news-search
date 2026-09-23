import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { DEFAULT_MCP_URL, MCP_PROTOCOL_VERSION, PACKAGE_NAME, PACKAGE_VERSION } from '../nodes/WebzNewsSearch/constants';

export class WebzNewsSearchApi implements ICredentialType {
	name = 'webzNewsSearchApi';
	icon = 'file:../nodes/WebzNewsSearch/webzNewsSearch.svg' as const;
	displayName = 'Webz.io News Search API';
	documentationUrl = 'https://docs.webz.io/docs/webz/news-search-api-mcp';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
		},
		{
			displayName: 'MCP URL',
			name: 'mcpUrl',
			type: 'hidden',
			default: DEFAULT_MCP_URL,
			description: 'MCP endpoint URL. Change to use a proxy or alternate deployment.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ ($credentials.mcpUrl || "' + DEFAULT_MCP_URL + '").trim().replace(/[/]+$/, "") }}',
			url: '',
			method: 'POST',
			headers: {
				Accept: 'application/json, text/event-stream',
				'Content-Type': 'application/json',
				'MCP-Protocol-Version': MCP_PROTOCOL_VERSION,
			},
			body: {
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
			},
		},
	};
}
