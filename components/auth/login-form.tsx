"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
	const [isLoading, setIsLoading] = useState<string | null>(null);
	const supabase = createClient();

	const signInWithProvider = async (provider: "twitter" | "google") => {
		try {
			setIsLoading(provider);

			const redirectUrl = `${window.location.origin}/api/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ""}`;

			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: redirectUrl,
				},
			});

			if (error) {
				toast.error(`Failed to sign in with ${provider}`);
				console.error("Auth error:", error);
			}
		} catch (error) {
			toast.error("An unexpected error occurred");
			console.error("Sign in error:", error);
		} finally {
			setIsLoading(null);
		}
	};

	return (
		<div className="flex min-h-dvh items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold text-center">
						Welcome to MoonPhase Hair
					</CardTitle>
					<CardDescription className="text-center">
						Sign in to be able to receive moon phase & fasting notifications
					</CardDescription>
				</CardHeader>
				<CardContent className="">
						<p className="block sm:hidden text-xs text-muted-foreground mb-2">
							Continue with:
						</p>
					<div className="flex flex-col gap-2">
						<Button
							variant="outline"
							onClick={() => signInWithProvider("twitter")}
							disabled={isLoading !== null}
							className="flex w-full whitespace-normal"
							title="Continue with X"
							aria-label="Login with X"
						>
							{isLoading === "twitter" ? (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Icons.twitter className="mr-2 h-4 w-4" />
							)}
							<div className="hidden sm:inline-block">Continue with X</div>
						</Button>
						<Button
							variant="outline"
							onClick={() => signInWithProvider("google")}
							disabled={isLoading !== null}
							className="flex w-full whitespace-normal"
							title="Continue with Google"
							aria-label="Login with Google"
						>
							{isLoading === "google" ? (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Icons.google className="mr-2 h-4 w-4" />
							)}
							<div className="hidden sm:inline-block">Continue with Google</div>
						</Button>
					</div>
					<p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
						By signing in, you agree that we store your name, email address and profile picture to provide you with a better experience.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
