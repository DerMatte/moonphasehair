import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/supabase/auth";
import LocationInfo from "./LocationInfo";
import { NavbarWrapper } from "./NavbarWrapper";

export interface LocationData {
	city: string;
	country: string;
	region?: string;
	timezone?: string;
	source?: string;
	latitude?: number;
	longitude?: number;
}

function decodeHeaderValue(value: string | null): string {
	if (!value) return "";

	try {
		const decoded = decodeURIComponent(value).trim();
		return /^(unknown|null|undefined)$/i.test(decoded) ? "" : decoded;
	} catch {
		const fallback = value.trim();
		return /^(unknown|null|undefined)$/i.test(fallback) ? "" : fallback;
	}
}

function parseCoordinate(value: string | null): number | undefined {
	if (!value) return undefined;

	const coordinate = Number.parseFloat(value);
	return Number.isFinite(coordinate) ? coordinate : undefined;
}

export const getLocationData = async (): Promise<LocationData | null> => {
	const requestHeaders = await headers();
	const city = requestHeaders.get("x-vercel-ip-city");
	const country = requestHeaders.get("x-vercel-ip-country");
	const region = requestHeaders.get("x-vercel-ip-country-region");
	const timezone = requestHeaders.get("x-vercel-ip-timezone");
	const latitude = requestHeaders.get("x-vercel-ip-latitude");
	const longitude = requestHeaders.get("x-vercel-ip-longitude");

	return {
		city: decodeHeaderValue(city),
		country: decodeHeaderValue(country),
		region: decodeHeaderValue(region),
		timezone: decodeHeaderValue(timezone) || "UTC",
		source: "vercel-header",
		latitude: parseCoordinate(latitude),
		longitude: parseCoordinate(longitude),
	};
};

export default async function Nav() {
	// Run independent async operations in parallel to eliminate waterfall (Rule 1.4)
	const [locationData, authResult] = await Promise.all([
		getLocationData(),
		getCurrentUser(),
	]);

	return (
		<header className="w-full">
			<div className="flex flex-row items-center justify-between px-6 sm:px-8 py-4 sm:py-8 border-b border-neutral-200">
				{/* Pass location icon to navbar for mobile layout */}
				<NavbarWrapper
					locationData={locationData || null}
					initialUser={authResult}
				/>
				{/* LocationInfo for desktop layout */}
				<LocationInfo locationData={locationData || null} />
			</div>
		</header>
	);
}
