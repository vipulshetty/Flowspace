import { cookies } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
const TOKEN_KEY = 'access_token'

export interface User {
  id: string
  email: string
  skin?: string
  visited_realms?: string[]
}

export interface AuthError {
  error: string
}

/**
 * Get the access token from cookies (server-side)
 */
function getTokenFromCookies(): string | null {
  const cookieStore = cookies()
  const token = cookieStore.get(TOKEN_KEY)
  return token?.value || null
}

/**
 * Create a server-side auth client
 */
export function createClient() {
  return {
    auth: {
      /**
       * Get the current user from the backend
       */
      async getUser(): Promise<{ data: { user: User | null }; error: AuthError | null }> {
        const token = getTokenFromCookies()

        if (!token) {
          return { data: { user: null }, error: null }
        }

        try {
          const response = await fetch(`${BACKEND_URL}/auth/me`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          })

          const responseData = await response.json()

          if (!response.ok) {
            return {
              data: { user: null },
              error: { error: responseData.error || 'Failed to get user' },
            }
          }

          return { data: { user: responseData.user }, error: null }
        } catch (error: any) {
          return {
            data: { user: null },
            error: { error: error.message || 'Network error' },
          }
        }
      },

      /**
       * Get the current session (token)
       */
      async getSession(): Promise<{
        data: { session: { access_token: string } | null }
        error: AuthError | null
      }> {
        const token = getTokenFromCookies()

        if (!token) {
          return { data: { session: null }, error: null }
        }

        // Verify token is still valid
        const { error } = await this.getUser()

        if (error) {
          return { data: { session: null }, error }
        }

        return {
          data: {
            session: {
              access_token: token,
            },
          },
          error: null,
        }
      },
    },
  }
}

/**
 * Verify if the user is authenticated (server-side)
 */
export async function verifyAuth(): Promise<{
  authenticated: boolean
  user: User | null
  token: string | null
}> {
  const token = getTokenFromCookies()

  if (!token) {
    return { authenticated: false, user: null, token: null }
  }

  try {
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      return { authenticated: false, user: null, token: null }
    }

    return { authenticated: true, user: data.user, token }
  } catch (error) {
    return { authenticated: false, user: null, token: null }
  }
}
