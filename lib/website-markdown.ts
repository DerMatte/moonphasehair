import {
	getPublicFastingInfo,
	getPublicMoonSnapshot,
	listPhaseGuides,
} from "@/lib/public-moon-api";

function normalizePath(pathname: string): string {
	if (pathname.length > 1 && pathname.endsWith("/")) {
		return pathname.slice(0, -1);
	}
	return pathname;
}

function formatPhaseBlock(
	title: string,
	phase: {
		name: string;
		emoji: string;
		action: string;
		description: string;
		startDate?: string;
		endDate?: string;
		date?: string;
	},
) {
	const lines = [
		`## ${title}: ${phase.emoji} ${phase.name}`,
		"",
		`**Hair advice:** ${phase.action}`,
		"",
		phase.description,
	];

	if (phase.startDate && phase.endDate) {
		lines.push("", `- Starts: ${phase.startDate}`, `- Ends: ${phase.endDate}`);
	}

	if (phase.date) {
		lines.push("", `- Date: ${phase.date}`);
	}

	return lines.join("\n");
}

function homeMarkdown(date = new Date()): string {
	const snapshot = getPublicMoonSnapshot(date);
	const illumination = Math.round(snapshot.current.illumination * 100);

	return [
		"# Moonphase Hair",
		"",
		"Cut your hair according to the phase of the moon.",
		"",
		formatPhaseBlock("Current phase", snapshot.current),
		"",
		`- Lunar age: ${snapshot.current.lunarAge.toFixed(2)} days`,
		`- Illumination: ${illumination}%`,
		"",
		formatPhaseBlock("Next phase", snapshot.next),
		"",
		formatPhaseBlock("Previous phase", snapshot.previous),
		"",
		"## Upcoming",
		"",
		...snapshot.upcoming.flatMap((phase) => [
			`- ${phase.emoji} **${phase.name}** (${phase.date}): ${phase.action}`,
		]),
		"",
		"## All hair guides",
		"",
		...listPhaseGuides().flatMap((phase) => [
			`- ${phase.emoji} **${phase.name}**: ${phase.action} — ${phase.description}`,
		]),
		"",
		"## Machine access",
		"",
		"- JSON API: `/api`",
		"- MCP: `/mcp`",
		"- Markdown: send `Accept: text/markdown` or `Accept: application/markdown`",
	].join("\n");
}

function developersMarkdown(): string {
	return [
		"# API & MCP",
		"",
		"Free public access. No API key. CORS is open.",
		"",
		"## REST",
		"",
		"`GET /api`",
		"",
		"Optional `?date=` as ISO-8601, YYYY-MM-DD, or a Unix timestamp.",
		"",
		"## MCP",
		"",
		"Separate Streamable HTTP server at `/mcp`.",
		"",
		"Tools:",
		"",
		"- `get_current_moon_phase`",
		"- `get_moon_phase`",
		"- `list_hair_guides`",
		"- `get_next_moon_phase`",
		"- `get_full_moon_fasting`",
		"",
		"```json",
		"{",
		'  "mcpServers": {',
		'    "moonphase-hair": {',
		'      "url": "https://<your-domain>/mcp"',
		"    }",
		"  }",
		"}",
		"```",
		"",
		"## Website as Markdown",
		"",
		"Any public page can be fetched as Markdown:",
		"",
		"```",
		"curl -H 'Accept: text/markdown' /",
		"curl -H 'Accept: application/markdown' /developers",
		"```",
	].join("\n");
}

function fastingMarkdown(date = new Date()): string {
	const fasting = getPublicFastingInfo(date);

	return [
		"# Full Moon Fasting",
		"",
		"Align a short fast with the lunar cycle.",
		"",
		`- Current phase: ${fasting.currentPhase}`,
		`- Full moon now: ${fasting.isFullMoon ? "yes" : "no"}`,
		`- Next full moon: ${fasting.nextFullMoon ?? "unknown"}`,
		"",
		fasting.recommendation,
		"",
		"## Why people fast at the full moon",
		"",
		"- Enhanced detoxification around the lunar peak",
		"- Mental clarity",
		"- Hormonal rhythm",
		"- Older fasting traditions tied to the full moon",
	].join("\n");
}

function privacyMarkdown(): string {
	return [
		"# Privacy Policy",
		"",
		"This page describes the data flows currently implemented in Moonphase Hair. It is a product description, not a legal guarantee.",
		"",
		"Last updated: July 27, 2026",
		"",
		"## Account Data",
		"",
		"If you sign in with Google or X, the app receives account information made available by that provider, such as your name, email address, and profile picture. Supabase provides authentication and stores the account record used by the app.",
		"",
		"## Approximate Location",
		"",
		"Vercel request headers can provide city, country, region, timezone, latitude, and longitude. The app uses these values to display an approximate location and orient the moon visualization. The application code does not write these location values to its account, reminder, or fasting database records.",
		"",
		"## Reminders & Push Notifications",
		"",
		"When you enable a reminder, the app stores the browser push endpoint and subscription data, the reminder type, the selected moon phase, and the next scheduled date.",
		"",
		"## Fasting Activity",
		"",
		"If you start or schedule a fast, the app stores its start and end times, duration, active or scheduled status, and the account that created it.",
		"",
		"## Analytics",
		"",
		"The app uses Vercel Analytics to understand page usage and product interactions.",
		"",
		"## Service Providers",
		"",
		"The current app relies on Vercel for hosting and analytics, Supabase for authentication and database storage, and Google or X when you choose that provider to sign in.",
	].join("\n");
}

export function renderWebsiteMarkdown(pathname: string): string | null {
	switch (normalizePath(pathname)) {
		case "/":
			return homeMarkdown();
		case "/developers":
			return developersMarkdown();
		case "/full-moon-fasting":
			return fastingMarkdown();
		case "/privacy":
			return privacyMarkdown();
		default:
			return null;
	}
}
