import {
	publicApiError,
	publicApiJson,
	publicApiOptionsResponse,
} from "@/lib/public-api-http";
import { getPublicMoonSnapshot, parseMoonDate } from "@/lib/public-moon-api";

export function OPTIONS() {
	return publicApiOptionsResponse();
}

export function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const parsed = parseMoonDate(searchParams.get("date"));

	if (!parsed.ok) {
		return publicApiError(400, parsed.error);
	}

	return publicApiJson(getPublicMoonSnapshot(parsed.date), {
		cacheSeconds: searchParams.get("date") ? 3600 : 300,
	});
}
