"use client";

import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export function LoginButton() {
	const router = useRouter();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="m-0 p-0"
			onClick={() => router.push("/auth/login")}
		>
			<User className="size-8" />
			<span className="sr-only">Sign in</span>
		</Button>
	);
}
