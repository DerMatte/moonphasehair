"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

if (
	!process.env.VAPID_EMAIL ||
	!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
	!process.env.VAPID_PRIVATE_KEY
) {
	throw new Error("Missing VAPID environment variables");
}

webpush.setVapidDetails(
	`mailto:${process.env.VAPID_EMAIL}`,
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	process.env.VAPID_PRIVATE_KEY,
);

export async function subscribeUser(
	subscriptionData: any,
	targetPhase: string,
	nextDate: string,
	subscriptionType: "hair" | "fasting" = "hair",
) {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return { success: false, error: "Authentication required" };
		}

		// First, check if subscription exists and delete it
		await supabase
			.from("subscriptions")
			.delete()
			.eq("user_id", user.id)
			.eq("endpoint", subscriptionData.endpoint)
			.eq("subscription_type", subscriptionType);

		// Then insert the new subscription
		const { error } = await supabase.from("subscriptions").insert({
			user_id: user.id,
			endpoint: subscriptionData.endpoint,
			subscription_type: subscriptionType,
			subscription_data: subscriptionData,
			target_phase: targetPhase,
			next_date: nextDate,
		});

		if (error) {
			console.error("Error storing subscription:", error);
			return { success: false, error: "Failed to store subscription" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error storing subscription:", error);
		return { success: false, error: "Failed to store subscription" };
	}
}

export async function unsubscribeUser(
	endpoint: string,
	subscriptionType: "hair" | "fasting" = "hair",
) {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return { success: false, error: "Authentication required" };
		}

		const { error } = await supabase
			.from("subscriptions")
			.delete()
			.eq("user_id", user.id)
			.eq("endpoint", endpoint)
			.eq("subscription_type", subscriptionType);

		if (error) {
			console.error("Error removing subscription:", error);
			return { success: false, error: "Failed to remove subscription" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error removing subscription:", error);
		return { success: false, error: "Failed to remove subscription" };
	}
}

export async function sendNotification(
	subscriptionData: any,
	title: string,
	body: string,
	url?: string,
) {
	try {
		await webpush.sendNotification(
			subscriptionData,
			JSON.stringify({
				title,
				body,
				icon: "/favicon.ico",
				url: url || "/",
			}),
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
}
