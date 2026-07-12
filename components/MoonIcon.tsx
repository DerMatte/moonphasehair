// Small moon icon component for visualizing phases
import { moonShadowPath } from "@/lib/moonShadowPath";

export default function MoonIcon({ phase }: { phase: number }) {
	const size = 80;
	const radius = size / 2;
	const shadowPath = moonShadowPath(phase, size);

	return (
		<svg width={size} height={size} className="drop-shadow-md">
			<title>Moon phase icon</title>
			<circle cx={radius} cy={radius} r={radius - 2} fill="#e5e7eb" />
			{shadowPath && <path d={shadowPath} fill="#6b7280" opacity="0.95" />}
		</svg>
	);
}
