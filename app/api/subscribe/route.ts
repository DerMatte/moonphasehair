import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { subscription, targetPhase, nextDate } = await request.json();
  
  // Store in KV (use endpoint as key for uniqueness)
  await kv.set(subscription.endpoint, JSON.stringify({ subscription, targetPhase, nextDate }));
  
  return NextResponse.json({ success: true });
}
