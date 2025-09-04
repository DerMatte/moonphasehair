"use client";

import { useOptimistic, useTransition, useEffect, useState } from "react";
import {
	subscribeMoonPhase,
	type SubscriptionState,
} from "@/app/actions/moon-subscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface MoonPhaseCardClientProps {
	phase: string;
	timeUntilPhase: string | null;
	isCurrentPhase: boolean;
	initialSubscribed: boolean;
}

export function MoonPhaseCardClient({
	phase,
	timeUntilPhase,
	isCurrentPhase,
	initialSubscribed,
}: MoonPhaseCardClientProps) {
	const [isPending, startTransition] = useTransition();
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
	const supabase = createClient();

	const [optimisticSubscribed, setOptimisticSubscribed] = useOptimistic(
		initialSubscribed,
		(state, newState: boolean) => newState,
	);

	useEffect(() => {
		// Check authentication status
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, [supabase.auth]);

	const handleSubscribe = async () => {
		// Check if user is authenticated
		if (!user) {
			toast.error("Please sign in to enable notifications");
			router.push(
				`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`,
			);
			return;
		}

		if (!("PushManager" in window)) {
			toast.error("Push notifications not supported");
			return;
		}

		try {
			const permission = await Notification.requestPermission();
			if (permission !== "granted") {
				toast.error("Notification permission denied");
				return;
			}

			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
			});

			startTransition(async () => {
				// Optimistically update the UI
				setOptimisticSubscribed(true);

				// Call server action
				const result = await subscribeMoonPhase(phase, subscription.toJSON());

				if (result.success) {
					toast.success(`Subscribed to ${phase} notifications!`);
				} else {
					// Revert optimistic update on error
					setOptimisticSubscribed(false);
					if (result.error === "Authentication required") {
						toast.error("Please sign in to enable notifications");
						router.push(
							`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`,
						);
					} else {
						toast.error(result.error || "Failed to subscribe");
					}
				}
			});
		} catch (error) {
			console.error("Subscription failed:", error);
			toast.error("Failed to subscribe. Please try again.");
		}
	};

	if (!timeUntilPhase || isCurrentPhase) {
		return null;
	}

	return (
		<button
			onClick={handleSubscribe}
			disabled={optimisticSubscribed || isPending}
			className="bg-sky-200 hover:bg-sky-300 disabled:bg-gray-300 px-4 py-2 rounded-lg font-mono text-base transition-colors text-balance"
			type="button"
		>
			{optimisticSubscribed
				? "Subscribed!"
				: isPending
					? "Subscribing..."
					: user
						? `Remind me ${timeUntilPhase}`
						: "Sign in to subscribe"}
		</button>
	);
}
