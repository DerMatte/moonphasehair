"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveFastingState(
	isActive: boolean,
	startTime: string | null,
	endTime: string | null,
	duration: number,
	scheduled: boolean,
) {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return { success: false, error: "Authentication required" };
		}

		// Check if there's an existing active fasting state
		const { data: existingState } = await supabase
			.from("fasting_states")
			.select("id")
			.eq("user_id", user.id)
			.eq("is_active", true)
			.single();

		if (existingState) {
			// Update existing state
			const { error } = await supabase
				.from("fasting_states")
				.update({
					is_active: isActive,
					start_time: startTime,
					end_time: endTime,
					duration: duration,
					scheduled: scheduled,
					updated_at: new Date().toISOString(),
				})
				.eq("id", existingState.id);

			if (error) {
				console.error("Error updating fasting state:", error);
				return { success: false, error: "Failed to update fasting state" };
			}
		} else {
			// Create new state
			const { error } = await supabase.from("fasting_states").insert({
				user_id: user.id,
				is_active: isActive,
				start_time: startTime,
				end_time: endTime,
				duration: duration,
				scheduled: scheduled,
			});

			if (error) {
				console.error("Error creating fasting state:", error);
				return { success: false, error: "Failed to save fasting state" };
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Error saving fasting state:", error);
		return { success: false, error: "Failed to save fasting state" };
	}
}

export async function getFastingState() {
	try {
		const supabase = await createClient();

		// Check if user is authenticated
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser();
		if (authError || !user) {
			return { success: false, error: "Authentication required", data: null };
		}

		const { data, error } = await supabase
			.from("fasting_states")
			.select("*")
			.eq("user_id", user.id)
			.eq("is_active", true)
			.single();

		if (error && error.code !== "PGRST116") {
			// PGRST116 is "no rows returned"
			console.error("Error fetching fasting state:", error);
			return {
				success: false,
				error: "Failed to fetch fasting state",
				data: null,
			};
		}

		return { success: true, data };
	} catch (error) {
		console.error("Error fetching fasting state:", error);
		return {
			success: false,
			error: "Failed to fetch fasting state",
			data: null,
		};
	}
}
