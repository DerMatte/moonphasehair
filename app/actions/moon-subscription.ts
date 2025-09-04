"use server";

import { createClient } from "@/lib/supabase/server";
import { getNextMoonPhaseOccurrence } from "@/lib/MoonPhaseCalculator";
import { revalidatePath } from "next/cache";

export type SubscriptionState = {
	phase: string;
	subscribed: boolean;
	loading?: boolean;
};

export async function subscribeMoonPhase(
	phase: string,
	subscription: any,
): Promise<{ success: boolean; error?: string }> {
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

		// Calculate next occurrence date
		const nextDate = getNextMoonPhaseOccurrence(phase, new Date());
		const nextDateString =
			nextDate?.toISOString() ||
			new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

		// First, check if subscription exists and delete it
		await supabase
			.from("subscriptions")
			.delete()
			.eq("user_id", user.id)
			.eq("endpoint", subscription.endpoint)
			.eq("target_phase", phase);

		// Then insert the new subscription
		const { error } = await supabase.from("subscriptions").insert({
			user_id: user.id,
			endpoint: subscription.endpoint,
			subscription_type: "moon_phase",
			subscription_data: subscription,
			target_phase: phase,
			next_date: nextDateString,
		});

		if (error) {
			console.error("Error saving subscription:", error);
			return { success: false, error: "Failed to save subscription" };
		}

		// Revalidate the page to show updated state
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Error in subscribeMoonPhase:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}

export async function unsubscribeMoonPhase(
	phase: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const supabase = await createClient();
		
		// Check if user is authenticated
		const { data: { user }, error: authError } = await supabase.auth.getUser();
		if (authError || !user) {
			return { success: false, error: "Authentication required" };
		}

		// Delete the subscription
		const { error } = await supabase
			.from('subscriptions')
			.delete()
			.eq('user_id', user.id)
			.eq('target_phase', phase)
			.eq('subscription_type', 'moon_phase');

		if (error) {
			console.error('Error removing subscription:', error);
			return { success: false, error: 'Failed to remove subscription' };
		}

		// Revalidate the page to show updated state
		revalidatePath('/');
		
		return { success: true };
	} catch (error) {
		console.error('Error in unsubscribeMoonPhase:', error);
		return { success: false, error: 'An unexpected error occurred' };
	}
}

export async function getSubscriptionStatus(phase: string): Promise<boolean> {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return false;

		const { data } = await supabase
			.from("subscriptions")
			.select("id")
			.eq("user_id", user.id)
			.eq("target_phase", phase)
			.eq("subscription_type", "moon_phase")
			.single();

		return !!data;
	} catch (error) {
		return false;
	}
}

export async function getAllUserSubscriptions(): Promise<string[]> {
	try {
		const supabase = await createClient();
		
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) return [];

		const { data, error } = await supabase
			.from('subscriptions')
			.select('target_phase')
			.eq('user_id', user.id)
			.eq('subscription_type', 'moon_phase');

		if (error) {
			console.error('Error fetching subscriptions:', error);
			return [];
		}

		return data?.map(sub => sub.target_phase) || [];
	} catch (error) {
		console.error('Error in getAllUserSubscriptions:', error);
		return [];
	}
}
