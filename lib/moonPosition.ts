import SunCalc from 'suncalc';

export interface MoonPosition {
  azimuth: number; // Direction along the horizon in degrees (0° = North, 90° = East, 180° = South, 270° = West)
  altitude: number; // Angle above the horizon in degrees (negative = below horizon)
  distance: number; // Distance to moon in kilometers
  parallacticAngle: number; // Moon tilt angle
}

export interface MoonPositionData extends MoonPosition {
  azimuthDegrees: number; // Azimuth converted to compass degrees (0-360)
  altitudeDegrees: number; // Altitude in degrees
  azimuthDirection: string; // Compass direction (N, NE, E, SE, S, SW, W, NW)
  isVisible: boolean; // Whether the moon is above the horizon
  formattedAzimuth: string; // Formatted azimuth string
  formattedAltitude: string; // Formatted altitude string
}

/**
 * Get compass direction from azimuth degrees
 */
function getCompassDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Convert radians to degrees
 */
function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculate moon position for a given date and location
 * @param date - The date/time to calculate for
 * @param latitude - Latitude in decimal degrees (positive = North)
 * @param longitude - Longitude in decimal degrees (positive = East)
 * @returns Moon position data including azimuth and altitude
 */
export function getMoonPosition(
  date: Date = new Date(),
  latitude: number,
  longitude: number
): MoonPositionData {
  // Get moon position from SunCalc
  const position = SunCalc.getMoonPosition(date, latitude, longitude);
  
  // Convert radians to degrees
  const altitudeDegrees = radToDeg(position.altitude);
  
  // Convert azimuth from radians to degrees
  // SunCalc returns azimuth in radians where 0 = South, π/2 = West, π = North, 3π/2 = East
  // We need to convert to compass degrees where 0° = North, 90° = East, 180° = South, 270° = West
  let azimuthDegrees = radToDeg(position.azimuth);
  
  // Convert from SunCalc's coordinate system to compass degrees
  azimuthDegrees = (azimuthDegrees + 180) % 360;
  
  // Get compass direction
  const azimuthDirection = getCompassDirection(azimuthDegrees);
  
  // Check if moon is visible (above horizon)
  const isVisible = altitudeDegrees > 0;
  
  // Format strings for display
  const formattedAzimuth = `${azimuthDegrees.toFixed(1)}° ${azimuthDirection}`;
  const formattedAltitude = `${altitudeDegrees.toFixed(1)}°${isVisible ? ' above horizon' : ' below horizon'}`;
  
  return {
    azimuth: position.azimuth,
    altitude: position.altitude,
    distance: position.distance,
    parallacticAngle: position.parallacticAngle,
    azimuthDegrees,
    altitudeDegrees,
    azimuthDirection,
    isVisible,
    formattedAzimuth,
    formattedAltitude
  };
}

/**
 * Get moon illumination data
 * @param date - The date/time to calculate for
 * @returns Moon illumination data
 */
export function getMoonIllumination(date: Date = new Date()) {
  return SunCalc.getMoonIllumination(date);
}

/**
 * Get moon rise and set times
 * @param date - The date to calculate for
 * @param latitude - Latitude in decimal degrees
 * @param longitude - Longitude in decimal degrees
 * @returns Moon rise, set, and highest point times
 */
export function getMoonTimes(
  date: Date = new Date(),
  latitude: number,
  longitude: number
) {
  return SunCalc.getMoonTimes(date, latitude, longitude);
}

/**
 * Get default location (can be overridden by user's actual location)
 * Returns coordinates for New York City as default
 */
export function getDefaultLocation(): { latitude: number; longitude: number; name: string } {
  return {
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'New York City'
  };
}