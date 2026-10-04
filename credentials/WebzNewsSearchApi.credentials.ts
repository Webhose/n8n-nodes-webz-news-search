import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { DEFAULT_API_URL } from '../nodes/WebzNewsSearch/constants';

export class WebzNewsSearchApi implements ICredentialType {
	name = 'webzNewsSearchApi';
	icon = 'file:../nodes/WebzNewsSearch/webzNewsSearch.svg' as const;
	displayName = 'Webz.io News Search API';
	documentationUrl = 'https://docs.webz.io/docs/webz/news-search-api';

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
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'hidden',
			default: DEFAULT_API_URL,
			description: 'News Search API URL. Change to use a proxy or alternate deployment.',
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

	// Proves the token with one search. The API has no separate credential endpoint.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{ ($credentials.apiUrl || "' + DEFAULT_API_URL + '").trim().replace(/[/]+$/, "") }}',
			url: '',
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
			body: {
				query: 'n8n',
				k: 1,
			},
		},
	};
}
