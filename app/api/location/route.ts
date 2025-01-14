import { geolocation } from '@vercel/functions';
import type { NextRequest } from 'next/server'


export async function GET(request: NextRequest) {

    // const latitude = request.headers.get('x-vercel-ip-latitude');
    // const longitude = request.headers.get('x-vercel-ip-longitude');

    const { city, latitude, longitude } = geolocation(request);

    return new Response(JSON.stringify({ lat: latitude, long: longitude, city: city }));
  }