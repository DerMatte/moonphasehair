"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RouteError({
	error: err,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	console.error("Route error:", err);
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
			<h2 className="text-2xl font-bold text-neutral-700">
				Something went wrong
			</h2>
			<p className="mt-2 text-sm text-neutral-500">
				The spirits have disrupted the connection. Try again.
			</p>
			<div className="mt-6 flex gap-4">
				<Button onClick={reset}>Try again</Button>
				<Button asChild variant="outline">
					<Link href="/">Go home</Link>
				</Button>
			</div>
		</div>
	);
}
