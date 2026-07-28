"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
	children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname();
	const shouldReduceMotion = useReducedMotion();
	const transition = shouldReduceMotion
		? { duration: 0 }
		: { duration: 0.25, ease: [0.4, 0.2, 0.2, 1] as const };

	return (
		// `wait` finishes the exit fade before mounting the next route (or its
		// loading skeleton), so the main column never collapses mid-transition.
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={pathname}
				initial={shouldReduceMotion ? false : { opacity: 0 }}
				animate={{
					opacity: 1,
					transition,
				}}
				exit={{
					opacity: 0,
					transition,
				}}
				className="h-full min-h-[50vh]"
				style={{
					willChange: "opacity",
				}}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}
