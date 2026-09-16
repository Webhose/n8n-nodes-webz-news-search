# n8n-nodes-webz-news-search

**Search global news with [Webz.io](https://webz.io) from n8n - standalone workflows, structured output, and AI agent tools.**

This community node talks to the hosted Webz.io News Search MCP server at `https://news-search-mcp.webz.io/mcp`. It runs without an LLM in the loop, splits each article into its own item, and can also be attached to an AI Agent as a tool.

Maintained by [Webz.io](https://webz.io) at [github.com/Webhose/webz-news-search](https://github.com/Webhose/webz-news-search).

## What you get

- Semantic news search in natural language
- One output item per article with `title`, `url`, `published`, `score`, and `excerpt`
- Optional filters for language, country, ticker, sentiment, category, and more
- Live MCP tool schema on the server side, with a JSON escape hatch for new filters
- `usableAsTool: true` for AI Agent workflows on self-hosted n8n

## Install

In n8n, open **Settings → Community nodes → Install**, then enter:

```
n8n-nodes-webz-news-search
```

Or install locally while developing:

```bash
cd packages/n8n-node
npm install
npm run build
```

Then point n8n at the built package:

```bash
export N8N_CUSTOM_EXTENSIONS=/path/to/webz-news-search/packages/n8n-node/dist
```

## Credentials

Create a **Webz.io News Search API** credential and paste your Webz.io API token from https://webz.io. The credential test calls MCP `initialize` only, so it does not consume search credits.

## Direct search (no agent required)

1. Add a **Webz.io News Search** node to your workflow.
2. Set **Query** to a natural language search, for example `Nvidia earnings analyst reaction`.
3. Optionally open **Additional Filters** for language, country, ticker, days, and the rest.
4. Leave **Simplify** enabled to get one item per article.

Each simplified item looks like:

```json
{
  "title": "Michael Burry sends another Nvidia stock verdict to investors",
  "url": "https://finance.yahoo.com/...",
  "published": "2026-08-30T20:33:00.000+03:00",
  "score": 8.6,
  "excerpt": "Nvidia earnings beat and August 27 stock reaction...",
  "query": "Nvidia earnings analyst reaction",
  "resultIndex": 1
}
```

Turn **Simplify** off if you want the raw MCP text blob in a single `{ "result": "..." }` item.

## With an AI Agent

The node is marked `usableAsTool: true`. On self-hosted n8n, set:

```bash
N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true
```

Then connect **Webz.io News Search** to an **AI Agent** node's tool input the same way you would connect Brave Search or another community tool node.

For agent-first workflows without structured output, the built-in **MCP Client Tool** node in [`../../n8n/README.md`](../../n8n/README.md) is still a good fit.

## How it works

The node opens one MCP session per execution, calls `news_search_by_webz`, parses the formatted text response, and closes the session. It uses n8n's own HTTP helpers only, with zero runtime npm dependencies, so it can be submitted for n8n verification.

New filters added on the server can be passed through **Additional Filters → Additional Fields (JSON)** without waiting for a node update.

## Configuration

| Setting | Where | Default |
| --- | --- | --- |
| API token | n8n credential | required |
| MCP URL | hidden credential field | `https://news-search-mcp.webz.io/mcp` |

## Publishing and verification

n8n requires verified community nodes to be published from GitHub Actions with an npm provenance statement. This package uses [.github/workflows/publish-n8n-node.yml](../../.github/workflows/publish-n8n-node.yml) with npm Trusted Publishers (no long-lived token).

### One-time npm setup

On [npmjs.com/package/n8n-nodes-webz-news-search](https://www.npmjs.com/package/n8n-nodes-webz-news-search) → **Settings** → **Publish access** → **Trusted Publishers** → **Add a publisher**:

| Field | Value |
| --- | --- |
| Repository owner | `Webhose` |
| Repository name | `webz-news-search` |
| Workflow filename | `publish-n8n-node.yml` |
| Environment name | leave blank |
| Allowed actions | `npm publish` |

Use the workflow **filename**, not the workflow display name. If publish fails with `OIDC permission denied for this action`, confirm **Allowed actions** includes `npm publish` and that **Environment name** is blank unless the workflow sets one.

### Publish a new version

After the Trusted Publisher is configured, dispatch the workflow from the repo **Actions** tab or run:

```bash
gh workflow run publish-n8n-node.yml
```

The workflow bumps the patch version, runs build/lint/tests, stages the package on npm with provenance, commits the version bump, and creates a GitHub release.

If your Trusted Publisher allows only `npm stage publish`, approve the staged version on [npmjs.com](https://www.npmjs.com/package/n8n-nodes-webz-news-search) with 2FA before it becomes installable.

### Submit for verification

When `@n8n/scan-community-package n8n-nodes-webz-news-search` passes, submit the package in the [n8n Creator Portal](https://creators.n8n.io/) for verification.

## Development

```bash
npm install
npm run build
npm run lint
npm test
```

Live smoke tests run when `WEBZ_API_TOKEN` is set:

```bash
export WEBZ_API_TOKEN=your-token
npm test
```

## Links

- [Webz.io](https://webz.io)
- [News Search MCP documentation](https://docs.webz.io/docs/webz/news-search-api-mcp)
- [MCP server landing page](https://news-search-mcp.webz.io)
- [News Search API filters](https://docs.webz.io/docs/webz/news-search-api-filters)
- [n8n community node docs](https://docs.n8n.io/integrations/community-nodes/)
- [GitHub](https://github.com/Webhose/webz-news-search)
