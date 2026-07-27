import MoonPhaseCardServer from "@/components/MoonphaseCardServer";
import { MoonSubscriptionProvider } from "@/components/MoonSubscriptionProvider";
import { moonPhases } from "@/lib/consts";
import type { MoonPhaseData } from "@/lib/MoonPhaseCalculator";
import { getNextMoonPhaseOccurrence } from "@/lib/MoonPhaseCalculator";
import { formatDateWithTimezone } from "@/lib/utils";

export default function MoonCarousel({
	moonPhaseData,
}: {
	moonPhaseData: MoonPhaseData;
}) {
	const occurrenceCards = [
		{
			key: `previous-${moonPhaseData.previous.startDate.getTime()}`,
			title: "Previous",
			phase: moonPhaseData.previous.name,
			phaseValue: moonPhaseData.previous.phaseValue,
			icon: moonPhaseData.previous.icon,
			emoji: moonPhaseData.previous.emoji,
			description: moonPhaseData.previous.description,
			dateText: `${formatDateWithTimezone(moonPhaseData.previous.startDate, false)} - ${formatDateWithTimezone(moonPhaseData.previous.endDate, false)}`,
			action: moonPhaseData.previous.action,
		},
		{
			key: `current-${moonPhaseData.current.startDate.getTime()}`,
			title: "Current",
			phase: moonPhaseData.current.name,
			phaseValue: moonPhaseData.current.phaseValue,
			icon: moonPhaseData.current.icon,
			emoji: moonPhaseData.current.emoji,
			description: moonPhaseData.current.description,
			dateText: `Since: ${formatDateWithTimezone(moonPhaseData.current.startDate)}`,
			action: moonPhaseData.current.action,
			isCurrentPhase: true,
			currentPhaseEndDate: moonPhaseData.current.endDate,
		},
		{
			key: `next-${moonPhaseData.next.startDate.getTime()}`,
			title: "Next",
			phase: moonPhaseData.next.name,
			phaseValue: moonPhaseData.next.phaseValue,
			icon: moonPhaseData.next.icon,
			emoji: moonPhaseData.next.emoji,
			description: moonPhaseData.next.description,
			dateText: `${formatDateWithTimezone(moonPhaseData.next.startDate, false)} - ${formatDateWithTimezone(moonPhaseData.next.endDate, false)}`,
			action: moonPhaseData.next.action,
		},
		...moonPhaseData.upcoming.slice(0, 2).map((upcoming) => ({
			key: `upcoming-${upcoming.name}-${upcoming.date.getTime()}`,
			title: "Upcoming",
			phase: upcoming.name,
			phaseValue: upcoming.phase,
			icon: upcoming.icon,
			emoji: upcoming.emoji,
			description: upcoming.description || "",
			dateText: formatDateWithTimezone(upcoming.date),
			action: upcoming.action,
		})),
	];

	return (
		<MoonSubscriptionProvider>
			<section className="mt-12 mb-8" aria-labelledby="moon-phases-heading">
				<h3
					id="moon-phases-heading"
					className="text-2xl font-bold font-sans mb-6"
				>
					Moon Phases
				</h3>

				<div className="grid gap-4 md:flex md:overflow-x-auto md:snap-x md:snap-mandatory md:pb-4">
					{occurrenceCards.map((card) => (
						<article
							key={card.key}
							className={`min-w-0 md:basis-[calc(50%-0.5rem)] md:shrink-0 md:snap-start lg:basis-[calc(33.333%-0.667rem)] ${
								card.isCurrentPhase ? "ring-2 ring-yellow-500 rounded-lg" : ""
							}`}
						>
							<MoonPhaseCardServer {...card} />
						</article>
					))}
				</div>

				<details className="mt-8 rounded-lg border border-neutral-300 bg-neutral-50/50">
					<summary className="cursor-pointer px-5 py-4 font-sans text-lg font-bold">
						Browse all moon phases
					</summary>
					<div className="grid gap-4 border-t border-neutral-300 p-4 sm:grid-cols-2 lg:grid-cols-4">
						{moonPhases.map((phase) => {
							const nextOccurrence = getNextMoonPhaseOccurrence(phase.name);
							const dateText = nextOccurrence
								? formatDateWithTimezone(nextOccurrence)
								: undefined;

							return (
								<article key={phase.name} className="min-w-0">
									<MoonPhaseCardServer
										title="Phase"
										phase={phase.name}
										phaseValue={phase.phaseValue}
										icon={phase.icon}
										emoji={phase.emoji}
										description={phase.description || ""}
										dateText={dateText}
										action={phase.action}
									/>
								</article>
							);
						})}
					</div>
				</details>
			</section>
		</MoonSubscriptionProvider>
	);
}

export function MoonCarouselSkeleton() {
	return (
		<div className="mt-12 mb-8">
			<h3 className="text-2xl font-bold font-sans mb-6">Moon Phases</h3>
			<div className="flex flex-col gap-4">
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
				<div className="h-12 w-full bg-neutral-200 animate-pulse rounded-md" />
			</div>
		</div>
	);
}
