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
  
  const phases = [
    { name: 'New Moon', emoji: '🌑', advice: 'Fresh start / Transformative change' },
    { name: 'Waxing Crescent', emoji: '🌒', advice: 'Hair grows back faster / Strengthen' },
    { name: 'First Quarter', emoji: '🌓', advice: 'Best for hair growing back faster & strengthening' },
    { name: 'Waxing Gibbous', emoji: '🌔', advice: 'Get rid of split ends / Hair care' },
    { name: 'Full Moon', emoji: '🌕', advice: 'Hair grows back faster / Nourish' },
    { name: 'Waning Gibbous', emoji: '🌖', advice: 'Detox / Release stored emotional energy' },
    { name: 'Last Quarter', emoji: '🌗', advice: 'Slows hair growth' },
    { name: 'Waning Crescent', emoji: '🌘', advice: 'Leave alone, allow recovery to take place' }
  ];
  
  return {
    current: {
      ...phases[phaseNumber],
      phaseNumber,
      startDate: currentPhaseStart,
      endDate: currentPhaseEnd
    },
    next: {
      ...phases[nextPhaseNumber],
      phaseNumber: nextPhaseNumber
    },
    previous: {
      ...phases[previousPhaseNumber],
      phaseNumber: previousPhaseNumber
    }
  };
}


export const MoonPhaseRecommendations = {
  "New Moon": {
    action: "New beginnings / Bold transformation",
    description: "An ideal moment for a striking new look or style change",
    icon: "🌟",
  },
  "Waxing Crescent": {
    action: "Accelerated growth / Strengthening phase",
    description: "Trim now for quicker, healthier regrowth",
    icon: "💪🏼",
  },
  "First Quarter": {
    action: "Experiment with styles / Color change",
    description: "Great time to explore new hairstyles or shades",
    icon: "🎨✨",
  },
  "Waxing Gibbous": {
    action: "Eliminate split ends / Focus on care",
    description: "Time to trim split ends and enhance hair health",
    icon: "✂️🌿",
  },
  "Full Moon": {
    action: "Boost growth / Nourishing treatments",
    description: "Cut for enhanced growth and deep nourishment",
    icon: "🌕💧",
  },
  "Waning Gibbous": {
    action: "Cleansing / Releasing emotional baggage",
    description: "Focus on detox treatments and emotional release",
    icon: "🧘‍♀️🌌",
  },
  "Last Quarter": {
    action: "Reduce growth rate",
    description: "Trim if you prefer slower hair regrowth",
    icon: "⏳✂️",
  },
  "Waning Crescent": {
    action: "Rest and recovery",
    description: "Allow your hair to recover - avoid cuts and focus on care",
    icon: "🛌🌙",
  }
};