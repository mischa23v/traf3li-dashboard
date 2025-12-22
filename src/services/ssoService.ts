/**
 * SSO Service
 * Handles all OAuth 2.0 SSO-related API calls
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
 */
export const initiateSSOLogin = async (provider: SSOProvider): Promise<SSOLoginInitiateResponse> => {
  try {
    const response = await apiClient.post(`/auth/sso/${provider}/initiate`)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get enabled SSO providers for login page
 */
export const getEnabledSSOProviders = async (): Promise<SSOProviderConfig[]> => {
  try {
    const response = await apiClient.get('/auth/sso/enabled-providers')
    return response.data.data
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
