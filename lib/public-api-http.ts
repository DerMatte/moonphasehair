export const PUBLIC_API_CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Allow-Headers":
		"Content-Type, Authorization, MCP-Protocol-Version, Accept",
	"Access-Control-Max-Age": "86400",
} as const;

export function publicApiOptionsResponse() {
	return new Response(null, {
		status: 204,
		headers: PUBLIC_API_CORS_HEADERS,
	});
}

export function publicApiJson(
	data: unknown,
	init?: {
		status?: number;
		cacheSeconds?: number;
	},
) {
	const status = init?.status ?? 200;
	const cacheSeconds = init?.cacheSeconds ?? 300;
	const headers: Record<string, string> = {
		...PUBLIC_API_CORS_HEADERS,
	};

	if (status >= 400) {
		headers["Cache-Control"] = "no-store";
	} else {
		headers["Cache-Control"] =
			`public, s-maxage=${cacheSeconds}, stale-while-revalidate=3600`;
	}

	return Response.json(data, { status, headers });
}

export function publicApiError(status: number, error: string) {
	return publicApiJson({ error }, { status });
}
