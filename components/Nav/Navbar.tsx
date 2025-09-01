"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import logo from "@/public/moonphasehair-logo.png";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Close, Menu } from "@nsmr/pixelart-react";
import { Label } from "../ui/label";
import { DesktopNavbar } from "./DesktopNavbar";
import { type LocationData } from "./index";

export function Navbar({
	locationData,
}: {
	locationData: LocationData | null;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const toggleMenu = () => setIsOpen(!isOpen);
	const pathname = usePathname();

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

	return (
		<nav className="w-full font-medium pt-2">
			{/* Desktop Layout */}
			<DesktopNavbar pathname={pathname} />

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

				{/* Mobile Right Side - Location Icon + Menu Button */}
				<div className="flex items-center space-x-3 h-12">
					{/* Location Icon on Mobile */}
					{/* <Pin size={32} /> */}

					{/* Hamburger Menu Button */}
					<motion.button
						onClick={toggleMenu}
						animate={{ rotate: isOpen ? 90 : 0 }}
						transition={{ duration: 0.2 }}
						className="p-1 flex items-center justify-center rounded text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shadow-none"
						aria-label="Toggle menu"
					>
						{isOpen ? <Close size={32} /> : <Menu size={32} />}
					</motion.button>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial="closed"
						animate="open"
						exit="closed"
						variants={menuVariants}
						className="md:hidden overflow-hidden mt-4"
					>
						<div className="py-2 space-y-1 border-t border-neutral-200 w-full">
							<motion.div variants={linkVariants}>
								<Link
									href="/"
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
							<motion.div variants={linkVariants} transition={{ delay: 0.1 }}>
								<Link
									href="/full-moon-fasting"
									onClick={() => setIsOpen(false)}
									className={cn(
										buttonVariants({ variant: "ghost" }),
										"px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium w-full flex justify-start items-center",
										pathname === "/full-moon-fasting" && "bg-neutral-200",
									)}
								>
									Full Moon Fasting
								</Link>
								<Label className="flex items-center justify-start text-xs text-center px-3 pt-4 rounded bg-transparent text-neutral-600 ">
									<span className="font-medium">Location:</span>
									{locationData?.city}, {locationData?.country}
								</Label>
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
