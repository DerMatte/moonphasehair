"use server";

import {
	buildUserNotification,
	parseUserNotificationRequest,
	type UserNotificationRequest,
} from "@/lib/notifications/templates";
import {
	getPushErrorStatus,
	parseStoredPushSubscription,
	sendPushNotification,
} from "@/lib/notifications/push.server";
import { createClient } from "@/lib/supabase/server";

export async function sendNotification(request: UserNotificationRequest) {
	try {
		const parsedRequest = parseUserNotificationRequest(request);
		if (!parsedRequest) {
			return { success: false, error: "Invalid notification request" };
		}

		const payload = buildUserNotification(parsedRequest);
		if (!payload) {
			return { success: false, error: "Notification template unavailable" };
		}

		const supabase = await createClient();
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return { success: false, error: "Authentication required" };
		}

		const { data: ownedSubscription, error: subscriptionError } = await supabase
			.from("subscriptions")
			.select("subscription_data")
			.eq("user_id", user.id)
			.eq("endpoint", parsedRequest.endpoint)
			.limit(1)
			.maybeSingle();

		if (subscriptionError || !ownedSubscription) {
			return { success: false, error: "Owned subscription not found" };
		}

		const subscription = parseStoredPushSubscription(
			ownedSubscription.subscription_data,
		);
		if (!subscription) {
			return { success: false, error: "Stored subscription is invalid" };
		}

		await sendPushNotification(subscription, payload);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification", {
			statusCode: getPushErrorStatus(error),
		});
		return { success: false, error: "Failed to send notification" };
	}
}
