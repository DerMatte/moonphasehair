'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const signInWithProvider = async (provider: 'twitter' | 'google') => {
    try {
      setIsLoading(provider)
      
      const redirectUrl = `${window.location.origin}/api/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        toast.error(`Failed to sign in with ${provider}`)
        console.error('Auth error:', error)
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to MoonPhase Hair</CardTitle>
          <CardDescription className="text-center">
            Sign in to receive personalized moon phase notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Button
              variant="outline"
              onClick={() => signInWithProvider('twitter')}
              disabled={isLoading !== null}
              className="w-full"
            >
              {isLoading === 'twitter' ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.twitter className="mr-2 h-4 w-4" />
              )}
              Continue with X (Twitter)
            </Button>
            <Button
              variant="outline"
              onClick={() => signInWithProvider('google')}
              disabled={isLoading !== null}
              className="w-full"
            >
              {isLoading === 'google' ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to receive notifications about moon phases
          </p>
        </CardContent>
      </Card>
    </div>
  )
}