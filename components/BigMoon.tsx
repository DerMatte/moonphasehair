// Big moon phase component using moon-pattern.png
export default function BigMoon({ phase }: { phase: number }) {
	// Use viewBox units instead of pixels for better scaling
	const viewBoxSize = 100;
	const radius = viewBoxSize / 2;

	const calculatePath = (phase: number) => {
		if (phase === 0 || phase === 1) {
			// New moon or start of cycle - full circle
			return `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} ${viewBoxSize} A ${radius} ${radius} 0 1 1 ${radius} 0`;
		} else if (phase === 0.5) {
			// Full moon - no dark overlay
			return "";
		} else if (phase < 0.5) {
			// Waxing phases
			const offset = Math.cos(phase * 2 * Math.PI) * radius;
			return `M ${radius} 0 A ${radius} ${radius} 0 1 0 ${radius} ${viewBoxSize} A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 1 : 0} ${radius} 0`;
		} else {
			// Waning phases
			const offset = Math.cos(phase * 2 * Math.PI) * radius;
			return `M ${radius} 0 A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 0 : 1} ${radius} ${viewBoxSize} A ${radius} ${radius} 0 1 0 ${radius} 0`;
		}
	};

	return (
		<div className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] aspect-square mx-auto">
			{/* Outer glow effect */}
			<div className="absolute -inset-[10%] rounded-full bg-gradient-to-r from-blue-200/20 via-white/30 to-blue-200/20 blur-2xl animate-pulse" />

			{/* Moon container with border */}
			<div className="relative w-full h-full rounded-full border-2 border-gray-300/30 p-[2%]">
			{/* Cool Arrow in bottom left corner */}
			<img
						src="/CoolArrow.svg"
						alt=""
						className="absolute bottom-0 left-0 -translate-x-4 -translate-y-4 -z-10 w-1/2"
						// style={{
						// 	filter: "invert(1) brightness(0.8)",
						// }}
					/>
				{/* Moon texture background */}
				{/* <div className="w-[476.04px] h-[476.04px] bg-blend-luminosity bg-gradient-to-bl from-zinc-300/50 to-neutral-500 rounded-full" /> */}
				<div
					className="relative w-full h-full rounded-full overflow-hidden"
					style={{
						backgroundImage: "url(/moon-pattern.png)",
						backgroundSize: "cover",
						backgroundPosition: "center",
						filter: "brightness(1.3) contrast(1.2)",
					}}
				>
					{/* Dark overlay for the moon phase */}
					<svg
						width="100%"
						height="100%"
						viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
						preserveAspectRatio="xMidYMid meet"
						className="absolute inset-0"
					>
						<title>Moon phase visualization</title>
						<defs>
							<mask id={`moonPhaseMask-${phase}`}>
								<rect width={viewBoxSize} height={viewBoxSize} fill="white" />
								{calculatePath(phase) && (
									<path d={calculatePath(phase)} fill="black" />
								)}
							</mask>
							<filter id={`shadowFilter-${phase}`}>
								<feGaussianBlur in="SourceAlpha" stdDeviation="1" />
								<feOffset dx="0.5" dy="0.5" result="offsetblur" />
								<feFlood floodColor="#171717" floodOpacity="0.8" />
								<feComposite in2="offsetblur" operator="in" />
								<feMerge>
									<feMergeNode />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>
						<rect
							width={viewBoxSize}
							height={viewBoxSize}
							fill="rgba(0,0,0,0.85)"
							mask={`url(#moonPhaseMask-${phase})`}
							filter={`url(#shadowFilter-${phase})`}
						/>
					</svg>

					{/* Inner shadow for depth */}
					<div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_var(--tw-shadow-color)]" />
				</div>
			</div>

			{/* Bottom glow for extra effect */}
			<div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-3/4 h-[10%] bg-neutral-200/20 blur-xl rounded-full" />
		</div>
	);
}