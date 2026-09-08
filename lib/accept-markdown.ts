const MARKDOWN_TYPE = /(?:application|text)\/(?:x-)?markdown/i;
const APPLICATION_MARKDOWN = /application\/(?:x-)?markdown/i;

export function wantsMarkdown(accept: string | null | undefined): boolean {
	if (!accept) {
		return false;
	}

	return MARKDOWN_TYPE.test(accept);
}

export function markdownContentType(accept: string | null | undefined): string {
	if (accept && APPLICATION_MARKDOWN.test(accept)) {
		return "application/markdown; charset=utf-8";
	}

	return "text/markdown; charset=utf-8";
}
