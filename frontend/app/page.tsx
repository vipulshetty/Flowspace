import { createClient } from '@/utils/auth/server'
import LandingPageClient from './LandingPageClient'

export default async function Index() {
  // Check if user is already authenticated
  const authClient = createClient()
  const { data, error } = await authClient.auth.getUser()

  // Pass the user state to the client component
  // So it can show appropriate buttons
  return <LandingPageClient isAuthenticated={!!data?.user} />
}

