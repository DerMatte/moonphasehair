import { moonPhases } from "@/lib/consts";
import {
	getMoonPhaseWithTiming,
	getNextMoonPhaseOccurrence,
} from "@/lib/MoonPhaseCalculator";
import {
	illuminationFromAgePercent,
	type MoonPhaseName,
	phaseSlug,
} from "@/lib/public-moon-parse";

export const PUBLIC_API_VERSION = "1.0.0";

export {
	illuminationFromAgePercent,
	MOON_PHASE_NAMES,
	parseMoonDate,
	parseMoonPhaseName,
	phaseSlug,
} from "@/lib/public-moon-parse";
export type { MoonPhaseName } from "@/lib/public-moon-parse";

export type PublicPhaseGuide = {
	name: MoonPhaseName;
	action: string;
	description: string;
	icon: string;
	emoji: string;
	phaseValue: number;
	slug: string;
};

export type PublicTimedPhase = PublicPhaseGuide & {
	phaseNumber: number;
	startDate: string;
	endDate: string;
};

export type PublicCurrentPhase = PublicTimedPhase & {
	lunarAge: number;
	lunarAgePercent: number;
	illumination: number;
};

export type PublicUpcomingPhase = PublicPhaseGuide & {
	date: string;
};

export type PublicMoonSnapshot = {
	requestedAt: string;
	current: PublicCurrentPhase;
	next: PublicTimedPhase;
	previous: PublicTimedPhase;
	upcoming: PublicUpcomingPhase[];
};

export type PublicFastingInfo = {
	requestedAt: string;
	isFullMoon: boolean;
	currentPhase: MoonPhaseName;
	nextFullMoon: string | null;
	recommendation: string;
};

function toGuide(phase: {
	name: string;
	action: string;
	description: string;
	icon: string;
	emoji: string;
	phaseValue: number;
}): PublicPhaseGuide {
	return {
		name: phase.name as MoonPhaseName,
		action: phase.action,
		description: phase.description,
		icon: phase.icon,
		emoji: phase.emoji,
		phaseValue: phase.phaseValue,
		slug: phaseSlug(phase.name),
	};
}

function toTimedPhase(phase: {
	name: string;
	action: string;
	description: string;
	icon: string;
	emoji: string;
	phaseValue: number;
	phaseNumber: number;
	startDate: Date;
	endDate: Date;
}): PublicTimedPhase {
	return {
		...toGuide(phase),
		phaseNumber: phase.phaseNumber,
		startDate: phase.startDate.toISOString(),
		endDate: phase.endDate.toISOString(),
	};
}

export function listPhaseGuides(): PublicPhaseGuide[] {
	return moonPhases.map(toGuide);
}

export function getNextFullMoonInstant(from: Date = new Date()): Date | null {
	const moonData = getMoonPhaseWithTiming(from);

	if (moonData.current.name === "Full Moon") {
		const phaseDuration =
			moonData.current.endDate.getTime() - moonData.current.startDate.getTime();
		return new Date(moonData.current.startDate.getTime() + phaseDuration / 2);
	}

	return getNextMoonPhaseOccurrence("Full Moon", from);
}

export function getPublicMoonSnapshot(
	date: Date = new Date(),
): PublicMoonSnapshot {
	const moonData = getMoonPhaseWithTiming(date);

	return {
		requestedAt: date.toISOString(),
		current: {
			...toTimedPhase(moonData.current),
			lunarAge: moonData.current.lunarAge,
			lunarAgePercent: moonData.current.lunarAgePercent,
			illumination: illuminationFromAgePercent(
				moonData.current.lunarAgePercent,
			),
		},
		next: toTimedPhase(moonData.next),
		previous: toTimedPhase(moonData.previous),
		upcoming: moonData.upcoming.map((phase) => ({
			...toGuide({
				name: phase.name,
				action: phase.action,
				description: phase.description,
				icon: phase.icon,
				emoji: phase.emoji,
				phaseValue: phase.phase,
			}),
			date: phase.date.toISOString(),
		})),
	};
}

export function getPublicNextPhase(
	phaseName: MoonPhaseName,
	from: Date = new Date(),
) {
	const date = getNextMoonPhaseOccurrence(phaseName, from);
	const guide = moonPhases.find((phase) => phase.name === phaseName);

	return {
		requestedAt: from.toISOString(),
		phase: guide ? toGuide(guide) : null,
		date: date?.toISOString() ?? null,
	};
}

export function getPublicFastingInfo(
	date: Date = new Date(),
): PublicFastingInfo {
	const snapshot = getPublicMoonSnapshot(date);
	const isFullMoon = snapshot.current.name === "Full Moon";
	const nextFullMoon = getNextFullMoonInstant(date);

	return {
		requestedAt: date.toISOString(),
		isFullMoon,
		currentPhase: snapshot.current.name,
		nextFullMoon: nextFullMoon?.toISOString() ?? null,
		recommendation: isFullMoon
			? "Currently in Full Moon phase — a traditional window for a 24-hour fast."
			: "Prepare for the next full moon. Many people fast for about 24 hours around the peak.",
	};
}
