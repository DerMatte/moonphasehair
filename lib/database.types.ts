export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			subscriptions: {
				Row: {
					id: string;
					user_id: string;
					endpoint: string;
					subscription_type: "hair" | "fasting";
					subscription_data: Json;
					target_phase: string;
					next_date: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					endpoint: string;
					subscription_type?: "hair" | "fasting";
					subscription_data: Json;
					target_phase: string;
					next_date: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					endpoint?: string;
					subscription_type?: "hair" | "fasting";
					subscription_data?: Json;
					target_phase?: string;
					next_date?: string;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			fasting_states: {
				Row: {
					id: string;
					user_id: string;
					is_active: boolean;
					start_time: string | null;
					end_time: string | null;
					duration: 24 | 48 | 72 | null;
					scheduled: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					is_active?: boolean;
					start_time?: string | null;
					end_time?: string | null;
					duration?: 24 | 48 | 72 | null;
					scheduled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					is_active?: boolean;
					start_time?: string | null;
					end_time?: string | null;
					duration?: 24 | 48 | 72 | null;
					scheduled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			profiles: {
				Row: {
					id: string;
					email: string | null;
					full_name: string | null;
					avatar_url: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					email?: string | null;
					full_name?: string | null;
					avatar_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string | null;
					full_name?: string | null;
					avatar_url?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			sent_tweets: {
				Row: {
					id: string;
					tweet_type: "pre" | "noon";
					phase_name: string;
					target_date: string;
					tweet_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					tweet_type: "pre" | "noon";
					phase_name: string;
					target_date: string;
					tweet_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					tweet_type?: "pre" | "noon";
					phase_name?: string;
					target_date?: string;
					tweet_id?: string | null;
					created_at?: string;
				};
				Relationships: [];
			};
			notification_deliveries: {
				Row: {
					id: string;
					subscription_id: string;
					scheduled_for: string;
					status: "pending" | "processing" | "failed" | "sent" | "skipped";
					attempt_count: number;
					next_attempt_at: string;
					claimed_at: string | null;
					processed_at: string | null;
					last_error: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					subscription_id: string;
					scheduled_for: string;
					status?: "pending" | "processing" | "failed" | "sent" | "skipped";
					attempt_count?: number;
					next_attempt_at?: string;
					claimed_at?: string | null;
					processed_at?: string | null;
					last_error?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					subscription_id?: string;
					scheduled_for?: string;
					status?: "pending" | "processing" | "failed" | "sent" | "skipped";
					attempt_count?: number;
					next_attempt_at?: string;
					claimed_at?: string | null;
					processed_at?: string | null;
					last_error?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: Record<never, never>;
		Functions: {
			claim_due_notifications: {
				Args: {
					p_now?: string;
					p_limit?: number;
					p_lease_seconds?: number;
				};
				Returns: Array<{
					delivery_id: string;
					subscription_id: string;
					subscription_type: "hair" | "fasting";
					subscription_data: Json;
					target_phase: string;
					scheduled_for: string;
					attempt_count: number;
				}>;
			};
			complete_notification_delivery: {
				Args: {
					p_delivery_id: string;
					p_next_date: string;
					p_outcome: "sent" | "skipped";
				};
				Returns: boolean;
			};
			fail_notification_delivery: {
				Args: {
					p_delivery_id: string;
					p_error: string;
					p_retry_at: string;
				};
				Returns: boolean;
			};
		};
		Enums: Record<never, never>;
		CompositeTypes: Record<never, never>;
	};
};

export type Tables<TableName extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][TableName]["Row"];
