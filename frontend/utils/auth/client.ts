import Cookies from 'js-cookie'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
const TOKEN_KEY = 'access_token'

export interface User {
  id: string
  email: string
  skin?: string
  visited_realms?: string[]
}

export interface AuthResponse {
  user: User
  access_token: string
}

export interface AuthError {
  error: string
}

class AuthClient {
  private token: string | null = null

  constructor() {
    // Initialize token from cookie on client side
    if (typeof window !== 'undefined') {
      this.token = Cookies.get(TOKEN_KEY) || null
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string): Promise<{ data: AuthResponse | null; error: AuthError | null }> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: { error: data.error || 'Signup failed' } }
      }

      // Store token in cookie
      this.setToken(data.access_token)

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { error: error.message || 'Network error' } }
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<{ data: AuthResponse | null; error: AuthError | null }> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: { error: data.error || 'Login failed' } }
      }

      // Store token in cookie
      this.setToken(data.access_token)

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { error: error.message || 'Network error' } }
    }
  }

  /**
   * Simple email-only sign in (no password required)
   */
  async simpleSignIn(email: string): Promise<{ data: AuthResponse | null; error: AuthError | null }> {
    try {
      const response = await fetch(`${BACKEND_URL}/auth/simple-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: { error: data.error || 'Sign in failed' } }
      }

      // Store token in cookie
      this.setToken(data.access_token)

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { error: error.message || 'Network error' } }
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    this.removeToken()
  }

  /**
   * Get the current user's information
   */
  async getUser(): Promise<{ data: { user: User } | null; error: AuthError | null }> {
    const token = this.getToken()

    if (!token) {
      return { data: null, error: { error: 'No access token' } }
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: { error: data.error || 'Failed to get user' } }
      }

      // Auto-fix invalid skin values
      if (data.user && (data.user.skin === 'default' || !data.user.skin)) {
        await this.fixSkin()
        // Re-fetch user data after fixing
        const updatedResponse = await fetch(`${BACKEND_URL}/auth/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const updatedData = await updatedResponse.json()
        return { data: updatedData, error: null }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { error: error.message || 'Network error' } }
    }
  }

  /**
   * Fix invalid skin value (internal helper)
   */
  private async fixSkin(): Promise<void> {
    const token = this.getToken()
    if (!token) return

    try {
      await fetch(`${BACKEND_URL}/auth/fix-skin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Failed to fix skin:', error)
    }
  }

  /**
   * Get the current session (token)
   */
  async getSession(): Promise<{ data: { session: { access_token: string } | null }; error: AuthError | null }> {
    const token = this.getToken()

    if (!token) {
      return { data: { session: null }, error: null }
    }

    // Verify token is still valid by checking with backend
    const { error } = await this.getUser()

    if (error) {
      this.removeToken()
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
  }

  /**
   * Store token in cookie
   */
  private setToken(token: string): void {
    this.token = token
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  /**
   * Get token from cookie
   */
  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = Cookies.get(TOKEN_KEY) || null
    }
    return this.token
  }

  /**
   * Remove token from cookie
   */
  private removeToken(): void {
    this.token = null
    Cookies.remove(TOKEN_KEY)
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<{ data: { access_token: string } | null; error: AuthError | null }> {
    const token = this.getToken()

    if (!token) {
      return { data: null, error: { error: 'No access token' } }
    }

    try {
      const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { data: null, error: { error: data.error || 'Failed to refresh token' } }
      }

      // Update token in cookie
      this.setToken(data.access_token)

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: { error: error.message || 'Network error' } }
    }
  }
}

// Export singleton instance
export const authClient = new AuthClient()

// Export helper function to create client (for compatibility with Supabase pattern)
export function createClient() {
  return authClient
}
