import { getMoonPhaseWithTiming } from "@/lib/MoonPhaseCalculator";
import { kv } from "@vercel/kv";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_MS = 9 * 60 * 1000;
const SITE_URL = "https://moonphasehair.com";

type TweetType = "pre" | "noon";

const hasKvConfig = () =>
	Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

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

const isSameUtcDate = (left: Date, right: Date) =>
	left.getUTCFullYear() === right.getUTCFullYear() &&
	left.getUTCMonth() === right.getUTCMonth() &&
	left.getUTCDate() === right.getUTCDate();

const isWithinWindow = (now: Date, target: Date) =>
	Math.abs(now.getTime() - target.getTime()) <= WINDOW_MS;

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildTweetText = (
	type: TweetType,
	phase: { name: string; action: string; description: string; emoji: string },
) => {
	const prefix =
		type === "pre"
			? `In 2 days: ${phase.emoji} ${phase.name}.`
			: `Today at noon: ${phase.emoji} ${phase.name}.`;
	const full = `${prefix} Hair tip: ${phase.action}. ${phase.description} ${SITE_URL}`;
	if (full.length <= 280) return full;

	const shortened = `${prefix} Hair tip: ${phase.action}. ${SITE_URL}`;
	if (shortened.length <= 280) return shortened;

	return `${prefix} Hair tip: ${phase.action}.`;
};

const createTwitterClient = () => {
	const appKey = process.env.X_API_KEY;
	const appSecret = process.env.X_API_SECRET;
	const accessToken = process.env.X_ACCESS_TOKEN;
	const accessSecret = process.env.X_ACCESS_SECRET;

	if (!appKey || !appSecret || !accessToken || !accessSecret) {
		return null;
	}

	return new TwitterApi({
		appKey,
		appSecret,
		accessToken,
		accessSecret,
	});
};

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

	const twitterClient = createTwitterClient();
	if (!twitterClient) {
		return NextResponse.json(
			{ error: "X API credentials are not configured" },
			{ status: 500 },
		);
	}

	const now = new Date();
	const phaseInfo = getMoonPhaseWithTiming(now);
	const nextChangeNoonUtc = toUtcNoon(phaseInfo.current.endDate);
	const preTweetTarget = new Date(nextChangeNoonUtc.getTime() - 2 * DAY_MS);

	const tweetsToSend: Array<{
		type: TweetType;
		phase: typeof phaseInfo.current;
		targetDate: Date;
	}> = [];

	if (isWithinWindow(now, preTweetTarget)) {
		tweetsToSend.push({
			type: "pre",
			phase: phaseInfo.next,
			targetDate: preTweetTarget,
		});
	}

	if (isSameUtcDate(now, phaseInfo.current.startDate)) {
		const currentStartNoonUtc = toUtcNoon(phaseInfo.current.startDate);
		if (isWithinWindow(now, currentStartNoonUtc)) {
			tweetsToSend.push({
				type: "noon",
				phase: phaseInfo.current,
				targetDate: currentStartNoonUtc,
			});
		}
	} else if (isSameUtcDate(now, phaseInfo.current.endDate)) {
		if (isWithinWindow(now, nextChangeNoonUtc)) {
			tweetsToSend.push({
				type: "noon",
				phase: phaseInfo.next,
				targetDate: nextChangeNoonUtc,
			});
		}
	}

	if (tweetsToSend.length === 0) {
		return NextResponse.json({
			status: "idle",
			now: now.toISOString(),
			nextChangeNoonUtc: nextChangeNoonUtc.toISOString(),
			preTweetTarget: preTweetTarget.toISOString(),
		});
	}

	const useKv = hasKvConfig();
	const results = [];

	for (const tweet of tweetsToSend) {
		const key = `x-tweet:${tweet.type}:${tweet.phase.name}:${toDateKey(
			tweet.targetDate,
		)}`;

		if (useKv) {
			const existing = await kv.get(key);
			if (existing) {
				results.push({
					type: tweet.type,
					phase: tweet.phase.name,
					status: "skipped",
					reason: "already_sent",
				});
				continue;
			}
		}

		const text = buildTweetText(tweet.type, tweet.phase);

		if (process.env.X_TWEET_DRY_RUN === "true") {
			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: "dry_run",
				text,
			});
			continue;
		}

		try {
			const response = await twitterClient.v2.tweet(text);
			if (useKv) {
				await kv.set(key, response.data.id, { ex: 40 * 24 * 60 * 60 });
			}
			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: "sent",
				id: response.data.id,
			});
		} catch (error) {
			console.error("Failed to send tweet", error);
			results.push({
				type: tweet.type,
				phase: tweet.phase.name,
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	return NextResponse.json({
		status: "processed",
		now: now.toISOString(),
		nextChangeNoonUtc: nextChangeNoonUtc.toISOString(),
		preTweetTarget: preTweetTarget.toISOString(),
		results,
	});
}
