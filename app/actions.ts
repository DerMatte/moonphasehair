'use server'

import webpush from 'web-push'
import { kv } from '@vercel/kv'

function initializeWebPush() {
  const vapidEmail = process.env.VAPID_EMAIL;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (vapidEmail && vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
      `mailto:${vapidEmail}`,
      vapidPublicKey,
      vapidPrivateKey
    );
    return true;
  }
  return false;
}

export async function subscribeUser(subscriptionData: any, targetPhase: string, nextDate: string) {
  if (!initializeWebPush()) {
    throw new Error('Push notifications not configured');
  }
  
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
  if (!initializeWebPush()) {
    throw new Error('Push notifications not configured');
  }
  
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
