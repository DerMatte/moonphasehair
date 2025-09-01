import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const supabase = await createClient();
	
	// Check if user is authenticated
	const { data: { user }, error: authError } = await supabase.auth.getUser();
	if (authError || !user) {
		return NextResponse.json(
			{ error: "Authentication required" },
			{ status: 401 }
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

	// Store in Supabase
	const { error } = await supabase
		.from('subscriptions')
		.upsert({
			user_id: user.id,
			endpoint: subscription.endpoint,
			subscription_type: 'moon_phase',
			subscription_data: subscription,
			target_phase: targetPhase,
			next_date: nextDate,
		}, {
			onConflict: 'user_id,endpoint'
		});

	if (error) {
		console.error('Error saving subscription:', error);
		return NextResponse.json(
			{ error: 'Failed to save subscription' },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true });
}
