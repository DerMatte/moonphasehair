// Big moon phase component using moon-pattern.png
import Image from "next/image";

export default function BigMoon({ phase }: { phase: number }) {
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

			{/* Debug info - remove in production */}
			<div className="absolute hidden md:inline-block -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 font-mono">
				Phase: {(phase * 100).toFixed(1)}%
			</div>
		</div>
	);
}
