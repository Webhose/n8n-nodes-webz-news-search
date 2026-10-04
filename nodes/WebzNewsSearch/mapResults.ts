export interface SimplifiedArticle {
	title: string;
	url: string;
	published: string;
	score: number | null;
	excerpt: string;
	query: string;
	resultIndex: number;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
	return value as Record<string, unknown>;
}

function asString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

export function mapArticles(payload: unknown, query: string): SimplifiedArticle[] {
	const body = asRecord(payload);
	if (!body) return [];

	const results = Array.isArray(body.results) ? body.results : [];
	const resolvedQuery = asString(body.query) || query;
	const articles: SimplifiedArticle[] = [];

	for (const item of results) {
		const result = asRecord(item);
		if (!result) continue;

		const article = asRecord(result.article) ?? {};
		const chunk = asRecord(result.chunk) ?? {};
		const title = asString(article.title);
		const url = asString(article.url);
		if (!title && !url) continue;

		const score = typeof result.score === 'number' && Number.isFinite(result.score) ? result.score : null;
		articles.push({
			title,
			url,
			published: asString(article.published_at),
			score,
			excerpt: asString(chunk.text),
			query: resolvedQuery,
			resultIndex: articles.length + 1,
		});
	}

	return articles;
}
