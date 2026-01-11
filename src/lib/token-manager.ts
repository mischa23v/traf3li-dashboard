/**
 * Gold Standard Token Manager
 *
 * ENTERPRISE PATTERN: AWS/Google/Microsoft Level
 *
 * Key principles:
 * 1. Access token stored in MEMORY only (not localStorage)
 * 2. Refresh token in httpOnly cookie only (never in JS)
 * 3. Never check for httpOnly cookies - just make the request
 * 4. Browser sends httpOnly cookie automatically with credentials: 'include'
 *
 * This is the ONLY place that manages access tokens.
 */

import { authEvents } from './auth-events'

// API base URL for auth endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.traf3li.com'

/**
 * Token state - kept in memory only
 * Never persisted to localStorage for security
 */
interface TokenState {
  accessToken: string | null
  expiresAt: number | null  // Unix timestamp in milliseconds
}

/**
 * Token refresh response from backend
 */
interface RefreshResponse {
  error?: boolean
  accessToken?: string
  access_token?: string  // OAuth 2.0 format
  expiresIn?: number
  expires_in?: number    // OAuth 2.0 format
  message?: string
}

/**
 * Gold Standard Token Manager
 *
 * Usage:
 *   import { tokenManager } from '@/lib/token-manager'
 *
 *   // Get valid token (auto-refreshes if needed)
 *   const token = await tokenManager.getValidAccessToken()
 *
 *   // After login, store the token
 *   tokenManager.setTokens(accessToken, expiresIn)
 *
 *   // On logout
 *   await tokenManager.logout()
 */
class TokenManager {
  private state: TokenState = {
    accessToken: null,
    expiresAt: null,
  }

  // Prevent concurrent refresh requests
  private refreshPromise: Promise<string | null> | null = null

  // Buffer before expiry to trigger refresh (60 seconds)
  private readonly REFRESH_BUFFER_MS = 60 * 1000

  /**
   * Check if current access token is valid (not expired or expiring soon)
   */
  private isTokenValid(): boolean {
    if (!this.state.accessToken || !this.state.expiresAt) {
      return false
    }
    // Token is valid if it won't expire in the next 60 seconds
    return Date.now() < this.state.expiresAt - this.REFRESH_BUFFER_MS
  }

  /**
   * Get a valid access token
   *
   * Returns current token if valid, otherwise attempts refresh.
   * Browser automatically sends httpOnly refresh cookie.
   *
   * @returns Access token string or null if not authenticated
   */
  async getValidAccessToken(): Promise<string | null> {
    // If we have a valid token, return it immediately
    if (this.isTokenValid()) {
      return this.state.accessToken
    }

    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // Start a new refresh
    this.refreshPromise = this.performRefresh()

    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * Perform token refresh
   *
   * GOLD STANDARD: Just make the request. Browser sends httpOnly cookie automatically.
   * No checks for cookie existence - httpOnly cookies are invisible to JS.
   */
  private async performRefresh(): Promise<string | null> {
    console.log('[TOKEN_MANAGER] Attempting token refresh via httpOnly cookie...')

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',  // CRITICAL: Sends httpOnly cookie
        headers: {
          'Content-Type': 'application/json',
        },
        // Empty body - refresh token is in httpOnly cookie
      })

      if (!response.ok) {
        console.log(`[TOKEN_MANAGER] Refresh failed with status ${response.status}`)

        if (response.status === 401 || response.status === 403) {
          // Session expired - clear state and emit event
          this.clearState()
          authEvents.onTokensCleared.emit({ reason: 'refresh_failed' })
          authEvents.onAuthStateChange.emit({ isAuthenticated: false })
        }

        return null
      }

      const data: RefreshResponse = await response.json()

      // Support both OAuth 2.0 (snake_case) and legacy (camelCase)
      const accessToken = data.access_token || data.accessToken
      const expiresIn = data.expires_in || data.expiresIn

      if (!accessToken) {
        console.error('[TOKEN_MANAGER] Refresh response missing accessToken')
        return null
      }

      // Store new token in memory
      this.state.accessToken = accessToken
      this.state.expiresAt = expiresIn
        ? Date.now() + expiresIn * 1000
        : Date.now() + 15 * 60 * 1000  // Default 15 min if not provided

      console.log('[TOKEN_MANAGER] Token refresh successful', {
        expiresIn: expiresIn ? `${expiresIn}s` : 'default 15min',
        expiresAt: new Date(this.state.expiresAt).toISOString(),
      })

      // Emit refresh event for subscribers (e.g., WebSocket)
      authEvents.onTokensRefreshed.emit({ accessToken, expiresIn })

      return accessToken
    } catch (error) {
      console.error('[TOKEN_MANAGER] Refresh request failed:', error)
      return null
    }
  }

  /**
   * Store tokens after successful login
   *
   * Called by login/OAuth handlers after receiving tokens from backend.
   * Refresh token is NOT passed here - it's in httpOnly cookie set by backend.
   *
   * @param accessToken - The access token from login response
   * @param expiresIn - Seconds until token expires
   */
  setTokens(accessToken: string, expiresIn?: number): void {
    this.state.accessToken = accessToken
    this.state.expiresAt = expiresIn
      ? Date.now() + expiresIn * 1000
      : Date.now() + 15 * 60 * 1000  // Default 15 min

    console.log('[TOKEN_MANAGER] Tokens set', {
      expiresIn: expiresIn ? `${expiresIn}s` : 'default 15min',
      expiresAt: new Date(this.state.expiresAt).toISOString(),
    })

    authEvents.onAuthStateChange.emit({ isAuthenticated: true })
  }

  /**
   * Get current access token without refresh
   * Use getValidAccessToken() for most cases
   */
  getAccessToken(): string | null {
    return this.state.accessToken
  }

  /**
   * Check if user appears to be authenticated
   * Note: This only checks memory state - actual auth requires backend verification
   */
  isAuthenticated(): boolean {
    return this.isTokenValid()
  }

  /**
   * Clear token state (memory only)
   * Called internally and on cross-tab logout
   */
  clearState(): void {
    this.state.accessToken = null
    this.state.expiresAt = null
    this.refreshPromise = null
    console.log('[TOKEN_MANAGER] State cleared')
  }

  /**
   * Full logout - clears memory AND calls backend to clear httpOnly cookie
   */
  async logout(): Promise<void> {
    const accessToken = this.state.accessToken

    // Clear local state first
    this.clearState()

    // Call backend to clear httpOnly cookie
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          'Content-Type': 'application/json',
        },
      })
      console.log('[TOKEN_MANAGER] Logout API called successfully')
    } catch (error) {
      // Ignore errors - we've already cleared local state
      console.warn('[TOKEN_MANAGER] Logout API call failed (ignored):', error)
    }

    // Emit events
    authEvents.onTokensCleared.emit({ reason: 'manual_logout' })
    authEvents.onAuthStateChange.emit({ isAuthenticated: false })
  }

  /**
   * Debug info for console
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      hasAccessToken: !!this.state.accessToken,
      expiresAt: this.state.expiresAt
        ? new Date(this.state.expiresAt).toISOString()
        : null,
      isValid: this.isTokenValid(),
      timeUntilExpiry: this.state.expiresAt
        ? `${Math.round((this.state.expiresAt - Date.now()) / 1000)}s`
        : null,
      refreshInProgress: !!this.refreshPromise,
    }
  }
}

// Singleton instance
export const tokenManager = new TokenManager()

// Export class for testing
export { TokenManager }
