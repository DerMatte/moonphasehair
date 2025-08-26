import { moonPhases } from "@/lib/consts";
import { Moon, LunarPhase } from "lunarphase-js";

// Map lunarphase-js phase names to our phase indices
const phaseNameToIndex: Record<string, number> = {
    [LunarPhase.NEW]: 0,
    [LunarPhase.WAXING_CRESCENT]: 1,
    [LunarPhase.FIRST_QUARTER]: 2,
    [LunarPhase.WAXING_GIBBOUS]: 3,
    [LunarPhase.FULL]: 4,
    [LunarPhase.WANING_GIBBOUS]: 5,
    [LunarPhase.LAST_QUARTER]: 6,
    [LunarPhase.WANING_CRESCENT]: 7,
};

// Lunar age boundaries for major phases (in days)
const PHASE_AGES = {
    NEW_MOON: 0,
    FIRST_QUARTER: 7.38264692644,
    FULL_MOON: 14.76529385288,
    LAST_QUARTER: 22.14794077932,
    SYNODIC_MONTH: 29.53058770576
};

export function getMoonPhase(date: Date): number {
    const phaseName = Moon.lunarPhase(date);
    return phaseNameToIndex[phaseName] || 0;
}

// Get accurate lunar age percentage (0-1 through the cycle)
export function getLunarAgePercent(date: Date = new Date()): number {
  return Moon.lunarAgePercent(date);
}

// Get phase boundaries based on lunar age
function getPhaseBoundaries(lunarAge: number): { start: number, end: number } {
  // Define phase boundaries in lunar days
  const boundaries = [
    { start: 0, end: 1.84566 },           // New Moon
    { start: 1.84566, end: 5.53699 },     // Waxing Crescent
    { start: 5.53699, end: 9.22831 },     // First Quarter
    { start: 9.22831, end: 12.91963 },    // Waxing Gibbous
    { start: 12.91963, end: 16.61096 },   // Full Moon
    { start: 16.61096, end: 20.30228 },   // Waning Gibbous
    { start: 20.30228, end: 23.99360 },   // Last Quarter
    { start: 23.99360, end: 29.53059 }    // Waning Crescent
  ];
  
  // Handle wrap-around for new moon
  if (lunarAge < boundaries[0].end || lunarAge >= boundaries[7].start) {
    return { start: boundaries[7].start, end: boundaries[0].end + PHASE_AGES.SYNODIC_MONTH };
  }
  
  // Find current phase boundaries
  for (const boundary of boundaries) {
    if (lunarAge >= boundary.start && lunarAge < boundary.end) {
      return boundary;
    }
  }
  
  return boundaries[0]; // Default to new moon
}

// New function to get phase with timing information
export function getMoonPhaseWithTiming(date: Date = new Date()) {
  const phaseNumber = getMoonPhase(date);
  const lunarAge = Moon.lunarAge(date); // Days since new moon
  const lunarAgePercent = Moon.lunarAgePercent(date); // 0-1 through cycle
  
  // Get accurate phase boundaries
  const boundaries = getPhaseBoundaries(lunarAge);
  
  // Calculate days until phase ends
  let daysUntilPhaseEnd = boundaries.end - lunarAge;
  if (daysUntilPhaseEnd < 0) {
    daysUntilPhaseEnd += PHASE_AGES.SYNODIC_MONTH;
  }
  
  // Calculate when current phase started
  let daysIntoPhase = lunarAge - boundaries.start;
  if (daysIntoPhase < 0) {
    daysIntoPhase = lunarAge + (PHASE_AGES.SYNODIC_MONTH - boundaries.start);
  }
  
  // Calculate phase dates
  const currentPhaseStart = new Date(date.getTime() - daysIntoPhase * 24 * 60 * 60 * 1000);
  
  const currentPhaseEnd = new Date(date.getTime() + daysUntilPhaseEnd * 24 * 60 * 60 * 1000);
  
  // Get next and previous phases
  const nextPhaseNumber = (phaseNumber + 1) % 8;
  const previousPhaseNumber = phaseNumber === 0 ? 7 : phaseNumber - 1;
  
  // For next phase, find its actual occurrence
  const nextPhaseData = moonPhases[nextPhaseNumber];
  const nextPhaseDate = getNextMoonPhaseOccurrence(nextPhaseData.name, date);
  
  // Calculate upcoming phases accurately
  const upcoming = [];
  let searchDate = new Date(date);
  
  for (let i = 2; i <= 5; i++) {
    const upcomingPhaseNumber = (phaseNumber + i) % 8;
    const upcomingPhaseData = moonPhases[upcomingPhaseNumber];
    const upcomingDate = getNextMoonPhaseOccurrence(upcomingPhaseData.name, searchDate);
    
    if (upcomingDate) {
      upcoming.push({
        name: upcomingPhaseData.name,
        phase: upcomingPhaseData.phaseValue,
        emoji: upcomingPhaseData.emoji,
        description: upcomingPhaseData.description,
        action: upcomingPhaseData.action,
        date: upcomingDate
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
      endDate: currentPhaseEnd
    },
    next: {
      ...moonPhases[nextPhaseNumber],
      phaseNumber: nextPhaseNumber,
      startDate: currentPhaseEnd,
      endDate: nextPhaseDate || currentPhaseEnd
    },
    previous: {
      ...moonPhases[previousPhaseNumber],
      phaseNumber: previousPhaseNumber,
      startDate: new Date(currentPhaseStart.getTime() - 24 * 60 * 60 * 1000), // Approximate
      endDate: currentPhaseStart
    },
    upcoming: upcoming
  };
}

// Get the exact date of next major moon phase
export function getNextMajorPhase(fromDate: Date = new Date()): { phase: string, date: Date } | null {
  const currentAge = Moon.lunarAge(fromDate);
  
  // Determine next major phase based on current lunar age
  let targetAge: number;
  let phaseName: string;
  
  if (currentAge < PHASE_AGES.FIRST_QUARTER) {
    targetAge = PHASE_AGES.FIRST_QUARTER;
    phaseName = "First Quarter";
  } else if (currentAge < PHASE_AGES.FULL_MOON) {
    targetAge = PHASE_AGES.FULL_MOON;
    phaseName = "Full Moon";
  } else if (currentAge < PHASE_AGES.LAST_QUARTER) {
    targetAge = PHASE_AGES.LAST_QUARTER;
    phaseName = "Last Quarter";
  } else {
    // Next new moon in next cycle
    targetAge = PHASE_AGES.NEW_MOON;
    phaseName = "New Moon";
  }
  
  // Search forward to find exact date
  for (let days = 0; days < 30; days++) {
    const searchDate = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
    const age = Moon.lunarAge(searchDate);
    
    // Check if we've reached or passed the target age
    if ((phaseName === "New Moon" && age < 1) || 
        (phaseName !== "New Moon" && age >= targetAge && age < targetAge + 0.5)) {
      return { phase: phaseName, date: new Date(searchDate) };
    }
  }
  
  return null;
}

// Function to find the next occurrence of a specific moon phase
export function getNextMoonPhaseOccurrence(targetPhaseName: string, fromDate: Date = new Date()): Date | null {
  // For major phases, use precise calculation
  const majorPhases = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];
  if (majorPhases.includes(targetPhaseName)) {
    // Search day by day for up to 30 days
    for (let days = 1; days <= 30; days++) {
      const searchDate = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
      searchDate.setHours(12, 0, 0, 0); // Set to noon to avoid date boundary issues
      const lunarAge = Moon.lunarAge(searchDate);
      
      // Check if we're at the target phase
      let isTargetPhase = false;
      switch (targetPhaseName) {
        case "New Moon":
          isTargetPhase = lunarAge < 1 || lunarAge > 28.5;
          break;
        case "First Quarter":
          isTargetPhase = lunarAge >= PHASE_AGES.FIRST_QUARTER - 0.5 && 
                         lunarAge <= PHASE_AGES.FIRST_QUARTER + 0.5;
          break;
        case "Full Moon":
          isTargetPhase = lunarAge >= PHASE_AGES.FULL_MOON - 0.5 && 
                         lunarAge <= PHASE_AGES.FULL_MOON + 0.5;
          break;
        case "Last Quarter":
          isTargetPhase = lunarAge >= PHASE_AGES.LAST_QUARTER - 0.5 && 
                         lunarAge <= PHASE_AGES.LAST_QUARTER + 0.5;
          break;
      }
      
      if (isTargetPhase) {
        return new Date(searchDate);
      }
    }
  } else {
    // For intermediate phases, use the existing logic
    const targetPhaseIndex = moonPhases.findIndex(phase => phase.name === targetPhaseName);
    if (targetPhaseIndex === -1) return null;
    
    // Search for the phase
    for (let days = 1; days <= 30; days++) {
      const searchDate = new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
      if (getMoonPhase(searchDate) === targetPhaseIndex) {
        return new Date(searchDate);
      }
    }
  }
  
  return null;
}

// Function to calculate time until a specific date
export function getTimeUntilDate(targetDate: Date, fromDate: Date = new Date()): string {
  const diffMs = targetDate.getTime() - fromDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays === 0) {
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    }
    return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
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