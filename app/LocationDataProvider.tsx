import { LocationProvider } from '@/contexts/LocationContext';
import { baseUrl } from '@/lib/utils';
import { ReactNode } from 'react';

interface LocationData {
  city: string;
  country: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  source?: string;
}

async function getLocationData(): Promise<LocationData | null> {
  try {
    const res = await fetch(new URL("/api/location", baseUrl), {
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Failed to fetch location data:', error);
  }

  // Fallback location data
  return {
    city: "Munich",
    country: "Germany",
    region: "Bavaria",
    timezone: "Europe/Berlin",
    source: "fallback",
    latitude: 48.1351,
    longitude: 11.582,
  };
}

export default async function LocationDataProvider({ children }: { children: ReactNode }) {
  const locationData = await getLocationData();
  
  return (
    <LocationProvider locationData={locationData}>
      {children}
    </LocationProvider>
  );
}