import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Await searchParams as required in Next.js 15
  const params = await searchParams
  
  if (user) {
    redirect(params.redirect || '/')
  }

  return <LoginForm redirectTo={params.redirect} />
}