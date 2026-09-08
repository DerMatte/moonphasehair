const PUBLIC_EXACT_PATHS = new Set([
	"/",
	"/privacy",
	"/full-moon-fasting",
	"/developers",
	"/llms.txt",
	"/api",
	"/mcp",
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

const PUBLIC_PREFIXES = ["/auth/", "/mcp", "/.well-known/"];

export function isPublicPath(pathname: string): boolean {
	if (PUBLIC_EXACT_PATHS.has(pathname)) {
		return true;
	}

	return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
