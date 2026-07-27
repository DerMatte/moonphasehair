import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	isAllowedNotificationPath,
	type NotificationPayload,
} from "@/lib/notifications/templates";
import {
	getPushErrorStatus,
	parseStoredPushSubscription,
	sendPushNotification,
} from "@/lib/notifications/push.server";
import { hasValidBearerToken } from "@/lib/security/bearer";

export async function POST(request: NextRequest) {
	const apiSecret = process.env.API_SECRET;
	if (!apiSecret) {
		return NextResponse.json(
			{ error: "Notification API is not configured" },
			{ status: 503 },
		);
	}

	if (!hasValidBearerToken(request.headers.get("Authorization"), apiSecret)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const requestBody: unknown = await request.json();
		if (!requestBody || typeof requestBody !== "object") {
			return NextResponse.json(
				{ success: false, error: "Invalid notification request" },
				{ status: 400 },
			);
		}

		const body = requestBody as Record<string, unknown>;
		const subscription = parseStoredPushSubscription(body.subscription);
		const url = body.url ?? "/";
		if (
			!subscription ||
			typeof body.title !== "string" ||
			body.title.length < 1 ||
			body.title.length > 120 ||
			typeof body.body !== "string" ||
			body.body.length < 1 ||
			body.body.length > 500 ||
			!isAllowedNotificationPath(url)
		) {
			return NextResponse.json(
				{ success: false, error: "Invalid notification request" },
				{ status: 400 },
			);
		}

		const payload: NotificationPayload = {
			title: body.title,
			body: body.body,
			url,
			tag:
				typeof body.tag === "string" && body.tag.length <= 128
					? body.tag
					: "moon-phase-reminder",
			requireInteraction: true,
		};

		await sendPushNotification(subscription, payload);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error sending push notification", {
			statusCode: getPushErrorStatus(error),
		});

		return NextResponse.json(
			{
				success: false,
				error: "Failed to send notification",
			},
			{ status: 500 },
		);
	}
}
