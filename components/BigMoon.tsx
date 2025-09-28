"use client";

// Big moon phase component using moon-pattern.png
import Image from "next/image";
import { useEffect, useState } from "react";
import { getMoonPosition, type MoonPositionData } from "@/lib/moonPosition";
import { useStoredLocation } from "@/hooks/useLocation";
import { Compass, Navigation, MapPin, Loader2 } from "lucide-react";

export default function BigMoon({ phase }: { phase: number }) {
	const { location, loading: locationLoading, isUsingDefault } = useStoredLocation();
	const [moonPosition, setMoonPosition] = useState<MoonPositionData | null>(null);
	const [currentTime, setCurrentTime] = useState(new Date());

	// Update moon position when location changes or every minute
	useEffect(() => {
		if (!location) return;

		const updatePosition = () => {
			const now = new Date();
			setCurrentTime(now);
			const position = getMoonPosition(now, location.latitude, location.longitude);
			setMoonPosition(position);
		};

		// Initial update
		updatePosition();

		// Update every minute
		const interval = setInterval(updatePosition, 60000);

		return () => clearInterval(interval);
	}, [location]);
	// Use viewBox units instead of pixels for better scaling
	const viewBoxSize = 100;
	const radius = viewBoxSize / 2;

	// Inverted calculatePath function - shadows and illumination are flipped
	const calculatePath = (phase: number) => {
		// Normalize phase to 0-1 range
		const normalizedPhase = phase % 1;

		if (normalizedPhase === 0 || normalizedPhase >= 0.99) {
			// New moon - no dark overlay (now fully illuminated)
			return "";
		} else if (normalizedPhase === 0.5) {
			// Full moon - full dark overlay (now fully shadowed)
			return `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} ${viewBoxSize} A ${radius} ${radius} 0 1 1 ${radius} 0`;
		} else if (normalizedPhase < 0.5) {
			// Waxing phases - shadow advances from left to right (inverted)
			const offset = Math.cos(normalizedPhase * 2 * Math.PI) * radius;
			return `M ${radius} 0 A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 0 : 1} ${radius} ${viewBoxSize} A ${radius} ${radius} 0 1 0 ${radius} 0`;
		} else {
			// Waning phases - shadow recedes from right to left (inverted)
			const offset = Math.cos(normalizedPhase * 2 * Math.PI) * radius;
			return `M ${radius} 0 A ${radius} ${radius} 0 1 0 ${radius} ${viewBoxSize} A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 1 : 0} ${radius} 0`;
		}
	};

	return (
		<div className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] aspect-square mx-auto">
			{/* Outer glow effect */}
			<div className="absolute -inset-[10%] rounded-full bg-gradient-to-r from-blue-200/20 via-white/30 to-blue-200/20 blur-2xl animate-pulse" />

			{/* Moon container with border */}
			<div className="relative w-full h-full rounded-full border-2 border-gray-300/30 p-[2%]">
				{/* Cool Arrow in bottom left corner */}
				{/** biome-ignore lint/performance/noImgElement: svgs are better like this */}
				<img
					src="/CoolArrow.svg"
					alt=""
					className="absolute bottom-0 left-0 -translate-x-4 -translate-y-4 -z-10 w-1/2"
				/>

				{/* Moon texture background */}
				<div className="relative w-full h-full rounded-full overflow-hidden">
					{/* Next.js optimized background image */}
					<Image
						src="/moon-pattern.png"
						alt="Moon surface texture"
						fill
						priority
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
						{calculatePath(phase) && (
							<path
								d={calculatePath(phase)}
								fill={`url(#moonShadowGradient-${phase})`}
								opacity="0.9"
							/>
						)}
					</svg>

					{/* Inner shadow for depth */}
					<div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_rgba(0,0,0,0.3)]" />
				</div>
			</div>

			{/* Bottom glow for extra effect */}
			<div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-3/4 h-[10%] bg-neutral-200/20 blur-xl rounded-full" />

			{/* Moon Position Information */}
			<div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
				<div className="bg-gradient-to-br from-white/5 to-white/10 dark:from-black/10 dark:to-black/20 backdrop-blur-lg rounded-2xl p-4 border border-white/20 dark:border-gray-700/30 shadow-xl">
					{locationLoading ? (
						<div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
							<Loader2 className="w-4 h-4 animate-spin" />
							<span>Getting location...</span>
						</div>
					) : moonPosition ? (
						<div className="space-y-3">
							{/* Location indicator */}
							{isUsingDefault && (
								<div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 dark:text-amber-400">
									<MapPin className="w-3.5 h-3.5" />
									<span className="font-medium">Using default location (New York City)</span>
								</div>
							)}
							
							{/* Position data */}
							<div className="grid grid-cols-2 gap-4">
								{/* Azimuth */}
								<div className="bg-white/5 dark:bg-black/10 rounded-xl p-3">
									<div className="flex items-center gap-2 mb-1">
										<Compass className="w-4 h-4 text-blue-400" />
										<span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Azimuth</span>
									</div>
									<div className="text-lg font-bold text-gray-900 dark:text-white">
										{moonPosition.azimuthDegrees.toFixed(1)}°
									</div>
									<div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
										{moonPosition.azimuthDirection}
									</div>
								</div>
								
								{/* Altitude/Elevation */}
								<div className="bg-white/5 dark:bg-black/10 rounded-xl p-3">
									<div className="flex items-center gap-2 mb-1">
										<Navigation className="w-4 h-4 text-green-400" />
										<span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Elevation</span>
									</div>
									<div className="text-lg font-bold text-gray-900 dark:text-white">
										{moonPosition.altitudeDegrees.toFixed(1)}°
									</div>
									<div className="text-xs font-medium">
										<span className={moonPosition.isVisible ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
											{moonPosition.isVisible ? '↑ Above horizon' : '↓ Below horizon'}
										</span>
									</div>
								</div>
							</div>

							{/* Phase and update info */}
							<div className="pt-3 border-t border-white/10 dark:border-gray-700/20">
								<div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
									<span>Phase: <span className="font-medium text-gray-900 dark:text-white">{(phase * 100).toFixed(1)}%</span></span>
									<span>Updated: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
								</div>
							</div>
						</div>
					) : (
						<div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
							Position data unavailable
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
