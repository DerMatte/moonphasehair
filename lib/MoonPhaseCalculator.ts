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