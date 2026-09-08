import { MOON_PHASE_NAMES, PUBLIC_API_VERSION } from "@/lib/public-moon-api";

export function getPublicApiCatalog(siteUrl: string) {
	const origin = siteUrl.replace(/\/$/, "");

	return {
		name: "Moonphase Hair API",
		version: PUBLIC_API_VERSION,
		free: true,
		authentication: "none",
		description:
			"Free public API for lunar phase timing and traditional hair-cutting advice.",
		documentation: `${origin}/developers`,
		openapi: `${origin}/api/v1/openapi`,
		mcp: `${origin}/api/mcp`,
		llms: `${origin}/llms.txt`,
		phases: MOON_PHASE_NAMES,
		endpoints: [
			{
				method: "GET",
				path: "/api/v1",
				description: "API catalog and discovery document",
			},
			{
				method: "GET",
				path: "/api/v1/moon",
				description:
					"Current or dated moon phase, hair advice, and nearby phases",
				query: {
					date: "Optional ISO-8601, YYYY-MM-DD, or Unix timestamp",
				},
			},
			{
				method: "GET",
				path: "/api/v1/phases",
				description: "All eight moon phases with hair-cutting guidance",
			},
			{
				method: "GET",
				path: "/api/v1/next",
				description: "Next occurrence of a named moon phase",
				query: {
					phase: `Required. One of: ${MOON_PHASE_NAMES.join(", ")}`,
					date: "Optional start date for the search",
				},
			},
			{
				method: "GET",
				path: "/api/v1/fasting",
				description: "Full-moon fasting window and current recommendation",
				query: {
					date: "Optional ISO-8601, YYYY-MM-DD, or Unix timestamp",
				},
			},
		],
	};
}

export function getOpenApiDocument(siteUrl: string) {
	const origin = siteUrl.replace(/\/$/, "");
	const dateParam = {
		name: "date",
		in: "query" as const,
		required: false,
		schema: { type: "string" },
		description: "ISO-8601, YYYY-MM-DD, or Unix timestamp (seconds or ms)",
	};

	return {
		openapi: "3.1.0",
		info: {
			title: "Moonphase Hair API",
			version: PUBLIC_API_VERSION,
			description:
				"Free, unauthenticated API for moon-phase timing and hair-cutting guidance.",
		},
		servers: [{ url: origin }],
		paths: {
			"/api/v1": {
				get: {
					summary: "API catalog",
					responses: { "200": { description: "Discovery document" } },
				},
			},
			"/api/v1/moon": {
				get: {
					summary: "Moon phase snapshot",
					parameters: [dateParam],
					responses: {
						"200": { description: "Current or dated moon snapshot" },
						"400": { description: "Invalid date" },
					},
				},
			},
			"/api/v1/phases": {
				get: {
					summary: "Hair guides for all phases",
					responses: { "200": { description: "Phase catalog" } },
				},
			},
			"/api/v1/next": {
				get: {
					summary: "Next named phase",
					parameters: [
						{
							name: "phase",
							in: "query" as const,
							required: true,
							schema: { type: "string", enum: [...MOON_PHASE_NAMES] },
						},
						dateParam,
					],
					responses: {
						"200": { description: "Next occurrence" },
						"400": { description: "Invalid phase or date" },
					},
				},
			},
			"/api/v1/fasting": {
				get: {
					summary: "Full moon fasting info",
					parameters: [dateParam],
					responses: { "200": { description: "Fasting recommendation" } },
				},
			},
		},
	};
}

export function resolveRequestOrigin(request: Request): string {
	const url = new URL(request.url);
	const forwardedHost = request.headers.get("x-forwarded-host");
	const forwardedProto = request.headers.get("x-forwarded-proto");
	if (forwardedHost) {
		return `${forwardedProto ?? url.protocol.replace(":", "")}://${forwardedHost}`;
	}
	return url.origin;
}
