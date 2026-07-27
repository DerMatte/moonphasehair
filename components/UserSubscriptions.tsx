import { Bell } from "lucide-react";
import { ReminderControls } from "@/components/ReminderControls";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/lib/database.types";

type Subscription = Pick<
	Tables<"subscriptions">,
	"id" | "target_phase" | "next_date" | "subscription_type"
>;

export default function UserSubscriptions({
	subscriptions,
	hasLoadError = false,
}: {
	subscriptions: Subscription[];
	hasLoadError?: boolean;
}) {
	return (
		<Card id="notification-settings" className="w-full scroll-mt-6">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="w-5 h-5" aria-hidden="true" />
					Notification Settings
				</CardTitle>
				<CardDescription>
					Manage browser permission, hair reminders, and fasting reminders.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{hasLoadError ? (
					<p role="alert" className="text-sm text-destructive">
						Your reminders could not be loaded. Refresh the page to try again.
					</p>
				) : (
					<ReminderControls reminders={subscriptions} />
				)}
			</CardContent>
		</Card>
	);
}
