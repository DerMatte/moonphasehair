"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Bell, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";

interface UserDropdownProps {
	user: SupabaseUser;
}

export function UserDropdown({ user }: UserDropdownProps) {
	const router = useRouter();
	const supabase = createClient();
	const [notificationsEnabled, setNotificationsEnabled] = useState(false);

	useEffect(() => {
		// Check if notifications are enabled
		const checkNotificationStatus = async () => {
			if ("Notification" in window) {
				setNotificationsEnabled(Notification.permission === "granted");
			}
		};
		checkNotificationStatus();
	}, []);

	const handleSignOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			toast.error("Failed to sign out");
		} else {
			router.push("/");
			router.refresh();
		}
	};

	const toggleNotifications = async () => {
		if (!notificationsEnabled && "Notification" in window) {
			const permission = await Notification.requestPermission();
			if (permission === "granted") {
				setNotificationsEnabled(true);
				toast.success("Notifications enabled");
			} else {
				toast.error("Notification permission denied");
			}
		} else {
			setNotificationsEnabled(false);
			toast.info("Notifications disabled");
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
				<Button variant="ghost" size="icon" className="rounded-full">
					<Avatar className="h-8 w-8 rounded-full">
						<AvatarImage
							src={user.user_metadata?.avatar_url}
							alt={user.user_metadata?.full_name || "User"}
						/>
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
				<DropdownMenuItem className="hover:bg-neutral-200 w-full cursor-pointer">
					<Link href="/profile" className="flex items-center gap-2">
						<User className="mr-2 h-4 w-4" />
						Profile
					</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={toggleNotifications} className="hover:bg-neutral-200 cursor-pointer">
					{notificationsEnabled ? (
						<>
							<BellOff className="mr-2 h-4 w-4" />
							Disable Notifications
						</>
					) : (
						<>
							<Bell className="mr-2 h-4 w-4" />
							Enable Notifications
						</>
					)}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} className="hover:bg-neutral-200 cursor-pointer">
					<LogOut className="mr-2 h-4 w-4" />
					Sign Out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
