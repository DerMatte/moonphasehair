'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })
    setSubscription(sub)
    
    // For now, subscribe to new moon phase (you can modify this)
    const result = await subscribeUser(sub.toJSON(), 'New Moon', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), 'hair')
    console.log('Subscription result:', result)
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe()
    setSubscription(null)
    if (subscription) {
      await unsubscribeUser(subscription.endpoint, 'hair')
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(subscription.toJSON(), 'Test Notification', message || 'Hello from Moon Hair!')
    }
  }
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }
  return (
    <Card className="space-y-4 p-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="push-notifications">
          <AccordionTrigger className="text-left">
            <div className="flex items-center justify-between  gap-4 w-full">
              <div className="font-semibold">Push Notifications</div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Enable push notifications to get moon phase reminders</div>
            </div>
            <CardContent>
            {subscription ? (
              <>
                <p className="text-sm text-green-600">✓ You are subscribed to push notifications</p>
                <Button onClick={unsubscribeFromPush} variant="outline">
                  Unsubscribe
                </Button>
                
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Test message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <Button onClick={sendTestNotification}>
                    Send Test Notification
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-600">Enable push notifications to get moon phase reminders</p>
                <Button onClick={subscribeToPush}>
                  Enable Notifications
                </Button>
              </>
            )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
