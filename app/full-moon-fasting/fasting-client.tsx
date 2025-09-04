"use client";

import { useState, useEffect, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, BellOff, Timer, CheckCircle2 } from "lucide-react";
import {
	subscribeUser,
	unsubscribeUser,
	sendNotification,
} from "@/app/actions";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface FastingClientProps {
	currentPhase: string;
	nextFullMoon: string | null;
}

type FastDuration = 24 | 48 | 72;
type FastingState = {
	isActive: boolean;
	startTime: string | null;
	endTime: string | null;
	duration: FastDuration;
	scheduled: boolean;
};

export default function FastingClient({
	currentPhase,
	nextFullMoon,
}: FastingClientProps) {
	const [fastDuration, setFastDuration] = useState<FastDuration>(24);
	const [fastingState, setFastingState] = useState<FastingState>({
		isActive: false,
		startTime: null,
		endTime: null,
		duration: 24,
		scheduled: false,
	});
	const [timeRemaining, setTimeRemaining] = useState<string>("");
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [isNotificationSupported, setIsNotificationSupported] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
	const supabase = createClient();

	// Check if user is subscribed to notifications
	const checkNotificationSubscription = useCallback(async () => {
		try {
			const registration = await navigator.serviceWorker.ready;
			const sub = await registration.pushManager.getSubscription();
			setSubscription(sub);
		} catch (error) {
			console.error("Error checking subscription:", error);
		}
	}, []);

	// Load fasting state from localStorage and check auth
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

		const saved = localStorage.getItem("fastingState");
		if (saved) {
			const parsed = JSON.parse(saved);
			setFastingState(parsed);
		}

		// Check notification support
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsNotificationSupported(true);
			checkNotificationSubscription();
		}

		return () => authSubscription.unsubscribe();
	}, [checkNotificationSubscription, supabase.auth]);

	// Save fasting state to localStorage
	useEffect(() => {
		// Save if there's an active fast OR a scheduled fast
		if (fastingState.isActive || fastingState.scheduled) {
			localStorage.setItem("fastingState", JSON.stringify(fastingState));
		} else {
			// Only remove if both isActive and scheduled are false
			localStorage.removeItem("fastingState");
		}
	}, [fastingState]);

	// Calculate fasting times based on full moon peak
	const calculateFastingTimes = useCallback(
		(duration: FastDuration) => {
			if (!nextFullMoon) return { start: null, end: null };

			const fullMoonDate = new Date(nextFullMoon);
			const hoursBeforePeak = duration / 2;

			const startTime = new Date(
				fullMoonDate.getTime() - hoursBeforePeak * 60 * 60 * 1000,
			);
			const endTime = new Date(
				fullMoonDate.getTime() + hoursBeforePeak * 60 * 60 * 1000,
			);

			return { start: startTime, end: endTime };
		},
		[nextFullMoon],
	);

	// Timer update effect
	useEffect(() => {
		// Check if scheduled fast should start
		if (
			fastingState.scheduled &&
			!fastingState.isActive &&
			fastingState.startTime
		) {
			const now = new Date();
			const start = new Date(fastingState.startTime);
			if (now >= start) {
				// Start the fast
				setFastingState((prev) => ({
					...prev,
					isActive: true,
					scheduled: false,
				}));
				toast.success("Your scheduled fast has begun!");
			}
		}

		if (!fastingState.isActive || !fastingState.endTime) return;

		const interval = setInterval(() => {
			const now = new Date();
			const end = new Date(fastingState.endTime!);
			const diff = end.getTime() - now.getTime();

			if (diff <= 0) {
				// Fast completed
				setTimeRemaining("Fast completed! 🎉");
				setFastingState({
					isActive: false,
					startTime: null,
					endTime: null,
					duration: 24,
					scheduled: false,
				});
				// Send completion notification
				if (subscription) {
					sendNotification(
						subscription.toJSON(),
						"Fast Completed! 🎉",
						`Congratulations! You've completed your ${fastingState.duration}h full moon fast.`,
						"/full-moon-fasting",
					);
				}
				clearInterval(interval);
			} else {
				const hours = Math.floor(diff / (1000 * 60 * 60));
				const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
				const seconds = Math.floor((diff % (1000 * 60)) / 1000);
				setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [fastingState, subscription]);

	// Start fasting
	const startFast = async () => {
		const times = calculateFastingTimes(fastDuration);
		if (!times.start || !times.end) return;

		const now = new Date();

		// Check if we should start now or schedule for later
		if (times.start > now) {
			// Schedule for future
			setFastingState({
				isActive: false,
				startTime: times.start.toISOString(),
				endTime: times.end.toISOString(),
				duration: fastDuration,
				scheduled: true,
			});
			toast.success(
				`I'm fasting this full moon! Starts ${formatDateTime(times.start)}`,
			);

			// Subscribe to start notification
			if (subscription) {
				const hoursUntilStart = Math.round(
					(times.start.getTime() - now.getTime()) / (1000 * 60 * 60),
				);
				await sendNotification(
					subscription.toJSON(),
					"Full Moon Fast Scheduled",
					`Your ${fastDuration}h fast will begin in ${hoursUntilStart} hours`,
					"/full-moon-fasting",
				);
			}
		} else if (times.end > now) {
			// Start immediately (we're within the fasting window)
			setFastingState({
				isActive: true,
				startTime: now.toISOString(),
				endTime: times.end.toISOString(),
				duration: fastDuration,
				scheduled: false,
			});
			toast.success("Fast started!");
		} else {
			toast.error("The fasting window for this full moon has passed");
		}
	};

	// Stop/Cancel fasting
	const stopFast = async () => {
		const wasScheduled = fastingState.scheduled && !fastingState.isActive;
		const wasActive = fastingState.isActive;

		// If cancelling a scheduled fast and user has notifications enabled,
		// unsubscribe from fasting notifications
		if (wasScheduled && subscription) {
			try {
				await unsubscribeUser(subscription.endpoint, "fasting");
			} catch (error) {
				console.error("Error unsubscribing from fasting notifications:", error);
			}
		}

		setFastingState({
			isActive: false,
			startTime: null,
			endTime: null,
			duration: 24,
			scheduled: false,
		});

		if (wasScheduled) {
			toast.info("Scheduled fast cancelled and notifications disabled");
		} else if (wasActive) {
			toast.info("Active fast stopped");
		}
	};

	// Toggle notifications
	const toggleNotifications = async () => {
		if (!isNotificationSupported) return;

		// Check if user is authenticated
		if (!user) {
			toast.error("Please sign in to enable notifications");
			router.push(
				`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`,
			);
			return;
		}

		try {
			if (subscription) {
				// Unsubscribe
				await subscription.unsubscribe();
				await unsubscribeUser(subscription.endpoint, "fasting");
				setSubscription(null);
				toast.success("Notifications disabled");
			} else {
				// Subscribe
				const registration = await navigator.serviceWorker.ready;
				const sub = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
				});
				setSubscription(sub);

				// Subscribe to fasting reminders
				await subscribeUser(
					sub.toJSON(),
					"Full Moon Fasting",
					nextFullMoon || new Date().toISOString(),
					"fasting",
				);
				toast.success("Notifications enabled");
			}
		} catch (error) {
			console.error("Error toggling notifications:", error);
			toast.error("Failed to toggle notifications");
		}
	};

	const fastingTimes = calculateFastingTimes(fastDuration);

	return (
		<>
			{/* Active Fast Timer - Full Width When Active */}
			{fastingState.isActive && (
				<Card className="border-primary mb-6 bg-neutral-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-2xl">
							<Timer className="w-6 h-6 animate-pulse" />
							Fast in Progress
						</CardTitle>
						<CardDescription>
							{fastingState.duration} hour full moon fast
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-center space-y-6">
							<div className="text-6xl font-bold font-mono">
								{timeRemaining}
							</div>
							<div className="text-sm text-muted-foreground">
								Started:{" "}
								{fastingState.startTime &&
									formatDateTime(new Date(fastingState.startTime))}
							</div>
							<Button onClick={stopFast} variant="destructive" size="lg">
								Stop Fast
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Scheduled Fast Info */}
			{fastingState.scheduled && !fastingState.isActive && (
				<Card className="border-green-500/50 mb-6 bg-neutral-50">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-xl">
							<CheckCircle2 className="w-5 h-5 text-green-500" />
							Fast Scheduled
						</CardTitle>
						<CardDescription>
							You're committed to fasting this full moon!
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="space-y-2">
								<p className="text-sm">
									<strong>Duration:</strong> {fastingState.duration} hours
								</p>
								<p className="text-sm">
									<strong>Starts:</strong>{" "}
									{fastingState.startTime &&
										formatDateTime(new Date(fastingState.startTime))}
								</p>
								<p className="text-sm">
									<strong>Ends:</strong>{" "}
									{fastingState.endTime &&
										formatDateTime(new Date(fastingState.endTime))}
								</p>
							</div>
							<Button
								onClick={stopFast}
								variant="outline"
								size="sm"
								className="w-full"
							>
								Cancel Fast
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Grid Layout for Selection and Stats */}
			{!fastingState.isActive && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Fast Selection - Spans 2 columns on large screens */}
					<Card className="lg:col-span-2 bg-neutral-50">
						<CardHeader>
							<CardTitle className="text-xl">
								Choose Your Fast Duration
							</CardTitle>
							<CardDescription>
								Select how long you want to fast around the full moon peak
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<RadioGroup
								value={String(fastDuration)}
								onValueChange={(v) =>
									setFastDuration(Number(v) as FastDuration)
								}
							>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="flex items-start space-x-3">
										<RadioGroupItem value="24" id="24h" />
										<Label htmlFor="24h" className="cursor-pointer space-y-1">
											<div className="font-medium">24 Hour Fast</div>
											<div className="text-sm text-muted-foreground">
												12h before to 12h after
											</div>
										</Label>
									</div>
									<div className="flex items-start space-x-3">
										<RadioGroupItem value="48" id="48h" />
										<Label htmlFor="48h" className="cursor-pointer space-y-1">
											<div className="font-medium">48 Hour Fast</div>
											<div className="text-sm text-muted-foreground">
												24h before to 24h after
											</div>
										</Label>
									</div>
									<div className="flex items-start space-x-3">
										<RadioGroupItem value="72" id="72h" />
										<Label htmlFor="72h" className="cursor-pointer space-y-1">
											<div className="font-medium">72 Hour Fast</div>
											<div className="text-sm text-muted-foreground">
												36h before to 36h after
											</div>
										</Label>
									</div>
								</div>
							</RadioGroup>

							{/* Fasting Times Preview */}
							{fastingTimes.start && fastingTimes.end && (
								<Alert className="bg-primary/5 border-primary/20">
									<AlertDescription>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
											<div>
												<strong>Start:</strong>{" "}
												{formatDateTime(fastingTimes.start)}
											</div>
											<div>
												<strong>End:</strong> {formatDateTime(fastingTimes.end)}
											</div>
										</div>
									</AlertDescription>
								</Alert>
							)}

							<div className="flex gap-3">
								<Button
									onClick={fastingState.scheduled ? stopFast : startFast}
									className={cn(
										"flex-1 transition-colors duration-200",
										fastingState.scheduled
											? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 text-white border border-neutral-700 shadow-[0_0_16px_2px_rgba(0,255,255,0.15)] hover:from-neutral-800 hover:to-neutral-600 hover:text-cyan-200 hover:shadow-[0_0_24px_4px_rgba(0,255,255,0.25)]"
											: "bg-neutral-900 text-neutral-50 border border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-600",
									)}
									size="lg"
									disabled={!nextFullMoon}
									variant="ghost"
									title={
										fastingState.scheduled
											? "Cancel Scheduled Fast"
											: "Start Fast"
									}
									aria-label={
										fastingState.scheduled
											? "Cancel Scheduled Fast"
											: "Start Fast"
									}
									aria-describedby={
										fastingState.scheduled
											? "cancel-fast-description"
											: "start-fast-description"
									}
								>
									{fastingState.scheduled ? (
										<>
											<CheckCircle2 className="w-5 h-5 mr-2 text-cyan-400 drop-shadow-[0_0_6px_cyan]" />
											<span className="font-bold tracking-wide uppercase text-cyan-200 drop-shadow-[0_0_4px_cyan] animate-pulse">
												I'm fasting this full moon
											</span>
										</>
									) : (
										<span className="font-semibold">Start Fast</span>
									)}
								</Button>
								{isNotificationSupported && (
									<Button
										onClick={toggleNotifications}
										variant="outline"
										size="lg"
										className="px-4"
										title={
											subscription
												? "Disable notifications"
												: "Enable notifications"
										}
									>
										{subscription ? (
											<BellOff className="w-5 h-5" />
										) : (
											<Bell className="w-5 h-5" />
										)}
									</Button>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Quick Stats - Single column on large screens */}
					<Card className="bg-neutral-50">
						<CardHeader>
							<CardTitle className="text-lg">Quick Tips</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-start gap-2">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">
										Stay hydrated with water and herbal teas
									</p>
								</div>
								<div className="flex items-start gap-2">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">
										Light exercise like walking or yoga is beneficial
									</p>
								</div>
								<div className="flex items-start gap-2">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">
										Break your fast gently with light foods
									</p>
								</div>
								<div className="flex items-start gap-2">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">
										Listen to your body and stop if unwell
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</>
	);
}
