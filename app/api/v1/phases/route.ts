import { publicApiJson, publicApiOptionsResponse } from "@/lib/public-api-http";
import { listPhaseGuides } from "@/lib/public-moon-api";

export function OPTIONS() {
	return publicApiOptionsResponse();
}

export function GET() {
	return publicApiJson(
		{
			count: 8,
			phases: listPhaseGuides(),
		},
		{ cacheSeconds: 86400 },
	);
}
