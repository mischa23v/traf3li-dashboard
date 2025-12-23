// Re-export api client for services
// NOTE: clearCache is deprecated - use TanStack Query's queryClient methods instead
export { apiClient, api, handleApiError, type ApiError } from '@/lib/api'
export { default } from '@/lib/api'
