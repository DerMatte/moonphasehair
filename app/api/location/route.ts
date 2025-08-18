import { geolocation } from '@vercel/functions';
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { city, country, region } = geolocation(request);
    
    return Response.json({ 
      city: city || 'Unknown',
      country: country || 'Unknown', 
      region: region || '',
      source: 'vercel'
    });
  } catch (error) {
    console.error('Geolocation error:', error);
    return Response.json({ 
      city: 'Unknown',
      country: 'Unknown', 
      region: '',
      source: 'error'
    }, { status: 500 });
  }
}