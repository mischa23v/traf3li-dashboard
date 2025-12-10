/**
 * API Configuration
 * Central configuration for API versioning and settings
 *
 * PRODUCTION: Uses Vercel rewrites to proxy /api/* to api.traf3li.com
 * This makes requests same-origin, fixing cross-site cookie issues in Safari.
 *
 * DEVELOPMENT: Uses direct API URL for faster development (no proxy)
 */

/**
 * Determine if we should use the proxy (production) or direct URL (development)
 * In production on Vercel, we use /api which gets proxied to api.traf3li.com
 * In development, we use the direct URL for faster response times
 */
const isProduction = import.meta.env.PROD
const useProxy = isProduction && !import.meta.env.VITE_DISABLE_API_PROXY

// For proxy mode, baseUrl is empty string (relative URLs)
// For direct mode, baseUrl is the full API domain
const rawBaseUrl = useProxy ? '' : (import.meta.env.VITE_API_URL || 'https://api.traf3li.com')

/**
 * Normalize base URL by removing trailing /api or /api/ suffix
 * This prevents double /api/api/ in the final URL
 */
const normalizeBaseUrl = (url: string): string => {
  if (!url) return '' // Empty for proxy mode
  // Remove trailing slash first
  let normalized = url.replace(/\/+$/, '')
  // Remove /api suffix if present (case-insensitive)
  normalized = normalized.replace(/\/api$/i, '')
  return normalized
}

export const API_CONFIG = {
  version: 'v1',
  baseUrl: normalizeBaseUrl(rawBaseUrl),
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://api.traf3li.com',
  timeout: 30000,
  retryAttempts: 3,
  useProxy, // Expose for debugging
} as const

/**
 * Get the full versioned API URL
 * Production (proxy): /api/v1
 * Development (direct): https://api.traf3li.com/api/v1
 */
export const getApiUrl = (): string => {
  if (useProxy) {
    return `/api/${API_CONFIG.version}`
  }
  return `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}`
}

/**
 * Get the WebSocket URL
 * WebSockets still connect directly (can't proxy WebSocket through Vercel rewrites)
 */
export const getWsUrl = (): string => {
  return API_CONFIG.wsUrl
}
