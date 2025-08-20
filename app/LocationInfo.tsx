import { Pin } from "@nsmr/pixelart-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, baseUrl } from "@/lib/utils";

interface LocationData {
	city: string;
	country: string;
	region?: string;
	timezone?: string;
	source?: string;
	latitude?: number;
	longitude?: number;
}

export default async function LocationInfo() {

	let locationData: LocationData | null = null;

	try {
		const res = await fetch(new URL("/api/location", baseUrl), {
			cache: "no-store",
		});
		if (res.ok) {
			locationData = await res.json();
		}
	} catch (error) {
		console.error("Failed to fetch /api/location:", error);
	}

	console.log(locationData);

	if (!locationData || !locationData.city) {
		locationData = {
			city: "Munich",
			country: "Germany",
			region: "Bavaria",
			timezone: "Europe/Berlin",
			source: "fallback",
			latitude: 48.1351,
			longitude: 11.582,
		};
	}

	const displayLocation =
		locationData.region && locationData.region !== locationData.city
			? `${locationData.city}, ${locationData.region}, ${locationData.country}`
			: `${locationData.city}, ${locationData.country}`;

	return (
		<div className="flex items-center gap-2 text-sm text-neutral-600">
			<Pin size={32} />
			<span
				className={cn(
					"font-mono",
					locationData.source === "fallback" && "text-orange-500 ml-1"
				)}
			>
				{displayLocation}
			</span>
		</div>
	);
}

export function LocationInfoSkeleton() {
	return (
		<div className="flex items-center gap-2 text-sm text-neutral-600">
			<Pin size={32} />
			<Skeleton className="w-16 h-3" />
		</div>
	);
}
