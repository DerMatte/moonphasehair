"use client";

import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface PageTransitionProps {
	children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname();

	return (
		<AnimatePresence mode="popLayout">
			<motion.div
				key={pathname}
				initial={{ opacity: 0 }}
				animate={{
					opacity: 1,
					transition: { duration: 0.7, ease: [0.4, 0.2, 0.2, 1] },
				}}
				exit={{
					opacity: 0,
					transition: { duration: 0.7, ease: [0.4, 0.2, 0.2, 1] },
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
