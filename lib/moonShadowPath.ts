// SVG path for the shadowed (non-illuminated) part of the moon's disc,
// as seen from the northern hemisphere: waxing moons are lit on the right,
// waning moons on the left.
//
// `phase` is the fraction 0-1 through the synodic cycle (0 = new moon,
// 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter). The
// illuminated fraction of the disc is (1 - cos(2π * phase)) / 2 and the
// terminator is a half-ellipse with horizontal semi-axis |cos(2π * phase)| * r.
//
// Returns "" when there is no shadow to draw (full moon).
export function moonShadowPath(phase: number, size: number): string {
	const r = size / 2;
	const p = ((phase % 1) + 1) % 1;
	const cos = Math.cos(p * 2 * Math.PI);
	const rx = Math.abs(cos) * r;

	if (p < 0.005 || p > 0.995) {
		// New moon - whole disc in shadow
		return `M ${r} 0 A ${r} ${r} 0 1 1 ${r} ${size} A ${r} ${r} 0 1 1 ${r} 0`;
	}
	if (Math.abs(p - 0.5) < 0.005) {
		// Full moon - no shadow
		return "";
	}
	if (p < 0.5) {
		// Waxing: shadow hugs the left edge; the terminator bulges right of
		// center while a crescent (cos > 0), left of center once gibbous.
		return `M ${r} 0 A ${r} ${r} 0 0 0 ${r} ${size} A ${rx} ${r} 0 0 ${cos > 0 ? 0 : 1} ${r} 0`;
	}
	// Waning: shadow hugs the right edge; the terminator bulges left of
	// center while a crescent (cos > 0), right of center once gibbous.
	return `M ${r} 0 A ${r} ${r} 0 0 1 ${r} ${size} A ${rx} ${r} 0 0 ${cos > 0 ? 1 : 0} ${r} 0`;
}
