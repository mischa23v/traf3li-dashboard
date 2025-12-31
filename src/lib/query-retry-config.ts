/**
 * TanStack Query Smart Retry Configuration
 *
 * Gold Standard: Intelligent retry logic that:
 * - Never retries 4xx client errors (except 429 with backoff)
 * - Uses exponential backoff with jitter for retries
 * - Respects Retry-After headers from 429 responses
 * - Limits retries to prevent infinite loops
 */

import { AxiosError } from 'axios'

// Maximum retry attempts
const MAX_RETRIES = 3

// Base delay for exponential backoff (in ms)
const BASE_DELAY = 1000

// Maximum delay cap (in ms)
const MAX_DELAY = 30000

// Jitter factor (0-1) to prevent thundering herd
const JITTER_FACTOR = 0.3

/**
 * Calculate delay with exponential backoff and jitter
 */
export const calculateBackoffDelay = (
  attemptNumber: number,
  retryAfterSeconds?: number
): number => {
  // If server specified retry-after, use it (with a minimum of 1 second)
  if (retryAfterSeconds !== undefined && retryAfterSeconds > 0) {
    return Math.max(retryAfterSeconds * 1000, 1000)
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  const exponentialDelay = BASE_DELAY * Math.pow(2, attemptNumber)

  // Add jitter to prevent thundering herd
  const jitter = exponentialDelay * JITTER_FACTOR * Math.random()

  // Cap at max delay
  return Math.min(exponentialDelay + jitter, MAX_DELAY)
}

/**
 * Extract retry-after seconds from error response
 */
export const getRetryAfterSeconds = (error: unknown): number | undefined => {
  if (error instanceof AxiosError) {
    const retryAfter = error.response?.headers?.['retry-after']
    if (retryAfter) {
      // Could be seconds or HTTP date
      const seconds = parseInt(retryAfter, 10)
      if (!isNaN(seconds)) {
        return seconds
      }
      // Try parsing as date
      const date = Date.parse(retryAfter)
      if (!isNaN(date)) {
        return Math.max(0, Math.ceil((date - Date.now()) / 1000))
      }
    }
  }
  return undefined
}

/**
 * Check if an error is retryable
 */
export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const status = error.response?.status

    // Network errors are retryable
    if (!status) {
      return true
    }

    // 5xx server errors are retryable
    if (status >= 500 && status < 600) {
      return true
    }

    // 429 Too Many Requests is retryable (with backoff)
    if (status === 429) {
      return true
    }

    // 408 Request Timeout is retryable
    if (status === 408) {
      return true
    }

    // All other 4xx errors are NOT retryable
    return false
  }

  // Unknown errors - retry once
  return true
}

/**
 * Smart retry function for TanStack Query
 * Returns false to stop retrying, true to continue
 */
export const smartRetry = (failureCount: number, error: unknown): boolean => {
  // Don't retry in development for faster debugging
  if (import.meta.env.DEV && failureCount >= 1) {
    return false
  }

  // Max retries reached
  if (failureCount >= MAX_RETRIES) {
    return false
  }

  // Check if error is retryable
  return isRetryableError(error)
}

/**
 * Smart retry delay function for TanStack Query
 * Returns the delay in milliseconds before the next retry
 */
export const smartRetryDelay = (
  attemptIndex: number,
  error: unknown
): number => {
  const retryAfter = getRetryAfterSeconds(error)
  return calculateBackoffDelay(attemptIndex, retryAfter)
}

/**
 * Combined retry configuration for TanStack Query
 */
export const queryRetryConfig = {
  retry: smartRetry,
  retryDelay: smartRetryDelay,
}

/**
 * Mutation retry configuration (very conservative - POST requests may have succeeded)
 *
 * IMPORTANT: We do NOT retry network errors (!error.response) for mutations because:
 * 1. The request might have succeeded on the server but the response was lost
 * 2. Retrying would create duplicate records (e.g., duplicate appointments)
 * 3. Only 429 (rate limit) is safe to retry because the request wasn't processed
 */
export const mutationRetryConfig = {
  retry: (failureCount: number, error: unknown): boolean => {
    // Maximum 1 retry for mutations (conservative approach)
    if (failureCount >= 1) return false

    if (error instanceof AxiosError) {
      // ONLY retry on 429 (rate limit) - the request wasn't processed
      // DO NOT retry on network errors - the request might have succeeded!
      return error.response?.status === 429
    }

    return false
  },
  retryDelay: smartRetryDelay,
}
