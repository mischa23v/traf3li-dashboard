/**
 * Request Deduplication Utility
 * Prevents identical concurrent requests from being made simultaneously
 *
 * Gold Standard: Used by Netflix, Stripe, and other high-scale applications
 * to prevent thundering herd and reduce API load
 */

interface PendingRequest {
  promise: Promise<any>
  timestamp: number
}

// Store for pending requests - key is the request signature
const pendingRequests = new Map<string, PendingRequest>()

// Cleanup interval (remove stale entries after 30 seconds)
const STALE_THRESHOLD = 30 * 1000

/**
 * Generate a unique key for a request based on method, URL, and params
 */
export const generateRequestKey = (
  method: string,
  url: string,
  params?: Record<string, any>,
  data?: any
): string => {
  const normalizedMethod = method.toLowerCase()
  const normalizedParams = params ? JSON.stringify(params, Object.keys(params).sort()) : ''
  const normalizedData = data ? JSON.stringify(data) : ''

  return `${normalizedMethod}:${url}:${normalizedParams}:${normalizedData}`
}

/**
 * Check if a request is already pending
 */
export const hasPendingRequest = (key: string): boolean => {
  const pending = pendingRequests.get(key)
  if (!pending) return false

  // Check if the pending request is stale
  if (Date.now() - pending.timestamp > STALE_THRESHOLD) {
    pendingRequests.delete(key)
    return false
  }

  return true
}

/**
 * Get the pending request promise if it exists
 */
export const getPendingRequest = (key: string): Promise<any> | null => {
  const pending = pendingRequests.get(key)
  if (!pending) return null

  // Check if stale
  if (Date.now() - pending.timestamp > STALE_THRESHOLD) {
    pendingRequests.delete(key)
    return null
  }

  return pending.promise
}

/**
 * Register a new pending request
 */
export const registerPendingRequest = (key: string, promise: Promise<any>): void => {
  pendingRequests.set(key, {
    promise,
    timestamp: Date.now(),
  })

  // Auto-cleanup when promise settles
  promise
    .finally(() => {
      // Small delay to allow for response caching
      setTimeout(() => {
        pendingRequests.delete(key)
      }, 100)
    })
    .catch(() => {
      // Ignore errors - we just want cleanup
    })
}

/**
 * Clear all pending requests (useful for logout/reset)
 */
export const clearPendingRequests = (): void => {
  pendingRequests.clear()
}

/**
 * Get count of pending requests (for debugging)
 */
export const getPendingRequestCount = (): number => {
  return pendingRequests.size
}

/**
 * Cleanup stale requests (can be called periodically)
 */
export const cleanupStaleRequests = (): number => {
  const now = Date.now()
  let cleaned = 0

  pendingRequests.forEach((value, key) => {
    if (now - value.timestamp > STALE_THRESHOLD) {
      pendingRequests.delete(key)
      cleaned++
    }
  })

  return cleaned
}

// Run cleanup every minute
if (typeof window !== 'undefined') {
  setInterval(cleanupStaleRequests, 60 * 1000)
}
