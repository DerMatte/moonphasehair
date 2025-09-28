"use client";

import { useState, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  error?: string;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  defaultLocation?: { latitude: number; longitude: number };
}

/**
 * Hook to get user's current location using browser's Geolocation API
 * Falls back to default location if permission denied or not available
 */
export function useLocation(options: UseLocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    defaultLocation = { latitude: 40.7128, longitude: -74.0060 } // NYC default
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation({
        ...defaultLocation,
        accuracy: 0,
        timestamp: Date.now(),
        error: 'Geolocation not supported'
      });
      setLoading(false);
      return;
    }

    // Success callback
    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
      setError(null);
      setLoading(false);
    };

    // Error callback
    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown error occurred';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out';
          break;
      }

      setError(errorMessage);
      
      // Use default location as fallback
      setLocation({
        ...defaultLocation,
        accuracy: 0,
        timestamp: Date.now(),
        error: errorMessage
      });
      
      setLoading(false);
    };

    // Request current position
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );

    // Watch for position changes
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy,
        maximumAge: 30000 // Update every 30 seconds max
      }
    );

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enableHighAccuracy, timeout, maximumAge, defaultLocation.latitude, defaultLocation.longitude]);

  return {
    location,
    loading,
    error,
    isUsingDefault: location?.error !== undefined
  };
}

/**
 * Hook to get location from localStorage with fallback to geolocation
 */
export function useStoredLocation(storageKey = 'userLocation') {
  const geolocation = useLocation();
  const [storedLocation, setStoredLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    // Try to get location from localStorage first
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStoredLocation(parsed);
      } catch (e) {
        console.error('Failed to parse stored location:', e);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    // Update stored location when geolocation updates
    if (geolocation.location && !geolocation.location.error) {
      localStorage.setItem(storageKey, JSON.stringify(geolocation.location));
      setStoredLocation(geolocation.location);
    }
  }, [geolocation.location, storageKey]);

  // Return stored location if available and recent, otherwise use geolocation
  const isStoredRecent = storedLocation && 
    (Date.now() - storedLocation.timestamp) < 3600000; // 1 hour

  return {
    location: isStoredRecent ? storedLocation : geolocation.location,
    loading: !storedLocation && geolocation.loading,
    error: geolocation.error,
    isUsingDefault: geolocation.isUsingDefault,
    isUsingStored: Boolean(isStoredRecent)
  };
}