import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
	getPublicFastingInfo,
	getPublicMoonSnapshot,
	getPublicNextPhase,
	listPhaseGuides,
	MOON_PHASE_NAMES,
	parseMoonDate,
	parseMoonPhaseName,
} from "@/lib/public-moon-api";

function textResult(data: unknown) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

function errorResult(message: string) {
	return {
		content: [{ type: "text" as const, text: message }],
		isError: true,
	};
}

const optionalDate = z
	.string()
	.optional()
	.describe("ISO-8601, YYYY-MM-DD, or Unix timestamp");

const handler = createMcpHandler(
	(server) => {
		server.registerTool(
			"get_current_moon_phase",
			{
				title: "Current moon phase",
				description:
					"Get the current moon phase, illumination, timing, and traditional hair-cutting advice.",
			},
			async () => textResult(getPublicMoonSnapshot(new Date())),
		);

		server.registerTool(
			"get_moon_phase",
			{
				title: "Moon phase for a date",
				description:
					"Get moon phase, illumination, nearby phases, and hair-cutting advice for a date. Omit date for now.",
				inputSchema: z.object({
					date: optionalDate,
				}),
			},
			async ({ date }) => {
				const parsed = parseMoonDate(date);
				if (!parsed.ok) {
					return errorResult(parsed.error);
				}
				return textResult(getPublicMoonSnapshot(parsed.date));
			},
		);

		server.registerTool(
			"list_hair_guides",
			{
				title: "Hair guides",
				description:
					"List all eight moon phases with traditional hair-cutting and care guidance.",
			},
			async () =>
				textResult({
					count: 8,
					phases: listPhaseGuides(),
				}),
		);

		server.registerTool(
			"get_next_moon_phase",
			{
				title: "Next moon phase",
				description: "Find the next occurrence of a named moon phase.",
				inputSchema: z.object({
					phase: z
						.string()
						.describe(
							`Moon phase name. One of: ${MOON_PHASE_NAMES.join(", ")}`,
						),
					date: optionalDate.describe(
						"Search from this date. Defaults to now.",
					),
				}),
			},
			async ({ phase, date }) => {
				const parsedPhase = parseMoonPhaseName(phase);
				if (!parsedPhase.ok) {
					return errorResult(parsedPhase.error);
				}
				const parsedDate = parseMoonDate(date);
				if (!parsedDate.ok) {
					return errorResult(parsedDate.error);
				}
				return textResult(
					getPublicNextPhase(parsedPhase.name, parsedDate.date),
				);
			},
		);

		server.registerTool(
			"get_full_moon_fasting",
			{
				title: "Full moon fasting",
				description:
					"Get the next full-moon fasting window and whether it is currently full moon.",
				inputSchema: z.object({
					date: optionalDate,
				}),
			},
			async ({ date }) => {
				const parsed = parseMoonDate(date);
				if (!parsed.ok) {
					return errorResult(parsed.error);
				}
				return textResult(getPublicFastingInfo(parsed.date));
			},
		);
	},
	{
		serverInfo: {
			name: "moonphase-hair",
			version: "1.0.0",
		},
		instructions:
			"Free public moon-phase and hair-cutting tools. No authentication required.",
	},
);

export function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
			"Access-Control-Allow-Headers":
				"Content-Type, Authorization, MCP-Protocol-Version, Accept, Last-Event-ID",
			"Access-Control-Max-Age": "86400",
		},
	});
}

export { handler as GET, handler as POST };
