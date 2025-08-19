import { geolocation } from "@vercel/functions";

export async function GET(request: Request) {
	const details = geolocation(request);
	const { latitude, longitude } = details;

	let timezone = "UTC"; // Default timezone

	if (latitude && longitude) {
		try {
			// You'll need to add geo-tz to your project: `pnpm add geo-tz`
			const { find } = await import("geo-tz");
			const timezones = find(parseFloat(latitude), parseFloat(longitude));

			if (timezones && timezones.length > 0) {
				timezone = timezones[0];
			}
		} catch (error) {
			console.error("Error determining timezone:", error);
			// Silently fail and fall back to UTC
		}
	}

	return Response.json({ ...details, timezone });
}