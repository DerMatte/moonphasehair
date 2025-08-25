import { kv } from '@vercel/kv';
import { getMoonPhaseWithTiming, getNextMoonPhaseOccurrence } from '@/lib/MoonPhaseCalculator';
import { NextResponse } from 'next/server';

export async function GET() {
  const keys = await kv.keys('*');
  
  for (const key of keys) {
    const value = await kv.get<string>(key);
    if (value === null) continue;
    const data = JSON.parse(value);
    const today = new Date();
    const reminderDate = new Date(data.nextDate);

    // Check if we've reached the reminder date
    if (reminderDate <= today) {
      const { current } = getMoonPhaseWithTiming(today);
      
      // Check if the current phase matches the target phase
      if (current.name === data.targetPhase) {
        // Send notification - target phase has arrived!
        await fetch('/api/send-notification', {
          method: 'POST',
          body: JSON.stringify({
            subscription: data.subscription,
            title: `${data.targetPhase} Moon Phase is Here! 🌙`,
            body: `It's time for your ${current.name} moon phase reminder. ${current.action || 'Perfect time for your moon-aligned activities!'}`,
            url: '/' // Link back to app
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        // Remove the reminder after sending
        await kv.del(key);
      } else {
        // If we've passed the date but phase doesn't match, recalculate
        const nextOccurrence = getNextMoonPhaseOccurrence(data.targetPhase, today);
        if (nextOccurrence) {
          // Update the reminder with the new date
          await kv.set(key, JSON.stringify({
            ...data,
            nextDate: nextOccurrence.toISOString()
          }));
        } else {
          // If we can't find next occurrence, remove the reminder
          await kv.del(key);
        }
      }
    }
  }
  
  return NextResponse.json({ status: 'checked' });
}
