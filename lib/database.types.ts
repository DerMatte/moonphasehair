export type Database = {
	public: {
		Tables: {
			subscriptions: {
				Row: {
					id: string;
					user_id: string | null;
					endpoint: string;
					subscription_type: string;
					subscription_data: any;
					target_phase: string;
					next_date: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id?: string | null;
					endpoint: string;
					subscription_type: string;
					subscription_data: any;
					target_phase: string;
					next_date: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string | null;
					endpoint?: string;
					subscription_type?: string;
					subscription_data?: any;
					target_phase?: string;
					next_date?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			fasting_states: {
				Row: {
					id: string;
					user_id: string | null;
					is_active: boolean;
					start_time: string;
					end_time: string | null;
					duration: number | null;
					scheduled: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id?: string | null;
					is_active?: boolean;
					start_time: string;
					end_time?: string | null;
					duration?: number | null;
					scheduled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string | null;
					is_active?: boolean;
					start_time?: string;
					end_time?: string | null;
					duration?: number | null;
					scheduled?: boolean;
					created_at?: string;
					updated_at?: string;
				};
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
			};
		};
			sent_tweets: {
				Row: {
					id: string;
					tweet_type: string;
					phase_name: string;
					target_date: string;
					tweet_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					tweet_type: string;
					phase_name: string;
					target_date: string;
					tweet_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					tweet_type?: string;
					phase_name?: string;
					target_date?: string;
					tweet_id?: string | null;
					created_at?: string;
				};
			};
	};
};
