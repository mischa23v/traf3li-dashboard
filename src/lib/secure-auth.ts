/**
 * Secure Authentication Token Management
 *
 * SECURITY OVERVIEW:
 * =================
 * This module provides secure token handling with support for both:
 * 1. httpOnly cookies (RECOMMENDED - requires backend support)
 * 2. Memory-only storage (fallback - tokens lost on refresh)
 *
 * WHY NOT localStorage?
 * - localStorage is accessible via JavaScript (XSS vulnerability)
 * - Any XSS attack can steal all tokens
 * - Refresh tokens in localStorage = complete account takeover
 *
 * RECOMMENDED ARCHITECTURE:
 * - Access token: Short-lived (15min), stored in memory only
 * - Refresh token: Long-lived, stored in httpOnly cookie (set by backend)
 * - CSRF token: Stored in httpOnly cookie, validated on requests
 *
 * BACKEND REQUIREMENTS: See bottom of file
 */

// ==================== TYPES ====================

export interface TokenPair {
  accessToken: string
  refreshToken?: string // Optional - may be in httpOnly cookie
  expiresIn?: number // Seconds until access token expires
  tokenType?: string // Usually "Bearer"
}

export interface SecureAuthConfig {
  /**
   * Use httpOnly cookies for refresh token (requires backend support)
   * When true, refresh token is never exposed to JavaScript
   */
  useHttpOnlyCookies: boolean

  /**
   * API endpoint for token refresh
   */
  refreshEndpoint: string

  /**
   * Buffer time (ms) before expiry to trigger refresh
   * Default: 60000 (1 minute)
   */
  refreshBuffer: number

  /**
   * Maximum retries for token refresh
   */
  maxRefreshRetries: number

  /**
   * Callback when auth fails completely (redirect to login)
   */
  onAuthFailure: () => void

  /**
   * Callback when tokens are refreshed successfully
   */
  onTokenRefresh?: (tokens: TokenPair) => void
}

// ==================== IN-MEMORY TOKEN STORE ====================

/**
 * SECURITY: Tokens stored in memory only
 * - Not accessible via XSS attacks on localStorage
 * - Lost on page refresh (acceptable for access tokens)
 * - Refresh flow uses httpOnly cookie (not JS accessible)
 */
class SecureTokenStore {
  private accessToken: string | null = null
  private accessTokenExpiry: number | null = null
  private refreshPromise: Promise<TokenPair | null> | null = null
  private config: SecureAuthConfig

  constructor(config: SecureAuthConfig) {
    this.config = config
  }

  /**
   * Store access token in memory (NOT localStorage)
   */
  setAccessToken(token: string, expiresIn?: number): void {
    this.accessToken = token

    if (expiresIn) {
      // Calculate expiry timestamp
      this.accessTokenExpiry = Date.now() + expiresIn * 1000
    }
  }

  /**
   * Get access token if valid
   */
  getAccessToken(): string | null {
    if (!this.accessToken) {
      return null
    }

    // Check if expired
    if (this.accessTokenExpiry && Date.now() >= this.accessTokenExpiry) {
      this.accessToken = null
      this.accessTokenExpiry = null
      return null
    }

    return this.accessToken
  }

  /**
   * Check if access token will expire soon
   */
  isTokenExpiringSoon(): boolean {
    if (!this.accessTokenExpiry) {
      return false
    }

    const timeUntilExpiry = this.accessTokenExpiry - Date.now()
    return timeUntilExpiry <= this.config.refreshBuffer
  }

  /**
   * Check if we have a valid token
   */
  hasValidToken(): boolean {
    return this.getAccessToken() !== null
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    this.accessToken = null
    this.accessTokenExpiry = null
    this.refreshPromise = null
  }

  /**
   * Refresh token using httpOnly cookie
   * Returns the same promise if refresh is already in progress (deduplication)
   */
  async refreshToken(): Promise<TokenPair | null> {
    // Return existing promise if refresh already in progress
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<TokenPair | null> {
    let retries = 0

    while (retries < this.config.maxRefreshRetries) {
      try {
        const response = await fetch(this.config.refreshEndpoint, {
          method: 'POST',
          credentials: 'include', // IMPORTANT: Send httpOnly cookies
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // Refresh token invalid - auth failure
            this.config.onAuthFailure()
            return null
          }
          throw new Error(`Refresh failed: ${response.status}`)
        }

        const tokens: TokenPair = await response.json()

        // Store new access token
        this.setAccessToken(tokens.accessToken, tokens.expiresIn)

        // Notify callback
        this.config.onTokenRefresh?.(tokens)

        return tokens
      } catch (error) {
        retries++

        if (retries >= this.config.maxRefreshRetries) {
          console.error('[SecureAuth] Token refresh failed after max retries:', error)
          this.config.onAuthFailure()
          return null
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000))
      }
    }

    return null
  }
}

// ==================== SINGLETON INSTANCE ====================

let tokenStore: SecureTokenStore | null = null

/**
 * Initialize secure auth with configuration
 * Call this early in your app initialization
 */
export function initSecureAuth(config: Partial<SecureAuthConfig> & Pick<SecureAuthConfig, 'onAuthFailure'>): void {
  const fullConfig: SecureAuthConfig = {
    useHttpOnlyCookies: true,
    refreshEndpoint: '/api/auth/refresh',
    refreshBuffer: 60000, // 1 minute before expiry
    maxRefreshRetries: 3,
    ...config,
  }

  tokenStore = new SecureTokenStore(fullConfig)
}

/**
 * Get the token store instance
 */
function getStore(): SecureTokenStore {
  if (!tokenStore) {
    throw new Error(
      '[SecureAuth] Not initialized. Call initSecureAuth() before using secure auth functions.'
    )
  }
  return tokenStore
}

// ==================== PUBLIC API ====================

/**
 * Store tokens after successful login
 */
export function setTokens(tokens: TokenPair): void {
  const store = getStore()
  store.setAccessToken(tokens.accessToken, tokens.expiresIn)
}

/**
 * Get current access token (for API requests)
 */
export function getAccessToken(): string | null {
  try {
    return getStore().getAccessToken()
  } catch {
    return null
  }
}

/**
 * Check if user has valid authentication
 */
export function isAuthenticated(): boolean {
  try {
    return getStore().hasValidToken()
  } catch {
    return false
  }
}

/**
 * Refresh token proactively or when expired
 */
export async function refreshToken(): Promise<TokenPair | null> {
  return getStore().refreshToken()
}

/**
 * Check if token needs refresh soon
 */
export function needsRefresh(): boolean {
  try {
    return getStore().isTokenExpiringSoon()
  } catch {
    return false
  }
}

/**
 * Clear all auth state (logout)
 */
export function clearAuth(): void {
  try {
    getStore().clearTokens()
  } catch {
    // Store not initialized, nothing to clear
  }
}

/**
 * Get Authorization header value
 */
export function getAuthHeader(): string | null {
  const token = getAccessToken()
  return token ? `Bearer ${token}` : null
}

/**
 * Middleware to attach auth header to fetch requests
 */
export function withAuth(options: RequestInit = {}): RequestInit {
  const authHeader = getAuthHeader()

  if (!authHeader) {
    return options
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      Authorization: authHeader,
    },
  }
}

/**
 * Create an authenticated fetch function
 * Automatically handles token refresh and retries
 */
export function createAuthenticatedFetch() {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    // Check if token needs refresh
    if (needsRefresh()) {
      await refreshToken()
    }

    // Make request with auth header
    const response = await fetch(url, withAuth({
      ...options,
      credentials: 'include', // Always include cookies
    }))

    // If unauthorized, try refreshing once
    if (response.status === 401) {
      const refreshed = await refreshToken()

      if (refreshed) {
        // Retry with new token
        return fetch(url, withAuth({
          ...options,
          credentials: 'include',
        }))
      }
    }

    return response
  }
}

// ==================== EXPORTS ====================

export default {
  init: initSecureAuth,
  setTokens,
  getAccessToken,
  getAuthHeader,
  isAuthenticated,
  refreshToken,
  needsRefresh,
  clearAuth,
  withAuth,
  createAuthenticatedFetch,
}

/**
 * ===========================================================
 * BACKEND REQUIREMENTS FOR HTTPONLY COOKIE IMPLEMENTATION
 * ===========================================================
 *
 * 1. LOGIN ENDPOINT (POST /api/auth/login)
 *    Response should:
 *    - Return access token in JSON body
 *    - Set refresh token in httpOnly cookie:
 *
 *    Set-Cookie: refresh_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/auth
 *
 * 2. REFRESH ENDPOINT (POST /api/auth/refresh)
 *    - Read refresh token from httpOnly cookie
 *    - Validate refresh token
 *    - Return new access token in JSON body
 *    - Optionally rotate refresh token (set new cookie)
 *
 * 3. LOGOUT ENDPOINT (POST /api/auth/logout)
 *    - Clear refresh token cookie:
 *
 *    Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/api/auth; Max-Age=0
 *
 * 4. COOKIE SETTINGS:
 *    - HttpOnly: true (prevents JS access)
 *    - Secure: true (HTTPS only in production)
 *    - SameSite: Strict or Lax (prevents CSRF)
 *    - Path: /api/auth (limits cookie scope)
 *    - Max-Age: 7 days (or your refresh token lifetime)
 *
 * 5. CSRF PROTECTION:
 *    - Use SameSite cookies (Strict recommended)
 *    - Or implement CSRF token validation
 *
 * ===========================================================
 */
