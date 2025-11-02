"use server";

import { TwitterApi } from "twitter-api-v2";

export type TweetResult = {
	id: string;
	text: string;
};

function getTwitterConfig() {
	const appKey = process.env.X_API_KEY;
	const appSecret = process.env.X_API_SECRET;
	const accessToken = process.env.X_ACCESS_TOKEN;
	const accessSecret = process.env.X_ACCESS_SECRET;

	if (!appKey || !appSecret || !accessToken || !accessSecret) {
		throw new Error("Missing X (Twitter) API credentials");
	}

	return { appKey, appSecret, accessToken, accessSecret };
}

export function createTwitterClient() {
	const config = getTwitterConfig();
	return new TwitterApi({
		appKey: config.appKey,
		appSecret: config.appSecret,
		accessToken: config.accessToken,
		accessSecret: config.accessSecret,
	});
}

export async function postTweet(status: string): Promise<TweetResult> {
	const client = createTwitterClient();
	const response = await client.v2.tweet(status);

	return {
		id: response.data.id,
		text: response.data.text,
	};
}
