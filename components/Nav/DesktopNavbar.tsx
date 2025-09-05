import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "@/public/moonphasehair-logo.png";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { LoginButton } from "@/components/auth/login-button";
import type { User } from "@supabase/supabase-js";

export function DesktopNavbar({
	pathname,
	user,
}: {
	pathname: string;
	user: User | null;
}) {
	return (
		<div className="hidden md:flex items-center justify-between w-full h-12">
			<div className="flex items-center gap-2">
				{/* Logo */}
				<Link href="/" className="flex items-center mr-4">
					<Image
						src={logo}
						alt="Moonphase Hair Logo"
						className="size-14"
						priority
					/>
				</Link>

				{/* Navigation Links */}
				<div className="flex items-center space-x-1 h-12">
					<Link
						href="/"
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium",
							pathname === "/" && "bg-neutral-200",
						)}
					>
						Home
					</Link>
					<Link
						href="/full-moon-fasting"
						className={cn(
							buttonVariants({ variant: "ghost" }),
							"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium",
							pathname === "/full-moon-fasting" && "bg-neutral-200",
						)}
					>
						Full Moon Fasting
					</Link>
					{user && (
						<Link
							href="/profile"
							className={cn(
								buttonVariants({ variant: "ghost" }),
								"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium",
								pathname === "/profile" && "bg-neutral-200",
							)}
						>
							Profile
						</Link>
					)}
				</div>
			</div>

			{/* Auth Section */}
			<div className="mr-2">
				{user ? <UserDropdown user={user} /> : <LoginButton />}
			</div>
		</div>
	);
}
