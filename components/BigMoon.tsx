"use client";

// Big moon phase component using moon-pattern.png
import Image from "next/image";
import { useEffect, useState } from "react";
import { moonShadowPath } from "@/lib/moonShadowPath";

export default function BigMoon({ phase }: { phase: number }) {
	// Use viewBox units instead of pixels for better scaling
	const viewBoxSize = 100;
	const shadowPath = moonShadowPath(phase, viewBoxSize);

	// Tilt of the moon as it currently appears in the observer's sky,
	// fetched client-side so the cached page stays location-agnostic
	const [rotation, setRotation] = useState<number | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		fetch("/api/moon-orientation", { signal: controller.signal })
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (data && typeof data.rotation === "number") {
					setRotation(data.rotation);
				}
			})
			.catch(() => {});
		return () => controller.abort();
	}, []);

	return (
		<div className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] aspect-square mx-auto">
			{/* Outer glow effect */}
			<div className="absolute -inset-[10%] rounded-full bg-gradient-to-r from-blue-200/20 via-white/30 to-blue-200/20 blur-2xl animate-pulse motion-reduce:animate-none" />

			{/* Moon container with border */}
			<div className="relative w-full h-full rounded-full border-2 border-gray-300/30 p-[2%]">
				{/* Cool Arrow in bottom left corner */}
				{/** biome-ignore lint/performance/noImgElement: svgs are better like this */}
				<img
					src="/CoolArrow.svg"
					alt=""
					width={320}
					height={320}
					className="absolute bottom-0 left-0 -translate-x-4 -translate-y-4 -z-10 w-1/2"
				/>

				{/* Moon texture background, rotated to match the moon's tilt in the sky */}
				<div
					className="relative w-full h-full rounded-full overflow-hidden transition-transform duration-1000 ease-out motion-reduce:transition-none"
					style={{ transform: `rotate(${rotation ?? 0}deg)` }}
				>
					{/* Next.js optimized background image */}
					<Image
						src="/moon-pattern.png"
						alt="Moon surface texture"
						fill
						priority
						sizes="(max-width: 640px) 400px, (max-width: 768px) 500px, (max-width: 1024px) 600px, 700px"
						className="object-cover brightness-[1.3] contrast-[1.2]"
					/>
					{/* Simplified dark overlay for the moon phase */}
					<svg
						width="100%"
						height="100%"
						viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
						preserveAspectRatio="xMidYMid meet"
						className="absolute inset-0"
					>
						<title>{`Moon phase visualization - Phase: ${(phase * 100).toFixed(1)}%`}</title>
						<defs>
							{/* Improved gradient for more realistic shadow */}
							<radialGradient
								id={`moonShadowGradient-${phase}`}
								cx="50%"
								cy="50%"
								r="50%"
							>
								<stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
								<stop offset="70%" stopColor="rgba(0,0,0,0.85)" />
								<stop offset="100%" stopColor="rgba(0,0,0,0.95)" />
							</radialGradient>
						</defs>

						{/* Draw the shadow path if it exists */}
						{shadowPath ? (
							<path
								d={shadowPath}
								fill={`url(#moonShadowGradient-${phase})`}
								opacity="0.9"
							/>
						) : null}
					</svg>

					{/* Inner shadow for depth */}
					<div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
				</div>
			</div>

			{/* Bottom glow for extra effect */}
			<div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-3/4 h-[10%] bg-neutral-200/20 blur-xl rounded-full" />

			{/* Debug info - remove in production */}
			<div className="absolute hidden md:inline-block -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono">
				Phase: {(phase * 100).toFixed(1)}%
				{rotation !== null && ` · Tilt: ${rotation.toFixed(0)}°`}
			</div>
		</div>
	);
}
