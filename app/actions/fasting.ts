"use server";

import { createClient } from "@/lib/supabase/server";

export interface FastingState {
	success: boolean;
	error?: string;
	data?: {
		id: string;
		user_id: string;
		is_active: boolean;
		start_time: string | null;
		end_time: string | null;
		duration: number | null;
		scheduled: boolean;
		created_at: string;
		updated_at: string;
	};
}

export interface FastingSubscriptionState {
	success: boolean;
	error?: string;
}

// Start a fasting session
export async function startFasting(
	startTime: string,
	endTime: string,
	duration: number,
	scheduled: boolean = false
): Promise<FastingState> {
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

		// Validate duration
		if (![24, 48, 72].includes(duration)) {
			return { success: false, error: "Invalid duration. Must be 24, 48, or 72 hours" };
		}

		// Check if user already has an active or scheduled fast
		const { data: existingFast, error: checkError } = await supabase
			.from("fasting_states")
			.select("*")
			.eq("user_id", user.id)
			.or("is_active.eq.true,scheduled.eq.true")
			.single();

		if (checkError && checkError.code !== "PGRST116") {
			console.error("Error checking existing fast:", checkError);
			return { success: false, error: "Failed to check existing fast" };
		}

		if (existingFast) {
			return { 
				success: false, 
				error: existingFast.is_active ? "You already have an active fast" : "You already have a scheduled fast" 
			};
		}

		// Create new fasting state
		const { data, error } = await supabase
			.from("fasting_states")
			.insert({
				user_id: user.id,
				is_active: !scheduled,
				start_time: startTime,
				end_time: endTime,
				duration: duration,
				scheduled: scheduled,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating fasting state:", error);
			return { success: false, error: "Failed to start fast" };
		}

		return { success: true, data };
	} catch (error) {
		console.error("Error starting fast:", error);
		return { success: false, error: "Failed to start fast" };
	}
}

// Update fasting session (e.g., activate a scheduled fast)
export async function updateFasting(
	fastingId: string,
	updates: {
		is_active?: boolean;
		scheduled?: boolean;
		start_time?: string;
		end_time?: string;
	}
): Promise<FastingState> {
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

		// Update the fasting state
		const { data, error } = await supabase
			.from("fasting_states")
			.update({
				...updates,
				updated_at: new Date().toISOString(),
			})
			.eq("id", fastingId)
			.eq("user_id", user.id) // Ensure user can only update their own fasts
			.select()
			.single();

		if (error) {
			console.error("Error updating fasting state:", error);
			return { success: false, error: "Failed to update fast" };
		}

		return { success: true, data };
	} catch (error) {
		console.error("Error updating fast:", error);
		return { success: false, error: "Failed to update fast" };
	}
}

// Stop/Cancel fasting session
export async function stopFasting(fastingId?: string): Promise<FastingState> {
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

		let query = supabase
			.from("fasting_states")
			.delete()
			.eq("user_id", user.id);

		if (fastingId) {
			query = query.eq("id", fastingId);
		} else {
			// Delete any active or scheduled fast for this user
			query = query.or("is_active.eq.true,scheduled.eq.true");
		}

		const { error } = await query;

		if (error) {
			console.error("Error stopping fasting state:", error);
			return { success: false, error: "Failed to stop fast" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error stopping fast:", error);
		return { success: false, error: "Failed to stop fast" };
	}
}

// Get current fasting state for user
export async function getCurrentFasting(): Promise<FastingState> {
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

		// Get current active or scheduled fast
		const { data, error } = await supabase
			.from("fasting_states")
			.select("*")
			.eq("user_id", user.id)
			.or("is_active.eq.true,scheduled.eq.true")
			.single();

		if (error && error.code !== "PGRST116") {
			console.error("Error fetching fasting state:", error);
			return { success: false, error: "Failed to fetch fasting state" };
		}

		if (!data) {
			return { success: true, data: undefined };
		}

		return { success: true, data };
	} catch (error) {
		console.error("Error fetching fasting state:", error);
		return { success: false, error: "Failed to fetch fasting state" };
	}
}

// Subscribe to fasting notifications
export async function subscribeFastingNotifications(
	subscriptionData: PushSubscriptionJSON,
	nextFullMoon: string
): Promise<FastingSubscriptionState> {
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
		if (!subscriptionData?.endpoint || !nextFullMoon) {
			return {
				success: false,
				error: "Missing required fields: subscription endpoint or next full moon date",
			};
		}

		// First, check if subscription exists and delete it (upsert behavior)
		await supabase
			.from("subscriptions")
			.delete()
			.eq("user_id", user.id)
			.eq("endpoint", subscriptionData.endpoint)
			.eq("target_phase", "Full Moon")
			.eq("subscription_type", "fasting");

		// Then insert the new subscription
		const { error } = await supabase.from("subscriptions").insert({
			user_id: user.id,
			endpoint: subscriptionData.endpoint,
			subscription_type: "fasting",
			subscription_data: subscriptionData,
			target_phase: "Full Moon",
			next_date: nextFullMoon,
		});

		if (error) {
			console.error("Error storing fasting subscription:", error);
			return { success: false, error: "Failed to store subscription" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error storing fasting subscription:", error);
		return { success: false, error: "Failed to store subscription" };
	}
}

// Unsubscribe from fasting notifications
export async function unsubscribeFastingNotifications(
	endpoint: string
): Promise<FastingSubscriptionState> {
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

		// Delete the subscription for this user and endpoint
		const { error } = await supabase
			.from("subscriptions")
			.delete()
			.eq("user_id", user.id)
			.eq("endpoint", endpoint)
			.eq("subscription_type", "fasting");

		if (error) {
			console.error("Error removing fasting subscription:", error);
			return { success: false, error: "Failed to remove subscription" };
		}

		return { success: true };
	} catch (error) {
		console.error("Error removing fasting subscription:", error);
		return { success: false, error: "Failed to remove subscription" };
	}
}

// Get fasting subscription status
export async function getFastingSubscriptionStatus(): Promise<{
	success: boolean;
	subscribed: boolean;
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
			return { success: false, subscribed: false, error: "Authentication required" };
		}

		// Check if user has an active fasting subscription
		const { data, error } = await supabase
			.from("subscriptions")
			.select("id")
			.eq("user_id", user.id)
			.eq("subscription_type", "fasting")
			.single();

		if (error && error.code !== "PGRST116") {
			// PGRST116 is "not found" error, which is expected when no subscription exists
			console.error("Error checking fasting subscription status:", error);
			return { success: false, subscribed: false, error: "Failed to check subscription status" };
		}

		return { success: true, subscribed: !!data };
	} catch (error) {
		console.error("Error checking fasting subscription status:", error);
		return { success: false, subscribed: false, error: "Failed to check subscription status" };
	}
}
