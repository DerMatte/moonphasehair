import { NextRequest, NextResponse } from 'next/server';
import { geolocation } from '@vercel/functions';
import { Moon } from 'lunarphase-js';

export async function GET(request: NextRequest) {
  try {
    const { city, country } = geolocation(request);
    const currentDate = new Date();
    const moonPhase = Moon.lunarPhase(currentDate);
    // @ts-expect-error why are you running?
    const illumination = Moon.lunarIlluminationPercent(currentDate);

    // Calculate the next moon phase
    const moonPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    const currentPhaseIndex = moonPhases.indexOf(moonPhase);
    const nextPhaseIndex = (currentPhaseIndex + 1) % moonPhases.length;
    const nextMoonPhase = moonPhases[nextPhaseIndex];

    // Estimate the date of the next moon phase (this is a rough estimate)
    const daysUntilNextPhase = Math.ceil((nextPhaseIndex - currentPhaseIndex + 8) % 8 * 3.6875);
    const nextPhaseDate = new Date(currentDate);
    nextPhaseDate.setDate(nextPhaseDate.getDate() + daysUntilNextPhase);

    const data = {
        location: `${city}, ${country}`,
      currentPhase: {
        name: moonPhase,
        illumination,
        date: currentDate.toISOString(),
      },
      nextPhase: {
        name: nextMoonPhase,
        date: nextPhaseDate.toISOString(),
      },
    }
    console.log(data)
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in moon phase calculation:', error);
    return NextResponse.json({ error: 'Failed to calculate moon phase' }, { status: 500 });
  }
}

