import MoonPhaseDisplay from '@/components/MoonPhaseDisplay';
import { headers } from 'next/headers';
import { getMoonPhase } from '@/lib/getMoonPhase';

export default async function HomePage() {
  try {
    const headersList = await headers();
    const city = headersList.get('x-vercel-ip-city') || 'Unknown';
    const country = headersList.get('x-vercel-ip-country') || 'Unknown';
    
    const data = await getMoonPhase(city, country);

    return (
      <main className='flex flex-col items-center justify-center gap-8 pt-24'>
        <h1 className="text-4xl font-bold mb-8 text-center">Moon Phase Tracker</h1>
        <MoonPhaseDisplay 
          location={data.location}
          currentPhase={data.currentPhase}
          nextPhase={data.nextPhase}
        />
      </main>
    );
  } catch (error) {
    console.error('Error calculating moon phase data:', error);
    return (
      <main className='flex flex-col items-center justify-center gap-8 pt-24'>
        <h1 className="text-4xl font-bold mb-8 text-center">Moon Phase Tracker</h1>
        <p className="text-red-500">Error: Failed to calculate moon phase data. Please try again later.</p>
      </main>
    );
  }
}

