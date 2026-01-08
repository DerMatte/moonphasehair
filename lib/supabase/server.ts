import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient(): Promise<SupabaseClient> {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	// Return mock client during build when env vars are not available
	if (!supabaseUrl || !supabaseAnonKey) {
		return {
			auth: {
				getUser: async () => ({ data: { user: null }, error: null }),
				onAuthStateChange: () => ({
					data: { subscription: { unsubscribe: () => {} } },
				}),
			},
			from: () => ({
				select: () => ({
					eq: () => ({
						eq: () => ({
							eq: () => ({
								single: async () => ({ data: null, error: null }),
							}),
						}),
					}),
				}),
				insert: async () => ({ error: null }),
				delete: () => ({
					eq: () => ({
						eq: () => ({
							eq: () => ({
								eq: () => ({ error: null }),
							}),
						}),
					}),
				}),
			}),
		} as unknown as SupabaseClient;
	}

	const cookieStore = await cookies();

	return createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					for (const { name, value, options } of cookiesToSet) {
						cookieStore.set(name, value, options);
					}
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	});
}