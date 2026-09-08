import { type NextRequest, NextResponse } from "next/server";
import { markdownContentType, wantsMarkdown } from "@/lib/accept-markdown";
import { updateSession } from "@/lib/supabase/middleware";
import { renderWebsiteMarkdown } from "@/lib/website-markdown";

export async function proxy(request: NextRequest) {
	if (
		request.method === "GET" &&
		wantsMarkdown(request.headers.get("accept"))
	) {
		const markdown = renderWebsiteMarkdown(request.nextUrl.pathname);
		if (markdown) {
			return new NextResponse(markdown, {
				status: 200,
				headers: {
					"Content-Type": markdownContentType(request.headers.get("accept")),
					Vary: "Accept",
					"Access-Control-Allow-Origin": "*",
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
				},
			});
		}
	}

	return await updateSession(request);
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - api routes that don't require auth
		 */
		"/((?!_next/static|_next/image|favicon.ico|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
