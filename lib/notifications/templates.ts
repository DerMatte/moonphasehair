export const FAST_DURATIONS = [24, 48, 72] as const;

export type FastDuration = (typeof FAST_DURATIONS)[number];

export type UserNotificationRequest =
	| {
			template: "test";
			endpoint: string;
			message?: string;
	  }
	| {
			template: "fast-scheduled";
			endpoint: string;
			duration: FastDuration;
			hoursUntilStart: number;
	  }
	| {
			template: "fast-completed";
			endpoint: string;
			duration: FastDuration;
	  };

export type NotificationPayload = {
	title: string;
	body: string;
	url: "/" | "/full-moon-fasting";
	tag: string;
	requireInteraction?: boolean;
};

const isFastDuration = (value: unknown): value is FastDuration =>
	typeof value === "number" && FAST_DURATIONS.includes(value as FastDuration);

export function parseUserNotificationRequest(
	value: unknown,
): UserNotificationRequest | null {
	if (!value || typeof value !== "object") {
		return null;
	}

	const request = value as Record<string, unknown>;
	if (
		typeof request.endpoint !== "string" ||
		request.endpoint.length === 0 ||
		request.endpoint.length > 2048
	) {
		return null;
	}

	switch (request.template) {
		case "test":
			if (
				request.message !== undefined &&
				(typeof request.message !== "string" || request.message.length > 160)
			) {
				return null;
			}
			return {
				template: "test",
				endpoint: request.endpoint,
				...(request.message ? { message: request.message } : {}),
			};
		case "fast-scheduled":
			if (
				!isFastDuration(request.duration) ||
				typeof request.hoursUntilStart !== "number" ||
				!Number.isInteger(request.hoursUntilStart) ||
				request.hoursUntilStart < 0 ||
				request.hoursUntilStart > 240
			) {
				return null;
			}
			return {
				template: "fast-scheduled",
				endpoint: request.endpoint,
				duration: request.duration,
				hoursUntilStart: request.hoursUntilStart,
			};
		case "fast-completed":
			if (!isFastDuration(request.duration)) {
				return null;
			}
			return {
				template: "fast-completed",
				endpoint: request.endpoint,
				duration: request.duration,
			};
		default:
			return null;
	}
}

export function buildUserNotification(
	request: UserNotificationRequest,
	environment: string | undefined = process.env.NODE_ENV,
): NotificationPayload | null {
	switch (request.template) {
		case "test":
			if (environment === "production") {
				return null;
			}
			return {
				title: "Test Notification",
				body: request.message || "Hello from Moon Hair!",
				url: "/",
				tag: "moon-phase-test",
			};
		case "fast-scheduled":
			return {
				title: "Full Moon Fast Scheduled",
				body: `Your ${request.duration}h fast will begin in ${request.hoursUntilStart} hours`,
				url: "/full-moon-fasting",
				tag: "fast-scheduled",
			};
		case "fast-completed":
			return {
				title: "Fast Completed! 🎉",
				body: `Congratulations! You've completed your ${request.duration}h full moon fast.`,
				url: "/full-moon-fasting",
				tag: "fast-completed",
			};
	}
}

export function isAllowedNotificationPath(
	value: unknown,
): value is NotificationPayload["url"] {
	return value === "/" || value === "/full-moon-fasting";
}
