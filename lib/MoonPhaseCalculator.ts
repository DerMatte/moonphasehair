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
  
  // Calculate when this phase started
  const currentPhaseStart = new Date(date);
  currentPhaseStart.setDate(date.getDate() - Math.floor(phaseDuration / 2));
  
  // Calculate when this phase will end
  const currentPhaseEnd = new Date(date);
  currentPhaseEnd.setDate(date.getDate() + Math.floor(phaseDuration / 2));
  
  // Get next and previous phases
  const nextPhaseNumber = (phaseNumber + 1) % 8;
  const previousPhaseNumber = phaseNumber === 0 ? 7 : phaseNumber - 1;
  
  // Calculate previous phase dates
  const previousPhaseStart = new Date(currentPhaseStart);
  previousPhaseStart.setDate(currentPhaseStart.getDate() - phaseDuration);
  const previousPhaseEnd = new Date(currentPhaseStart);
  previousPhaseEnd.setDate(currentPhaseStart.getDate() - 1);
  
  // Calculate next phase dates
  const nextPhaseStart = new Date(currentPhaseEnd);
  nextPhaseStart.setDate(currentPhaseEnd.getDate() + 1);
  const nextPhaseEnd = new Date(nextPhaseStart);
  nextPhaseEnd.setDate(nextPhaseStart.getDate() + phaseDuration);

  // Calculate upcoming phases (next 2-3 phases after the immediate next)
  const upcomingPhases = [];
  for (let i = 2; i <= 4; i++) {
    const upcomingPhaseNumber = (phaseNumber + i) % 8;
    const upcomingPhaseStart = new Date(currentPhaseStart);
    upcomingPhaseStart.setDate(currentPhaseStart.getDate() + (phaseDuration * i));
    const upcomingPhaseEnd = new Date(upcomingPhaseStart);
    upcomingPhaseEnd.setDate(upcomingPhaseStart.getDate() + phaseDuration);
    
    upcomingPhases.push({
      ...moonPhases[upcomingPhaseNumber],
      phaseNumber: upcomingPhaseNumber,
      startDate: upcomingPhaseStart,
      endDate: upcomingPhaseEnd
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
    upcoming: upcomingPhases
  };
}