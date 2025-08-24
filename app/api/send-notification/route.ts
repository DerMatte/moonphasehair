import webpush from 'web-push';
import { NextRequest, NextResponse } from 'next/server'

if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error('Missing VAPID environment variables');
}

const vapidEmail = process.env.VAPID_EMAIL;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidEmail || !vapidPublicKey || !vapidPrivateKey) {
  throw new Error('Missing VAPID environment variables');
}

export async function POST(request: NextRequest) {
  const { subscription, title, body, url } = await request.json();
  
  webpush.setVapidDetails(
    `mailto:${vapidEmail}`,
    vapidPublicKey,
    vapidPrivateKey
  );
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify({ title, body, url }));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}