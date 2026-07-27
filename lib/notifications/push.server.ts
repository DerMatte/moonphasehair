import "server-only";

import webpush from "web-push";
import type { NotificationPayload } from "@/lib/notifications/templates";

export type StoredPushSubscription = {
	endpoint: string;
	expirationTime?: number | null;
	keys: {
		auth: string;
		p256dh: string;
	};
};

let configuredVapidKey: string | null = null;

function getVapidConfig() {
	const email = process.env.VAPID_EMAIL;
	const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
	const privateKey = process.env.VAPID_PRIVATE_KEY;

	if (!email || !publicKey || !privateKey) {
		throw new Error("Push delivery is not configured");
	}

	return { email, publicKey, privateKey };
}

function configureWebPush() {
	const config = getVapidConfig();
	if (configuredVapidKey === config.publicKey) {
		return;
	}

	webpush.setVapidDetails(
		`mailto:${config.email}`,
		config.publicKey,
		config.privateKey,
	);
	configuredVapidKey = config.publicKey;
}

export function parseStoredPushSubscription(
	value: unknown,
): StoredPushSubscription | null {
	if (!value || typeof value !== "object") {
		return null;
	}

	const subscription = value as Record<string, unknown>;
	const keys =
		subscription.keys && typeof subscription.keys === "object"
			? (subscription.keys as Record<string, unknown>)
			: null;

	if (
		typeof subscription.endpoint !== "string" ||
		subscription.endpoint.length === 0 ||
		subscription.endpoint.length > 2048 ||
		!keys ||
		typeof keys.auth !== "string" ||
		keys.auth.length === 0 ||
		typeof keys.p256dh !== "string" ||
		keys.p256dh.length === 0
	) {
		return null;
	}

	return {
		endpoint: subscription.endpoint,
		expirationTime:
			typeof subscription.expirationTime === "number"
				? subscription.expirationTime
				: null,
		keys: {
			auth: keys.auth,
			p256dh: keys.p256dh,
		},
	};
}

export async function sendPushNotification(
	subscription: StoredPushSubscription,
	payload: NotificationPayload,
) {
	configureWebPush();
	await webpush.sendNotification(
		subscription,
		JSON.stringify({
			...payload,
			icon: "/favicon.ico",
			badge: "/favicon.ico",
		}),
	);
}

export function getPushErrorStatus(error: unknown): number | null {
	if (
		error &&
		typeof error === "object" &&
		"statusCode" in error &&
		typeof error.statusCode === "number"
	) {
		return error.statusCode;
	}

	return null;
}
