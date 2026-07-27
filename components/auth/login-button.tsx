"use client";

import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LoginButton() {
	const router = useRouter();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="m-0 p-0"
			onClick={() => router.push("/auth/login")}
			aria-label="Sign in"
		>
			<User className="size-8" aria-hidden="true" />
		</Button>
	);
}
