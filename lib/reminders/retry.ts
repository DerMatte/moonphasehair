const MINUTE_MS = 60 * 1000;
const MAX_RETRY_MS = 6 * 60 * MINUTE_MS;

export function getNotificationRetryDelayMs(attemptCount: number): number {
	const safeAttempt = Number.isFinite(attemptCount)
		? Math.max(1, Math.floor(attemptCount))
		: 1;

	return Math.min(15 * MINUTE_MS * 2 ** (safeAttempt - 1), MAX_RETRY_MS);
}
