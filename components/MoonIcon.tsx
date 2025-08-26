// Small moon icon component for visualizing phases
export default function MoonIcon({ phase }: { phase: number }) {
	const size = 80;
	const radius = size / 2;

	const calculatePath = (phase: number) => {
		if (phase === 0 || phase === 1) {
			// New moon - keep unchanged (full shadow)
			return `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} ${size} A ${radius} ${radius} 0 1 1 ${radius} 0`;
		} else if (phase === 0.5) {
			// Full moon - keep unchanged (no shadow)
			return "";
		} else if (phase < 0.5) {
			// Waxing phases - now use waning logic (inverted)
			const offset = Math.cos(phase * 2 * Math.PI) * radius;
			return `M ${radius} 0 A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 0 : 1} ${radius} ${size} A ${radius} ${radius} 0 1 0 ${radius} 0`;
		} else {
			// Waning phases - now use waxing logic (inverted)
			const offset = Math.cos(phase * 2 * Math.PI) * radius;
			return `M ${radius} 0 A ${radius} ${radius} 0 1 0 ${radius} ${size} A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 1 : 0} ${radius} 0`;
		}
	};

	return (
		<svg width={size} height={size} className="drop-shadow-md">
			<title>Moon phase icon</title>
			<circle cx={radius} cy={radius} r={radius - 2} fill="#e5e7eb" />
			{calculatePath(phase) && (
				<path d={calculatePath(phase)} fill="#6b7280" opacity="0.95" />
			)}
		</svg>
	);
}