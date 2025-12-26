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
 */

import { apiClientNoVersion, handleApiError, storeTokens } from '@/lib/api'
import type { User } from './authService'

const authApi = apiClientNoVersion

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
   * @param provider - OAuth provider
   * @param code - Authorization code from provider
   * @param state - State parameter for CSRF protection
   */
  handleCallback: async (
    provider: OAuthProvider,
    code: string,
    state?: string
  ): Promise<{ user: User; isNewUser: boolean }> => {
    try {
      const response = await authApi.post<OAuthCallbackResponse>(
        '/auth/sso/callback',
        {
          provider,
          code,
          state,
        }
      )

      if (response.data.error || !response.data.user) {
        throw new Error(
          response.data.message || 'فشل المصادقة عبر المزود الخارجي'
        )
      }

      // Store tokens if provided
      if (response.data.accessToken && response.data.refreshToken) {
        storeTokens(response.data.accessToken, response.data.refreshToken)
      }

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user))

      return {
        user: response.data.user,
        isNewUser: response.data.isNewUser || false,
      }
    } catch (error: any) {
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
