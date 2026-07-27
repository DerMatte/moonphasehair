export function getSupabasePublicEnv() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!url || !key) {
		throw new Error("Supabase public environment variables are not configured");
	}

	return { key, url };
}
