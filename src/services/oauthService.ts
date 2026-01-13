/**
 * OAuth Service
 * Handles social login (OAuth) authentication flows
 *
 * Supports:
 * - Google
 * - Facebook
 * - Apple
 * - Twitter
 * - LinkedIn
 * - GitHub
 * - Microsoft
 *
 * ============================================================================
 * 🚨 BACKEND_TODO: SSO CALLBACK TOKEN ISSUE
 * ============================================================================
 * The POST /api/auth/sso/callback endpoint MUST return tokens in the response.
 *
 * REQUIRED response format:
 * {
 *   "error": false,
 *   "message": "Success",
 *   "user": { "_id": "...", "email": "...", "role": "...", ... },
 *   "accessToken": "eyJhbG...",    // ← REQUIRED at root level
 *   "refreshToken": "eyJhbG...",   // ← REQUIRED at root level
 *   "isNewUser": false
 * }
 *
 * See: src/config/BACKEND_AUTH_ISSUES.ts for full documentation
 * ============================================================================
 */

import { apiClientNoVersion, handleApiError, storeTokens, refreshCsrfToken, getAccessToken, getRefreshToken } from '@/lib/api'
import type { User } from './authService'

const authApi = apiClientNoVersion

// ==================== SSO/OAUTH DEBUG LOGGING ====================
// Always enabled to help diagnose token/auth issues on production
const oauthLog = (message: string, data?: any) => {
  console.log(`[OAUTH] ${message}`, data !== undefined ? data : '')
}
const oauthWarn = (message: string, data?: any) => {
  console.warn(`[OAUTH] ⚠️ ${message}`, data !== undefined ? data : '')
}
const oauthError = (message: string, error?: any) => {
  console.error(`[OAUTH] ❌ ${message}`, error || '')
}

/**
 * Decode JWT to see its contents (without verifying signature)
 * This is safe for debugging - verification happens on backend
 */
const decodeJWT = (token: string): { header: any; payload: any; valid: boolean } => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return { header: null, payload: null, valid: false }
    }
    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))
    return { header, payload, valid: true }
  } catch {
    return { header: null, payload: null, valid: false }
  }
}

/**
 * Log token details for debugging
 */
const logTokenDetails = (label: string, token: string | null) => {
  if (!token) {
    oauthWarn(`${label}: NO TOKEN`)
    return
  }

  const decoded = decodeJWT(token)
  if (!decoded.valid) {
    oauthWarn(`${label}: INVALID JWT FORMAT`, { token: token.substring(0, 50) + '...' })
    return
  }

  const now = Math.floor(Date.now() / 1000)
  const exp = decoded.payload.exp
  const iat = decoded.payload.iat
  const isExpired = exp && exp < now

  oauthLog(`${label}:`, {
    tokenPreview: token.substring(0, 30) + '...' + token.substring(token.length - 10),
    algorithm: decoded.header.alg,
    type: decoded.header.typ,
    userId: decoded.payload.userId || decoded.payload.sub || decoded.payload.id,
    email: decoded.payload.email,
    role: decoded.payload.role,
    firmId: decoded.payload.firmId,
    issuedAt: iat ? new Date(iat * 1000).toISOString() : 'N/A',
    expiresAt: exp ? new Date(exp * 1000).toISOString() : 'N/A',
    isExpired,
    expiresIn: exp ? `${Math.round((exp - now) / 60)} minutes` : 'N/A',
  })
}

/**
 * OAuth Provider Types
 */
export type OAuthProvider =
  | 'google'
  | 'facebook'
  | 'apple'
  | 'twitter'
  | 'linkedin'
  | 'github'
  | 'microsoft'

/**
 * OAuth Provider Configuration
 */
export interface OAuthProviderConfig {
  id: OAuthProvider
  name: string
  nameAr: string
  icon: string
  color: string
  available: boolean
}

/**
 * Available OAuth Providers
 */
export const OAUTH_PROVIDERS: OAuthProviderConfig[] = [
  {
    id: 'google',
    name: 'Google',
    nameAr: 'جوجل',
    icon: 'google',
    color: '#4285F4',
    available: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك',
    icon: 'facebook',
    color: '#1877F2',
    available: true,
  },
  {
    id: 'apple',
    name: 'Apple',
    nameAr: 'آبل',
    icon: 'apple',
    color: '#000000',
    available: true,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    nameAr: 'تويتر',
    icon: 'twitter',
    color: '#1DA1F2',
    available: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    nameAr: 'لينكد إن',
    icon: 'linkedin',
    color: '#0A66C2',
    available: true,
  },
  {
    id: 'github',
    name: 'GitHub',
    nameAr: 'جيت هاب',
    icon: 'github',
    color: '#333333',
    available: true,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    nameAr: 'مايكروسوفت',
    icon: 'microsoft',
    color: '#00A4EF',
    available: true,
  },
]

/**
 * OAuth Authorization Response
 * Backend returns 'authorizationUrl' per documentation
 */
interface OAuthAuthorizeResponse {
  authorizationUrl: string
  authUrl?: string  // Legacy support
  pkceEnabled?: boolean
  state?: string
}

/**
 * OAuth Callback Response
 * Supports both OAuth 2.0 standard fields (snake_case) and backwards-compatible fields (camelCase)
 */
interface OAuthCallbackResponse {
  error: boolean
  message: string
  user?: User

  // OAuth 2.0 Standard (snake_case) - recommended for new code
  access_token?: string
  refresh_token?: string
  token_type?: 'Bearer'
  expires_in?: number  // seconds until access token expires

  // Backwards compatibility (camelCase) - existing code continues to work
  accessToken?: string
  refreshToken?: string

  csrfToken?: string
  isNewUser?: boolean
}

/**
 * OAuth Service Object
 */
const oauthService = {
  /**
   * Get OAuth authorization URL
   * Initiates OAuth flow and returns authorization URL
   * POST /api/auth/sso/initiate
   *
   * @param provider - OAuth provider (google, facebook, etc.)
   * @param returnUrl - URL to redirect after auth (default: /dashboard)
   * @param usePKCE - Enable PKCE for mobile apps (default: false)
   */
  getAuthorizationUrl: async (
    provider: OAuthProvider,
    returnUrl: string = '/dashboard',
    usePKCE: boolean = false
  ): Promise<OAuthAuthorizeResponse> => {
    try {
      const response = await authApi.post<OAuthAuthorizeResponse>(
        '/auth/sso/initiate',
        {
          provider,
          returnUrl,
          use_pkce: usePKCE,
        }
      )

      // Backend returns 'authorizationUrl', normalize to include legacy 'authUrl'
      return {
        ...response.data,
        authUrl: response.data.authorizationUrl || response.data.authUrl,
      }
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Start OAuth flow for web
   * Redirects browser to provider's login page
   *
   * @param provider - OAuth provider
   * @param returnUrl - URL to redirect after auth
   */
  startWebFlow: async (
    provider: OAuthProvider,
    returnUrl: string = '/dashboard'
  ): Promise<void> => {
    const response = await oauthService.getAuthorizationUrl(
      provider,
      returnUrl,
      false
    )
    // Use authorizationUrl (primary) or authUrl (legacy fallback)
    const redirectUrl = response.authorizationUrl || response.authUrl
    if (!redirectUrl) {
      throw new Error('No authorization URL returned from backend')
    }
    window.location.href = redirectUrl
  },

  /**
   * Start OAuth flow for mobile apps with PKCE
   * Returns authorization URL for in-app browser
   *
   * @param provider - OAuth provider
   * @param returnUrl - Deep link URL (e.g., myapp://auth/callback)
   */
  startMobileFlow: async (
    provider: OAuthProvider,
    returnUrl: string
  ): Promise<OAuthAuthorizeResponse> => {
    return oauthService.getAuthorizationUrl(provider, returnUrl, true)
  },

  /**
   * Handle OAuth callback
   * Called after provider redirects back to our app
   * Backend handles the actual token exchange
   *
   * =========================================================================
   * 🚨 BACKEND_TODO: This endpoint MUST return accessToken and refreshToken!
   * =========================================================================
   * Currently the backend may NOT be returning tokens in the response.
   * This causes users to appear logged in but fail on all API calls.
   *
   * REQUIRED backend response:
   * {
   *   error: false,
   *   user: { _id, email, role, mfaEnabled, firmId, ... },
   *   accessToken: "jwt_token_here",    // ← CRITICAL: Must be at root level
   *   refreshToken: "jwt_token_here",   // ← CRITICAL: Must be at root level
   *   isNewUser: boolean
   * }
   *
   * See: src/config/BACKEND_AUTH_ISSUES.ts for full documentation
   * =========================================================================
   *
   * @param provider - OAuth provider
   * @param code - Authorization code from provider
   * @param state - State parameter for CSRF protection
   */
  handleCallback: async (
    provider: OAuthProvider,
    code: string,
    state?: string
  ): Promise<{ user: User; isNewUser: boolean }> => {
    oauthLog('=== OAUTH CALLBACK START ===')
    oauthLog('Callback params:', {
      provider,
      codeLength: code?.length,
      codePreview: code ? code.substring(0, 20) + '...' : 'NO CODE',
      state: state || 'NO STATE',
    })

    // Log current token state BEFORE callback
    oauthLog('Token state BEFORE callback:')
    logTokenDetails('  Current accessToken', getAccessToken())
    logTokenDetails('  Current refreshToken', getRefreshToken())

    try {
      oauthLog('Calling POST /auth/sso/callback...')
      const response = await authApi.post<OAuthCallbackResponse>(
        '/auth/sso/callback',
        {
          provider,
          code,
          state,
        }
      )

      oauthLog('Callback response received:', {
        hasError: response.data.error,
        hasUser: !!response.data.user,
        hasAccessToken: !!response.data.accessToken,
        hasRefreshToken: !!response.data.refreshToken,
        hasCsrfToken: !!response.data.csrfToken,
        isNewUser: response.data.isNewUser,
        message: response.data.message,
        userEmail: response.data.user?.email,
        userId: response.data.user?._id,
      })

      // =========================================================================
      // Check for tokens/session info in response
      // =========================================================================
      // Supports two patterns:
      // 1. BFF Pattern: No tokens in body, only expires_in. Tokens in httpOnly cookies.
      // 2. Legacy Pattern: Tokens in response body (OAuth 2.0 or camelCase format)
      // =========================================================================
      const hasOAuth2Tokens = response.data.access_token && response.data.refresh_token
      const hasLegacyTokens = response.data.accessToken && response.data.refreshToken
      const hasExpiresInOnly = !hasOAuth2Tokens && !hasLegacyTokens && ((response.data as any).expires_in !== undefined || (response.data as any).expiresIn !== undefined)

      // BFF pattern: No tokens but has expiresIn - this is valid!
      if (hasExpiresInOnly) {
        oauthLog('BFF Pattern detected: tokens in httpOnly cookies, expiresIn in response')
      } else if (!hasOAuth2Tokens && !hasLegacyTokens) {
        // No tokens AND no expiresIn - might still be BFF pattern without expiresIn
        // Only warn (not error) since BFF with httpOnly cookies may not send any token info
        oauthWarn('No tokens or expiresIn in response - may be BFF pattern with httpOnly cookies only')
        oauthLog('Response keys:', Object.keys(response.data))
      }

      if (response.data.error || !response.data.user) {
        oauthError('Callback returned error or no user:', {
          error: response.data.error,
          message: response.data.message,
        })
        throw new Error(
          response.data.message || 'فشل المصادقة عبر المزود الخارجي'
        )
      }

      // Try to extract tokens - supports both OAuth 2.0 (snake_case) and backwards-compatible (camelCase)
      // OAuth 2.0 format takes precedence
      // Note: refreshToken may be in httpOnly cookie (more secure) rather than response body
      let accessToken = response.data.access_token || response.data.accessToken
      let refreshToken = response.data.refresh_token || response.data.refreshToken
      const expiresIn = response.data.expires_in || (response.data as any).expiresIn // seconds until access token expires

      // Check alternate locations if accessToken not found at root level
      if (!accessToken) {
        const data = response.data as any
        // Try nested structures (common backend variations)
        accessToken = data.token || data.tokens?.access_token || data.tokens?.accessToken || data.data?.access_token || data.data?.accessToken || data.auth?.access_token || data.auth?.accessToken
        refreshToken = refreshToken || data.tokens?.refresh_token || data.tokens?.refreshToken || data.data?.refresh_token || data.data?.refreshToken || data.auth?.refresh_token || data.auth?.refreshToken

        if (accessToken) {
          oauthLog('Found accessToken in alternate location')
        }
      }

      // Store tokens/session - supports both patterns:
      // 1. BFF Pattern: Tokens in httpOnly cookies, only expiresIn in response
      // 2. Legacy Pattern: Tokens in response body (OAuth 2.0 or camelCase)
      const isBffPattern = !accessToken && expiresIn !== undefined
      const isLegacyPattern = !!accessToken

      if (isBffPattern) {
        // BFF Pattern: Tokens in httpOnly cookies, only track expiresIn
        oauthLog('Storing session from callback (BFF pattern)...', {
          expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
          tokensIn: 'httpOnly cookies',
        })
        storeTokens(null, null, expiresIn)
        oauthLog('BFF session stored successfully')
      } else if (isLegacyPattern) {
        // Legacy Pattern: Tokens in response body
        oauthLog('Storing tokens from callback response (Legacy pattern)...', {
          hasExpiresIn: !!expiresIn,
          expiresIn: expiresIn ? `${expiresIn}s (${Math.round(expiresIn / 60)}min)` : 'N/A',
          refreshTokenIn: refreshToken ? 'response body' : 'httpOnly cookie',
          tokenFormat: response.data.access_token ? 'OAuth 2.0 (snake_case)' : 'Legacy (camelCase)',
        })
        logTokenDetails('  New accessToken', accessToken)
        if (refreshToken) {
          logTokenDetails('  New refreshToken', refreshToken)
        }

        storeTokens(accessToken, refreshToken, expiresIn)

        // Verify accessToken was stored correctly
        const storedAccess = getAccessToken()
        oauthLog('Token storage verification:', {
          accessTokenStored: storedAccess === accessToken,
          accessTokenInLocalStorage: !!localStorage.getItem('accessToken'),
          refreshTokenInLocalStorage: !!localStorage.getItem('refreshToken'),
          refreshTokenStrategy: refreshToken ? 'localStorage' : 'httpOnly cookie',
        })
      } else {
        // No tokens and no expiresIn - BFF pattern may not provide expiresIn either
        // Check if we have user data, which indicates successful auth via httpOnly cookies
        if (response.data.user) {
          oauthLog('No tokens/expiresIn in response, but user present - assuming BFF with httpOnly cookies')
          // Store minimal session state (default 15 min expiry)
          storeTokens(null, null, 900)
        } else {
          // This is an actual error - no tokens AND no user
          console.error('🚨 NO accessToken AND NO expiresIn RETURNED - User will NOT be authenticated!')
          console.error('[OAUTH] Without tokens or session info, subsequent API calls will fail')
          oauthWarn('No tokens or session info in callback response!', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasExpiresIn: expiresIn !== undefined,
            responseKeys: Object.keys(response.data),
          })
        }
      }

      // Store user in localStorage
      oauthLog('Storing user in localStorage:', {
        userId: response.data.user._id,
        email: response.data.user.email,
        role: response.data.user.role,
      })
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Initialize CSRF token after successful OAuth authentication
      // This ensures we have a valid token for subsequent API calls
      oauthLog('Refreshing CSRF token...')
      refreshCsrfToken().catch((err) => {
        oauthWarn('CSRF token initialization after OAuth failed:', err)
      })

      oauthLog('=== OAUTH CALLBACK SUCCESS ===')

      return {
        user: response.data.user,
        isNewUser: response.data.isNewUser || false,
      }
    } catch (error: any) {
      oauthError('Callback failed:', {
        message: error?.message,
        status: error?.status || error?.response?.status,
        code: error?.code,
        data: error?.response?.data,
      })
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get current auth status after OAuth redirect
   * Use this to check if user is authenticated after OAuth flow
   */
  checkAuthStatus: async (): Promise<User | null> => {
    try {
      const response = await authApi.get<{
        error: boolean
        user?: User
        csrfToken?: string
      }>('/auth/me')

      if (response.data.error || !response.data.user) {
        return null
      }

      return response.data.user
    } catch {
      return null
    }
  },

  /**
   * Link OAuth provider to existing account
   *
   * @param provider - OAuth provider to link
   * @param returnUrl - URL to redirect after linking
   */
  linkProvider: async (
    provider: OAuthProvider,
    returnUrl: string = '/settings/security'
  ): Promise<void> => {
    try {
      const response = await authApi.post<{ authUrl: string }>(
        '/auth/sso/link',
        {
          provider,
          returnUrl,
        }
      )

      window.location.href = response.data.authUrl
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Unlink OAuth provider from account
   *
   * @param provider - OAuth provider to unlink
   */
  unlinkProvider: async (provider: OAuthProvider): Promise<void> => {
    try {
      await authApi.delete(`/auth/sso/unlink/${provider}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get linked OAuth providers for current user
   * GET /api/auth/sso/linked
   * Backend returns links array with provider details
   */
  getLinkedProviders: async (): Promise<OAuthProvider[]> => {
    try {
      const response = await authApi.get<{
        error?: boolean
        message?: string
        // Backend format
        links?: Array<{
          providerType: OAuthProvider
          externalEmail?: string
          lastLoginAt?: string
          isActive?: boolean
        }>
        // Legacy format
        providers?: OAuthProvider[]
      }>('/auth/sso/linked')

      // Handle backend format (links array)
      if (response.data.links) {
        return response.data.links.map((link) => link.providerType)
      }

      // Fallback to legacy format
      return response.data.providers || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get linked OAuth providers with details
   * Returns full link information including email and last login
   */
  getLinkedProvidersWithDetails: async (): Promise<Array<{
    providerType: OAuthProvider
    externalEmail?: string
    lastLoginAt?: string
    isActive?: boolean
  }>> => {
    try {
      const response = await authApi.get<{
        error?: boolean
        message?: string
        links?: Array<{
          providerType: OAuthProvider
          externalEmail?: string
          lastLoginAt?: string
          isActive?: boolean
        }>
      }>('/auth/sso/linked')

      return response.data.links || []
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get available OAuth providers
   * Returns only providers that are enabled on the backend
   */
  getAvailableProviders: async (): Promise<OAuthProviderConfig[]> => {
    try {
      const response = await authApi.get<{
        providers: OAuthProvider[]
      }>('/auth/sso/providers')

      const providers = response.data.providers || response.data
      if (Array.isArray(providers)) {
        return OAUTH_PROVIDERS.filter((p) =>
          providers.includes(p.id) || providers.some((pr: any) => pr.id === p.id || pr.provider === p.id)
        )
      }
      return OAUTH_PROVIDERS
    } catch {
      // Fallback to all providers if endpoint doesn't exist
      return OAUTH_PROVIDERS
    }
  },
}

export default oauthService
