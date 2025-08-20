import {
	getMoonPhaseWithTiming,
} from "@/lib/MoonPhaseCalculator";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDateTime } from "@/lib/utils";
import { moonPhases } from "@/lib/consts";
import BigMoon from "@/components/BigMoon";
import MoonPhaseCard from "@/components/MoonphaseCard";








export default function MoonHairDashboard() {
	// Get moon phase timing information
	const moonPhaseData = getMoonPhaseWithTiming(new Date());

	// Get all moon phases
	const allPhases = moonPhases;

	return (
		<div className="">
			<div className="max-w-7xl mx-auto p-4">
				<div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-12">
					<div className="mb-8 lg:mb-0 lg:flex-1">
						<BigMoon phase={moonPhaseData.current.phaseNumber / 8} />
					</div>
					<div className="lg:flex-1 lg:flex lg:flex-col lg:gap-15">
						<div className="w-md inline-flex flex-col justify-start items-start gap-8 pb-16 md:pb-0 md:pt-16">
							<h1 className="self-stretch justify-start text-3xl font-bold font-sans md:text-5xl">
								Moon Hair Dashboard
							</h1>
							<h2 className="self-stretch justify-start text-base font-normal font-mono text-balance">
								Intrinsic Knowledge from my favourite X Account.
								<br />
								<span className="italic">
									Cut your Hair according to the phase of the moon.
								</span>{" "}
								Make sure to pass the knowledge on and share it with your
								friends.
							</h2>
						</div>
						<div className="flex flex-col gap-4">
							<h3 className="text-2xl font-bold font-sans pb-4 md:pb-8">
								Current Phase: {moonPhaseData.current.name}{" "}
							</h3>
							<div className="flex flex-row gap-4">
								<div className="text-5xl md:text-6xl">
									{moonPhaseData.current.emoji}
								</div>
								<div className="flex flex-col text-sm justify-center gap-2">
									<p className="italic font-bold max-w-md text-balance">
										{
											moonPhaseData.current.description
										}
									</p>
									<span>
										Since: {formatDateTime(moonPhaseData.current.startDate)}
									</span>
									<span>
										Until: {formatDateTime(moonPhaseData.current.endDate)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Horizontal scrollable moon phases section */}
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
										dateText={`${formatDateTime(moonPhaseData.previous.startDate)} - ${formatDateTime(moonPhaseData.previous.endDate)}`}
										action={
											moonPhaseData.previous.action
										}
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
											dateText={`${formatDateTime(moonPhaseData.current.startDate)} - ${formatDateTime(moonPhaseData.current.endDate)}`}
											action={
												moonPhaseData.current.action
											}
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
										dateText={`${formatDateTime(moonPhaseData.next.startDate)} - ${formatDateTime(moonPhaseData.next.endDate)}`}
										action={
											moonPhaseData.next.action
										}
									/>
								</CarouselItem>

								{/* Upcoming Phases */}
								<CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
									<MoonPhaseCard
										title="Upcoming"
										phase={moonPhaseData.upcoming[0].name}
										phaseValue={moonPhaseData.upcoming[0].phaseNumber / 8}
										emoji={moonPhaseData.upcoming[0].emoji}
										description={moonPhaseData.upcoming[0].description}
										dateText={`${formatDateTime(moonPhaseData.upcoming[0].startDate)} - ${formatDateTime(moonPhaseData.upcoming[0].endDate)}`}
										action={moonPhaseData.upcoming[0].action}
									/>
								</CarouselItem>

								{/* Additional moon phases */}
								{allPhases.map((phase) => (
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
							dateText={`${formatDateTime(moonPhaseData.previous.startDate)} - ${formatDateTime(moonPhaseData.previous.endDate)}`}
							action={
								moonPhaseData.previous.action
							}
						/>

						{/* Current Phase - Highlighted */}
						<div className="ring-2 ring-yellow-500 rounded-lg">
							<MoonPhaseCard
								title="Current"
								phase={moonPhaseData.current.name}
								phaseValue={moonPhaseData.current.phaseNumber / 8}
								emoji={moonPhaseData.current.emoji}
								description={moonPhaseData.current.description}
								dateText={`${formatDateTime(moonPhaseData.current.startDate)} - ${formatDateTime(moonPhaseData.current.endDate)}`}
								action={
									moonPhaseData.current.action
								}
							/>
						</div>

						{/* Next Phase */}
						<MoonPhaseCard
							title="Next"
							phase={moonPhaseData.next.name}
							phaseValue={moonPhaseData.next.phaseNumber / 8}
							emoji={moonPhaseData.next.emoji}
							description={moonPhaseData.next.description}
							dateText={`${formatDateTime(moonPhaseData.next.startDate)} - ${formatDateTime(moonPhaseData.next.endDate)}`}
							action={
								moonPhaseData.next.action
							}
						/>

						{/* Upcoming Phase */}
						<MoonPhaseCard
							title="Upcoming"
							phase={moonPhaseData.upcoming[0].name}
							phaseValue={moonPhaseData.upcoming[0].phaseNumber / 8}
							emoji={moonPhaseData.upcoming[0].emoji}
							description={moonPhaseData.upcoming[0].description}
							dateText={`${formatDateTime(moonPhaseData.upcoming[0].startDate)} - ${formatDateTime(moonPhaseData.upcoming[0].endDate)}`}
							action={moonPhaseData.upcoming[0].action}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
