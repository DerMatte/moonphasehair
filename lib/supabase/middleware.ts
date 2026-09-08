import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/database.types";
import { isPublicPath } from "@/lib/security/public-paths";
import { getSupabasePublicEnv } from "./env";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});
	const { key, url } = getSupabasePublicEnv();

	const supabase = createServerClient<Database>(url, key, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}
				supabaseResponse = NextResponse.next({
					request,
				});
				for (const { name, value, options } of cookiesToSet) {
					supabaseResponse.cookies.set(name, value, options);
				}
			},
		},
	});

	// IMPORTANT: DO NOT REMOVE auth.getUser()
	// This will refresh session if expired - required for Server Components
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const pathname = request.nextUrl.pathname;
	const isPublicRoute = isPublicPath(pathname);

	// If user is not authenticated and trying to access a protected route
	if (!user && !isPublicRoute) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth/login";
		return NextResponse.redirect(url);
	}

	return supabaseResponse;
}
