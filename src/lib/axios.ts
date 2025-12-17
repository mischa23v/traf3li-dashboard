// Re-export apiClient as axios for compatibility
export { apiClient as axios } from './api'
export {
  apiClient,
  api,
  handleApiError,
  clearCache,
  getCacheSize,
  getRateLimitInfo,
  formatRetryAfter,
  resetApiState,
  getOpenCircuits,
  getCircuitStatus,
  getPendingRequestCount,
  type ApiError,
  type RateLimitInfo,
} from './api'
export { default } from './api'

// Re-export retry config for use in custom hooks
export {
  smartRetry,
  smartRetryDelay,
  isRetryableError,
  calculateBackoffDelay,
} from './query-retry-config'
