import MoonPhase from '@/components/MoonPhase';
import { MoreInfo } from '@/components/MoreInfo';
import { headers } from 'next/headers';

export default async function MoonPage() {
  const headersList = await headers();
  const city = headersList.get('x-vercel-ip-city') || 'Unknown';
  const country = headersList.get('x-vercel-ip-country') || 'Unknown';

  return (
    <main className='flex flex-col items-center justify-center gap-8 pt-24 min-h-screen pb-48'>
        <div className="mb-24">
          <h1 className="text-4xl font-bold mb-8 text-center">Moon Phase Hair Tracker</h1>
          
          <h2 className="text-md text-center">
            Learn how the moon phase affects your hair growth and styling.
          </h2>
        </div>
        
        <MoonPhase />

        <div className="mt-8">
          <p>City: {city}</p>
          <p>Country: {country}</p>
        </div>

        <MoreInfo />
      </main>
  );
}
