/**
 * API Configuration
 * Central configuration for API versioning and settings
 *
 * IMPORTANT: VITE_API_URL should be the domain only (e.g., https://api.traf3li.com)
 * The /api/v1 path is added automatically by getApiUrl()
 *
 * This configuration handles both formats for backwards compatibility:
 * - https://api.traf3li.com (correct - domain only)
 * - https://api.traf3li.com/api (legacy - will strip /api suffix)
 */

/**
 * Normalize base URL by removing trailing /api or /api/ suffix
 * This prevents double /api/api/ in the final URL
 */
const normalizeBaseUrl = (url: string): string => {
  // Remove trailing slash first
  let normalized = url.replace(/\/+$/, '')
  // Remove /api suffix if present (case-insensitive)
  normalized = normalized.replace(/\/api$/i, '')
  return normalized
}

const rawBaseUrl = import.meta.env.VITE_API_URL || 'https://api.traf3li.com'

export const API_CONFIG = {
  version: 'v1',
  baseUrl: normalizeBaseUrl(rawBaseUrl),
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://api.traf3li.com',
  timeout: 30000,
  retryAttempts: 3,
} as const

/**
 * Get the full versioned API URL
 * Returns: {baseUrl}/api/{version} (e.g., https://api.traf3li.com/api/v1)
 */
export const getApiUrl = (): string => {
  return `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}`
}

/**
 * Get the WebSocket URL
 */
export const getWsUrl = (): string => {
  return API_CONFIG.wsUrl
}
