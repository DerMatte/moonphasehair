import { moonPhases } from "@/lib/consts";
import { MoonPhase, SearchMoonPhase, SearchMoonQuarter } from "astronomy-engine";

export type MoonPhaseData = ReturnType<typeof getMoonPhaseWithTiming>;

const SYNODIC_MONTH = 29.53058770576;

// Each of the 8 phases spans 45° of ecliptic phase angle, centered on the
// major-phase instants: 0° = New Moon, 90° = First Quarter, 180° = Full Moon,
// 270° = Last Quarter.
const PHASE_SPAN = 45;
const HALF_SPAN = PHASE_SPAN / 2;

const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;

// Find the instant the moon's phase angle reaches `angle`, searching
// `limitDays` from `fromDate` (negative searches backwards).
function searchPhaseAngle(
	angle: number,
	fromDate: Date,
	limitDays: number,
): Date | null {
	const time = SearchMoonPhase(normalizeAngle(angle), fromDate, limitDays);
	return time ? time.date : null;
}

// Phase index 0-7 from the true ecliptic phase angle
export function getMoonPhase(date: Date): number {
	return Math.floor(normalizeAngle(MoonPhase(date) + HALF_SPAN) / PHASE_SPAN) % 8;
}

// Fraction 0-1 through the cycle, based on the true phase angle
// (0 = new moon, 0.5 = full moon). Drives the moon visualizations:
// illuminated fraction = (1 - cos(2π * percent)) / 2.
export function getLunarAgePercent(date: Date = new Date()): number {
	return MoonPhase(date) / 360;
}

// Get phase with timing information; all boundary instants are computed
// from the true (not mean) lunar motion.
export function getMoonPhaseWithTiming(date: Date = new Date()) {
	const phaseAngle = MoonPhase(date);
	const phaseNumber = getMoonPhase(date);
	const lunarAgePercent = phaseAngle / 360;
	const lunarAge = lunarAgePercent * SYNODIC_MONTH;

	const startAngle = phaseNumber * PHASE_SPAN - HALF_SPAN;
	const endAngle = phaseNumber * PHASE_SPAN + HALF_SPAN;

	// A 45° span never takes more than ~4.5 days to traverse
	const currentPhaseStart = searchPhaseAngle(startAngle, date, -7) ?? date;
	const currentPhaseEnd = searchPhaseAngle(endAngle, date, 7) ?? date;

	const nextPhaseNumber = (phaseNumber + 1) % 8;
	const previousPhaseNumber = phaseNumber === 0 ? 7 : phaseNumber - 1;

	const nextPhaseEnd = searchPhaseAngle(
		endAngle + PHASE_SPAN,
		currentPhaseEnd,
		7,
	);
	const previousPhaseStart = searchPhaseAngle(
		startAngle - PHASE_SPAN,
		currentPhaseStart,
		-7,
	);

	// Upcoming phases: each entry's date is when that phase next occurs
	const upcoming = [];
	let searchDate = new Date(date);

	for (let i = 2; i <= 5; i++) {
		const upcomingPhaseNumber = (phaseNumber + i) % 8;
		const upcomingPhaseData = moonPhases[upcomingPhaseNumber];
		const upcomingDate = getNextMoonPhaseOccurrence(
			upcomingPhaseData.name,
			searchDate,
		);

		if (upcomingDate) {
			upcoming.push({
				name: upcomingPhaseData.name,
				phase: upcomingPhaseData.phaseValue,
				emoji: upcomingPhaseData.emoji,
				icon: upcomingPhaseData.icon,
				description: upcomingPhaseData.description,
				action: upcomingPhaseData.action,
				date: upcomingDate,
			});
			searchDate = new Date(upcomingDate);
		}
	}

	return {
		current: {
			...moonPhases[phaseNumber],
			phaseNumber,
			lunarAge,
			lunarAgePercent,
			startDate: currentPhaseStart,
			endDate: currentPhaseEnd,
		},
		next: {
			...moonPhases[nextPhaseNumber],
			phaseNumber: nextPhaseNumber,
			startDate: currentPhaseEnd,
			endDate: nextPhaseEnd || currentPhaseEnd,
		},
		previous: {
			...moonPhases[previousPhaseNumber],
			phaseNumber: previousPhaseNumber,
			startDate: previousPhaseStart || currentPhaseStart,
			endDate: currentPhaseStart,
		},
		upcoming: upcoming,
	};
}

// Get the exact instant of the next major moon phase
export function getNextMajorPhase(
	fromDate: Date = new Date(),
): { phase: string; date: Date } | null {
	const quarterNames = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];
	const quarter = SearchMoonQuarter(fromDate);
	return { phase: quarterNames[quarter.quarter], date: quarter.time.date };
}

// Find the next occurrence of a specific moon phase. Major phases return
// their exact instant (e.g. the moment of full moon); intermediate phases
// return the moment the phase begins.
export function getNextMoonPhaseOccurrence(
	targetPhaseName: string,
	fromDate: Date = new Date(),
): Date | null {
	const targetPhaseIndex = moonPhases.findIndex(
		(phase) => phase.name === targetPhaseName,
	);
	if (targetPhaseIndex === -1) return null;

	const isMajorPhase = targetPhaseIndex % 2 === 0;
	const targetAngle = isMajorPhase
		? targetPhaseIndex * PHASE_SPAN
		: targetPhaseIndex * PHASE_SPAN - HALF_SPAN;

	// One occurrence per synodic month, so ~35 days always contains it
	return searchPhaseAngle(targetAngle, fromDate, 35);
}

// Function to calculate time until a specific date
export function getTimeUntilDate(
	targetDate: Date,
	fromDate: Date = new Date(),
): string {
	const diffMs = targetDate.getTime() - fromDate.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffHours = Math.floor(
		(diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
	);

	if (diffDays === 0) {
		if (diffHours === 0) {
			const diffMinutes = Math.floor(diffMs / (1000 * 60));
			return `in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
		}
		return `in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
	} else if (diffDays === 1) {
		return "tomorrow";
	} else if (diffDays < 7) {
		return `in ${diffDays} days`;
	} else if (diffDays < 14) {
		return "in about a week";
	} else if (diffDays < 21) {
		return "in about 2 weeks";
	} else if (diffDays < 28) {
		return "in about 3 weeks";
	} else {
		const weeks = Math.round(diffDays / 7);
		return `in about ${weeks} weeks`;
	}
}
