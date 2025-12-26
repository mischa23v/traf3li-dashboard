/**
 * SSO Service
 * Handles all OAuth 2.0 SSO-related API calls
 *
 * @description
 * This service provides functions for managing Single Sign-On (SSO) authentication
 * using OAuth 2.0 protocol with multiple providers (Google, Microsoft, Custom).
 *
 * ## OAuth 2.0 Flow
 *
 * 1. **Initiation**: Client calls `initiateSSOLogin(provider)`
 *    → Backend returns authorization URL with state parameter
 *
 * 2. **Authorization**: User is redirected to provider's OAuth consent screen
 *
 * 3. **Callback**: Provider redirects back with authorization code
 *    → Backend handles the callback at `/auth/sso/:provider/callback`
 *    → Backend exchanges code for access token
 *    → Backend validates user and creates/updates account
 *    → Backend returns JWT token to client
 *
 * 4. **Authentication**: Client stores JWT and uses it for subsequent requests
 *
 * ## Implemented Endpoints
 *
 * ### SSO Settings Management
 * - GET    /settings/sso                        - Get SSO configuration
 * - PATCH  /settings/sso                        - Update global SSO settings
 * - GET    /settings/sso/providers/available    - List available providers
 * - GET    /settings/sso/providers/:id          - Get specific provider config
 * - POST   /settings/sso/providers              - Create provider config
 * - PATCH  /settings/sso/providers/:id          - Update provider config
 * - DELETE /settings/sso/providers/:id          - Delete provider config
 * - POST   /settings/sso/test-connection        - Test provider connection
 *
 * ### SSO Authentication
 * - GET    /auth/sso/:provider/authorize        - Start OAuth flow (get authorization URL)
 * - GET    /auth/sso/providers                  - Get enabled providers for login
 * - GET    /auth/sso/:provider/callback         - OAuth callback (handled by backend)
 *
 * ## NOT Implemented
 *
 * The following account linking features are NOT currently implemented:
 * - POST   /auth/sso/link                       - Link SSO account to existing user
 * - DELETE /auth/sso/unlink/:provider          - Unlink SSO account from user
 * - GET    /auth/sso/linked                    - List user's linked SSO accounts
 *
 * These features would allow users to:
 * - Link multiple SSO providers to a single account
 * - Unlink SSO providers while maintaining other login methods
 * - View all linked authentication methods
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * Supported SSO providers
 */
export type SSOProvider = 'google' | 'microsoft' | 'custom'

/**
 * SSO Provider Status
 */
export type SSOProviderStatus = 'active' | 'inactive' | 'error'

/**
 * SSO Provider Configuration
 */
export interface SSOProviderConfig {
  _id?: string
  provider: SSOProvider
  enabled: boolean
  status: SSOProviderStatus
  displayName: string
  displayNameAr: string
  logo?: string
  clientId: string
  clientSecret?: string // Masked on GET, required on POST/PUT
  redirectUri: string
  authorizationUrl?: string
  tokenUrl?: string
  scope?: string
  additionalConfig?: Record<string, any>
  createdAt?: string
  updatedAt?: string
  lastTestedAt?: string
  lastTestStatus?: 'success' | 'failed'
  lastTestError?: string
}

/**
 * SSO Configuration Settings
 */
export interface SSOSettings {
  enabled: boolean
  allowPasswordLogin: boolean
  autoProvision: boolean
  defaultRole?: 'client' | 'lawyer' | 'admin'
  providers: SSOProviderConfig[]
}

/**
 * Available SSO Provider Info
 */
export interface AvailableProvider {
  id: SSOProvider
  name: string
  nameAr: string
  logo: string
  description: string
  descriptionAr: string
  defaultScopes: string[]
  requiredFields: string[]
  documentationUrl: string
}

/**
 * SSO Test Connection Request
 */
export interface TestConnectionRequest {
  provider: SSOProvider
  clientId: string
  clientSecret: string
  redirectUri: string
  authorizationUrl?: string
  tokenUrl?: string
  scope?: string
}

/**
 * SSO Test Connection Response
 */
export interface TestConnectionResponse {
  success: boolean
  message: string
  messageAr: string
  details?: any
  error?: string
}

/**
 * SSO Provider Create/Update Request
 */
export interface SaveProviderRequest {
  provider: SSOProvider
  enabled: boolean
  displayName: string
  displayNameAr: string
  clientId: string
  clientSecret: string
  redirectUri: string
  authorizationUrl?: string
  tokenUrl?: string
  scope?: string
  additionalConfig?: Record<string, any>
}

/**
 * SSO Login Initiate Response
 */
export interface SSOLoginInitiateResponse {
  authorizationUrl: string
  state: string
}

/**
 * Get SSO configuration
 *
 * @endpoint GET /settings/sso
 * @returns {Promise<SSOSettings>} Current SSO settings including global config and all providers
 * @throws {Error} API error with message
 *
 * @example
 * const settings = await getSSOSettings()
 * console.log(settings.enabled, settings.providers)
 */
export const getSSOSettings = async (): Promise<SSOSettings> => {
  try {
    const response = await apiClient.get('/settings/sso')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update SSO global settings
 *
 * @endpoint PATCH /settings/sso
 * @param {Partial<SSOSettings>} data - Settings to update (enabled, allowPasswordLogin, autoProvision, defaultRole)
 * @returns {Promise<SSOSettings>} Updated SSO settings
 * @throws {Error} API error with message
 *
 * @example
 * const updated = await updateSSOSettings({
 *   enabled: true,
 *   allowPasswordLogin: false,
 *   autoProvision: true,
 *   defaultRole: 'client'
 * })
 */
export const updateSSOSettings = async (data: Partial<SSOSettings>): Promise<SSOSettings> => {
  try {
    const response = await apiClient.patch('/settings/sso', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get list of available SSO providers
 *
 * @endpoint GET /settings/sso/providers/available
 * @returns {Promise<AvailableProvider[]>} List of all supported SSO providers with metadata
 * @throws {Error} API error with message
 *
 * @description
 * Returns information about all SSO providers that can be configured,
 * including their default scopes, required fields, and documentation URLs.
 *
 * @example
 * const providers = await getAvailableProviders()
 * providers.forEach(p => console.log(p.name, p.defaultScopes))
 */
export const getAvailableProviders = async (): Promise<AvailableProvider[]> => {
  try {
    const response = await apiClient.get('/settings/sso/providers/available')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get a specific SSO provider configuration
 *
 * @endpoint GET /settings/sso/providers/:id
 * @param {string} providerId - The provider ID (MongoDB _id)
 * @returns {Promise<SSOProviderConfig>} Provider configuration (clientSecret is masked)
 * @throws {Error} API error with message
 *
 * @example
 * const provider = await getSSOProvider('507f1f77bcf86cd799439011')
 * console.log(provider.displayName, provider.enabled)
 */
export const getSSOProvider = async (providerId: string): Promise<SSOProviderConfig> => {
  try {
    const response = await apiClient.get(`/settings/sso/providers/${providerId}`)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Create a new SSO provider configuration
 *
 * @endpoint POST /settings/sso/providers
 * @param {SaveProviderRequest} data - Provider configuration (clientSecret required)
 * @returns {Promise<SSOProviderConfig>} Created provider configuration
 * @throws {Error} API error with message
 *
 * @example
 * const provider = await createSSOProvider({
 *   provider: 'google',
 *   enabled: true,
 *   displayName: 'Google',
 *   displayNameAr: 'جوجل',
 *   clientId: 'your-client-id.apps.googleusercontent.com',
 *   clientSecret: 'your-client-secret',
 *   redirectUri: 'https://app.traf3li.com/auth/callback/google',
 *   scope: 'openid profile email'
 * })
 */
export const createSSOProvider = async (data: SaveProviderRequest): Promise<SSOProviderConfig> => {
  try {
    const response = await apiClient.post('/settings/sso/providers', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update an existing SSO provider configuration
 *
 * @endpoint PATCH /settings/sso/providers/:id
 * @param {string} providerId - The provider ID (MongoDB _id)
 * @param {Partial<SaveProviderRequest>} data - Fields to update (clientSecret optional)
 * @returns {Promise<SSOProviderConfig>} Updated provider configuration
 * @throws {Error} API error with message
 *
 * @description
 * Updates provider settings. If clientSecret is not provided, the existing secret is retained.
 *
 * @example
 * const updated = await updateSSOProvider('507f1f77bcf86cd799439011', {
 *   enabled: false,
 *   displayName: 'Google SSO'
 * })
 */
export const updateSSOProvider = async (
  providerId: string,
  data: Partial<SaveProviderRequest>
): Promise<SSOProviderConfig> => {
  try {
    const response = await apiClient.patch(`/settings/sso/providers/${providerId}`, data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Delete an SSO provider configuration
 *
 * @endpoint DELETE /settings/sso/providers/:id
 * @param {string} providerId - The provider ID (MongoDB _id)
 * @returns {Promise<void>} No response body
 * @throws {Error} API error with message
 *
 * @description
 * Permanently removes the SSO provider configuration. Users who previously
 * authenticated with this provider may lose access if no other login method exists.
 *
 * @example
 * await deleteSSOProvider('507f1f77bcf86cd799439011')
 */
export const deleteSSOProvider = async (providerId: string): Promise<void> => {
  try {
    await apiClient.delete(`/settings/sso/providers/${providerId}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Test SSO provider connection
 *
 * @endpoint POST /settings/sso/test-connection
 * @param {TestConnectionRequest} data - Provider credentials to test
 * @returns {Promise<TestConnectionResponse>} Test result with success/failure status
 * @throws {Error} API error with message
 *
 * @description
 * Validates OAuth configuration by attempting to reach the provider's
 * authorization endpoint. Does not perform full authentication flow.
 *
 * @example
 * const result = await testSSOConnection({
 *   provider: 'google',
 *   clientId: 'your-client-id.apps.googleusercontent.com',
 *   clientSecret: 'your-client-secret',
 *   redirectUri: 'https://app.traf3li.com/auth/callback/google',
 *   scope: 'openid profile email'
 * })
 * console.log(result.success, result.message)
 */
export const testSSOConnection = async (data: TestConnectionRequest): Promise<TestConnectionResponse> => {
  try {
    const response = await apiClient.post('/settings/sso/test-connection', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Initiate SSO login flow
 *
 * @endpoint GET /auth/sso/:provider/authorize
 * @param {SSOProvider} provider - The SSO provider to use ('google' | 'microsoft' | 'custom')
 * @returns {Promise<SSOLoginInitiateResponse>} Authorization URL and state parameter
 * @throws {Error} API error with message
 *
 * @description
 * **Step 1 of OAuth flow**: Initiates the OAuth 2.0 authentication flow.
 * The backend generates a state parameter for CSRF protection and returns
 * the provider's authorization URL.
 *
 * Client should redirect user to the returned authorizationUrl.
 * After user consent, provider redirects to `/auth/sso/:provider/callback`
 * which is handled entirely by the backend.
 *
 * @example
 * const { authorizationUrl, state } = await initiateSSOLogin('google')
 * // Store state in sessionStorage for validation
 * sessionStorage.setItem('oauth_state', state)
 * // Redirect user to provider's login page
 * window.location.href = authorizationUrl
 */
export const initiateSSOLogin = async (provider: SSOProvider): Promise<SSOLoginInitiateResponse> => {
  try {
    const response = await apiClient.post('/auth/sso/initiate', { provider })
    return response.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get enabled SSO providers for login page
 *
 * @endpoint GET /auth/sso/providers
 * @returns {Promise<SSOProviderConfig[]>} List of enabled SSO providers (public endpoint)
 * @throws {Error} API error with message
 *
 * @description
 * Returns only enabled SSO providers for displaying login buttons.
 * This is a public endpoint that doesn't require authentication.
 * ClientSecret is masked in the response.
 *
 * @example
 * const providers = await getEnabledSSOProviders()
 * providers.forEach(p => {
 *   console.log(`Login with ${p.displayName}`)
 * })
 */
export const getEnabledSSOProviders = async (): Promise<SSOProviderConfig[]> => {
  try {
    const response = await apiClient.get('/auth/sso/providers')
    return response.data.data || response.data.providers || []
  } catch (error) {
    throw handleApiError(error)
  }
}

const ssoService = {
  getSSOSettings,
  updateSSOSettings,
  getAvailableProviders,
  getSSOProvider,
  createSSOProvider,
  updateSSOProvider,
  deleteSSOProvider,
  testSSOConnection,
  initiateSSOLogin,
  getEnabledSSOProviders,
}

export default ssoService
