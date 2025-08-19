'use client';

import { useState, useEffect } from 'react';
import { Pin } from "@nsmr/pixelart-react";

interface LocationData {
  city: string;
  country: string;
  region?: string;
  source: 'vercel' | 'browser' | 'ip' | 'default';
}

export default function LocationInfo() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const detectLocation = async () => {
      try {
        // First try: Check if we're on Vercel and have geo headers via a simple fetch
        try {
          const response = await fetch('/api/location');
          if (response.ok) {
            const data = await response.json();
            if (data.city && data.city !== 'Unknown' && mounted) {
              setLocation({
                city: data.city,
                country: data.country || 'Unknown',
                region: data.region,
                source: 'vercel'
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.warn('Vercel geo API failed:', apiError);
        }

        // Second try: Browser geolocation with reverse geocoding
        if ('geolocation' in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                enableHighAccuracy: false
              });
            });

            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const geoData = await response.json();
              if (mounted && geoData.city) {
                setLocation({
                  city: geoData.city || geoData.locality || 'Unknown City',
                  country: geoData.countryName || 'Unknown Country',
                  region: geoData.principalSubdivision,
                  source: 'browser'
                });
                setIsLoading(false);
                return;
              }
            }
          } catch (geoError) {
            console.warn('Browser geolocation failed:', geoError);
          }
        }

        // Third try: IP-based geolocation
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            const ipData = await response.json();
            if (mounted && ipData.city && ipData.country_name) {
              setLocation({
                city: ipData.city,
                country: ipData.country_name,
                region: ipData.region,
                source: 'ip'
              });
              setIsLoading(false);
              return;
            }
          }
        } catch (ipError) {
          console.warn('IP geolocation failed:', ipError);
        }

        // Final fallback
        if (mounted) {
          setLocation({
            city: 'Munich',
            country: 'Germany',
            region: 'Bavaria',
            source: 'default'
          });
          setIsLoading(false);
        }

      } catch (error) {
        console.error('All location detection failed:', error);
        if (mounted) {
          setLocation({
            city: 'Munich',
            country: 'Germany',
            region: 'Bavaria',
            source: 'default'
          });
          setIsLoading(false);
        }
      }
    };

    detectLocation();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Pin size={32} />
        <span className="font-mono animate-pulse">Loading location...</span>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Pin size={32} />
        <span className="font-mono">Location unavailable</span>
      </div>
    );
  }

  const displayLocation = location.region && location.region !== location.city 
    ? `${location.city}, ${location.region}, ${location.country}`
    : `${location.city}, ${location.country}`;

  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <Pin size={32} />
      <span className="font-mono">
        {displayLocation}
        {location.source === 'default' && (
          <span className="text-xs text-orange-500 ml-1" title="Using default location">
            (default)
          </span>
        )}
      </span>
    </div>
  );
}
