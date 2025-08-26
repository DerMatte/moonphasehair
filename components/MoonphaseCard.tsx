"use client";

import MoonIcon from "@/components/MoonIcon";
import { useState, useMemo } from 'react';
import { getNextMoonPhaseOccurrence, getTimeUntilDate, getMoonPhaseWithTiming } from '@/lib/MoonPhaseCalculator';

// Moon phase card component
export default function MoonPhaseCard({
	title,
	phase,
	phaseValue,
	description,
	emoji,
	dateText,
	action,
}: {
	title: string;
	phase: string;
	phaseValue: number;
	description: string;
	emoji: string;
	dateText?: string;
	action?: string;
}) {
	const [subscribed, setSubscribed] = useState(false);

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
				isCurrentPhase: true
			};
		}
		
		// For other phases, show when they will occur next
		const nextDate = getNextMoonPhaseOccurrence(phase);
		const timeUntil = nextDate ? getTimeUntilDate(nextDate) : null;
		return {
			nextOccurrenceDate: nextDate,
			timeUntilPhase: timeUntil,
			isCurrentPhase: false
		};
	}, [phase]);

	const handleSubscribe = async (targetPhase: string) => {
		if (!('PushManager' in window)) return alert('Push notifications not supported');

		const permission = await Notification.requestPermission();
		if (permission !== 'granted') return;

		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		});

		// Use the calculated next occurrence date
		const nextDate = nextOccurrenceDate?.toISOString() || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

		// Send to API
		await fetch('/api/subscribe', {
			method: 'POST',
			body: JSON.stringify({ subscription: JSON.stringify(subscription), targetPhase, nextDate }),
			headers: { 'Content-Type': 'application/json' },
		});

		setSubscribed(true);
	};

	return (
		<div className=" border-neutral-200 p-6 h-full">
			<div className="flex flex-col items-center text-center space-y-4">
				<MoonIcon phase={phaseValue} />
				<div className="space-y-2">
					<h3 className="font-semibold text-lg text-gray-900">
						{title}: {phase} <span className="text-2xl">{emoji}</span>
					</h3>
					{action && (
						<p className="text-sm font-medium text-gray-700">{action}</p>
					)}
					<p className="text-sm text-gray-600 italic">{description}</p>
					{dateText && <p className="text-xs text-gray-500 mt-2">{dateText}</p>}
				</div>
				{timeUntilPhase && !isCurrentPhase && (
					<button
						onClick={() => handleSubscribe(phase)}
						disabled={subscribed}
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 transition-colors"
						type="button"
					>
						{subscribed ? 'Subscribed!' : `Remind me (${timeUntilPhase})`}
					</button>
				)}
				{timeUntilPhase && isCurrentPhase && (
					<p className="mt-4 text-sm text-gray-600 font-medium">
						Current phase {timeUntilPhase}
					</p>
				)}
			</div>
		</div>
	);
}