import Link from "next/link";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthCodeError() {
	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center mb-4">
						<AlertCircle className="h-12 w-12 text-destructive" />
					</div>
					<CardTitle className="text-2xl font-bold text-center">
						Authentication Error
					</CardTitle>
					<CardDescription className="text-center">
						We couldn't complete your sign in. This might happen if you took too
						long to complete the process or if the link expired.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button asChild className="w-full">
						<Link href="/auth/login">Try Again</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link href="/">Go Home</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
