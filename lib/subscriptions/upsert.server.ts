import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { moonPhases } from "@/lib/consts";
import { parseStoredPushSubscription } from "@/lib/notifications/push.server";

export type SubscriptionType = "hair" | "fasting";

type UpsertOwnedSubscriptionInput = {
	userId: string;
	subscriptionData: unknown;
	targetPhase: string;
	nextDate: string | Date;
	subscriptionType: SubscriptionType;
};

const validPhases = new Set(moonPhases.map((phase) => phase.name));

export async function upsertOwnedSubscription(
	supabase: SupabaseClient,
	input: UpsertOwnedSubscriptionInput,
): Promise<{ success: true } | { success: false; error: string }> {
	const subscription = parseStoredPushSubscription(input.subscriptionData);
	const nextDate =
		input.nextDate instanceof Date ? input.nextDate : new Date(input.nextDate);

	if (
		!subscription ||
		!validPhases.has(input.targetPhase) ||
		Number.isNaN(nextDate.getTime())
	) {
		return { success: false, error: "Invalid subscription details" };
	}

	if (
		input.subscriptionType === "fasting" &&
		input.targetPhase !== "Full Moon"
	) {
		return { success: false, error: "Invalid fasting reminder phase" };
	}

	const { error } = await supabase.from("subscriptions").upsert(
		{
			user_id: input.userId,
			endpoint: subscription.endpoint,
			subscription_type: input.subscriptionType,
			subscription_data: subscription,
			target_phase: input.targetPhase,
			next_date: nextDate.toISOString(),
			updated_at: new Date().toISOString(),
		},
		{
			onConflict: "user_id,endpoint,target_phase,subscription_type",
		},
	);

	if (error) {
		console.error("Error storing subscription", { code: error.code });
		return { success: false, error: "Failed to store subscription" };
	}

	return { success: true };
}
