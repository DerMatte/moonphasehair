import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { getSupabasePublicEnv } from "./env";

export function createClient() {
	const { key, url } = getSupabasePublicEnv();
	return createBrowserClient<Database>(url, key);
}
