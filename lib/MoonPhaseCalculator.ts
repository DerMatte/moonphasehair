import { moonPhases } from "@/lib/consts";

export function getMoonPhase(date: Date): number {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    const day = date.getDate();
  
    let c = 0;
    let e = 0;
    let jd = 0;
    let b = 0;
  
    if (month < 3) {
      year--;
      month += 12;
    }
  
    month++;
    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09;
    jd /= 29.5305882; // Synodic month length
    b = parseInt(jd.toString());
    jd -= b;
    b = Math.round(jd * 8);
    if (b >= 8) b = 0;
  
    return b;
}

// New function to get phase with timing information
export function getMoonPhaseWithTiming(date: Date = new Date()) {
  const phaseNumber = getMoonPhase(date);
  const synodic = 29.5305882; // days
  const phaseDuration = synodic / 8; // approximately 3.69 days per phase
  
  // Calculate more accurate phase timing
  const calculatePhaseDate = (baseDate: Date, phaseOffset: number) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + (phaseOffset * phaseDuration));
    return newDate;
  };

  // Calculate current phase timing
  const currentPhaseStart = calculatePhaseDate(date, -0.5);
  const currentPhaseEnd = calculatePhaseDate(date, 0.5);
  
  // Get next and previous phases with proper dates
  const nextPhaseNumber = (phaseNumber + 1) % 8;
  const previousPhaseNumber = phaseNumber === 0 ? 7 : phaseNumber - 1;
  
  const nextPhaseStart = calculatePhaseDate(date, 0.5);
  const nextPhaseEnd = calculatePhaseDate(date, 1.5);
  
  const previousPhaseStart = calculatePhaseDate(date, -1.5);
  const previousPhaseEnd = calculatePhaseDate(date, -0.5);

  // Calculate upcoming phases (next 3-4 phases after the immediate next one)
  const upcoming = [];
  for (let i = 2; i <= 5; i++) {
    const upcomingPhaseNumber = (phaseNumber + i) % 8;
    const upcomingDate = calculatePhaseDate(date, i - 0.5);
    
    upcoming.push({
      name: moonPhases[upcomingPhaseNumber].name,
      phase: moonPhases[upcomingPhaseNumber].phaseValue,
      emoji: moonPhases[upcomingPhaseNumber].emoji,
      description: moonPhases[upcomingPhaseNumber].description,
      action: moonPhases[upcomingPhaseNumber].action,
      date: upcomingDate
    });
  }

  return {
    current: {
      ...moonPhases[phaseNumber],
      phaseNumber,
      startDate: currentPhaseStart,
      endDate: currentPhaseEnd
    },
    next: {
      ...moonPhases[nextPhaseNumber],
      phaseNumber: nextPhaseNumber,
      startDate: nextPhaseStart,
      endDate: nextPhaseEnd
    },
    previous: {
      ...moonPhases[previousPhaseNumber],
      phaseNumber: previousPhaseNumber,
      startDate: previousPhaseStart,
      endDate: previousPhaseEnd
    },
    upcoming: upcoming
  };
}

// Function to find the next occurrence of a specific moon phase
export function getNextMoonPhaseOccurrence(targetPhaseName: string, fromDate: Date = new Date()): Date | null {
  // Find the target phase number
  const targetPhaseIndex = moonPhases.findIndex(phase => phase.name === targetPhaseName);
  if (targetPhaseIndex === -1) return null;
  
  // Check phases for the next ~2 months (2 lunar cycles)
  for (let daysAhead = 0; daysAhead < 60; daysAhead++) {
    const checkDate = new Date(fromDate);
    checkDate.setDate(fromDate.getDate() + daysAhead);
    
    const phaseNumber = getMoonPhase(checkDate);
    
    if (phaseNumber === targetPhaseIndex) {
      // Found the phase, calculate the start of this phase period
      const phaseStart = new Date(checkDate);
      phaseStart.setHours(12, 0, 0, 0); // Set to noon for consistency
      return phaseStart;
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