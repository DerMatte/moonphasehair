import LocationInfo from "./LocationInfo";
import { Navbar } from "./Navbar";
import { baseUrl } from "@/lib/utils";

export interface LocationData {
	city: string;
	country: string;
	region?: string;
	timezone?: string;
	source?: string;
	latitude?: number;
	longitude?: number;
}

export const getLocationData = async () => {
	const res = await fetch(new URL("/api/location", baseUrl), {
		cache: "no-store",
	});
	if (res.ok) {
		return await res.json();
	}
	console.error("Error fetching location data:", res.statusText);
	return null;
};

export default async function Nav() {
	const locationData = await getLocationData();

	return (
		<header className="w-full">
			<div className="flex flex-row items-center justify-between px-6 sm:px-8 py-4 sm:py-8 border-b border-neutral-200">
				{/* Pass location icon to navbar for mobile layout */}
				<Navbar locationData={locationData || null} />
				{/* LocationInfo for desktop layout */}
				<LocationInfo locationData={locationData || null} />
			</div>
		</header>
	);
}
