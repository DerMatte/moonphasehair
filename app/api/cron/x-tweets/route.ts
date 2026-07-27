import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import {
	getMoonPhaseWithTiming,
	type MoonPhaseData,
} from "@/lib/MoonPhaseCalculator";
import { createAdminClient } from "@/lib/supabase/admin";
import {
	createMoonPhasePostImage,
	getMoonPhasePostImageAltText,
} from "@/lib/x/moonPhasePostImage";

const DAY_MS = 24 * 60 * 60 * 1000;
const CATCH_UP_MS = 3 * DAY_MS;
const MAX_X_IMAGE_BYTES = 5 * 1024 * 1024;
const POST_IMAGE_THEME =
	process.env.X_POST_IMAGE_THEME === "dark" ? "dark" : "brand";

type TweetType = "pre" | "noon";
type TweetPhase = Pick<
	MoonPhaseData["next"],
	"name" | "action" | "description" | "emoji" | "phaseValue"
>;

type ScheduledTweet = {
	type: TweetType;
	phase: TweetPhase;
	targetDate: Date;
	phaseDate: Date;
};

const toUtcNoon = (date: Date) =>
	new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			12,
			0,
			0,
			0,
		),
	);

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getScheduledTweets = (phaseInfo: MoonPhaseData): ScheduledTweet[] => {
	const phases = [
		{
			phase: phaseInfo.current,
			phaseDate: toUtcNoon(phaseInfo.current.startDate),
		},
		{
			phase: phaseInfo.next,
			phaseDate: toUtcNoon(phaseInfo.current.endDate),
		},
	];

	return phases.flatMap(({ phase, phaseDate }) => [
		{
			type: "pre" as const,
			phase,
			targetDate: new Date(phaseDate.getTime() - 2 * DAY_MS),
			phaseDate,
		},
		{
			type: "noon" as const,
			phase,
			targetDate: phaseDate,
			phaseDate,
		},
	]);
};

const isDue = (tweet: ScheduledTweet, now: Date) => {
	const ageMs = now.getTime() - tweet.targetDate.getTime();

	if (ageMs < 0 || ageMs > CATCH_UP_MS) return false;

	// Once the phase-day update is due, an old advance notice is no longer useful.
	return tweet.type !== "pre" || now.getTime() < tweet.phaseDate.getTime();
};

const getTimingLabel = (tweet: ScheduledTweet, now: Date) => {
	const daysUntilPhase =
		(toUtcNoon(tweet.phaseDate).getTime() - toUtcNoon(now).getTime()) / DAY_MS;

	let timing = "Moon update";
	if (tweet.type === "pre") {
		if (daysUntilPhase === 2) timing = "In 2 days";
		else if (daysUntilPhase === 1) timing = "Tomorrow";
		else if (daysUntilPhase === 0) timing = "Today";
	} else if (daysUntilPhase === 0) {
		timing = "Today's phase";
	}

	return timing;
};

const buildTweetText = (tweet: ScheduledTweet, now: Date) => {
	const { phase } = tweet;
	const timing = getTimingLabel(tweet, now);
	const prefix = `${timing}: ${phase.emoji} ${phase.name}`;
	const full = `${prefix}\n\n✂️ Hair focus\n${phase.action}\n\n${phase.description}`;
	if (full.length <= 280) return full;

	const shortened = `${prefix}\n\n✂️ Hair focus\n${phase.action}`;
	if (shortened.length <= 280) return shortened;

	return prefix;
};

const createTwitterClient = () => {
	const appKey = process.env.X_API_KEY;
	const appSecret = process.env.X_API_SECRET;
	const accessToken = process.env.X_ACCESS_TOKEN;
	const accessSecret = process.env.X_ACCESS_SECRET;

	if (!appKey || !appSecret || !accessToken || !accessSecret) {
		throw new Error("X API credentials are not configured");
	}

	return new TwitterApi({
		appKey,
		appSecret,
		accessToken,
		accessSecret,
	});
};

const getMissingEnvironment = (dryRun: boolean) => {
	const required = [
		{
			name: "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL",
			value: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
		},
		{
			name: "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY",
			value:
				process.env.SUPABASE_SECRET_KEY ??
				process.env.SUPABASE_SERVICE_ROLE_KEY,
		},
	];

	if (!dryRun) {
		required.push(
			{ name: "X_API_KEY", value: process.env.X_API_KEY },
			{ name: "X_API_SECRET", value: process.env.X_API_SECRET },
			{ name: "X_ACCESS_TOKEN", value: process.env.X_ACCESS_TOKEN },
			{ name: "X_ACCESS_SECRET", value: process.env.X_ACCESS_SECRET },
		);
	}

	return required.filter(({ value }) => !value).map(({ name }) => name);
};

const getErrorMessage = (error: unknown) =>
	error instanceof Error ? error.message : "Unknown error";

export async function GET(request: NextRequest) {
	const cronSecret = process.env.CRON_SECRET;
	if (!cronSecret) {
		return NextResponse.json(
			{ error: "CRON_SECRET is not configured" },
			{ status: 500 },
		);
	}

	if (request.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
		console.error("Unauthorized cron job attempt");
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const dryRun =
		process.env.X_TWEET_DRY_RUN === "true" ||
		request.nextUrl.searchParams.get("dryRun") === "true";
	const missingEnvironment = getMissingEnvironment(dryRun);
	if (missingEnvironment.length > 0) {
		return NextResponse.json(
			{
				error: "Cron environment is not configured",
				missing: missingEnvironment,
			},
			{ status: 500 },
		);
	}

	const now = new Date();
	const phaseInfo = getMoonPhaseWithTiming(now);
	const scheduledTweets = getScheduledTweets(phaseInfo);
	const tweetsToSend = scheduledTweets
		.filter((tweet) => isDue(tweet, now))
		.sort(
			(left, right) => left.targetDate.getTime() - right.targetDate.getTime(),
		);

	if (tweetsToSend.length === 0) {
		const nextTargets = scheduledTweets
			.filter((tweet) => tweet.targetDate.getTime() > now.getTime())
			.sort(
				(left, right) => left.targetDate.getTime() - right.targetDate.getTime(),
			)
			.map((tweet) => ({
				type: tweet.type,
				phase: tweet.phase.name,
				at: tweet.targetDate.toISOString(),
			}));

		return NextResponse.json({
			status: "idle",
			now: now.toISOString(),
			nextTargets,
		});
	}

	const supabase = createAdminClient();
	const twitterClient = dryRun ? null : createTwitterClient();
	const results: Array<Record<string, unknown>> = [];

	for (const tweet of tweetsToSend) {
		const dateKey = toDateKey(tweet.targetDate);

		const text = buildTweetText(tweet, now);
		const timing = getTimingLabel(tweet, now);
		const imageAltText = getMoonPhasePostImageAltText({
			...tweet.phase,
			phaseDate: tweet.phaseDate,
		});

		if (dryRun) {
			const { data: existing, error: lookupError } = await supabase
				.from("sent_tweets")
				.select("id")
				.eq("tweet_type", tweet.type)
				.eq("phase_name", tweet.phase.name)
				.eq("target_date", dateKey)
				.maybeSingle();

			if (lookupError) {
				results.push({
					type: tweet.type,
					phase: tweet.phase.name,
					status: "error",
					step: "dedup_lookup",
					error: lookupError.message,
				});
				continue;
			}

			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: existing ? "skipped" : "dry_run",
				...(existing
					? { reason: "already_sent" }
					: {
							text,
							image: {
								altText: imageAltText,
								dimensions: "1200x675",
								theme: POST_IMAGE_THEME,
							},
						}),
			});
			continue;
		}

		// Reserve the unique event before posting so duplicate cron invocations
		// cannot both publish it.
		const { data: reservation, error: reservationError } = await supabase
			.from("sent_tweets")
			.insert({
				tweet_type: tweet.type,
				phase_name: tweet.phase.name,
				target_date: dateKey,
			})
			.select("id")
			.single();

		if (reservationError?.code === "23505") {
			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: "skipped",
				reason: "already_sent",
			});
			continue;
		}

		if (reservationError || !reservation) {
			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: "error",
				step: "dedup_reservation",
				error: reservationError?.message ?? "Reservation returned no row",
			});
			continue;
		}

		try {
			if (!twitterClient) {
				throw new Error("X API client is not available");
			}

			const image = await createMoonPhasePostImage({
				...tweet.phase,
				phaseDate: tweet.phaseDate,
				timing,
				theme: POST_IMAGE_THEME,
			});
			if (image.byteLength > MAX_X_IMAGE_BYTES) {
				throw new Error(
					`Generated moon phase image exceeds X's 5 MB limit (${image.byteLength} bytes)`,
				);
			}

			const mediaId = await twitterClient.v2.uploadMedia(image, {
				media_type: "image/png",
				media_category: "tweet_image",
			});
			await twitterClient.v2.createMediaMetadata(mediaId, {
				alt_text: { text: imageAltText },
			});

			const response = await twitterClient.v2.tweet({
				text,
				media: { media_ids: [mediaId] },
			});
			const { error: recordError } = await supabase
				.from("sent_tweets")
				.update({ tweet_id: response.data.id })
				.eq("id", reservation.id);

			if (recordError) {
				results.push({
					type: tweet.type,
					phase: tweet.phase.name,
					status: "error",
					step: "record_post",
					id: response.data.id,
					error: recordError.message,
				});
				continue;
			}

			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: "sent",
				id: response.data.id,
			});
		} catch (error) {
			console.error("Failed to send tweet", error);
			const { error: releaseError } = await supabase
				.from("sent_tweets")
				.delete()
				.eq("id", reservation.id)
				.is("tweet_id", null);

			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: "error",
				step: "post_to_x",
				error: getErrorMessage(error),
				...(releaseError
					? { reservationReleaseError: releaseError.message }
					: {}),
			});
		}
	}

	const hasErrors = results.some((result) => result.status === "error");

	return NextResponse.json(
		{
			status: hasErrors ? "failed" : "processed",
			now: now.toISOString(),
			results,
		},
		{ status: hasErrors ? 502 : 200 },
	);
}
