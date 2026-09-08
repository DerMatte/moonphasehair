import {
	getOpenApiDocument,
	resolveRequestOrigin,
} from "@/lib/public-api-catalog";
import { publicApiJson, publicApiOptionsResponse } from "@/lib/public-api-http";

export function OPTIONS() {
	return publicApiOptionsResponse();
}

export function GET(request: Request) {
	return publicApiJson(getOpenApiDocument(resolveRequestOrigin(request)), {
		cacheSeconds: 86400,
	});
}
