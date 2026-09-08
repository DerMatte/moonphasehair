export const MOON_PHASE_NAMES = [
	"New Moon",
	"Waxing Crescent",
	"First Quarter",
	"Waxing Gibbous",
	"Full Moon",
	"Waning Gibbous",
	"Last Quarter",
	"Waning Crescent",
] as const;

export type MoonPhaseName = (typeof MOON_PHASE_NAMES)[number];

const PHASE_NAME_SET = new Set<string>(MOON_PHASE_NAMES);

const PHASE_ALIASES: Record<string, MoonPhaseName> = {
	new: "New Moon",
	"new-moon": "New Moon",
	newmoon: "New Moon",
	"waxing-crescent": "Waxing Crescent",
	waxingcrescent: "Waxing Crescent",
	"first-quarter": "First Quarter",
	firstquarter: "First Quarter",
	"waxing-gibbous": "Waxing Gibbous",
	waxinggibbous: "Waxing Gibbous",
	full: "Full Moon",
	"full-moon": "Full Moon",
	fullmoon: "Full Moon",
	"waning-gibbous": "Waning Gibbous",
	waninggibbous: "Waning Gibbous",
	"last-quarter": "Last Quarter",
	lastquarter: "Last Quarter",
	"third-quarter": "Last Quarter",
	thirdquarter: "Last Quarter",
	"waning-crescent": "Waning Crescent",
	waningcrescent: "Waning Crescent",
};

export type DateParseResult =
	| { ok: true; date: Date }
	| { ok: false; error: string };

export type PhaseParseResult =
	| { ok: true; name: MoonPhaseName }
	| { ok: false; error: string };

export function phaseSlug(name: string): string {
	return name.toLowerCase().replace(/\s+/g, "-");
}

export function illuminationFromAgePercent(lunarAgePercent: number): number {
	return (1 - Math.cos(2 * Math.PI * lunarAgePercent)) / 2;
}

export function parseMoonDate(
	input: string | null | undefined,
): DateParseResult {
	if (input == null || input.trim() === "") {
		return { ok: true, date: new Date() };
	}

	const value = input.trim();

	if (/^\d{10}$/.test(value)) {
		return { ok: true, date: new Date(Number(value) * 1000) };
	}

	if (/^\d{13}$/.test(value)) {
		return { ok: true, date: new Date(Number(value)) };
	}

	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		const [year, month, day] = value.split("-").map(Number);
		const date = new Date(Date.UTC(year, month - 1, day));
		if (
			date.getUTCFullYear() !== year ||
			date.getUTCMonth() !== month - 1 ||
			date.getUTCDate() !== day
		) {
			return { ok: false, error: `Invalid calendar date: ${value}` };
		}
		return { ok: true, date };
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return {
			ok: false,
			error:
				"Invalid date. Use ISO-8601, YYYY-MM-DD, or a Unix timestamp in seconds or milliseconds.",
		};
	}

	return { ok: true, date: parsed };
}

export function parseMoonPhaseName(
	input: string | null | undefined,
): PhaseParseResult {
	if (input == null || input.trim() === "") {
		return {
			ok: false,
			error: `Missing phase. Use one of: ${MOON_PHASE_NAMES.join(", ")}`,
		};
	}

	const trimmed = input.trim();
	if (PHASE_NAME_SET.has(trimmed)) {
		return { ok: true, name: trimmed as MoonPhaseName };
	}

	const normalized = trimmed.toLowerCase().replace(/[_\s]+/g, "-");
	const alias = PHASE_ALIASES[normalized];
	if (alias) {
		return { ok: true, name: alias };
	}

	const match = MOON_PHASE_NAMES.find(
		(name) => name.toLowerCase() === trimmed.toLowerCase(),
	);
	if (match) {
		return { ok: true, name: match };
	}

	return {
		ok: false,
		error: `Unknown phase "${trimmed}". Use one of: ${MOON_PHASE_NAMES.join(", ")}`,
	};
}
