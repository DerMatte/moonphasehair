"use client";

import type { User } from "@supabase/supabase-js";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface MoonSubscriptionContextValue {
	isLoading: boolean;
	isSubscribed: (phase: string) => boolean;
	setSubscribed: (phase: string, subscribed: boolean) => void;
	user: User | null;
}

const MoonSubscriptionContext =
	createContext<MoonSubscriptionContextValue | null>(null);

export function MoonSubscriptionProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [supabase] = useState(createClient);
	const [user, setUser] = useState<User | null>(null);
	const [subscribedPhases, setSubscribedPhases] = useState<Set<string>>(
		() => new Set(),
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isActive = true;

		const loadSubscriptions = async () => {
			const { data, error } = await supabase
				.from("subscriptions")
				.select("target_phase")
				.eq("subscription_type", "hair");

			if (!isActive) return;

			if (error) {
				console.error("Error loading moon subscriptions:", error);
				setSubscribedPhases(new Set());
				return;
			}

			setSubscribedPhases(
				new Set(data.map((subscription) => subscription.target_phase)),
			);
		};

		const initialize = async () => {
			const {
				data: { user: currentUser },
			} = await supabase.auth.getUser();

			if (!isActive) return;

			setUser(currentUser);
			if (currentUser) {
				await loadSubscriptions();
			}
			if (isActive) setIsLoading(false);
		};

		void initialize();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (!isActive) return;

			setUser(session?.user ?? null);
			if (session?.user) {
				setIsLoading(true);
				void loadSubscriptions().finally(() => {
					if (isActive) setIsLoading(false);
				});
			} else {
				setSubscribedPhases(new Set());
				setIsLoading(false);
			}
		});

		return () => {
			isActive = false;
			subscription.unsubscribe();
		};
	}, [supabase]);

	const setSubscribed = (phase: string, subscribed: boolean) => {
		setSubscribedPhases((current) => {
			const next = new Set(current);
			if (subscribed) {
				next.add(phase);
			} else {
				next.delete(phase);
			}
			return next;
		});
	};

	return (
		<MoonSubscriptionContext.Provider
			value={{
				isLoading,
				isSubscribed: (phase) => subscribedPhases.has(phase),
				setSubscribed,
				user,
			}}
		>
			{children}
		</MoonSubscriptionContext.Provider>
	);
}

export function useMoonSubscriptions() {
	const context = useContext(MoonSubscriptionContext);

	if (!context) {
		throw new Error(
			"useMoonSubscriptions must be used within MoonSubscriptionProvider",
		);
	}

	return context;
}
