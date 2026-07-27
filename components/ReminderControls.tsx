"use client";

import { Bell, BellOff, CalendarClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { removeUserSubscription } from "@/app/actions/moon-subscription";
import { Button } from "@/components/ui/button";

export interface ReminderSummary {
	id: string;
	target_phase: string;
	next_date: string;
	subscription_type: string;
}

type PermissionState = NotificationPermission | "checking" | "unsupported";

export function ReminderControls({
	reminders,
}: {
	reminders: ReminderSummary[];
}) {
	const [permission, setPermission] = useState<PermissionState>("checking");
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	useEffect(() => {
		setPermission(
			"Notification" in window ? Notification.permission : "unsupported",
		);
	}, []);

	const requestPermission = async () => {
		if (!("Notification" in window)) return;

		const result = await Notification.requestPermission();
		setPermission(result);

		if (result === "granted") {
			toast.success("Browser notifications are allowed");
		} else {
			toast.info("Notification permission was not granted");
		}
	};

	const removeReminder = (reminder: ReminderSummary) => {
		setRemovingId(reminder.id);
		startTransition(async () => {
			const result = await removeUserSubscription(reminder.id);
			if (result.success) {
				toast.success(`${getReminderLabel(reminder)} reminder removed`);
				router.refresh();
			} else {
				toast.error(result.error || "Failed to remove reminder");
			}
			setRemovingId(null);
		});
	};

	return (
		<div className="space-y-5">
			<div className="rounded-lg border bg-neutral-50 p-4" aria-live="polite">
				<div className="flex items-start gap-3">
					{permission === "granted" ? (
						<Bell className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
					) : (
						<BellOff className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
					)}
					<div className="min-w-0 flex-1 space-y-2">
						<div>
							<p className="font-medium">Browser Permission</p>
							<p className="text-sm text-muted-foreground">
								{getPermissionDescription(permission)}
							</p>
						</div>
						{permission === "default" ? (
							<Button type="button" size="sm" onClick={requestPermission}>
								Allow Browser Notifications
							</Button>
						) : null}
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-semibold">Active Reminders</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Removing a reminder stops that topic. Browser permission is managed
					separately in your browser settings.
				</p>
			</div>

			{reminders.length > 0 ? (
				<ul className="space-y-2">
					{reminders.map((reminder) => (
						<li
							key={reminder.id}
							className="flex flex-col gap-3 rounded-lg border bg-neutral-50 p-3 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="flex min-w-0 items-start gap-3">
								<CalendarClock
									className="mt-0.5 size-5 shrink-0"
									aria-hidden="true"
								/>
								<div className="min-w-0">
									<p className="font-medium">{getReminderLabel(reminder)}</p>
									<p className="break-words text-sm text-muted-foreground">
										{reminder.target_phase}
										{" · "}
										Next scheduled{" "}
										<time
											dateTime={reminder.next_date}
											suppressHydrationWarning
										>
											{formatReminderDate(reminder.next_date)}
										</time>
									</p>
								</div>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => removeReminder(reminder)}
								disabled={isPending}
								aria-label={`Remove ${getReminderLabel(reminder)} reminder for ${reminder.target_phase}`}
							>
								<Trash2 className="size-4" aria-hidden="true" />
								{removingId === reminder.id ? "Removing…" : "Remove"}
							</Button>
						</li>
					))}
				</ul>
			) : (
				<div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
					<p>You do not have any active reminders.</p>
					<p className="mt-2">
						Choose a hair reminder on the{" "}
						<Link className="underline underline-offset-4" href="/">
							moon phase dashboard
						</Link>{" "}
						or a fasting reminder on the{" "}
						<Link
							className="underline underline-offset-4"
							href="/full-moon-fasting"
						>
							fasting page
						</Link>
						.
					</p>
				</div>
			)}
		</div>
	);
}

function getPermissionDescription(permission: PermissionState) {
	switch (permission) {
		case "granted":
			return "Allowed on this browser. The active topics below determine what the app sends.";
		case "denied":
			return "Blocked in this browser. Change the site permission in your browser settings to receive reminders.";
		case "default":
			return "Not decided yet. Allow notifications before subscribing to a reminder.";
		case "unsupported":
			return "This browser does not support web push notifications.";
		default:
			return "Checking this browser…";
	}
}

function getReminderLabel(reminder: ReminderSummary) {
	return reminder.subscription_type === "fasting" ? "Fasting" : "Hair Phase";
}

function formatReminderDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "date unavailable";

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}
