"use client";

import { useTransition, useEffect, useState } from "react";
import {
	subscribeMoonPhase,
	unsubscribeMoonPhase,
	getSubscriptionStatus,
} from "@/app/actions/moon-subscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface MoonPhaseCardClientProps {
	phase: string;
	timeUntilPhase: string | null;
	isCurrentPhase: boolean;
}

export function MoonPhaseCardClient({
	phase,
	timeUntilPhase,
	isCurrentPhase,
}: MoonPhaseCardClientProps) {
	const [isPending, startTransition] = useTransition();
	const [user, setUser] = useState<User | null>(null);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		// Check authentication status
		// biome-ignore lint/suspicious/noExplicitAny: Supabase types
		supabase.auth.getUser().then(({ data }: any) => {
			setUser(data?.user ?? null);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		// biome-ignore lint/suspicious/noExplicitAny: Supabase types
		} = supabase.auth.onAuthStateChange((_event: any, session: any) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, [supabase.auth]);

	// Fetch subscription status when user or phase changes
	useEffect(() => {
		async function checkSubscription() {
			if (user) {
				const status = await getSubscriptionStatus(phase);
				setIsSubscribed(status);
			} else {
				setIsSubscribed(false);
			}
			setIsLoading(false);
		}
		checkSubscription();
	}, [user, phase]);

	const handleToggleSubscription = async () => {
		// Check if user is authenticated
		if (!user) {
			toast.error("Please sign in to enable notifications");
			router.push(
				`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`,
			);
			return;
		}

		// If already subscribed, unsubscribe
		if (isSubscribed) {
			startTransition(async () => {
				// Optimistically update the UI
				setIsSubscribed(false);

				// Call server action to unsubscribe
				const result = await unsubscribeMoonPhase(phase);

				if (result.success) {
					toast.success(`Unsubscribed from ${phase} notifications`);
				} else {
					// Revert optimistic update on error
					setIsSubscribed(true);
					toast.error(result.error || "Failed to unsubscribe");
				}
			});
			return;
		}

		// Subscribe logic
		if (!("PushManager" in window)) {
			toast.error("Push notifications not supported");
			return;
		}

		try {
			// Check if we already have permission
			let permission = Notification.permission;
			
			// Only request permission if not already granted
			if (permission === "default") {
				permission = await Notification.requestPermission();
			}
			
			if (permission !== "granted") {
				toast.error("Notification permission denied");
				return;
			}

			const registration = await navigator.serviceWorker.ready;
			
			// Check if already has a push subscription
			let subscription = await registration.pushManager.getSubscription();
			
			// Create a new subscription if none exists
			if (!subscription) {
				subscription = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
				});
			}

			startTransition(async () => {
				// Optimistically update the UI
				setIsSubscribed(true);

				// Call server action
				const result = await subscribeMoonPhase(phase, subscription.toJSON());

				if (result.success) {
					toast.success(`Subscribed to ${phase} notifications!`);
				} else {
					// Revert optimistic update on error
					setIsSubscribed(false);
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

	if (isLoading) {
		return (
			<button
				disabled
				className="bg-gray-200 px-4 py-2 rounded-lg font-mono text-base"
				type="button"
			>
				Loading...
			</button>
		);
	}

	return (
		<button
			onClick={handleToggleSubscription}
			disabled={isPending}
			className={`${
				isSubscribed 
					? "bg-green-200 hover:bg-red-200" 
					: "bg-sky-200 hover:bg-sky-300"
			} disabled:bg-gray-300 px-4 py-2 rounded-lg font-mono text-base transition-colors text-balance`}
			type="button"
		>
			{isPending
				? isSubscribed ? "Unsubscribing..." : "Subscribing..."
				: isSubscribed
					? "✓ Subscribed (click to unsubscribe)"
					: user
						? `Remind me ${timeUntilPhase}`
						: "Sign in to subscribe"}
		</button>
	);
}
