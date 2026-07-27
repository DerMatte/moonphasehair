import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	getMoonPhaseWithTiming,
	getNextMoonPhaseOccurrence,
} from "@/lib/MoonPhaseCalculator";
import {
	getPushErrorStatus,
	parseStoredPushSubscription,
	sendPushNotification,
} from "@/lib/notifications/push.server";
import type { NotificationPayload } from "@/lib/notifications/templates";
import { getNotificationRetryDelayMs } from "@/lib/reminders/retry";
import { hasValidBearerToken } from "@/lib/security/bearer";
import { createAdminClient } from "@/lib/supabase/admin";

const BATCH_SIZE = 50;
const CLAIM_LEASE_SECONDS = 15 * 60;

type ClaimedDelivery = {
	delivery_id: string;
	subscription_id: string;
	subscription_type: "hair" | "fasting";
	subscription_data: unknown;
	target_phase: string;
	scheduled_for: string;
	attempt_count: number;
};

function isClaimedDelivery(value: unknown): value is ClaimedDelivery {
	if (!value || typeof value !== "object") {
		return false;
	}

	const delivery = value as Record<string, unknown>;
	return (
		typeof delivery.delivery_id === "string" &&
		typeof delivery.subscription_id === "string" &&
		(delivery.subscription_type === "hair" ||
			delivery.subscription_type === "fasting") &&
		typeof delivery.target_phase === "string" &&
		typeof delivery.scheduled_for === "string" &&
		typeof delivery.attempt_count === "number"
	);
}

function buildReminderPayload(
	delivery: ClaimedDelivery,
	action: string | undefined,
): NotificationPayload {
	if (delivery.subscription_type === "fasting") {
		return {
			title: "Full Moon Fasting Time! 🌙",
			body: `The Full Moon has arrived - perfect time for your fasting practice! ${action || "Time to cleanse and reset."}`,
			url: "/full-moon-fasting",
			tag: `moon-reminder-${delivery.delivery_id}`,
			requireInteraction: true,
		};
	}

	return {
		title: `${delivery.target_phase} Moon Phase is Here! 🌙`,
		body: `It's time for your ${delivery.target_phase} moon phase reminder. ${action || "Perfect time for your moon-aligned activities!"}`,
		url: "/",
		tag: `moon-reminder-${delivery.delivery_id}`,
		requireInteraction: true,
	};
}

export async function GET(request: NextRequest) {
	const cronSecret = process.env.CRON_SECRET;
	if (!cronSecret) {
		return NextResponse.json(
			{ error: "Reminder cron is not configured" },
			{ status: 503 },
		);
	}

	if (!hasValidBearerToken(request.headers.get("Authorization"), cronSecret)) {
		console.error("Unauthorized reminder cron attempt");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const now = new Date();
	const supabase = createAdminClient();
	const { data: claimedRows, error: claimError } = await supabase.rpc(
		"claim_due_notifications",
		{
			p_now: now.toISOString(),
			p_limit: BATCH_SIZE,
			p_lease_seconds: CLAIM_LEASE_SECONDS,
		},
	);

	if (claimError) {
		console.error("Unable to claim due reminders", {
			code: claimError.code,
		});
		return NextResponse.json(
			{ error: "Failed to claim due reminders" },
			{ status: 500 },
		);
	}

	const deliveries = Array.isArray(claimedRows)
		? (claimedRows as unknown[]).filter(isClaimedDelivery)
		: [];
	const { current } = getMoonPhaseWithTiming(now);
	const results: Array<Record<string, unknown>> = [];

	for (const delivery of deliveries) {
		const nextOccurrence = getNextMoonPhaseOccurrence(
			delivery.target_phase,
			now,
		);

		if (!nextOccurrence) {
			await recordFailure(
				supabase,
				delivery,
				now,
				"Unable to calculate next occurrence",
			);
			results.push({
				deliveryId: delivery.delivery_id,
				status: "failed",
				reason: "invalid_phase",
			});
			continue;
		}

		if (current.name !== delivery.target_phase) {
			const { error } = await supabase.rpc("complete_notification_delivery", {
				p_delivery_id: delivery.delivery_id,
				p_next_date: nextOccurrence.toISOString(),
				p_outcome: "skipped",
			});
			results.push({
				deliveryId: delivery.delivery_id,
				status: error ? "failed" : "skipped",
				...(error ? { reason: "completion_write_failed" } : {}),
			});
			continue;
		}

		const subscription = parseStoredPushSubscription(
			delivery.subscription_data,
		);
		if (!subscription) {
			await recordFailure(
				supabase,
				delivery,
				now,
				"Stored push subscription is invalid",
			);
			results.push({
				deliveryId: delivery.delivery_id,
				status: "failed",
				reason: "invalid_subscription",
			});
			continue;
		}

		try {
			await sendPushNotification(
				subscription,
				buildReminderPayload(delivery, current.action),
			);

			const { error: completeError } = await supabase.rpc(
				"complete_notification_delivery",
				{
					p_delivery_id: delivery.delivery_id,
					p_next_date: nextOccurrence.toISOString(),
					p_outcome: "sent",
				},
			);

			if (completeError) {
				console.error("Reminder sent but completion could not be recorded", {
					deliveryId: delivery.delivery_id,
					code: completeError.code,
				});
				results.push({
					deliveryId: delivery.delivery_id,
					status: "failed",
					reason: "completion_write_failed",
				});
			} else {
				results.push({
					deliveryId: delivery.delivery_id,
					status: "sent",
				});
			}
		} catch (error) {
			const statusCode = getPushErrorStatus(error);
			if (statusCode === 404 || statusCode === 410) {
				const { error: deleteError } = await supabase
					.from("subscriptions")
					.delete()
					.eq("id", delivery.subscription_id);
				results.push({
					deliveryId: delivery.delivery_id,
					status: deleteError ? "failed" : "expired",
					...(deleteError ? { reason: "subscription_cleanup_failed" } : {}),
				});
				continue;
			}

			await recordFailure(supabase, delivery, now, "Push delivery failed");
			console.error("Push reminder delivery failed", {
				deliveryId: delivery.delivery_id,
				statusCode,
			});
			results.push({
				deliveryId: delivery.delivery_id,
				status: "failed",
				reason: "push_delivery_failed",
			});
		}
	}

	const failed = results.filter((result) => result.status === "failed").length;
	return NextResponse.json(
		{
			status: failed > 0 ? "partial" : "processed",
			claimed: deliveries.length,
			failed,
			results,
		},
		{ status: failed > 0 ? 502 : 200 },
	);
}

async function recordFailure(
	supabase: ReturnType<typeof createAdminClient>,
	delivery: ClaimedDelivery,
	now: Date,
	message: string,
) {
	const retryAt = new Date(
		now.getTime() + getNotificationRetryDelayMs(delivery.attempt_count),
	);
	const { error } = await supabase.rpc("fail_notification_delivery", {
		p_delivery_id: delivery.delivery_id,
		p_error: message,
		p_retry_at: retryAt.toISOString(),
	});

	if (error) {
		console.error("Unable to record reminder failure", {
			deliveryId: delivery.delivery_id,
			code: error.code,
		});
	}
}
