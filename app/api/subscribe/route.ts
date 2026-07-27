import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { upsertOwnedSubscription } from "@/lib/subscriptions/upsert.server";
import { createClient } from "@/lib/supabase/server";

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

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!body || typeof body !== "object") {
		return NextResponse.json(
			{ error: "Invalid subscription request" },
			{ status: 400 },
		);
	}

	const requestBody = body as Record<string, unknown>;
	if (
		typeof requestBody.targetPhase !== "string" ||
		typeof requestBody.nextDate !== "string"
	) {
		return NextResponse.json(
			{ error: "Invalid subscription request" },
			{ status: 400 },
		);
	}

	const result = await upsertOwnedSubscription(supabase, {
		userId: user.id,
		subscriptionData: requestBody.subscription,
		targetPhase: requestBody.targetPhase,
		nextDate: requestBody.nextDate,
		subscriptionType: "hair",
	});

	if (!result.success) {
		return NextResponse.json(
			{ error: result.error },
			{ status: result.error.startsWith("Invalid") ? 400 : 500 },
		);
	}

	return NextResponse.json({ success: true });
}
