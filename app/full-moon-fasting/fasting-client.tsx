"use client";

import { useState, useEffect, useCallback, useId } from "react";
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
	startFasting,
	stopFasting,
	updateFasting,
	getCurrentFasting,
	subscribeFastingNotifications,
	unsubscribeFastingNotifications,
	getFastingSubscriptionStatus,
} from "@/app/actions/fasting";
import { sendNotification } from "@/app/actions";
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
	id?: string;
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
	const [isSubscribedToNotifications, setIsSubscribedToNotifications] =
		useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	// Load fasting state from database and check auth
	useEffect(() => {
		const initializeData = async () => {
			// Check authentication status
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);

			if (user) {
				// Load current fasting state from database
				const fastingResult = await getCurrentFasting();
				if (fastingResult.success && fastingResult.data) {
					const dbFast = fastingResult.data;
					setFastingState({
						id: dbFast.id,
						isActive: dbFast.is_active,
						startTime: dbFast.start_time,
						endTime: dbFast.end_time,
						duration: (dbFast.duration || 24) as FastDuration,
						scheduled: dbFast.scheduled,
					});
				}

				// Check fasting notification subscription status
				const subscriptionResult = await getFastingSubscriptionStatus();
				if (subscriptionResult.success) {
					setIsSubscribedToNotifications(subscriptionResult.subscribed);
				}
			}
		};

		initializeData();

		// Listen for auth changes
		const {
			data: { subscription: authSubscription },
		} = supabase.auth.onAuthStateChange(async (_event, session) => {
			setUser(session?.user ?? null);
			if (session?.user) {
				// Reload fasting state when user signs in
				const fastingResult = await getCurrentFasting();
				if (fastingResult.success && fastingResult.data) {
					const dbFast = fastingResult.data;
					setFastingState({
						id: dbFast.id,
						isActive: dbFast.is_active,
						startTime: dbFast.start_time,
						endTime: dbFast.end_time,
						duration: (dbFast.duration || 24) as FastDuration,
						scheduled: dbFast.scheduled,
					});
				}
			} else {
				// Reset state when user signs out
				setFastingState({
					isActive: false,
					startTime: null,
					endTime: null,
					duration: 24,
					scheduled: false,
				});
			}
		});

		// Check notification support
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsNotificationSupported(true);
			// Check subscription status inline to avoid dependency issues
			const checkSubscription = async () => {
				try {
					const registration = await navigator.serviceWorker.ready;
					const sub = await registration.pushManager.getSubscription();
					setSubscription(sub);
				} catch (error) {
					console.error("Error checking subscription:", error);
				}
			};
			checkSubscription();
		}

		return () => authSubscription.unsubscribe();
	}, [supabase.auth]);

	// Auto-update scheduled fasts to active when start time arrives
	useEffect(() => {
		if (
			!fastingState.scheduled ||
			fastingState.isActive ||
			!fastingState.startTime ||
			!fastingState.id
		)
			return;

		// Capture values to avoid stale closures
		const startTime = fastingState.startTime;
		const fastingId = fastingState.id;

		const interval = setInterval(async () => {
			const now = new Date();
			const start = new Date(startTime);

			if (now >= start) {
				// Activate the scheduled fast
				const result = await updateFasting(fastingId, {
					is_active: true,
					scheduled: false,
				});

				if (result.success && result.data) {
					setFastingState({
						id: result.data.id,
						isActive: result.data.is_active,
						startTime: result.data.start_time,
						endTime: result.data.end_time,
						duration: (result.data.duration || 24) as FastDuration,
						scheduled: result.data.scheduled,
					});
					toast.success("Your scheduled fast has begun!");
				}
				clearInterval(interval);
			}
		}, 60000); // Check every minute

		return () => clearInterval(interval);
	}, [
		fastingState.scheduled,
		fastingState.isActive,
		fastingState.startTime,
		fastingState.id,
	]);

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

	// Timer update effect for active fasts
	useEffect(() => {
		if (!fastingState.isActive || !fastingState.endTime || !fastingState.id)
			return;

		// Capture values to avoid stale closures
		const endTime = fastingState.endTime;
		const fastingId = fastingState.id;
		const duration = fastingState.duration;

		const interval = setInterval(async () => {
			const now = new Date();
			const end = new Date(endTime);
			const diff = end.getTime() - now.getTime();

			if (diff <= 0) {
				// Fast completed - update database
				const result = await stopFasting(fastingId);
				if (result.success) {
					setFastingState({
						isActive: false,
						startTime: null,
						endTime: null,
						duration: 24,
						scheduled: false,
					});
					setTimeRemaining("Fast completed! 🎉");

					// Send completion notification
					if (subscription) {
						sendNotification(
							subscription.toJSON(),
							"Fast Completed! 🎉",
							`Congratulations! You've completed your ${duration}h full moon fast.`,
							"/full-moon-fasting",
						);
					}
					toast.success("Fast completed! 🎉");
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
	}, [
		fastingState.isActive,
		fastingState.endTime,
		fastingState.id,
		fastingState.duration,
		subscription,
	]);

	// Start fasting
	const startFast = async () => {
		if (!user) {
			toast.error("Please sign in to start fasting");
			router.push(
				`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`,
			);
			return;
		}

		setLoading(true);
		const times = calculateFastingTimes(fastDuration);
		if (!times.start || !times.end) {
			setLoading(false);
			return;
		}

		const now = new Date();

		try {
			// Check if we should start now or schedule for later
			if (times.start > now) {
				// Schedule for future
				const result = await startFasting(
					times.start.toISOString(),
					times.end.toISOString(),
					fastDuration,
					true, // scheduled
				);

				if (result.success && result.data) {
					setFastingState({
						id: result.data.id,
						isActive: result.data.is_active,
						startTime: result.data.start_time,
						endTime: result.data.end_time,
						duration: (result.data.duration || fastDuration) as FastDuration,
						scheduled: result.data.scheduled,
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
				} else {
					toast.error(result.error || "Failed to schedule fast");
				}
			} else if (times.end > now) {
				// Start immediately (we're within the fasting window)
				const result = await startFasting(
					now.toISOString(),
					times.end.toISOString(),
					fastDuration,
					false, // not scheduled, active immediately
				);

				if (result.success && result.data) {
					setFastingState({
						id: result.data.id,
						isActive: result.data.is_active,
						startTime: result.data.start_time,
						endTime: result.data.end_time,
						duration: (result.data.duration || fastDuration) as FastDuration,
						scheduled: result.data.scheduled,
					});
					toast.success("Fast started!");
				} else {
					toast.error(result.error || "Failed to start fast");
				}
			} else {
				toast.error("The fasting window for this full moon has passed");
			}
		} catch (error) {
			console.error("Error starting fast:", error);
			toast.error("Failed to start fast");
		} finally {
			setLoading(false);
		}
	};

	// Stop/Cancel fasting
	const stopFast = async () => {
		if (!fastingState.id) return;

		setLoading(true);
		const wasScheduled = fastingState.scheduled && !fastingState.isActive;
		const wasActive = fastingState.isActive;

		try {
			// Stop the fast in the database
			const result = await stopFasting(fastingState.id);

			if (result.success) {
				// If cancelling a scheduled fast and user has notifications enabled,
				// unsubscribe from fasting notifications
				if (wasScheduled && subscription) {
					try {
						await unsubscribeFastingNotifications(subscription.endpoint);
					} catch (error) {
						console.error(
							"Error unsubscribing from fasting notifications:",
							error,
						);
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
					toast.info("Scheduled fast cancelled");
				} else if (wasActive) {
					toast.info("Active fast stopped");
				}
			} else {
				toast.error(result.error || "Failed to stop fast");
			}
		} catch (error) {
			console.error("Error stopping fast:", error);
			toast.error("Failed to stop fast");
		} finally {
			setLoading(false);
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

		setLoading(true);

		try {
			if (isSubscribedToNotifications && subscription) {
				// Unsubscribe
				const result = await unsubscribeFastingNotifications(
					subscription.endpoint,
				);
				if (result.success) {
					await subscription.unsubscribe();
					setSubscription(null);
					setIsSubscribedToNotifications(false);
					toast.success("Fasting notifications disabled");
				} else {
					toast.error(result.error || "Failed to disable notifications");
				}
			} else {
				// Subscribe
				const permission = await Notification.requestPermission();
				if (permission !== "granted") {
					toast.error("Notification permission denied");
					setLoading(false);
					return;
				}

				const registration = await navigator.serviceWorker.ready;
				const sub = await registration.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
				});
				setSubscription(sub);

				// Subscribe to fasting reminders
				const result = await subscribeFastingNotifications(
					sub.toJSON(),
					nextFullMoon || new Date().toISOString(),
				);

				if (result.success) {
					setIsSubscribedToNotifications(true);
					toast.success("Fasting notifications enabled");
				} else {
					toast.error(result.error || "Failed to enable notifications");
				}
			}
		} catch (error) {
			console.error("Error toggling notifications:", error);
			toast.error("Failed to toggle notifications");
		} finally {
			setLoading(false);
		}
	};

	const fastingTimes = calculateFastingTimes(fastDuration);
	
	// Generate unique IDs for form elements
	const fastId24 = useId();
	const fastId48 = useId();
	const fastId72 = useId();

	return (
		<div className="grid gap-6 grid-cols-1 auto-rows-min">
			{/* Active Fast Timer - Takes full grid width */}
			{fastingState.isActive && (
				<div className="col-span-full">
					<Card className="border-primary bg-neutral-50">
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
							<div className="grid gap-6 place-items-center text-center">
								<div className="text-6xl font-bold font-mono">
									{timeRemaining}
								</div>
								<div className="text-sm text-muted-foreground">
									Started:{" "}
									{fastingState.startTime &&
										formatDateTime(new Date(fastingState.startTime))}
								</div>
								<Button
									onClick={stopFast}
									variant="destructive"
									size="lg"
									disabled={loading}
								>
									{loading ? "Stopping..." : "Stop Fast"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Main Content Grid - Only shows when not actively fasting */}
			{!fastingState.isActive && (
				<div className="col-span-full grid gap-6 grid-cols-1 lg:grid-cols-[2fr_1fr]">
					{/* Fast Selection Panel */}
					<Card className="bg-neutral-50">
						<CardHeader>
							<CardTitle className="text-xl">
								Choose Your Fast Duration
							</CardTitle>
							<CardDescription>
								Select how long you want to fast around the full moon peak
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-6">
								{/* Duration Selection Grid */}
								<RadioGroup
									value={String(fastDuration)}
									onValueChange={(v) =>
										setFastDuration(Number(v) as FastDuration)
									}
								>
									<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
										<div className="grid gap-3 grid-cols-[auto_1fr] items-start">
											<RadioGroupItem value="24" id={fastId24} />
											<Label htmlFor={fastId24} className="cursor-pointer grid gap-1">
												<div className="font-medium">24 Hour Fast</div>
												<div className="text-sm text-muted-foreground">
													12h before to 12h after
												</div>
											</Label>
										</div>
										<div className="grid gap-3 grid-cols-[auto_1fr] items-start">
											<RadioGroupItem value="48" id={fastId48} />
											<Label htmlFor={fastId48} className="cursor-pointer grid gap-1">
												<div className="font-medium">48 Hour Fast</div>
												<div className="text-sm text-muted-foreground">
													24h before to 24h after
												</div>
											</Label>
										</div>
										<div className="grid gap-3 grid-cols-[auto_1fr] items-start">
											<RadioGroupItem value="72" id={fastId72} />
											<Label htmlFor={fastId72} className="cursor-pointer grid gap-1">
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
											<div className="grid gap-3 grid-cols-1">
												<div className="text-sm break-words">
													<strong>Start:</strong>{" "}
													<span className="block sm:inline mt-1 sm:mt-0">
														{formatDateTime(fastingTimes.start)}
													</span>
												</div>
												<div className="text-sm break-words">
													<strong>End:</strong>{" "}
													<span className="block sm:inline mt-1 sm:mt-0">
														{formatDateTime(fastingTimes.end)}
													</span>
												</div>
											</div>
										</AlertDescription>
									</Alert>
								)}

								{/* Action Buttons */}
								<div className="grid gap-3 grid-cols-1 sm:grid-cols-[1fr_auto]">
									<Button
										onClick={fastingState.scheduled ? stopFast : startFast}
										className={cn(
											"transition-colors duration-200 min-h-[3rem] text-xs sm:text-sm",
											fastingState.scheduled
												? "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-700 text-white border border-neutral-700 shadow-[0_0_16px_2px_rgba(0,255,255,0.15)] hover:from-neutral-800 hover:to-neutral-600 hover:text-cyan-200 hover:shadow-[0_0_24px_4px_rgba(0,255,255,0.25)]"
												: "bg-neutral-900 text-neutral-50 border border-neutral-700 hover:bg-neutral-800 hover:text-neutral-200 hover:border-neutral-600",
										)}
										size="lg"
										disabled={!nextFullMoon || loading}
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
										{loading ? (
											<span className="font-semibold">Loading...</span>
										) : fastingState.scheduled ? (
											<div className="flex items-center justify-center gap-2 flex-wrap">
												<CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 drop-shadow-[0_0_6px_cyan] flex-shrink-0" />
												<span className="font-bold tracking-wide uppercase text-cyan-200 drop-shadow-[0_0_4px_cyan] animate-pulse text-center break-words">
													I'm fasting this full moon
												</span>
											</div>
										) : (
											<span className="font-semibold text-center">
												{user ? "Start Fast" : "Sign in to start fasting"}
											</span>
										)}
									</Button>
									{isNotificationSupported && user && (
										<Button
											onClick={toggleNotifications}
											variant="outline"
											size="lg"
											className="px-4 sm:px-4 w-full sm:w-auto"
											disabled={loading}
											title={
												isSubscribedToNotifications
													? "Disable fasting notifications"
													: "Enable fasting notifications"
											}
										>
											<div className="flex items-center gap-2">
												{isSubscribedToNotifications ? (
													<BellOff className="w-5 h-5" />
												) : (
													<Bell className="w-5 h-5" />
												)}
												<span className="sm:hidden">
													{isSubscribedToNotifications ? "Notifications Off" : "Notifications On"}
												</span>
											</div>
										</Button>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Tips Panel */}
					<Card className="bg-neutral-50">
						<CardHeader>
							<CardTitle className="text-lg">Quick Tips</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3">
								<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">JUST STOP EATING. No Calories. No Coffee. No Tea.</p>
								</div>
								<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">
										Drink lots of water at least 4l. Bonus: add celtic sea salt + lemon juice.
									</p>
								</div>
								<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">
										Autogaphy starts at 24h. This is where your body starts to regenerate cells. Hour 36 – 48 is the hardest. After 72+ you completely loose your hunger.
									</p>
								</div>
								<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
									<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm">
										Break your fast with bone broth or soup. HALF the length of the fast = the length of time you should take to reactivate digestion
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Scheduled Fast Info - Takes full grid width */}
			{fastingState.scheduled && !fastingState.isActive && (
				<div className="col-span-full">
					<Card className="border-green-500/50 bg-neutral-50">
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
							<div className="grid gap-4">
								<div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
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
									className="justify-self-start"
									disabled={loading}
								>
									{loading ? "Cancelling..." : "Cancel Fast"}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
