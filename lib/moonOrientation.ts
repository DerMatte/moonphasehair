import { Body, Equator, Horizon, MoonPhase, Observer } from "astronomy-engine";

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

type Vec = readonly [number, number, number];

// x = north, y = east, z = up; azimuth measured clockwise from north
function horizontalToVec(azimuth: number, altitude: number): Vec {
	const az = azimuth * DEG;
	const alt = altitude * DEG;
	return [
		Math.cos(alt) * Math.cos(az),
		Math.cos(alt) * Math.sin(az),
		Math.sin(alt),
	];
}

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: Vec, b: Vec): Vec => [
	a[1] * b[2] - a[2] * b[1],
	a[2] * b[0] - a[0] * b[2],
	a[0] * b[1] - a[1] * b[0],
];

// Project `v` onto the plane perpendicular to `m` and normalize
function tangential(v: Vec, m: Vec): Vec {
	const d = dot(v, m);
	const t: Vec = [v[0] - d * m[0], v[1] - d * m[1], v[2] - d * m[2]];
	const len = Math.hypot(t[0], t[1], t[2]);
	return [t[0] / len, t[1] / len, t[2] / len];
}

// Angle of the moon's bright limb as it appears in the sky from the
// observer's location, measured clockwise from "up" (towards the zenith).
// This is the tilt timeanddate.com applies to its moon graphic.
export function getMoonLimbAngle(
	date: Date,
	latitude: number,
	longitude: number,
): number {
	const observer = new Observer(latitude, longitude, 0);
	const moonEq = Equator(Body.Moon, date, observer, true, true);
	const sunEq = Equator(Body.Sun, date, observer, true, true);
	const moonHor = Horizon(date, observer, moonEq.ra, moonEq.dec);
	const sunHor = Horizon(date, observer, sunEq.ra, sunEq.dec);

	const moon = horizontalToVec(moonHor.azimuth, moonHor.altitude);
	const sun = horizontalToVec(sunHor.azimuth, sunHor.altitude);

	// On-sky frame at the moon, as seen by an observer facing it:
	// "up" towards the zenith, "right" completing the screen frame
	const up = tangential([0, 0, 1], moon);
	const right = cross(up, moon);
	// The midpoint of the bright limb always points at the sun
	const towardSun = tangential(sun, moon);

	return Math.atan2(dot(towardSun, right), dot(towardSun, up)) * RAD;
}

// Screen rotation (CSS clockwise degrees, normalized to [-180, 180]) for a
// moon drawn with a vertical terminator (lit on the right when waxing, on
// the left when waning) so its bright limb points the way it currently
// does in the sky above the observer.
export function getMoonRotationDegrees(
	date: Date,
	latitude: number,
	longitude: number,
): number {
	const limbAngle = getMoonLimbAngle(date, latitude, longitude);
	const drawnLimbAngle = MoonPhase(date) < 180 ? 90 : -90;
	const rotation = limbAngle - drawnLimbAngle;
	return ((((rotation + 180) % 360) + 360) % 360) - 180;
}
