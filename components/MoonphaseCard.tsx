"use client";

import MoonIcon from "@/components/MoonIcon";
import { useState } from 'react';
import { getMoonPhaseWithTiming } from '@/lib/MoonPhaseCalculator';

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

	const handleSubscribe = async (targetPhase: string) => {
		if (!('PushManager' in window)) return alert('Push notifications not supported');

		const permission = await Notification.requestPermission();
		if (permission !== 'granted') return;

		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
		});

		// Calculate next date for this phase (find next occurrence, e.g., ~2 weeks out)
		const { upcoming } = getMoonPhaseWithTiming(new Date());
		const nextOccurrence = upcoming.find((p) => p.name === targetPhase);
		const nextDate = nextOccurrence?.date?.toISOString() || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // Fallback: 2 weeks

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
				<button
					onClick={() => handleSubscribe(phase)}
					disabled={subscribed}
					className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
					type="button"
				>
					{subscribed ? 'Subscribed!' : 'Remind me for this phase (in ~2 weeks)'}
				</button>
			</div>
		</div>
	);
}