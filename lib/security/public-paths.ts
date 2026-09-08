const PUBLIC_EXACT_PATHS = new Set([
	"/",
	"/privacy",
	"/full-moon-fasting",
	"/developers",
	"/llms.txt",
	"/auth/login",
	"/auth/callback",
	"/auth/auth-code-error",
	"/api/location",
	"/api/geo",
	"/api/moon-orientation",
	"/api/check-reminders",
	"/api/send-notification",
	"/api/cron/x-tweets",
]);

const PUBLIC_PREFIXES = ["/auth/", "/api/v1", "/api/mcp", "/.well-known/"];

export function isPublicPath(pathname: string): boolean {
	if (PUBLIC_EXACT_PATHS.has(pathname)) {
		return true;
	}

	return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
