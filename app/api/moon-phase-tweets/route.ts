import type { SupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { moonPhases } from "@/lib/consts";
import {
	getMoonPhaseWithTiming,
	getNextMoonPhaseOccurrence,
} from "@/lib/MoonPhaseCalculator";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { baseUrl } from "@/lib/utils";
import { postTweet } from "@/lib/x/client";

type TweetEventType =
	| "phase_change"
	| "full_moon_day"
	| "full_moon_two_days_before"
	| "new_moon_day"
	| "new_moon_two_days_before";

type TweetEvent = {
	type: TweetEventType;
	phaseName: string;
	scheduledFor: Date;
	scheduledIso: string;
	message: string;
};

const TWO_DAYS_HOURS_RANGE = {
	min: 36,
	max: 60,
};

function formatAction(action?: string) {
	if (!action) {
		return "";
	}

	return action.replace(/\s*\/\s*/g, " & ");
}

function sanitizeTweetLength(message: string): string {
	if (message.length <= 280) {
		return message;
	}

	return `${message.slice(0, 277)}...`;
}

function createPhaseChangeMessage(
	phaseName: string,
	emoji: string,
	action?: string,
) {
	const formattedAction = formatAction(action);
	const actionPart = formattedAction ? `${formattedAction}. ` : "";

	return sanitizeTweetLength(
		`${emoji} ${phaseName} phase just began. ${actionPart}Track the lunar calendar: ${baseUrl} #MoonPhaseHair`,
	);
}

function createDayOfMessage(phaseName: string, emoji: string, action?: string) {
	const formattedAction = formatAction(action);
	const actionPart = formattedAction ? `${formattedAction}. ` : "";

	return sanitizeTweetLength(
		`${emoji} It's ${phaseName} day! ${actionPart}Celebrate with us: ${baseUrl} #MoonPhaseHair`,
	);
}

function createLeadupMessage(
	phaseName: string,
	emoji: string,
	action: string | undefined,
	targetDate: Date,
) {
	const formattedDate = format(targetDate, "MMM d");
	const formattedAction = formatAction(action);
	const actionPart = formattedAction ? `${formattedAction}. ` : "";

	return sanitizeTweetLength(
		`${emoji} ${phaseName} arrives in 2 days (${formattedDate}). ${actionPart}Plan your ritual: ${baseUrl} #MoonPhaseHair`,
	);
}

function getPhaseMeta(phaseName: string) {
	return moonPhases.find((phase) => phase.name === phaseName);
}

async function eventExists(
	supabase: SupabaseClient,
	eventType: TweetEventType,
	phaseName: string,
	scheduledIso: string,
) {
	const { data, error } = await supabase
		.from("moon_phase_tweets")
		.select("id")
		.eq("event_type", eventType)
		.eq("phase_name", phaseName)
		.eq("scheduled_for", scheduledIso)
		.limit(1);

	if (error) {
		throw error;
	}

	return data && data.length > 0;
}

async function persistTweetEvent(
	supabase: SupabaseClient,
	event: TweetEvent,
	tweetId: string,
) {
	const { error } = await supabase.from("moon_phase_tweets").insert({
		event_type: event.type,
		phase_name: event.phaseName,
		scheduled_for: event.scheduledIso,
		tweet_body: event.message,
		tweet_id: tweetId,
	});

	if (error) {
		throw error;
	}
}

function withinTwoDayWindow(targetDate: Date, now: Date) {
	const diffHours = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60);
	return (
		diffHours >= TWO_DAYS_HOURS_RANGE.min &&
		diffHours <= TWO_DAYS_HOURS_RANGE.max
	);
}

export async function GET(request: NextRequest) {
	if (
		request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
	) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const supabase = createServiceRoleClient();
	const now = new Date();
	const { current } = getMoonPhaseWithTiming(now);

	const eventsToPost: TweetEvent[] = [];

	if (current?.startDate) {
		const phaseChangeIso = current.startDate.toISOString();
		let alreadyTweeted = false;

		try {
			alreadyTweeted = await eventExists(
				supabase,
				"phase_change",
				current.name,
				phaseChangeIso,
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to check existing phase change tweets";

			return NextResponse.json({ error: message }, { status: 500 });
		}

		if (!alreadyTweeted && current.startDate <= now) {
			eventsToPost.push({
				type: "phase_change",
				phaseName: current.name,
				scheduledFor: current.startDate,
				scheduledIso: phaseChangeIso,
				message: createPhaseChangeMessage(
					current.name,
					current.emoji ?? "Moon",
					current.action,
				),
			});
		}
	}

	const fullMoonUpcoming = getNextMoonPhaseOccurrence("Full Moon", now);
	const newMoonUpcoming = getNextMoonPhaseOccurrence("New Moon", now);

	if (current?.name === "Full Moon" && current.startDate) {
		const dayIso = current.startDate.toISOString();
		let alreadyTweeted = false;

		try {
			alreadyTweeted = await eventExists(
				supabase,
				"full_moon_day",
				current.name,
				dayIso,
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to check existing full moon day tweets";

			return NextResponse.json({ error: message }, { status: 500 });
		}

		if (!alreadyTweeted) {
			eventsToPost.push({
				type: "full_moon_day",
				phaseName: current.name,
				scheduledFor: current.startDate,
				scheduledIso: dayIso,
				message: createDayOfMessage(
					current.name,
					current.emoji ?? "Moon",
					current.action,
				),
			});
		}
	}

	if (current?.name === "New Moon" && current.startDate) {
		const dayIso = current.startDate.toISOString();
		let alreadyTweeted = false;

		try {
			alreadyTweeted = await eventExists(
				supabase,
				"new_moon_day",
				current.name,
				dayIso,
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to check existing new moon day tweets";

			return NextResponse.json({ error: message }, { status: 500 });
		}

		if (!alreadyTweeted) {
			eventsToPost.push({
				type: "new_moon_day",
				phaseName: current.name,
				scheduledFor: current.startDate,
				scheduledIso: dayIso,
				message: createDayOfMessage(
					current.name,
					current.emoji ?? "Moon",
					current.action,
				),
			});
		}
	}

	if (fullMoonUpcoming && withinTwoDayWindow(fullMoonUpcoming, now)) {
		const upcomingIso = fullMoonUpcoming.toISOString();
		let alreadyTweeted = false;

		try {
			alreadyTweeted = await eventExists(
				supabase,
				"full_moon_two_days_before",
				"Full Moon",
				upcomingIso,
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to check existing full moon lead-up tweets";

			return NextResponse.json({ error: message }, { status: 500 });
		}

		if (!alreadyTweeted) {
			const fullMoonMeta = getPhaseMeta("Full Moon");
			eventsToPost.push({
				type: "full_moon_two_days_before",
				phaseName: "Full Moon",
				scheduledFor: fullMoonUpcoming,
				scheduledIso: upcomingIso,
				message: createLeadupMessage(
					"Full Moon",
					fullMoonMeta?.emoji ?? "Moon",
					fullMoonMeta?.action,
					fullMoonUpcoming,
				),
			});
		}
	}

	if (newMoonUpcoming && withinTwoDayWindow(newMoonUpcoming, now)) {
		const upcomingIso = newMoonUpcoming.toISOString();
		let alreadyTweeted = false;

		try {
			alreadyTweeted = await eventExists(
				supabase,
				"new_moon_two_days_before",
				"New Moon",
				upcomingIso,
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to check existing new moon lead-up tweets";

			return NextResponse.json({ error: message }, { status: 500 });
		}

		if (!alreadyTweeted) {
			const newMoonMeta = getPhaseMeta("New Moon");
			eventsToPost.push({
				type: "new_moon_two_days_before",
				phaseName: "New Moon",
				scheduledFor: newMoonUpcoming,
				scheduledIso: upcomingIso,
				message: createLeadupMessage(
					"New Moon",
					newMoonMeta?.emoji ?? "Moon",
					newMoonMeta?.action,
					newMoonUpcoming,
				),
			});
		}
	}

	const posted: TweetEvent[] = [];
	const failures: Array<{ event: TweetEvent; error: string }> = [];

	for (const event of eventsToPost) {
		try {
			const tweet = await postTweet(event.message);
			await persistTweetEvent(supabase, event, tweet.id);
			posted.push(event);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unknown error while posting tweet";
			failures.push({ event, error: message });
		}
	}

	return NextResponse.json({
		checkedAt: now.toISOString(),
		phase: current?.name,
		attempted: eventsToPost.length,
		posted: posted.length,
		failures,
	});
}
