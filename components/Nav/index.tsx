import LocationInfo from "./LocationInfo";
import { NavbarWrapper } from "./NavbarWrapper";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export interface LocationData {
	city: string;
	country: string;
	region?: string;
	timezone?: string;
	source?: string;
	latitude?: number;
	longitude?: number;
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
		city: city || "Unknown",
		country: country || "Unknown",
		region: region || "",
		timezone: timezone || "UTC",
		source: "vercel-header",
		latitude: latitude ? Number.parseFloat(latitude) : undefined,
		longitude: longitude ? Number.parseFloat(longitude) : undefined,
	};
};

export default async function Nav() {
	const locationData = await getLocationData();
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<header className="w-full">
			<div className="flex flex-row items-center justify-between px-6 sm:px-8 py-4 sm:py-8 border-b border-neutral-200">
				{/* Pass location icon to navbar for mobile layout */}
				<NavbarWrapper locationData={locationData || null} initialUser={user} />
				{/* LocationInfo for desktop layout */}
				<LocationInfo locationData={locationData || null} />
			</div>
		</header>
	);
}
