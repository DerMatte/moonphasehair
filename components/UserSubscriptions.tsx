import { createClient } from "@/lib/supabase/server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Bell } from "lucide-react";

interface Subscription {
	id: string;
	target_phase: string;
}

export default async function UserSubscriptions() {
	const supabase = await createClient();
	// biome-ignore lint/suspicious/noExplicitAny: Supabase types
	const { data: userData }: any = await supabase.auth.getUser();
	const user = userData?.user;

	if (!user) {
		return null;
	}

	const { data, error } = await supabase
		.from("subscriptions")
		.select("*")
		.eq("user_id", user.id)
		.eq("subscription_type", "hair");

	if (error || !data || data.length === 0) {
		return null;
	}

	const subscribedPhases = data as Subscription[];

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="w-5 h-5" />
					Your Moon Phase Notifications
				</CardTitle>
				<CardDescription>
					You'll be notified when these phases occur
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{subscribedPhases.map((subscription: Subscription) => (
						<div
							key={subscription.id}
							className="flex items-center gap-2 p-2 bg-neutral-50 rounded"
						>
							<span className="text-lime-600">✓</span>
							<span className="font-mono">{subscription.target_phase}</span>
						</div>
					))}
				</div>
				<p className="text-xs text-muted-foreground mt-4">
					Click on any moon phase card below to manage your subscriptions
				</p>
			</CardContent>
		</Card>
	);
}