// Re-export apiClient as axios for compatibility
export { apiClient as axios } from './api'
export { apiClient, api, handleApiError, clearCache, getCacheSize, type ApiError } from './api'
export { default } from './api'
