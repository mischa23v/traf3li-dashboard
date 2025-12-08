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
  type ApiError,
  type RateLimitInfo,
} from './api'
export { default } from './api'
