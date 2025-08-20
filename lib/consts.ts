export const moonPhases = [
	 {
        name: "New Moon",
		action: "New beginnings / Bold transformation",
		description: "An ideal moment for a striking new look or style change",
		advice: "An ideal moment for a striking new look or style change",
		icon: "🌟",
		emoji: "🌑",
		phaseValue: 0,
	},
	{
		name: "Waxing Crescent",
		action: "Accelerated growth / Strengthening phase",
		description: "Trim now for quicker, healthier regrowth",
		advice: "Trim now for quicker, healthier regrowth",
		icon: "💪🏼",
		emoji: "🌒",
		phaseValue: 0.125,
	},
	{
		name: "First Quarter",
		action: "Experiment with styles / Color change",
		description: "Great time to explore new hairstyles or shades",
		advice: "Great time to explore new hairstyles or shades",
		icon: "🎨✨",
		emoji: "🌓",
		phaseValue: 0.25,
	},
	{
		name: "Waxing Gibbous",
		action: "Eliminate split ends / Focus on care",
		description: "Time to trim split ends and enhance hair health",
		advice: "Time to trim split ends and enhance hair health",
		icon: "✂️🌿",
		emoji: "🌔",
		phaseValue: 0.375,
	},
	{
		name: "Full Moon",
		action: "Boost growth / Nourishing treatments",
		description: "Cut for enhanced growth and deep nourishment",
		advice: "Cut for enhanced growth and deep nourishment",
		icon: "🌕💧",
		emoji: "🌕",
		phaseValue: 0.5,
	},
	{
		name: "Waning Gibbous",
		action: "Cleansing / Releasing emotional baggage",
		description: "Focus on detox treatments and emotional release",
		advice: "Focus on detox treatments and emotional release",
		icon: "🧘‍♀️🌌",
		emoji: "🌖",
		phaseValue: 0.625,
	},
	{
		name: "Last Quarter",
		action: "Reduce growth rate",
		description: "Trim if you prefer slower hair regrowth",
		advice: "Trim if you prefer slower hair regrowth",
		icon: "⏳✂️",
		emoji: "🌗",
		phaseValue: 0.75,
	},
	{
		name: "Waning Crescent",
		action: "Rest and recovery",
		description: "Allow your hair to recover - avoid cuts and focus on care",
		advice: "Allow your hair to recover - avoid cuts and focus on care",
		icon: "🛌🌙",
		emoji: "🌘",
		phaseValue: 0.875,
	},
];

// Moon Phase Recommendations object for easy lookup
export const MoonPhaseRecommendations = {
	"New Moon": {
		action: "New beginnings / Bold transformation",
		description: "An ideal moment for a striking new look or style change",
	},
	"Waxing Crescent": {
		action: "Accelerated growth / Strengthening phase",
		description: "Trim now for quicker, healthier regrowth",
	},
	"First Quarter": {
		action: "Experiment with styles / Color change",
		description: "Great time to explore new hairstyles or shades",
	},
	"Waxing Gibbous": {
		action: "Eliminate split ends / Focus on care",
		description: "Time to trim split ends and enhance hair health",
	},
	"Full Moon": {
		action: "Boost growth / Nourishing treatments",
		description: "Cut for enhanced growth and deep nourishment",
	},
	"Waning Gibbous": {
		action: "Cleansing / Releasing emotional baggage",
		description: "Focus on detox treatments and emotional release",
	},
	"Last Quarter": {
		action: "Reduce growth rate",
		description: "Trim if you prefer slower hair regrowth",
	},
	"Waning Crescent": {
		action: "Rest and recovery",
		description: "Allow your hair to recover - avoid cuts and focus on care",
	},
} as const;
