import { createClient } from "@/lib/supabase/server";
import {
	getMoonPhaseWithTiming,
	getNextMoonPhaseOccurrence,
} from "@/lib/MoonPhaseCalculator";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	// Verify cron secret for security
	if (
		request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
	) {
		console.error("Unauthorized cron job attempt");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = await createClient();
	const today = new Date();

	console.log(`🌙 Checking moon phase reminders at ${today.toISOString()}`);

	// Get all hair (moon phase) subscriptions that are due for checking
	const { data: subscriptions, error } = await supabase
		.from("subscriptions")
		.select("*")
		.eq("subscription_type", "hair")
		.lte("next_date", today.toISOString());

	if (error) {
		console.error("Error fetching subscriptions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch subscriptions" },
			{ status: 500 },
		);
	}

	console.log(`📋 Found ${subscriptions?.length || 0} subscriptions to check`);

	let notificationsSent = 0;
	let subscriptionsUpdated = 0;

	for (const subscription of subscriptions || []) {
		const reminderDate = new Date(subscription.next_date);

		// Check if we've reached the reminder date
		if (reminderDate <= today) {
			const { current } = getMoonPhaseWithTiming(today);

			// Check if the current phase matches the target phase
			if (current.name === subscription.target_phase) {
				console.log(`🌙 ${subscription.target_phase} phase detected! Sending notification...`);
				
				// Send notification - target phase has arrived!
				const notificationResponse = await fetch(
					`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/send-notification`,
					{
						method: "POST",
						body: JSON.stringify({
							subscription: subscription.subscription_data,
							title: `${subscription.target_phase} Moon Phase is Here! 🌙`,
							body: `It's time for your ${current.name} moon phase reminder. ${current.action || "Perfect time for your moon-aligned activities!"}`,
							url: "/", // Link back to app
						}),
						headers: { "Content-Type": "application/json" },
					},
				);

				if (!notificationResponse.ok) {
					const errorText = await notificationResponse.text();
					console.error(
						`❌ Failed to send notification for ${subscription.target_phase}:`,
						errorText,
					);
				} else {
					console.log(`✅ Notification sent successfully for ${subscription.target_phase}`);
					notificationsSent++;
				}

				// Calculate next occurrence for continuous notifications
				const nextOccurrence = getNextMoonPhaseOccurrence(
					subscription.target_phase,
					today,
				);

				if (nextOccurrence) {
					// Update the subscription with the new date
					const { error: updateError } = await supabase
						.from("subscriptions")
						.update({ next_date: nextOccurrence.toISOString() })
						.eq("id", subscription.id);

					if (updateError) {
						console.error(`❌ Error updating subscription for ${subscription.target_phase}:`, updateError);
					} else {
						console.log(`📅 Updated ${subscription.target_phase} subscription to next occurrence: ${nextOccurrence.toISOString()}`);
						subscriptionsUpdated++;
					}
				}
			} else {
				// If we've passed the date but phase doesn't match, recalculate
				const nextOccurrence = getNextMoonPhaseOccurrence(
					subscription.target_phase,
					today,
				);
				if (nextOccurrence) {
					// Update the subscription with the new date
					const { error: updateError } = await supabase
						.from("subscriptions")
						.update({ next_date: nextOccurrence.toISOString() })
						.eq("id", subscription.id);

					if (updateError) {
						console.error(`❌ Error recalculating subscription for ${subscription.target_phase}:`, updateError);
					} else {
						console.log(`🔄 Recalculated ${subscription.target_phase} subscription to: ${nextOccurrence.toISOString()}`);
						subscriptionsUpdated++;
					}
				}
			}
		}
	}

	console.log(`✅ Cron job completed: ${notificationsSent} notifications sent, ${subscriptionsUpdated} subscriptions updated`);

	return NextResponse.json({
		status: "checked",
		count: subscriptions?.length || 0,
		notificationsSent,
		subscriptionsUpdated,
	});
}
