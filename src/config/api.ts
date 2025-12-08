/**
 * API Configuration
 * Central configuration for API versioning and settings
 */

export const API_CONFIG = {
  version: 'v1',
  baseUrl: import.meta.env.VITE_API_URL || 'https://api.traf3li.com',
  wsUrl: import.meta.env.VITE_WS_URL || 'wss://api.traf3li.com',
  timeout: 30000,
  retryAttempts: 3,
} as const

/**
 * Get the full versioned API URL
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
