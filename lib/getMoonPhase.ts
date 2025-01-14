import { Moon } from 'lunarphase-js';

export async function getMoonPhase(city: string = 'Unknown', country: string = 'Unknown') {
  const currentDate = new Date();
  const moonPhase = Moon.lunarPhase(currentDate);
  const illumination = Moon.illuminationPercentage(currentDate);

  // Calculate the next moon phase
  const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const currentPhaseIndex = moonPhases.indexOf(moonPhase);
  const nextPhaseIndex = (currentPhaseIndex + 1) % moonPhases.length;
  const nextMoonPhase = moonPhases[nextPhaseIndex];

  // Estimate the date of the next moon phase
  const daysUntilNextPhase = Math.ceil((nextPhaseIndex - currentPhaseIndex + 8) % 8 * 3.6875);
  const nextPhaseDate = new Date(currentDate);
  nextPhaseDate.setDate(nextPhaseDate.getDate() + daysUntilNextPhase);

  return {
    location: `${city}, ${country}`,
    currentPhase: {
      name: moonPhase,
      illumination,
      date: currentDate.toISOString(),
    },
    nextPhase: {
      name: nextMoonPhase,
      date: nextPhaseDate.toISOString(),
    }
  };
} 