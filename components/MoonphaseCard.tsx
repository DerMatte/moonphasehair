"use client";

import MoonIcon from "@/components/MoonIcon";
import { useState, useMemo } from "react";
import {
	getNextMoonPhaseOccurrence,
	getTimeUntilDate,
	getMoonPhaseWithTiming,
} from "@/lib/MoonPhaseCalculator";
import { toast } from "sonner";

// Moon phase card component
export default function MoonPhaseCard({
	title,
	phase,
	phaseValue,
	description,
	emoji,
	icon,
	dateText,
	action,
}: {
	title: string;
	phase: string;
	phaseValue: number;
	description: string;
	emoji: string;
	icon?: string;
	dateText?: string;
	action?: string;
}) {
	const [subscribed, setSubscribed] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		// Check authentication status
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user);
		});

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, [supabase.auth]);

	// Calculate the next occurrence of this phase and time until it
	const { nextOccurrenceDate, timeUntilPhase, isCurrentPhase } = useMemo(() => {
		// Check if this is the current phase
		const currentPhaseData = getMoonPhaseWithTiming(new Date());
		const isCurrent = currentPhaseData.current.name === phase;

		// For current phase, show time until it ends
		if (isCurrent) {
			const timeUntilEnd = getTimeUntilDate(currentPhaseData.current.endDate);
			return {
				nextOccurrenceDate: currentPhaseData.current.endDate,
				timeUntilPhase: `ends ${timeUntilEnd}`,
				isCurrentPhase: true,
			};
		}

		// For other phases, show when they will occur next
		const nextDate = getNextMoonPhaseOccurrence(phase);
		const timeUntil = nextDate ? getTimeUntilDate(nextDate) : null;
		return {
			nextOccurrenceDate: nextDate,
			timeUntilPhase: timeUntil,
			isCurrentPhase: false,
		};
	}, [phase]);

	const handleSubscribe = async (targetPhase: string) => {
		try {
			// Check if user is authenticated
			if (!user) {
				toast.error("Please sign in to enable notifications");
				router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
				return;
			}

			if (!("PushManager" in window))
				return alert("Push notifications not supported");

			const permission = await Notification.requestPermission();
			if (permission !== "granted") return;

			const registration = await navigator.serviceWorker.ready;
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
			});

			// Use the calculated next occurrence date
			const nextDate =
				nextOccurrenceDate?.toISOString() ||
				new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

			// Send to API
			const response = await fetch("/api/subscribe", {
				method: "POST",
				body: JSON.stringify({ subscription, targetPhase, nextDate }),
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				const errorData = await response.json();
				if (response.status === 401) {
					toast.error("Please sign in to enable notifications");
					router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
					return;
				}
				throw new Error(errorData.error || "Failed to subscribe");
			}

			setSubscribed(true);
			toast.success("Subscribed!");
		} catch (error) {
			console.error("Subscription failed:", error);
			toast.error("Failed to subscribe. Please try again.");
		}
	};

	return (
		<div className="flex flex-col gap-4 h-full items-start justify-start p-6">
			{/* Moon Icon */}
			<MoonIcon phase={phaseValue} />
			{/* Phase Info */}
			<div className="flex flex-col gap-1.5 items-start justify-start w-full">
				<h3 className="font-bold text-base leading-normal">
					{title}: {phase} <span className="font-normal">{icon || emoji}</span>
				</h3>
				{action && (
					<p className="font-mono italic text-base leading-normal">{action}</p>
				)}
				<p className="font-mono italic text-base leading-normal min-h-[42px] ">
					{description}
				</p>
			</div>

			{/* Date Text - Always display if available */}
			{dateText ? (
				<div className="w-full">
					<p className="font-mono text-base leading-normal">{dateText}</p>
				</div>
			) : null}

			{/* Reminder Button */}
			{timeUntilPhase && !isCurrentPhase && (
				<button
					onClick={() => handleSubscribe(phase)}
					disabled={subscribed}
					className="bg-sky-200 hover:bg-sky-300 disabled:bg-gray-300 px-4 py-2 rounded-lg font-mono text-base transition-colors text-balance"
					type="button"
				>
					{subscribed ? "Subscribed!" : (user ? `Remind me ${timeUntilPhase}` : "Sign in to subscribe")}
				</button>
			)}

			{/* Current Phase Status */}
			{timeUntilPhase && isCurrentPhase && (
				<div className="py-2 text-center">
					<p className="font-mono text-base">Current phase {timeUntilPhase}</p>
				</div>
			)}
		</div>
	);
}
