import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UserSubscriptions from "@/components/UserSubscriptions";
import { User } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login?redirect=/profile");
	}

	return (
		<div className="min-h-dvh">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-8">
				{/* Page Header */}
				<div className="text-center mb-8 md:col-span-2">
					<div className="flex items-center justify-center gap-3 mb-4">
						<h1 className="text-3xl font-bold">
							Your Profile
						</h1>
					</div>
					<p className="text-neutral-600 max-w-2xl mx-auto">
						Manage your moon phase notifications and account settings
					</p>
				</div>

				{/* User Info */}
				<Card className="max-w-2xl mx-auto mb-8">
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
				<UserSubscriptions />

				{/* Additional sections can be added here */}
				<Card className="">
					<CardHeader className="">
						<h2 className="text-xl font-semibold mb-4">
							Notification Settings
						</h2>
					</CardHeader>
					<CardContent className="">
						<p className="text-neutral-600 mb-4">
							Customize how and when you receive moon phase notifications.
						</p>
						<div className="text-sm text-neutral-500">
							<p>
								💡 Tip: You can subscribe to multiple moon phases by clicking
								the "Remind me" buttons on the main page.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
