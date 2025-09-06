import webpush from "web-push";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

if (
	!process.env.VAPID_EMAIL ||
	!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
	!process.env.VAPID_PRIVATE_KEY
) {
	throw new Error("Missing VAPID environment variables");
}

const vapidEmail = process.env.VAPID_EMAIL;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidEmail || !vapidPublicKey || !vapidPrivateKey) {
	throw new Error("Missing VAPID environment variables");
}

export async function POST(request: NextRequest) {

	if (request.headers.get("Authorization") !== `Bearer ${process.env.API_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	try {
		const { subscription, title, body, url } = await request.json();

		// Validate required fields
		if (!subscription || !title || !body) {
			console.error("Missing required fields:", { subscription: !!subscription, title: !!title, body: !!body });
			return NextResponse.json(
				{ success: false, error: "Missing required fields: subscription, title, or body" },
				{ status: 400 }
			);
		}

		webpush.setVapidDetails(
			`mailto:${vapidEmail}`,
			vapidPublicKey,
			vapidPrivateKey,
		);

		console.log("Sending notification:", { title, body, url, endpoint: subscription.endpoint?.substring(0, 50) + "..." });

		await webpush.sendNotification(
			subscription,
			JSON.stringify({ 
				title, 
				body, 
				icon: "/favicon.ico",
				badge: "/favicon.ico",
				url: url || "/",
				tag: "moon-phase-reminder",
				requireInteraction: true
			}),
		);

		console.log("Notification sent successfully");
		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error sending push notification:", error);
		
		// Provide more detailed error information
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		const errorCode = (error as { statusCode?: number })?.statusCode || "UNKNOWN";
		
		return NextResponse.json({ 
			success: false, 
			error: "Failed to send notification",
			details: errorMessage,
			code: errorCode
		}, { status: 500 });
	}
}
