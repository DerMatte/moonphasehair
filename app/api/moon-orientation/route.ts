import { geolocation } from "@vercel/functions";
import {
	getMoonLimbAngle,
	getMoonRotationDegrees,
} from "@/lib/moonOrientation";

// Munich fallback keeps the rotation meaningful in local dev and when
// geo headers are missing
const FALLBACK = { latitude: 48.1374, longitude: 11.5755 };

export async function GET(request: Request) {
	const geo = geolocation(request);
	const latitude = geo.latitude ? parseFloat(geo.latitude) : FALLBACK.latitude;
	const longitude = geo.longitude
		? parseFloat(geo.longitude)
		: FALLBACK.longitude;

	const now = new Date();

	return Response.json({
		rotation: getMoonRotationDegrees(now, latitude, longitude),
		limbAngle: getMoonLimbAngle(now, latitude, longitude),
		latitude,
		longitude,
	});
}
