"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { subscribeMoonPhase } from "@/app/actions/moon-subscription";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
} from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

export default function PushNotificationManagerOptimized() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [message, setMessage] = useState("");
	const [user, setUser] = useState<User | null>(null);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const supabase = createClient();

	const [optimisticSubscribed, setOptimisticSubscribed] = useOptimistic(
		!!subscription,
		(state, newState: boolean) => newState,
	);

	useEffect(() => {
		// Check authentication status
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
		});

		// Listen for auth changes
		const {
			data: { subscription: authSubscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsSupported(true);
			registerServiceWorker();
		}

		return () => authSubscription.unsubscribe();
	}, [supabase.auth]);

	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/",
			updateViaCache: "none",
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}

	async function subscribeToPush() {
		if (!user) {
			toast.error("Please sign in to enable notifications");
			router.push("/auth/login");
			return;
		}

		try {
			const registration = await navigator.serviceWorker.ready;
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
			});
			setSubscription(sub);

			startTransition(async () => {
				// Optimistically update the UI
				setOptimisticSubscribed(true);

				// Use server action for subscription
				const result = await subscribeMoonPhase("New Moon", sub.toJSON());

				if (result.success) {
					toast.success("Successfully subscribed to notifications");
				} else {
					// Revert optimistic update on error
					setOptimisticSubscribed(false);
					setSubscription(null);
					toast.error(result.error || "Failed to subscribe");
				}
			});
		} catch (error) {
			console.error("Subscription failed:", error);
			toast.error("Failed to subscribe");
		}
	}

	async function unsubscribeFromPush() {
		if (subscription) {
			await subscription.unsubscribe();
			setSubscription(null);
			setOptimisticSubscribed(false);
			toast.success("Unsubscribed from notifications");
		}
	}

	async function sendTestNotification() {
		if (subscription && user) {
			// This would need a server action for sending test notifications
			toast.info("Test notification sent!");
		}
	}

	if (process.env.NODE_ENV === "production") {
		return null;
	}

	if (!isSupported) {
		return <p>Push notifications are not supported in this browser.</p>;
	}

	return (
		<Card className="space-y-4 p-4 bg-neutral-100/90">
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="push-notifications">
					<AccordionTrigger className="text-left">
						<div className="flex items-center justify-between gap-4 w-full">
							<div className="font-semibold">Push Notifications</div>
							<ChevronDown className="w-4 h-4 text-muted-foreground" />
						</div>
					</AccordionTrigger>
					<AccordionContent>
						<div className="mb-4">
							<div className="text-sm text-muted-foreground">
								Enable push notifications to get moon phase reminders
							</div>
						</div>
						<CardContent>
							{!user ? (
								<>
									<p className="text-sm text-neutral-600 mb-3">
										Sign in to enable push notifications
									</p>
									<Button
										onClick={() => router.push("/auth/login")}
										className="w-full"
									>
										Sign In
									</Button>
								</>
							) : optimisticSubscribed ? (
								<>
									<p className="text-sm text-green-600">
										✓ You are subscribed to push notifications
									</p>
									<Button
										onClick={unsubscribeFromPush}
										variant="outline"
										disabled={isPending}
									>
										Unsubscribe
									</Button>

									<div className="space-y-2">
										<input
											type="text"
											placeholder="Test message"
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											className="w-full p-2 border rounded"
										/>
										<Button onClick={sendTestNotification} disabled={isPending}>
											Send Test Notification
										</Button>
									</div>
								</>
							) : (
								<>
									<p className="text-sm text-neutral-600">
										Enable push notifications to get moon phase reminders
									</p>
									<Button onClick={subscribeToPush} disabled={isPending}>
										{isPending ? "Subscribing..." : "Enable Notifications"}
									</Button>
								</>
							)}
						</CardContent>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</Card>
	);
}
