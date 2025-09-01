'use client'

import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LoginButton() {
  const router = useRouter()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full"
      onClick={() => router.push('/auth/login')}
    >
      <User className="h-5 w-5" />
      <span className="sr-only">Sign in</span>
    </Button>
  )
}