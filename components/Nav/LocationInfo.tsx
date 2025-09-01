import { Pin } from "@nsmr/pixelart-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type LocationData } from "./index";

export default async function LocationInfo({
	locationData,
}: {
	locationData: LocationData | null;
}) {
	const displayLocation =
		locationData?.city && locationData.city !== locationData.country
			? `${locationData.city}, ${locationData.country}`
			: locationData?.country;

	return (
		<div className="hidden md:inline-flex items-center gap-2 text-sm text-neutral-600 whitespace-nowrap">
			<Pin size={32} />
			<span
				className={cn(
					"hidden sm:block",
					locationData?.source === "fallback" && "text-orange-500 ml-1",
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
			<Skeleton className="w-16 h-3 hidden sm:block" />
		</div>
	);
}
