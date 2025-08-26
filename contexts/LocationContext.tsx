'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Hemisphere, getHemisphere } from '@/lib/hemisphere';

interface LocationData {
  city: string;
  country: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  hemisphere: Hemisphere;
  source?: string;
}

const LocationContext = createContext<LocationData | null>(null);

export function LocationProvider({ 
  children, 
  locationData 
}: { 
  children: ReactNode;
  locationData: Omit<LocationData, 'hemisphere'> | null;
}) {
  const enrichedData: LocationData | null = locationData ? {
    ...locationData,
    hemisphere: getHemisphere(locationData.latitude)
  } : null;

  return (
    <LocationContext.Provider value={enrichedData}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  return context;
}

export function useHemisphere(): Hemisphere {
  const context = useContext(LocationContext);
  return context?.hemisphere || Hemisphere.NORTHERN;
}