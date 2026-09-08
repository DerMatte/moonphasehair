import {
	publicApiError,
	publicApiJson,
	publicApiOptionsResponse,
} from "@/lib/public-api-http";
import {
	getPublicNextPhase,
	parseMoonDate,
	parseMoonPhaseName,
} from "@/lib/public-moon-api";

export function OPTIONS() {
	return publicApiOptionsResponse();
}

export function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const phase = parseMoonPhaseName(searchParams.get("phase"));
	if (!phase.ok) {
		return publicApiError(400, phase.error);
	}

	const parsed = parseMoonDate(searchParams.get("date"));
	if (!parsed.ok) {
		return publicApiError(400, parsed.error);
	}

	return publicApiJson(getPublicNextPhase(phase.name, parsed.date), {
		cacheSeconds: 300,
	});
}
