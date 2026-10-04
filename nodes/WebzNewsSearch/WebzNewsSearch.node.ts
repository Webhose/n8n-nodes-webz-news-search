import {
	NodeApiError,
	NodeConnectionTypes,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type JsonObject,
} from 'n8n-workflow';

import { searchNews, WebzApiError } from './api';
import { buildRequestBody } from './buildRequest';
import { DEFAULT_API_URL, resolveApiUrl } from './constants';
import { mapArticles } from './mapResults';
import { PROPERTIES } from './parameters';

export class WebzNewsSearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Webz.io News Search',
		name: 'webzNewsSearch',
		subtitle: '={{$parameter["operation"]}}',
		icon: {
			light: 'file:webzNewsSearch.svg',
			dark: 'file:webzNewsSearch.dark.svg',
		},
		group: ['transform'],
		version: 1,
		description: 'Search global news with the Webz.io News Search API',
		defaults: {
			name: 'Webz.io News Search',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'webzNewsSearchApi',
				required: true,
			},
		],
		usableAsTool: true,
		properties: PROPERTIES,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('webzNewsSearchApi');
		const apiUrl = resolveApiUrl(credentials.apiUrl, DEFAULT_API_URL);

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const query = this.getNodeParameter('query', itemIndex) as string;
				const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
				const simplify = this.getNodeParameter('simplify', itemIndex, true) as boolean;
				const additionalFilters = this.getNodeParameter('additionalFilters', itemIndex, {}) as IDataObject;

				const body = buildRequestBody(query, limit, additionalFilters);
				const response = await searchNews(this, apiUrl, body);

				if (!simplify) {
					returnData.push({
						json: response,
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				for (const article of mapArticles(response, query)) {
					returnData.push({
						json: article as unknown as JsonObject,
						pairedItem: { item: itemIndex },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: items[itemIndex].json,
						error,
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				const message = error instanceof Error ? error.message : 'News Search API request failed.';
				const statusCode = error instanceof WebzApiError ? error.statusCode : undefined;
				throw new NodeApiError(
					this.getNode(),
					{
						message,
						...(statusCode ? { statusCode } : {}),
					},
					{ itemIndex },
				);
			}
		}

		return [returnData];
	}
}
