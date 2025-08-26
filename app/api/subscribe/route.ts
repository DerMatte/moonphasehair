import { kv } from '@vercel/kv';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { subscription, targetPhase, nextDate } = await request.json();
  
  // Validate required fields
  if (!subscription?.endpoint || !targetPhase || !nextDate) {
    return NextResponse.json(
      { error: 'Missing required fields: subscription.endpoint, targetPhase, or nextDate' }, 
      { status: 400 }
    );
  }
  
  // Store in KV (use endpoint as key for uniqueness)
  // Set expiration to 33 days (33 * 24 * 60 * 60 = 2,851,200 seconds)
  await kv.set(subscription.endpoint, JSON.stringify({ subscription, targetPhase, nextDate }), { ex: 2851200 });
  
  return NextResponse.json({ success: true });
}
