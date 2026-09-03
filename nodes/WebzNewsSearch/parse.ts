export interface ParsedArticle {
	title: string;
	url: string;
	published: string;
	score: number | null;
	excerpt: string;
	query: string;
	resultIndex: number;
}

const RESULT_DELIMITER = /^--- Result \d+ ---$/m;

function parseHeaderLine(line: string): { key: string; value: string } | null {
	const match = line.match(/^([^:]+):\s*(.*)$/);
	if (!match) return null;
	return { key: match[1].trim(), value: match[2].trim() };
}

function parseScore(value: string): number | null {
	const parsed = Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function parseResultBlock(block: string, query: string, resultIndex: number): ParsedArticle | null {
	const lines = block.split('\n').filter((line) => line.trim().length > 0);
	if (lines.length === 0) return null;

	let title = '';
	let url = '';
	let published = '';
	let score: number | null = null;
	const excerptLines: string[] = [];
	let inExcerpt = false;

	for (const line of lines) {
		if (inExcerpt) {
			excerptLines.push(line);
			continue;
		}

		const parsed = parseHeaderLine(line);
		if (!parsed) continue;

		switch (parsed.key.toLowerCase()) {
			case 'title':
				title = parsed.value;
				break;
			case 'url':
				url = parsed.value;
				break;
			case 'published':
				published = parsed.value;
				break;
			case 'score':
				score = parseScore(parsed.value);
				break;
			case 'excerpt':
				if (parsed.value.length > 0) excerptLines.push(parsed.value);
				inExcerpt = true;
				break;
		}
	}

	if (!title && !url) return null;

	return {
		title,
		url,
		published,
		score,
		excerpt: excerptLines.join('\n').trim(),
		query,
		resultIndex,
	};
}

export function extractQuery(text: string): string {
	const match = text.match(/^Query:\s*(.+)$/m);
	return match?.[1]?.trim() ?? '';
}

export function parseResults(text: string): ParsedArticle[] | null {
	if (!RESULT_DELIMITER.test(text)) return null;

	const query = extractQuery(text);
	const parts = text.split(RESULT_DELIMITER);
	const articles: ParsedArticle[] = [];

	for (let i = 1; i < parts.length; i++) {
		const article = parseResultBlock(parts[i], query, i);
		if (article) articles.push(article);
	}

	return articles.length > 0 ? articles : null;
}
