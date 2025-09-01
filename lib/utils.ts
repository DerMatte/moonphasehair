import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatDateTime = (date: Date, locales: string = "en-GB") => {
	// Add safety check for undefined date
	if (!date || !(date instanceof Date)) {
		return "Date unavailable";
	}

	return date.toLocaleString(locales, {
		hour12: false,
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short",
		weekday: "short",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

export const baseUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: "http://localhost:3000";

export function formatDateWithTimezone(
	date: Date,
	includeTime: boolean = true,
	timezone?: string,
) {
	// Add safety check for undefined date
	if (!date || !(date instanceof Date)) {
		return "Date unavailable";
	}

	const options: Intl.DateTimeFormatOptions = {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
	};

	if (includeTime) {
		options.hour = "2-digit";
		options.minute = "2-digit";
		options.hour12 = false;
		options.timeZoneName = "short";
	}

	return date.toLocaleString("en-US", options);
}
