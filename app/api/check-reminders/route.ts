import { kv } from '@vercel/kv';
import { getMoonPhaseWithTiming, getNextMoonPhaseOccurrence } from '@/lib/MoonPhaseCalculator';
import { NextResponse } from 'next/server';

export async function GET() {
  const keys = await kv.keys('*');
  
  for (const key of keys) {
    const value = await kv.get<string>(key);
    if (value === null) continue;
    
    // Handle both string and object values from KV store
    const data = typeof value === 'string' ? JSON.parse(value) : value;
    const today = new Date();
    const reminderDate = new Date(data.nextDate);

    // Check if we've reached the reminder date
    if (reminderDate <= today) {
      const { current } = getMoonPhaseWithTiming(today);
      
      // Check if the current phase matches the target phase
      if (current.name === data.targetPhase) {
        // Send notification - target phase has arrived!
        const notificationResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/send-notification`, {
          method: 'POST',
          body: JSON.stringify({
            subscription: data.subscription,
            title: `${data.targetPhase} Moon Phase is Here! 🌙`,
            body: `It's time for your ${current.name} moon phase reminder. ${current.action || 'Perfect time for your moon-aligned activities!'}`,
            url: '/' // Link back to app
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!notificationResponse.ok) {
          console.error('Failed to send notification:', await notificationResponse.text());
        }

        // Remove the reminder after sending
        await kv.del(key);
      } else {
        // If we've passed the date but phase doesn't match, recalculate
        const nextOccurrence = getNextMoonPhaseOccurrence(data.targetPhase, today);
        if (nextOccurrence) {
          // Update the reminder with the new date and maintain 33-day expiration
          await kv.set(key, JSON.stringify({
            ...data,
            nextDate: nextOccurrence.toISOString()
          }), { ex: 2851200 });
        } else {
          // If we can't find next occurrence, remove the reminder
          await kv.del(key);
        }
      }
    }
  }
  
  return NextResponse.json({ status: 'checked' });
}
