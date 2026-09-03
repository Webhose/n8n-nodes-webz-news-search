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

import { buildArguments } from './buildArguments';
import { DEFAULT_MCP_URL, PREFERRED_TOOL_NAME, resolveMcpUrl } from './constants';
import { callTool, closeSession, openSession } from './mcp';
import { parseResults } from './parse';
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
		description: 'Search global news using Webz.io News Search MCP',
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
		const mcpUrl = resolveMcpUrl(credentials.mcpUrl, DEFAULT_MCP_URL);

		let sessionId: string | undefined;
		try {
			sessionId = await openSession(this, mcpUrl);

			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				try {
					const query = this.getNodeParameter('query', itemIndex) as string;
					const limit = this.getNodeParameter('limit', itemIndex, 10) as number;
					const simplify = this.getNodeParameter('simplify', itemIndex, true) as boolean;
					const additionalFilters = this.getNodeParameter('additionalFilters', itemIndex, {}) as IDataObject;

					const args = buildArguments(query, limit, additionalFilters);
					const text = await callTool(this, mcpUrl, sessionId, PREFERRED_TOOL_NAME, args);

					if (!simplify) {
						returnData.push({
							json: { result: text },
							pairedItem: { item: itemIndex },
						});
						continue;
					}

					const parsed = parseResults(text);
					if (!parsed) {
						returnData.push({
							json: { result: text },
							pairedItem: { item: itemIndex },
						});
						continue;
					}

					for (const article of parsed) {
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

					throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
				}
			}
		} finally {
			if (sessionId) {
				await closeSession(this, mcpUrl, sessionId);
			}
		}

		return [returnData];
	}
}
