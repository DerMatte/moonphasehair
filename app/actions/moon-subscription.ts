"use server";

import { createClient } from "@/lib/supabase/server";
import { getNextMoonPhaseOccurrence } from "@/lib/MoonPhaseCalculator";
import { revalidatePath } from "next/cache";

export interface SubscriptionState {
	success: boolean;
	error?: string;
}

export async function subscribeMoonPhase(
	phase: string,
	subscriptionData: PushSubscriptionJSON,
): Promise<SubscriptionState> {
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

		// Validate required fields
		if (!subscriptionData?.endpoint || !phase) {
			return {
				success: false,
				error: "Missing required fields: subscription endpoint or phase",
			};
		}

		// Calculate next occurrence of this phase
		const nextDate = getNextMoonPhaseOccurrence(phase);
		if (!nextDate) {
			return {
				success: false,
				error: "Unable to calculate next occurrence for this phase",
			};
		}

		// First, check if subscription exists and delete it (upsert behavior)
		await supabase
			.from("subscriptions")
			.delete()
			.eq("user_id", user.id)
			.eq("endpoint", subscriptionData.endpoint)
			.eq("target_phase", phase)
			.eq("subscription_type", "hair");

		// Then insert the new subscription
		const { error } = await supabase.from("subscriptions").insert({
			user_id: user.id,
			endpoint: subscriptionData.endpoint,
			subscription_type: "hair",
			subscription_data: subscriptionData,
			target_phase: phase,
			next_date: nextDate.toISOString(),
		});

		if (error) {
			console.error("Error storing moon phase subscription:", error);
			return { success: false, error: "Failed to store subscription" };
		}

		// Revalidate the path to update the UI
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Error storing moon phase subscription:", error);
		return { success: false, error: "Failed to store subscription" };
	}
}

export async function unsubscribeMoonPhase(
	phase: string,
): Promise<SubscriptionState> {
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

		// Delete the subscription for this user and phase
		const { error } = await supabase
			.from("subscriptions")
			.delete()
			.eq("user_id", user.id)
			.eq("target_phase", phase)
			.eq("subscription_type", "hair");

		if (error) {
			console.error("Error removing moon phase subscription:", error);
			return { success: false, error: "Failed to remove subscription" };
		}

		// Revalidate the path to update the UI
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Error removing moon phase subscription:", error);
		return { success: false, error: "Failed to remove subscription" };
	}
}

export async function getSubscriptionStatus(phase: string): Promise<boolean> {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return false;
		}

		// Check if user has an active subscription for this phase
		const { data, error } = await supabase
			.from("subscriptions")
			.select("id")
			.eq("user_id", user.id)
			.eq("target_phase", phase)
			.eq("subscription_type", "hair")
			.single();

		if (error && error.code !== "PGRST116") {
			// PGRST116 is "not found" error, which is expected when no subscription exists
			console.error("Error checking subscription status:", error);
			return false;
		}

		return !!data;
	} catch (error) {
		console.error("Error checking subscription status:", error);
		return false;
	}
}

export async function getAllUserSubscriptions(): Promise<{
	success: boolean;
	data?: Array<{
		id: string;
		target_phase: string;
		next_date: string;
		subscription_type: string;
	}>;
	error?: string;
}> {
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

		// Get all subscriptions for this user
		const { data, error } = await supabase
			.from("subscriptions")
			.select("id, target_phase, next_date, subscription_type")
			.eq("user_id", user.id)
			.eq("subscription_type", "hair");

		if (error) {
			console.error("Error fetching user subscriptions:", error);
			return { success: false, error: "Failed to fetch subscriptions" };
		}

		return { success: true, data: data || [] };
	} catch (error) {
		console.error("Error fetching user subscriptions:", error);
		return { success: false, error: "Failed to fetch subscriptions" };
	}
}
