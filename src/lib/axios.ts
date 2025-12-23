// Re-export apiClient as axios for compatibility
export { apiClient as axios } from './api'
export {
  apiClient,
  api,
  handleApiError,
  // NOTE: clearCache and getCacheSize are deprecated - use TanStack Query methods instead
  getRateLimitInfo,
  formatRetryAfter,
  resetApiState,
  getOpenCircuits,
  getCircuitStatus,
  getPendingRequestCount,
  shouldAddIdempotencyKey,
  generateIdempotencyKey,
  FINANCIAL_PATHS,
  cancelAllRequests,
  cancelNavigationRequests,
  isAbortError,
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

// Re-export idempotency utilities for custom use
export {
  getIdempotencyKey,
  clearIdempotencyKey,
  clearAllIdempotencyKeys,
} from './idempotency'

// Re-export request cancellation utilities
export {
  getAbortController,
  cancelRequest,
  getActiveRequestCount,
  createTimeoutSignal,
  combineSignals,
} from './request-cancellation'
