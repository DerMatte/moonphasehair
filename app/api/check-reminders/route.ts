import { createClient } from "@/lib/supabase/server";
import {
	getMoonPhaseWithTiming,
	getNextMoonPhaseOccurrence,
} from "@/lib/MoonPhaseCalculator";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	if (
		request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = await createClient();
	const today = new Date();

	// Get all subscriptions that are due for checking
	const { data: subscriptions, error } = await supabase
		.from('subscriptions')
		.select('*')
		.lte('next_date', today.toISOString());

	if (error) {
		console.error('Error fetching subscriptions:', error);
		return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
	}

	for (const subscription of subscriptions || []) {
		const reminderDate = new Date(subscription.next_date);

		// Check if we've reached the reminder date
		if (reminderDate <= today) {
			const { current } = getMoonPhaseWithTiming(today);

			// Check if the current phase matches the target phase
			if (current.name === subscription.target_phase) {
				// Send notification - target phase has arrived!
				const notificationResponse = await fetch(
					`${process.env.VERCEL_URL || "http://localhost:3000"}/api/send-notification`,
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
					console.error(
						"Failed to send notification:",
						await notificationResponse.text(),
					);
				}

				// Calculate next occurrence for continuous notifications
				const nextOccurrence = getNextMoonPhaseOccurrence(
					subscription.target_phase,
					today,
				);

				if (nextOccurrence) {
					// Update the subscription with the new date
					const { error: updateError } = await supabase
						.from('subscriptions')
						.update({ next_date: nextOccurrence.toISOString() })
						.eq('id', subscription.id);

					if (updateError) {
						console.error('Error updating subscription:', updateError);
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
						.from('subscriptions')
						.update({ next_date: nextOccurrence.toISOString() })
						.eq('id', subscription.id);

					if (updateError) {
						console.error('Error updating subscription:', updateError);
					}
				}
			}
		}
	}

	return NextResponse.json({ status: "checked", count: subscriptions?.length || 0 });
}