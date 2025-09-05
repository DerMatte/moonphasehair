import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const supabase = await createClient();

	// Check if user is authenticated
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 },
		);
	}

	const { subscription, targetPhase, nextDate } = await request.json();

	// Validate required fields
	if (!subscription?.endpoint || !targetPhase || !nextDate) {
		return NextResponse.json(
			{
				error:
					"Missing required fields: subscription.endpoint, targetPhase, or nextDate",
			},
			{ status: 400 },
		);
	}

	// First, check if subscription exists and delete it
	await supabase
		.from("subscriptions")
		.delete()
		.eq("user_id", user.id)
		.eq("endpoint", subscription.endpoint)
		.eq("target_phase", targetPhase);

	// Then insert the new subscription
	const { error } = await supabase.from("subscriptions").insert({
		user_id: user.id,
		endpoint: subscription.endpoint,
		subscription_type: "hair",
		subscription_data: subscription,
		target_phase: targetPhase,
		next_date: nextDate,
	});

	if (error) {
		console.error("Error saving subscription:", error);
		return NextResponse.json(
			{ error: "Failed to save subscription" },
			{ status: 500 },
		);
	}

	return NextResponse.json({ success: true });
}
