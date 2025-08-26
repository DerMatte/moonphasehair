"use client";

import MoonIcon from "@/components/MoonIcon";
import { useState, useMemo } from 'react';
import { getNextMoonPhaseOccurrence, getTimeUntilDate, getMoonPhaseWithTiming } from '@/lib/MoonPhaseCalculator';
import { toast } from 'sonner';

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
		<div className="flex flex-col gap-4 h-full items-start justify-start p-6">
		{/* Moon Icon */}
			<MoonIcon phase={phaseValue} />
		{/* Phase Info */}
		<div className="flex flex-col gap-1.5 items-start justify-start w-full">
			<h3 className="font-bold text-base text-black leading-normal">
				{title}: {phase} <span className="font-normal">{icon || emoji}</span>
			</h3>
			{action && (
				<p className="font-mono italic text-base text-black leading-normal">
					{action}
				</p>
			)}
			<p className="font-mono italic text-base text-black leading-normal min-h-[42px]">
				{description}
			</p>
		</div>
		
		{/* Date Text */}
		{dateText && (
			<p className="font-mono text-base text-gray-900 leading-normal">
				{dateText}
			</p>
		)}
		
		{/* Reminder Button */}
		{timeUntilPhase && !isCurrentPhase && (
			<button
				onClick={() => {
					handleSubscribe(phase)
					toast.success('Subscribed!')
				}}
				disabled={subscribed}
				className="bg-sky-200 hover:bg-sky-300 disabled:bg-gray-300 px-4 py-2 rounded-lg font-mono text-base text-neutral-900 transition-colors text-balance"
				type="button"
			>
				{subscribed ? 'Subscribed!' : `Remind me ${timeUntilPhase}`}
			</button>
		)}
		
		{/* Current Phase Status */}
		{timeUntilPhase && isCurrentPhase && (
			<div className="py-2 text-center">
				<p className="font-mono text-base text-black">
					Current phase {timeUntilPhase}
				</p>
			</div>
		)}
	</div>
	);
}