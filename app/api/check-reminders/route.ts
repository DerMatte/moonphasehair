import { kv } from '@vercel/kv';
import { getMoonPhaseWithTiming } from '@/lib/MoonPhaseCalculator';
import { NextResponse } from 'next/server';

export async function GET() {
  const keys = await kv.keys('*');
  
  for (const key of keys) {
    const value = await kv.get<string>(key);
    if (value === null) continue;
    const data = JSON.parse(value);
    const today = new Date();
    const reminderDate = new Date(data.nextDate);

    if (reminderDate <= today) {
      const { current } = getMoonPhaseWithTiming(today);
      
      await fetch('/api/send-notification', {
        method: 'POST',
        body: JSON.stringify({
          subscription: data.subscription,
          title: `Moon Phase Reminder: ${data.targetPhase}`,
          body: `It's time for ${current.name}! Get that haircut aligned with the moon.`,
          url: '/' // Link back to app
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      // Optional: Remove after sending
      await kv.del(key);
    }
  }
  
  return NextResponse.json({ status: 'checked' });
}
