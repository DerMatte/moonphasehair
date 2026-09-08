"use client";

import { Close, Menu } from "@nsmr/pixelart-react";
import type { User } from "@supabase/supabase-js";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginButton } from "@/components/auth/login-button";
import { UserDropdown } from "@/components/auth/user-dropdown";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import logo from "@/public/moonphasehair-logo.png";
import { buttonVariants } from "../ui/button";
import { DesktopNavbar } from "./DesktopNavbar";
import type { LocationData } from "./index";

const menuVariants = {
	closed: {
		opacity: 0,
		height: 0,
		transition: {
			duration: 0.3,
			ease: [0.4, 0.0, 0.2, 1] as const,
		},
	},
	open: {
		opacity: 1,
		height: "auto",
		transition: {
			duration: 0.3,
			ease: [0.4, 0.0, 0.2, 1] as const,
		},
	},
} as const;

const linkVariants = {
	closed: { opacity: 0, y: -10 },
	open: { opacity: 1, y: 0 },
};

const reducedMenuVariants = {
	closed: { opacity: 0, height: 0, transition: { duration: 0 } },
	open: { opacity: 1, height: "auto", transition: { duration: 0 } },
} as const;

const reducedLinkVariants = {
	closed: { opacity: 0 },
	open: { opacity: 1 },
};

export function Navbar({
	locationData,
	initialUser = null,
}: {
	locationData: LocationData | null;
	initialUser?: User | null;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [user, setUser] = useState<User | null>(initialUser);
	const [supabase] = useState(createClient);
	const toggleMenu = () => setIsOpen((prev) => !prev);
	const pathname = usePathname();
	const shouldReduceMotion = useReducedMotion();
	const displayLocation =
		locationData?.city && locationData.city !== locationData.country
			? [locationData.city, locationData.country].filter(Boolean).join(", ")
			: locationData?.country || locationData?.city || null;

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, [supabase]);

	return (
		<nav className="w-full font-medium pt-2" aria-label="Primary">
			{/* Desktop Layout */}
			<DesktopNavbar pathname={pathname} user={user} />

			{/* Mobile Layout */}
			<div className="md:hidden flex items-center justify-between w-full h-12">
				{/* Logo */}
				<Link href="/" className="flex items-center h-12">
					<Image
						src={logo}
						alt="Moonphase Hair Logo"
						className="size-12"
						priority
					/>
				</Link>

				{/* Mobile Right Side - Auth + Menu Button */}
				<div className="flex items-center space-x-2 h-12">
					{/* Auth Button */}
					{user ? <UserDropdown user={user} /> : <LoginButton />}

					{/* Hamburger Menu Button */}
					<motion.button
						type="button"
						onClick={toggleMenu}
						animate={{ rotate: shouldReduceMotion ? 0 : isOpen ? 90 : 0 }}
						transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
						className="p-1 flex items-center justify-center rounded text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shadow-none"
						aria-label={
							isOpen ? "Close navigation menu" : "Open navigation menu"
						}
						aria-expanded={isOpen}
						aria-controls="mobile-navigation-menu"
					>
						{isOpen ? (
							<Close size={32} aria-hidden="true" />
						) : (
							<Menu size={32} aria-hidden="true" />
						)}
					</motion.button>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						id="mobile-navigation-menu"
						initial="closed"
						animate="open"
						exit="closed"
						variants={shouldReduceMotion ? reducedMenuVariants : menuVariants}
						className="md:hidden overflow-hidden mt-4"
					>
						<div className="py-2 space-y-1 border-t border-neutral-200 w-full">
							<motion.div
								variants={
									shouldReduceMotion ? reducedLinkVariants : linkVariants
								}
							>
								<Link
									href="/"
									aria-current={pathname === "/" ? "page" : undefined}
									onClick={() => setIsOpen(false)}
									className={cn(
										buttonVariants({ variant: "ghost" }),
										"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium w-full flex justify-start items-center ",
										pathname === "/" && "bg-neutral-200",
									)}
								>
									Home
								</Link>
							</motion.div>
							<motion.div
								variants={
									shouldReduceMotion ? reducedLinkVariants : linkVariants
								}
								transition={{ delay: shouldReduceMotion ? 0 : 0.1 }}
							>
								<Link
									href="/full-moon-fasting"
									aria-current={
										pathname === "/full-moon-fasting" ? "page" : undefined
									}
									onClick={() => setIsOpen(false)}
									className={cn(
										buttonVariants({ variant: "ghost" }),
										"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium w-full flex justify-start items-center",
										pathname === "/full-moon-fasting" && "bg-neutral-200",
									)}
								>
									Full Moon Fasting
								</Link>
							</motion.div>
							<motion.div
								variants={
									shouldReduceMotion ? reducedLinkVariants : linkVariants
								}
								transition={{ delay: shouldReduceMotion ? 0 : 0.15 }}
							>
								<Link
									href="/developers"
									aria-current={pathname === "/developers" ? "page" : undefined}
									onClick={() => setIsOpen(false)}
									className={cn(
										buttonVariants({ variant: "ghost" }),
										"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium w-full flex justify-start items-center",
										pathname === "/developers" && "bg-neutral-200",
									)}
								>
									API
								</Link>
							</motion.div>
							{user && (
								<motion.div
									variants={
										shouldReduceMotion ? reducedLinkVariants : linkVariants
									}
									transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
								>
									<Link
										href="/profile"
										aria-current={pathname === "/profile" ? "page" : undefined}
										onClick={() => setIsOpen(false)}
										className={cn(
											buttonVariants({ variant: "ghost" }),
											"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium w-full flex justify-start items-center",
											pathname === "/profile" && "bg-neutral-200",
										)}
									>
										Profile
									</Link>
								</motion.div>
							)}
							<motion.div
								variants={
									shouldReduceMotion ? reducedLinkVariants : linkVariants
								}
								transition={{
									delay: shouldReduceMotion ? 0 : user ? 0.3 : 0.2,
								}}
							>
								{displayLocation ? (
									<div className="flex items-center justify-start gap-1 text-xs px-3 pt-4 rounded bg-transparent text-neutral-600">
										<span className="font-medium">Location:</span>
										<span>{displayLocation}</span>
									</div>
								) : null}
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
