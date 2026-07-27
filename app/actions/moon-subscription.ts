"use server";

import { revalidatePath } from "next/cache";
import { getNextMoonPhaseOccurrence } from "@/lib/MoonPhaseCalculator";
import { upsertOwnedSubscription } from "@/lib/subscriptions/upsert.server";
import { createClient } from "@/lib/supabase/server";

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

		// Calculate next occurrence of this phase
		const nextDate = getNextMoonPhaseOccurrence(phase);
		if (!nextDate) {
			return {
				success: false,
				error: "Unable to calculate next occurrence for this phase",
			};
		}

		return await upsertOwnedSubscription(supabase, {
			userId: user.id,
			subscriptionData,
			targetPhase: phase,
			nextDate,
			subscriptionType: "hair",
		});
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

		return { success: true };
	} catch (error) {
		console.error("Error removing moon phase subscription:", error);
		return { success: false, error: "Failed to remove subscription" };
	}
}

export async function removeUserSubscription(
	subscriptionId: string,
): Promise<SubscriptionState> {
	if (!subscriptionId) {
		return { success: false, error: "Missing subscription ID" };
	}

	try {
		const supabase = await createClient();
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
			.eq("id", subscriptionId)
			.eq("user_id", user.id);

		if (error) {
			console.error("Error removing user subscription:", error);
			return { success: false, error: "Failed to remove reminder" };
		}

		revalidatePath("/profile");
		return { success: true };
	} catch (error) {
		console.error("Error removing user subscription:", error);
		return { success: false, error: "Failed to remove reminder" };
	}
}
