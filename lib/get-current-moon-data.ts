import { cache } from "react";
import { connection } from "next/server";
import {
	getMoonPhaseWithTiming,
	getNextMoonPhaseOccurrence,
	type MoonPhaseData,
} from "@/lib/MoonPhaseCalculator";

/**
 * Request-time moon phase data. Deduplicated within a single render so
 * multiple Suspense boundaries can share one calculation.
 */
export const getCurrentMoonPhaseData = cache(
	async (): Promise<MoonPhaseData> => {
		await connection();
		return getMoonPhaseWithTiming(new Date());
	},
);

export const getNextFullMoonDate = cache(async (): Promise<Date | null> => {
	const moonData = await getCurrentMoonPhaseData();

	if (moonData.current.name === "Full Moon") {
		const phaseStart = moonData.current.startDate;
		const phaseEnd = moonData.current.endDate;
		const phaseDuration = phaseEnd.getTime() - phaseStart.getTime();
		return new Date(phaseStart.getTime() + phaseDuration / 2);
	}

	return getNextMoonPhaseOccurrence("Full Moon", new Date());
});
