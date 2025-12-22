/**
 * API Keys Service
 * Handles all API key management operations for user authentication
 */

import apiClient, { handleApiError } from '@/lib/api'

export interface ApiKey {
  _id: string
  keyId: string
  name: string
  description?: string
  keyPrefix: string // First 4 characters (e.g., "sk_li")
  keySuffix: string // Last 4 characters (e.g., "v3x8")
  scopes: string[]
  expiresAt: string
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
  usageCount: number
}

export interface CreateApiKeyRequest {
  name: string
  description?: string
  expiryDays: number // 1 to 90 days
  scopes: string[]
}

export interface CreateApiKeyResponse {
  apiKey: ApiKey
  fullKey: string // Full key is only shown once during creation
}

export interface ApiKeyStats {
  totalKeys: number
  activeKeys: number
  expiredKeys: number
  totalRequests: number
}

/**
 * Get all API keys for the current user
 */
export const getUserApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const response = await apiClient.get('/api-keys')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Create a new API key
 */
export const createApiKey = async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
  try {
    const response = await apiClient.post('/api-keys', data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Revoke an API key
 */
export const revokeApiKey = async (keyId: string): Promise<void> => {
  try {
    await apiClient.delete(`/api-keys/${keyId}`)
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update API key metadata (name, description)
 */
export const updateApiKey = async (
  keyId: string,
  data: { name?: string; description?: string }
): Promise<ApiKey> => {
  try {
    const response = await apiClient.patch(`/api-keys/${keyId}`, data)
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get API key usage statistics
 */
export const getApiKeyStats = async (): Promise<ApiKeyStats> => {
  try {
    const response = await apiClient.get('/api-keys/stats')
    return response.data.data
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Available scopes for API keys
 */
export const API_KEY_SCOPES = [
  { value: 'read:profile', label: 'Read Profile', labelAr: 'قراءة الملف الشخصي' },
  { value: 'read:clients', label: 'Read Clients', labelAr: 'قراءة العملاء' },
  { value: 'write:clients', label: 'Write Clients', labelAr: 'كتابة العملاء' },
  { value: 'read:cases', label: 'Read Cases', labelAr: 'قراءة القضايا' },
  { value: 'write:cases', label: 'Write Cases', labelAr: 'كتابة القضايا' },
  { value: 'read:invoices', label: 'Read Invoices', labelAr: 'قراءة الفواتير' },
  { value: 'write:invoices', label: 'Write Invoices', labelAr: 'كتابة الفواتير' },
  { value: 'read:documents', label: 'Read Documents', labelAr: 'قراءة المستندات' },
  { value: 'write:documents', label: 'Write Documents', labelAr: 'كتابة المستندات' },
  { value: 'read:reports', label: 'Read Reports', labelAr: 'قراءة التقارير' },
] as const

const apiKeysService = {
  getUserApiKeys,
  createApiKey,
  revokeApiKey,
  updateApiKey,
  getApiKeyStats,
}

export default apiKeysService
