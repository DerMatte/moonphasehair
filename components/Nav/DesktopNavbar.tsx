import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import { LoginButton } from "@/components/auth/login-button";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { cn } from "@/lib/utils";
import logo from "@/public/moonphasehair-logo.png";
import { buttonVariants } from "../ui/button";

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
						aria-current={pathname === "/" ? "page" : undefined}
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
						aria-current={
							pathname === "/full-moon-fasting" ? "page" : undefined
						}
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
							aria-current={pathname === "/profile" ? "page" : undefined}
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
