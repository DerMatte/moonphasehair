'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  const [isIOSPromptClosed, setIsIOSPromptClosed] = useState(false)

  const handleCloseIOSPrompt = () => {
    setIsIOSPromptClosed(true)
  }

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
    toast.success('App installed successfully')
    setPromptInstall(null)
  }

  if (isStandalone) {
    return null // Don't show install prompt if already installed
  }

  return (
    <div className="space-y-4 relative">
      {isIOS && !isIOSPromptClosed && (
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg relative ">
          <div className="absolute top-2 right-2">
            <Button onClick={handleCloseIOSPrompt} size="sm" className=" text-white hover:bg-sky-600">
              X
            </Button>
          </div>
          <p className="text-sm text-sky-800 text-balance">
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
          <Button onClick={handleInstallClick} size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
            Install App
          </Button>
        </div>
      )}
    </div>
  )
}
