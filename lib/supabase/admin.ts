import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
	const supabaseUrl =
		process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseSecret =
		process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !supabaseSecret) {
		throw new Error("Supabase admin credentials are not configured");
	}

	return createClient(supabaseUrl, supabaseSecret, {
		auth: {
			autoRefreshToken: false,
			persistSession: false,
		},
	});
}
