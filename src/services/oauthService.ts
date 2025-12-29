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
 */
interface OAuthAuthorizeResponse {
  authUrl: string
  pkceEnabled?: boolean
  state?: string
}

/**
 * OAuth Callback Response
 */
interface OAuthCallbackResponse {
  error: boolean
  message: string
  user?: User
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
   * Redirects user to provider's login page
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
      const response = await authApi.get<OAuthAuthorizeResponse>(
        `/auth/sso/${provider}/authorize`,
        {
          params: {
            returnUrl,
            use_pkce: usePKCE,
          },
        }
      )

      return response.data
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
    const { authUrl } = await oauthService.getAuthorizationUrl(
      provider,
      returnUrl,
      false
    )
    window.location.href = authUrl
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
      // 🚨 BACKEND_TODO: CRITICAL CHECK - Backend must return tokens!
      // =========================================================================
      // If this error appears, the backend /auth/sso/callback endpoint is NOT
      // returning accessToken and refreshToken. This is a BACKEND BUG.
      //
      // BACKEND FIX REQUIRED:
      // In the SSO callback controller, add to the response:
      //
      // res.json({
      //   error: false,
      //   message: 'Login successful',
      //   user: userData,
      //   accessToken: jwt.sign({ userId, email, role, firmId }, ACCESS_SECRET, { expiresIn: '15m' }),
      //   refreshToken: jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' }),
      //   isNewUser: isNewUser
      // });
      //
      // See: src/config/BACKEND_AUTH_ISSUES.ts for full documentation
      // =========================================================================
      if (!response.data.accessToken || !response.data.refreshToken) {
        console.error('🚨🚨🚨 BACKEND DID NOT RETURN TOKENS! 🚨🚨🚨')
        console.error('[OAUTH] ❌ CRITICAL: Backend SSO callback returned user but NO TOKENS!')
        console.error('[OAUTH] This is a BACKEND BUG - the /auth/sso/callback endpoint must return accessToken and refreshToken')
        console.error('[OAUTH] Full response data:', JSON.stringify(response.data, null, 2))
        console.error('[OAUTH] Expected response shape: { user: {...}, accessToken: "...", refreshToken: "...", isNewUser: boolean }')
        console.error('[OAUTH] Actual response keys:', Object.keys(response.data))
        console.error('[OAUTH] 📋 See src/config/BACKEND_AUTH_ISSUES.ts for fix instructions')

        // Check if tokens might be in a nested structure (common backend mistake)
        const possibleTokenLocations = {
          'response.data.accessToken': response.data.accessToken,
          'response.data.refreshToken': response.data.refreshToken,
          'response.data.token': (response.data as any).token,
          'response.data.tokens': (response.data as any).tokens,
          'response.data.data?.accessToken': (response.data as any).data?.accessToken,
          'response.data.data?.token': (response.data as any).data?.token,
          'response.data.auth?.accessToken': (response.data as any).auth?.accessToken,
        }
        console.error('[OAUTH] Checking alternate token locations:', possibleTokenLocations)
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

      // Try to extract tokens - check multiple possible locations
      let accessToken = response.data.accessToken
      let refreshToken = response.data.refreshToken

      // Check alternate locations if not found at root level
      if (!accessToken || !refreshToken) {
        const data = response.data as any
        // Try nested structures
        accessToken = accessToken || data.token || data.tokens?.accessToken || data.data?.accessToken || data.auth?.accessToken
        refreshToken = refreshToken || data.tokens?.refreshToken || data.data?.refreshToken || data.auth?.refreshToken

        if (accessToken || refreshToken) {
          oauthWarn('Found tokens in alternate location!', {
            accessTokenLocation: accessToken ? 'found' : 'missing',
            refreshTokenLocation: refreshToken ? 'found' : 'missing',
          })
        }
      }

      // Store tokens if provided
      if (accessToken && refreshToken) {
        oauthLog('Storing tokens from callback response...')
        logTokenDetails('  New accessToken', accessToken)
        logTokenDetails('  New refreshToken', refreshToken)

        storeTokens(accessToken, refreshToken)

        // Verify tokens were stored correctly
        const storedAccess = getAccessToken()
        const storedRefresh = getRefreshToken()
        oauthLog('Token storage verification:', {
          accessTokenStored: storedAccess === accessToken,
          refreshTokenStored: storedRefresh === refreshToken,
          accessTokenInLocalStorage: !!localStorage.getItem('accessToken'),
          refreshTokenInLocalStorage: !!localStorage.getItem('refreshToken'),
        })
      } else {
        // =========================================================================
        // 🚨 BACKEND_TODO: This is where the SSO flow breaks!
        // =========================================================================
        // The backend /auth/sso/callback endpoint did NOT return tokens.
        // The user will appear logged in but ALL API calls will fail with 401.
        //
        // SYMPTOMS:
        // - User sees dashboard briefly then gets redirected to login
        // - Console shows "401 Unauthorized" on subsequent requests
        // - User data in localStorage but no tokens
        //
        // BACKEND FIX: Return tokens in /auth/sso/callback response
        // See: src/config/BACKEND_AUTH_ISSUES.ts for full fix instructions
        // =========================================================================
        console.error('🚨 NO TOKENS TO STORE - User will NOT be authenticated!')
        console.error('[OAUTH] Without tokens, subsequent API calls will fail with 401')
        console.error('[OAUTH] The user appears logged in but actually is not authenticated')
        console.error('[OAUTH] 📋 BACKEND FIX REQUIRED: Return accessToken & refreshToken from /auth/sso/callback')
        console.error('[OAUTH] 📋 See src/config/BACKEND_AUTH_ISSUES.ts for complete fix instructions')
        oauthWarn('No tokens in callback response!', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          responseKeys: Object.keys(response.data),
        })
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
   */
  getLinkedProviders: async (): Promise<OAuthProvider[]> => {
    try {
      const response = await authApi.get<{
        providers: OAuthProvider[]
      }>('/auth/sso/linked')

      return response.data.providers
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
