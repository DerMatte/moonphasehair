'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [promptInstall, setPromptInstall] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  useEffect(() => {
    const ready = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setPromptInstall(e)
    }

    window.addEventListener('beforeinstallprompt', ready as any)

    return () => {
      window.removeEventListener('beforeinstallprompt', ready as any)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!promptInstall) {
      return
    }
    const result = await promptInstall.prompt()
    console.log('👍', 'userChoice', result)
    setPromptInstall(null)
  }

  if (isStandalone) {
    return null // Don't show install prompt if already installed
  }

  return (
    <div className="space-y-4">
      {isIOS && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            To install this app on your iOS device, tap the share button{' '}
            <span role="img" aria-label="share icon">
              ⎋
            </span>{' '}
            and then "Add to Home Screen"{' '}
            <span role="img" aria-label="plus icon">
              ➕
            </span>
            .
          </p>
        </div>
      )}

      {promptInstall && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-800 mb-2">
            Install Moonphase Hair app for the best experience!
          </p>
          <Button onClick={handleInstallClick} size="sm">
            Install App
          </Button>
        </div>
      )}
    </div>
  )
}
