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
		: { duration: 0.35, ease: [0.4, 0.2, 0.2, 1] as const };

	return (
		<AnimatePresence mode="popLayout">
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
				className="h-full"
				style={{
					willChange: "opacity",
				}}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}
