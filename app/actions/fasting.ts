"use server";

import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { upsertOwnedSubscription } from "@/lib/subscriptions/upsert.server";

export interface FastingState {
	success: boolean;
	error?: string;
	data?: Tables<"fasting_states">;
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
	scheduled: boolean = false,
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
			return {
				success: false,
				error: "Invalid duration. Must be 24, 48, or 72 hours",
			};
		}

		const parsedStart = new Date(startTime);
		const parsedEnd = new Date(endTime);
		if (
			Number.isNaN(parsedStart.getTime()) ||
			Number.isNaN(parsedEnd.getTime()) ||
			parsedEnd <= parsedStart
		) {
			return {
				success: false,
				error: "Invalid fasting start or end time",
			};
		}

		// The partial unique index on live states makes this insert atomic.
		const { data, error } = await supabase
			.from("fasting_states")
			.insert({
				user_id: user.id,
				is_active: !scheduled,
				start_time: parsedStart.toISOString(),
				end_time: parsedEnd.toISOString(),
				duration: duration as 24 | 48 | 72,
				scheduled: scheduled,
			})
			.select()
			.single();

		if (error) {
			if (error.code === "23505") {
				return {
					success: false,
					error: "You already have an active or scheduled fast",
				};
			}
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
	},
): Promise<FastingState> {
	try {
		if (!fastingId || !updates || typeof updates !== "object") {
			return { success: false, error: "Invalid fasting update" };
		}

		const allowedKeys = new Set([
			"is_active",
			"scheduled",
			"start_time",
			"end_time",
		]);
		if (Object.keys(updates).some((key) => !allowedKeys.has(key))) {
			return { success: false, error: "Invalid fasting update" };
		}

		const validatedUpdates: {
			is_active?: boolean;
			scheduled?: boolean;
			start_time?: string;
			end_time?: string;
			updated_at: string;
		} = {
			updated_at: new Date().toISOString(),
		};

		if (updates.is_active !== undefined) {
			if (typeof updates.is_active !== "boolean") {
				return { success: false, error: "Invalid active state" };
			}
			validatedUpdates.is_active = updates.is_active;
		}
		if (updates.scheduled !== undefined) {
			if (typeof updates.scheduled !== "boolean") {
				return { success: false, error: "Invalid scheduled state" };
			}
			validatedUpdates.scheduled = updates.scheduled;
		}
		if (updates.is_active === true && updates.scheduled === true) {
			return {
				success: false,
				error: "A fast cannot be active and scheduled at the same time",
			};
		}
		for (const key of ["start_time", "end_time"] as const) {
			const value = updates[key];
			if (value === undefined) continue;
			const parsedValue = new Date(value);
			if (typeof value !== "string" || Number.isNaN(parsedValue.getTime())) {
				return { success: false, error: "Invalid fasting time" };
			}
			validatedUpdates[key] = parsedValue.toISOString();
		}

		if (Object.keys(validatedUpdates).length === 1) {
			return { success: false, error: "No fasting changes provided" };
		}

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
			.update(validatedUpdates)
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

		let query = supabase.from("fasting_states").delete().eq("user_id", user.id);

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
			.maybeSingle();

		if (error) {
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
	nextFullMoon: string,
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

		return await upsertOwnedSubscription(supabase, {
			userId: user.id,
			subscriptionData,
			targetPhase: "Full Moon",
			nextDate: nextFullMoon,
			subscriptionType: "fasting",
		});
	} catch (error) {
		console.error("Error storing fasting subscription:", error);
		return { success: false, error: "Failed to store subscription" };
	}
}

// Unsubscribe from fasting notifications
export async function unsubscribeFastingNotifications(
	endpoint: string,
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
			return {
				success: false,
				subscribed: false,
				error: "Authentication required",
			};
		}

		// Check if user has an active fasting subscription
		const { data, error } = await supabase
			.from("subscriptions")
			.select("id")
			.eq("user_id", user.id)
			.eq("subscription_type", "fasting")
			.limit(1)
			.maybeSingle();

		if (error) {
			console.error("Error checking fasting subscription status:", error);
			return {
				success: false,
				subscribed: false,
				error: "Failed to check subscription status",
			};
		}

		return { success: true, subscribed: !!data };
	} catch (error) {
		console.error("Error checking fasting subscription status:", error);
		return {
			success: false,
			subscribed: false,
			error: "Failed to check subscription status",
		};
	}
}
