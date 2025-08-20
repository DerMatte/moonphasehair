import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import MoonPhaseCard from "@/components/MoonphaseCard";
import { getMoonPhaseWithTiming } from "@/lib/MoonPhaseCalculator";
import { formatDateWithTimezone } from "@/lib/utils";
import { moonPhases } from "@/lib/consts";

export default function MoonCarousel() {
	const moonPhaseData = getMoonPhaseWithTiming(new Date());

	return (
		<div className="mt-12 mb-8">
			<h2 className="text-2xl font-bold font-sans mb-6">Moon Phases</h2>

			{/* Desktop horizontal carousel */}
			<div className="hidden md:block relative">
				<Carousel
					opts={{
						align: "start",
						loop: true,
					}}
					className="w-full carousel-smooth-scroll"
				>
					<CarouselContent className="-ml-2 md:-ml-4">
						{/* Previous Phase */}
						<CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
							<MoonPhaseCard
								title="Previous"
								phase={moonPhaseData.previous.name}
								phaseValue={moonPhaseData.previous.phaseNumber / 8}
								emoji={moonPhaseData.previous.emoji}
								description={moonPhaseData.previous.description}
								dateText={`${formatDateWithTimezone(moonPhaseData.previous.startDate, false)} - ${formatDateWithTimezone(moonPhaseData.previous.endDate, false)}`}
								action={moonPhaseData.previous.action}
							/>
						</CarouselItem>

						<hr className="my-4 rotate-90" />

						{/* Current Phase - Highlighted */}
						<CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
							<div className="ring-2 ring-yellow-500">
								<MoonPhaseCard
									title="Current"
									phase={moonPhaseData.current.name}
									phaseValue={moonPhaseData.current.phaseNumber / 8}
									emoji={moonPhaseData.current.emoji}
									description={moonPhaseData.current.description}
									dateText={`Since: ${formatDateWithTimezone(moonPhaseData.current.startDate)}`}
									action={moonPhaseData.current.action}
								/>
							</div>
						</CarouselItem>

						{/* Next Phase */}
						<CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
							<MoonPhaseCard
								title="Next"
								phase={moonPhaseData.next.name}
								phaseValue={moonPhaseData.next.phaseNumber / 8}
								emoji={moonPhaseData.next.emoji}
								description={moonPhaseData.next.description}
								dateText={`${formatDateWithTimezone(moonPhaseData.next.startDate, false)} - ${formatDateWithTimezone(moonPhaseData.next.endDate, false)}`}
								action={moonPhaseData.next.action}
							/>
						</CarouselItem>

						{/* Upcoming Phases */}
						{moonPhaseData.upcoming.slice(0, 2).map((upcoming) => (
							<CarouselItem
								key={`upcoming-${upcoming.name}-${upcoming.date.getTime()}`}
								className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4"
							>
								<MoonPhaseCard
									title="Upcoming"
									phase={upcoming.name}
									phaseValue={upcoming.phase}
									emoji={upcoming.emoji}
									description={upcoming.description || ""}
									dateText={formatDateWithTimezone(upcoming.date)}
									action={upcoming.action}
								/>
							</CarouselItem>
						))}

						{/* Additional moon phases */}
						{moonPhases.map((phase) => (
							<CarouselItem
								key={phase.name}
								className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4"
							>
								<MoonPhaseCard
									title="Phase"
									phase={phase.name}
									phaseValue={phase.phaseValue}
									emoji={phase.emoji}
									description={phase.description || ""}
									action={phase.action}
								/>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="hidden md:flex -left-4 bg-white/80 hover:bg-white shadow-lg" />
					<CarouselNext className="hidden md:flex -right-4 bg-white/80 hover:bg-white shadow-lg" />
				</Carousel>
			</div>

			{/* Mobile vertical list */}
			<div className="md:hidden space-y-4">
				{/* Previous Phase */}
				<MoonPhaseCard
					title="Previous"
					phase={moonPhaseData.previous.name}
					phaseValue={moonPhaseData.previous.phaseNumber / 8}
					emoji={moonPhaseData.previous.emoji}
					description={moonPhaseData.previous.description}
					dateText={`${formatDateWithTimezone(moonPhaseData.previous.startDate, false)} - ${formatDateWithTimezone(moonPhaseData.previous.endDate, false)}`}
					action={moonPhaseData.previous.action}
				/>

				{/* Current Phase - Highlighted */}
				<div className="ring-2 ring-yellow-500 rounded-lg">
					<MoonPhaseCard
						title="Current"
						phase={moonPhaseData.current.name}
						phaseValue={moonPhaseData.current.phaseNumber / 8}
						emoji={moonPhaseData.current.emoji}
						description={moonPhaseData.current.description}
						dateText={`Since: ${formatDateWithTimezone(moonPhaseData.current.startDate)}`}
						action={moonPhaseData.current.action}
					/>
				</div>

				{/* Next Phase */}
				<MoonPhaseCard
					title="Next"
					phase={moonPhaseData.next.name}
					phaseValue={moonPhaseData.next.phaseNumber / 8}
					emoji={moonPhaseData.next.emoji}
					description={moonPhaseData.next.description}
					dateText={`${formatDateWithTimezone(moonPhaseData.next.startDate, false)} - ${formatDateWithTimezone(moonPhaseData.next.endDate, false)}`}
					action={moonPhaseData.next.action}
				/>

				{/* Upcoming Phases */}
				{moonPhaseData.upcoming.slice(0, 1).map((upcoming) => (
					<MoonPhaseCard
						key={`mobile-upcoming-${upcoming.name}-${upcoming.date.getTime()}`}
						title="Upcoming"
						phase={upcoming.name}
						phaseValue={upcoming.phase}
						emoji={upcoming.emoji}
						description={upcoming.description || ""}
						dateText={formatDateWithTimezone(upcoming.date)}
						action={upcoming.action}
					/>
				))}
			</div>
		</div>
	);
}


export function MoonCarouselSkeleton() {
	return (
		<div className="mt-12 mb-8">
			<h2 className="text-2xl font-bold font-sans mb-6">Moon Phases</h2>
			<div className="flex flex-col gap-4">
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
			</div>
		</div>
	);
}