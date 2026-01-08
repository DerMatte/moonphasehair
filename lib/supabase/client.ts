import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
	// Return cached client if available
	if (supabaseClient) {
		return supabaseClient;
	}

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		// During SSR/build, return a mock client that does nothing
		// This is safe because client components using Supabase
		// will only actually call methods after hydration
		if (typeof window === "undefined") {
			return {
				auth: {
					getUser: async () => ({ data: { user: null }, error: null }),
					onAuthStateChange: () => ({
						data: { subscription: { unsubscribe: () => {} } },
					}),
				},
			} as unknown as SupabaseClient;
		}
		throw new Error(
			"Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
		);
	}

	supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
	return supabaseClient;
}
