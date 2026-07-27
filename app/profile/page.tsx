import { redirect } from "next/navigation";
import { Suspense } from "react";
import UserSubscriptions from "@/components/UserSubscriptions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

async function ProfileContent() {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/auth/login?redirect=/profile");
	}

	const supabase = await createClient();
	const { data: subscriptions, error: subscriptionsError } = await supabase
		.from("subscriptions")
		.select("id, target_phase, next_date, subscription_type")
		.eq("user_id", user.id)
		.order("next_date", { ascending: true });

	return (
		<div className="min-h-dvh">
			<div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-4 py-8">
				{/* Page Header */}
				<div className="mb-8 text-center">
					<div className="flex items-center justify-center gap-3 mb-4">
						<h1 className="text-3xl font-bold">Your Profile</h1>
					</div>
					<p className="text-neutral-600 max-w-2xl mx-auto">
						Manage your account and all notification topics in one place.
					</p>
				</div>

				{/* User Info */}
				<Card className="">
					<CardHeader className="">
						<h2 className="text-xl font-semibold mb-4">Account Information</h2>
					</CardHeader>
					<CardContent className="">
						<div className="space-y-3">
							<div>
								<span className="text-sm font-medium text-neutral-500 block">
									Email
								</span>
								<p className="">{user.email}</p>
							</div>
							<div>
								<span className="text-sm font-medium text-neutral-500 block">
									Member Since
								</span>
								<p className="">
									{new Date(user.created_at).toLocaleDateString("en-US", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* User Subscriptions */}
				<UserSubscriptions
					subscriptions={subscriptions ?? []}
					hasLoadError={Boolean(subscriptionsError)}
				/>
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[50vh] animate-pulse items-center justify-center" />
			}
		>
			<ProfileContent />
		</Suspense>
	);
}
