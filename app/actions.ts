'use server'

import webpush from 'web-push'
import { kv } from '@vercel/kv'

if (!process.env.VAPID_EMAIL || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error('Missing VAPID environment variables');
}

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

export async function subscribeUser(subscriptionData: any, targetPhase: string, nextDate: string) {
  try {
    // Store in KV (use endpoint as key for uniqueness)
    await kv.set(subscriptionData.endpoint, JSON.stringify({ 
      subscription: subscriptionData, 
      targetPhase, 
      nextDate,
      createdAt: new Date().toISOString()
    }));
    
    return { success: true }
  } catch (error) {
    console.error('Error storing subscription:', error);
    return { success: false, error: 'Failed to store subscription' }
  }
}

export async function unsubscribeUser(endpoint: string) {
  try {
    await kv.del(endpoint);
    return { success: true }
  } catch (error) {
    console.error('Error removing subscription:', error);
    return { success: false, error: 'Failed to remove subscription' }
  }
}

export async function sendNotification(subscriptionData: any, title: string, body: string, url?: string) {
  try {
    await webpush.sendNotification(
      subscriptionData,
      JSON.stringify({
        title,
        body,
        icon: '/favicon.ico',
        url: url || '/'
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
