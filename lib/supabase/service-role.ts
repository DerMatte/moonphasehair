"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createServiceRoleClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url) {
		throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
	}

	if (!serviceKey) {
		throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
	}

	return createSupabaseClient(url, serviceKey, {
		auth: {
			persistSession: false,
			autoRefreshToken: false,
		},
	});
}
