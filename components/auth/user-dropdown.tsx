"use client";

import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Bell, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

interface UserDropdownProps {
	user: SupabaseUser;
}

export function UserDropdown({ user }: UserDropdownProps) {
	const router = useRouter();
	const supabase = createClient();

	const handleSignOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			toast.error("Failed to sign out");
		} else {
			router.push("/");
			router.refresh();
		}
	};

	const getUserInitials = () => {
		const name = user.user_metadata?.full_name || user.email;
		if (!name) return "U";

		const parts = name.split(" ");
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full"
					aria-label="Open account menu"
				>
					<Avatar className="h-8 w-8 rounded-full">
						<AvatarImage src={user.user_metadata?.avatar_url} alt="" />
						<AvatarFallback>{getUserInitials()}</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56 bg-neutral-50">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{user.user_metadata?.full_name || "User"}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					asChild
					className="hover:bg-neutral-200 w-full cursor-pointer"
				>
					<Link href="/profile" className="flex items-center gap-2">
						<User className="mr-2 h-4 w-4" aria-hidden="true" />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					asChild
					className="hover:bg-neutral-200 w-full cursor-pointer"
				>
					<Link
						href="/profile#notification-settings"
						className="flex items-center gap-2"
					>
						<Bell className="mr-2 h-4 w-4" aria-hidden="true" />
						Manage Notifications
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleSignOut}
					className="hover:bg-neutral-200 cursor-pointer"
				>
					<LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
