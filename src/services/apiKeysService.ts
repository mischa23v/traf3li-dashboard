/**
 * API Keys Service
 *
 * Comprehensive service for managing API keys in the Traf3li legal management system.
 * Provides full CRUD operations with scope-based permission management for secure
 * programmatic access to the platform.
 *
 * **Key Features:**
 * - Create API keys with custom expiration periods (1-90 days)
 * - Fine-grained permission control using scopes (read/write access per resource)
 * - Secure key handling (full key shown only once at creation)
 * - Usage tracking and statistics
 * - Immediate revocation capability
 *
 * **Security Notes:**
 * - API keys are only displayed in full at creation time and cannot be retrieved later
 * - Keys show only prefix and suffix (e.g., "sk_li...v3x8") for security
 * - Revoked keys are immediately invalidated system-wide
 * - All operations require user authentication
 *
 * @module apiKeysService
 * @see API_KEY_SCOPES for available permission scopes
 */

import apiClient, { handleApiError } from '@/lib/api'

/**
 * API Key object representing a stored API key with metadata
 *
 * @interface ApiKey
 * @property {string} _id - MongoDB document ID
 * @property {string} keyId - Unique identifier for the key (used in API calls)
 * @property {string} name - User-friendly name for the key
 * @property {string} [description] - Optional detailed description
 * @property {string} keyPrefix - First 4 characters of the key (e.g., "sk_li") for identification
 * @property {string} keySuffix - Last 4 characters of the key (e.g., "v3x8") for identification
 * @property {string[]} scopes - Array of permission scopes (e.g., ['read:clients', 'write:cases'])
 * @property {string} expiresAt - ISO 8601 timestamp when the key expires
 * @property {string} createdAt - ISO 8601 timestamp when the key was created
 * @property {string} [lastUsedAt] - ISO 8601 timestamp of last API request (if any)
 * @property {boolean} isActive - Whether the key is currently active and valid
 * @property {number} usageCount - Total number of API requests made with this key
 */
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

/**
 * Request payload for creating a new API key
 *
 * @interface CreateApiKeyRequest
 * @property {string} name - Descriptive name for the API key
 * @property {string} [description] - Optional detailed description of the key's purpose
 * @property {number} expiryDays - Number of days until expiration (valid range: 1-90)
 * @property {string[]} scopes - Array of permission scopes to grant (see API_KEY_SCOPES)
 */
export interface CreateApiKeyRequest {
  name: string
  description?: string
  expiryDays: number // 1 to 90 days
  scopes: string[]
}

/**
 * Response from creating a new API key
 *
 * **CRITICAL**: The `fullKey` field contains the complete API key and is ONLY available
 * in this response. It cannot be retrieved again. Users must copy and securely store
 * this key immediately.
 *
 * @interface CreateApiKeyResponse
 * @property {ApiKey} apiKey - The created API key metadata
 * @property {string} fullKey - The complete API key string (ONLY SHOWN ONCE - save immediately!)
 */
export interface CreateApiKeyResponse {
  apiKey: ApiKey
  fullKey: string // Full key is only shown once during creation
}

/**
 * Aggregated statistics about API key usage
 *
 * @interface ApiKeyStats
 * @property {number} totalKeys - Total number of API keys created (active + expired)
 * @property {number} activeKeys - Number of currently valid, non-expired keys
 * @property {number} expiredKeys - Number of expired or revoked keys
 * @property {number} totalRequests - Total API requests made across all keys
 */
export interface ApiKeyStats {
  totalKeys: number
  activeKeys: number
  expiredKeys: number
  totalRequests: number
}

/**
 * Get all API keys for the current user
 *
 * Retrieves a list of all API keys associated with the authenticated user's account.
 * The returned keys show only the prefix and suffix for security purposes - the full
 * key is never retrievable after creation.
 *
 * @returns {Promise<ApiKey[]>} Array of API key objects containing metadata and usage information
 *
 * @throws {Error} If the request fails or the user is not authenticated
 *
 * @example
 * ```typescript
 * const apiKeys = await getUserApiKeys();
 * console.log(`You have ${apiKeys.length} API keys`);
 * apiKeys.forEach(key => {
 *   console.log(`${key.name}: ${key.keyPrefix}...${key.keySuffix}`);
 * });
 * ```
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
 *
 * Creates a new API key with specified scopes and expiration period. The full API key
 * is returned in the response and is only available at this time - it cannot be retrieved
 * again later. Users must copy and securely store the key immediately.
 *
 * @param {CreateApiKeyRequest} data - API key configuration
 * @param {string} data.name - Descriptive name for the API key (e.g., "Production API", "Mobile App")
 * @param {string} [data.description] - Optional detailed description of the key's purpose
 * @param {number} data.expiryDays - Number of days until the key expires (1-90 days)
 * @param {string[]} data.scopes - Array of permission scopes (e.g., ['read:clients', 'write:cases'])
 *
 * @returns {Promise<CreateApiKeyResponse>} Object containing the API key metadata and the full key
 * @returns {ApiKey} response.apiKey - The API key metadata (prefix, suffix, scopes, etc.)
 * @returns {string} response.fullKey - The complete API key string (ONLY SHOWN ONCE)
 *
 * @throws {Error} If the request fails, scopes are invalid, or expiry days are out of range
 *
 * @note **SECURITY CRITICAL**: The `fullKey` in the response is the ONLY time the complete
 * API key will be available. It cannot be retrieved again. Users must copy and securely
 * store this key immediately. Future requests will only show the prefix and suffix.
 *
 * @example
 * ```typescript
 * const newKey = await createApiKey({
 *   name: 'Mobile App API Key',
 *   description: 'API key for iOS and Android mobile applications',
 *   expiryDays: 90,
 *   scopes: ['read:clients', 'read:cases', 'write:documents']
 * });
 *
 * // IMPORTANT: Save this key - it won't be shown again!
 * console.log('Full API Key:', newKey.fullKey);
 * console.log('Key ID:', newKey.apiKey.keyId);
 * console.log('Expires:', newKey.apiKey.expiresAt);
 * ```
 *
 * @see API_KEY_SCOPES for available permission scopes
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
 *
 * Permanently revokes (deletes) an API key, making it immediately unusable for authentication.
 * This action cannot be undone. Any applications or services using this key will lose access
 * and must be updated with a new key.
 *
 * @param {string} keyId - The unique identifier of the API key to revoke
 *
 * @returns {Promise<void>} Resolves when the key is successfully revoked
 *
 * @throws {Error} If the request fails, the key doesn't exist, or user lacks permission
 *
 * @example
 * ```typescript
 * // Revoke a compromised or unused API key
 * await revokeApiKey('key_abc123xyz');
 * console.log('API key has been revoked');
 *
 * // The key is immediately invalidated and cannot be used
 * ```
 *
 * @note This is a destructive operation and cannot be undone. Consider updating the
 * key's description with a revocation reason before deleting, if audit trail is needed.
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
 *
 * Updates the descriptive metadata of an existing API key. This operation only modifies
 * the name and description fields - it cannot change scopes, expiration, or the key itself.
 * The key's permissions and expiration date remain unchanged.
 *
 * @param {string} keyId - The unique identifier of the API key to update
 * @param {Object} data - Object containing the fields to update
 * @param {string} [data.name] - New name for the API key
 * @param {string} [data.description] - New description for the API key
 *
 * @returns {Promise<ApiKey>} The updated API key object with new metadata
 *
 * @throws {Error} If the request fails, the key doesn't exist, or user lacks permission
 *
 * @example
 * ```typescript
 * // Update just the name
 * const updated = await updateApiKey('key_abc123', {
 *   name: 'Production API - Updated'
 * });
 *
 * // Update both name and description
 * const updated = await updateApiKey('key_abc123', {
 *   name: 'Legacy Mobile App',
 *   description: 'Deprecated - will be removed Q2 2025'
 * });
 *
 * console.log('Updated:', updated.name);
 * ```
 *
 * @note This operation does NOT modify scopes, expiration date, or the API key value itself.
 * To change permissions or expiration, you must create a new key and revoke the old one.
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
 *
 * Retrieves aggregated statistics about the user's API keys, including total counts,
 * status breakdown, and overall usage metrics. This provides a high-level overview
 * of API key usage across the account.
 *
 * @returns {Promise<ApiKeyStats>} Statistics object containing:
 * @returns {number} stats.totalKeys - Total number of API keys (active + expired)
 * @returns {number} stats.activeKeys - Number of currently valid, non-expired keys
 * @returns {number} stats.expiredKeys - Number of expired keys
 * @returns {number} stats.totalRequests - Total API requests made across all keys
 *
 * @throws {Error} If the request fails or the user is not authenticated
 *
 * @example
 * ```typescript
 * const stats = await getApiKeyStats();
 * console.log(`Total Keys: ${stats.totalKeys}`);
 * console.log(`Active: ${stats.activeKeys}`);
 * console.log(`Expired: ${stats.expiredKeys}`);
 * console.log(`Total API Requests: ${stats.totalRequests.toLocaleString()}`);
 *
 * // Calculate usage rate
 * const avgRequestsPerKey = stats.totalRequests / stats.totalKeys;
 * console.log(`Average requests per key: ${avgRequestsPerKey.toFixed(2)}`);
 * ```
 *
 * @note Statistics are updated in real-time and reflect the current state of the account
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
 *
 * Defines all available permission scopes that can be assigned to API keys.
 * Scopes follow a resource:action pattern (e.g., 'read:clients', 'write:cases').
 * Each API key can have multiple scopes to grant fine-grained access control.
 *
 * **Permission Model:**
 * - `read:*` - Grants read-only access to a resource (GET operations)
 * - `write:*` - Grants create/update/delete access to a resource (POST/PUT/PATCH/DELETE operations)
 *
 * **Available Scopes:**
 * - `read:profile` - View user profile information
 * - `read:clients` - View client records
 * - `write:clients` - Create, update, and delete client records
 * - `read:cases` - View legal case information
 * - `write:cases` - Create, update, and manage legal cases
 * - `read:invoices` - View invoices and billing information
 * - `write:invoices` - Create and manage invoices
 * - `read:documents` - View and download documents
 * - `write:documents` - Upload, update, and delete documents
 * - `read:reports` - Generate and view reports
 *
 * @constant
 * @type {Array<{value: string, label: string, labelAr: string}>}
 *
 * @example
 * ```typescript
 * // Create a read-only API key
 * const readOnlyScopes = API_KEY_SCOPES
 *   .filter(scope => scope.value.startsWith('read:'))
 *   .map(scope => scope.value);
 *
 * await createApiKey({
 *   name: 'Read-Only API',
 *   expiryDays: 30,
 *   scopes: readOnlyScopes
 * });
 *
 * // Create a key with specific permissions
 * await createApiKey({
 *   name: 'Client Management API',
 *   expiryDays: 90,
 *   scopes: ['read:clients', 'write:clients', 'read:documents']
 * });
 * ```
 *
 * @note Write scopes typically imply read access for the same resource, but this
 * should be explicitly granted by including both scopes for clarity and security.
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
