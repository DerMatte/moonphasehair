const REDIRECT_BASE = "https://moonphasehair.invalid";
const MAX_REDIRECT_LENGTH = 2048;

export function sanitizeLocalRedirect(
	candidate: string | null | undefined,
	fallback = "/",
): string {
	if (
		!candidate ||
		candidate.length > MAX_REDIRECT_LENGTH ||
		!candidate.startsWith("/") ||
		candidate.startsWith("//") ||
		/[\u0000-\u001f\u007f]/.test(candidate)
	) {
		return fallback;
	}

	try {
		const url = new URL(candidate, REDIRECT_BASE);
		if (url.origin !== REDIRECT_BASE) {
			return fallback;
		}

		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return fallback;
	}
}
