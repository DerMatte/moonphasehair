import { geolocation } from '@vercel/functions';
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { city, country, region, latitude, longitude } = geolocation(request);
    
    let timezone = "UTC"; // Default timezone
    
    // Try to get timezone if we have coordinates
    if (latitude && longitude) {
      try {
        const { find } = await import("geo-tz");
        const timezones = find(parseFloat(latitude), parseFloat(longitude));
        if (timezones && timezones.length > 0) {
          timezone = timezones[0];
        }
      } catch (error) {
        console.error("Error determining timezone:", error);
        // Silently fail and fall back to UTC
      }
    }
    
    return Response.json({ 
      city: city || 'Unknown',
      country: country || 'Unknown', 
      region: region || '',
      timezone,
      source: 'vercel'
    });
  } catch (error) {
    console.error('Geolocation error:', error);
    return Response.json({ 
      city: 'Unknown',
      country: 'Unknown', 
      region: '',
      timezone: 'UTC',
      source: 'error'
    }, { status: 500 });
  }
}