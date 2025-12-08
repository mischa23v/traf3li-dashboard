/**
 * Network Error Retry Utility
 *
 * Provides retry logic with exponential backoff for failed API requests.
 * Handles network errors, server errors (5xx), and rate limiting (429).
 *
 * Usage:
 * ```typescript
 * import { retryRequest, queryRetryConfig } from '@/utils/retry'
 *
 * // Wrap any async function
 * const data = await retryRequest(() => apiClient.get('/endpoint'))
 *
 * // Use with React Query
 * useQuery({
 *   queryKey: ['data'],
 *   queryFn: () => apiClient.get('/endpoint'),
 *   ...queryRetryConfig
 * })
 * ```
 */

import { AxiosError } from 'axios'

/**
 * Retry configuration options
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number

  /**
   * Base delay in milliseconds before first retry
   * @default 1000
   */
  baseDelay?: number

  /**
   * Maximum delay in milliseconds between retries
   * @default 10000
   */
  maxDelay?: number

  /**
   * Custom function to determine if an error should be retried
   * @param error - The error that occurred
   * @returns true if the request should be retried
   */
  retryCondition?: (error: any) => boolean

  /**
   * Callback function called before each retry attempt
   * @param error - The error that occurred
   * @param attempt - The current retry attempt number (1-indexed)
   * @param delay - The delay in ms before this retry
   */
  onRetry?: (error: any, attempt: number, delay: number) => void
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryCondition: shouldRetryError,
}

/**
 * Determines if an error should be retried based on its type and status code
 *
 * Retries on:
 * - Network errors (no response received)
 * - 5xx server errors (500-599)
 * - 429 rate limit errors (with special handling)
 *
 * Does NOT retry on:
 * - 4xx client errors (except 429)
 * - Successful responses (2xx)
 *
 * @param error - The error to evaluate
 * @returns true if the error should be retried
 */
export function shouldRetryError(error: any): boolean {
  // Network errors (no response received)
  if (!error.response) {
    // Check if it's a network error or timeout
    if (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      error.code === 'ETIMEDOUT'
    ) {
      return true
    }
  }

  // Server errors (5xx)
  if (error.response?.status >= 500 && error.response?.status < 600) {
    return true
  }

  // Rate limit errors (429) - should be retried with longer delay
  if (error.response?.status === 429) {
    return true
  }

  // Axios errors without response (connection issues)
  if (error.isAxiosError && !error.response) {
    return true
  }

  // Don't retry client errors (4xx except 429) or successful responses
  return false
}

/**
 * Calculates delay before next retry using exponential backoff
 *
 * For 429 rate limit errors, respects the Retry-After header if present.
 * For other errors, uses exponential backoff: baseDelay * 2^attempt
 *
 * @param attempt - Current retry attempt number (0-indexed)
 * @param error - The error that occurred
 * @param options - Retry options
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(
  attempt: number,
  error: any,
  options: Required<Omit<RetryOptions, 'onRetry' | 'retryCondition'>>
): number {
  // Special handling for 429 Rate Limited
  if (error.response?.status === 429) {
    const retryAfter = error.response.headers['retry-after']
    if (retryAfter) {
      // Retry-After can be in seconds or a date
      const retryAfterMs = parseInt(retryAfter, 10) * 1000
      if (!isNaN(retryAfterMs)) {
        // Cap at maxDelay but allow longer delays for rate limiting
        return Math.min(retryAfterMs, options.maxDelay * 3)
      }
    }
    // Default longer delay for rate limiting
    return Math.min(options.baseDelay * 4, options.maxDelay * 2)
  }

  // Exponential backoff: baseDelay * 2^attempt
  // With jitter to prevent thundering herd
  const exponentialDelay = options.baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * 0.3 * exponentialDelay // ±30% jitter
  const delay = exponentialDelay + jitter

  // Cap at maxDelay
  return Math.min(delay, options.maxDelay)
}

/**
 * Retries a failed request with exponential backoff
 *
 * @template T - The return type of the function
 * @param fn - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after max retries
 *
 * @example
 * ```typescript
 * // Basic usage
 * const data = await retryRequest(() => apiClient.get('/users'))
 *
 * // With custom options
 * const data = await retryRequest(
 *   () => apiClient.post('/data', payload),
 *   {
 *     maxRetries: 5,
 *     baseDelay: 2000,
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms`)
 *     }
 *   }
 * )
 *
 * // With custom retry condition
 * const data = await retryRequest(
 *   () => riskyOperation(),
 *   {
 *     retryCondition: (error) => error.code === 'SPECIFIC_ERROR'
 *   }
 * )
 * ```
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
    retryCondition: options.retryCondition || DEFAULT_RETRY_OPTIONS.retryCondition,
  }

  let lastError: any
  let attempt = 0

  while (attempt <= config.maxRetries) {
    try {
      // Attempt the request
      const result = await fn()
      return result
    } catch (error) {
      lastError = error
      attempt++

      // Check if we should retry
      const shouldRetry = config.retryCondition(error)
      const hasRetriesLeft = attempt <= config.maxRetries

      if (!shouldRetry || !hasRetriesLeft) {
        // Don't retry, throw the error
        throw error
      }

      // Calculate delay before next retry
      const delay = calculateRetryDelay(attempt - 1, error, {
        baseDelay: config.baseDelay,
        maxDelay: config.maxDelay,
        maxRetries: config.maxRetries,
      })

      // Log retry attempt in development
      if (import.meta.env.DEV) {
        console.warn(
          `[Retry] Attempt ${attempt}/${config.maxRetries} failed. Retrying in ${delay}ms...`,
          {
            error: error.message || error,
            status: error.response?.status,
            nextDelay: delay,
          }
        )
      }

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(error, attempt, delay)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // All retries exhausted, throw last error
  throw lastError
}

/**
 * React Query retry configuration
 *
 * Provides optimal retry settings for React Query's useQuery and useMutation.
 * Uses exponential backoff with jitter, up to 30 seconds max delay.
 *
 * @example
 * ```typescript
 * // With useQuery
 * const { data, error } = useQuery({
 *   queryKey: ['users'],
 *   queryFn: () => apiClient.get('/users'),
 *   ...queryRetryConfig
 * })
 *
 * // With custom overrides
 * const { data } = useQuery({
 *   queryKey: ['critical-data'],
 *   queryFn: fetchCriticalData,
 *   ...queryRetryConfig,
 *   retry: 5, // Override to retry more times
 * })
 * ```
 */
export const queryRetryConfig = {
  /**
   * Number of retry attempts for failed queries
   */
  retry: 3,

  /**
   * Exponential backoff delay calculation
   * attemptIndex is 0-based (0 for first retry)
   *
   * Delays: ~1000ms, ~2000ms, ~4000ms, capped at 30000ms
   */
  retryDelay: (attemptIndex: number, error: any) => {
    // Use longer delays for rate limiting
    if ((error as AxiosError)?.response?.status === 429) {
      const retryAfter = (error as AxiosError)?.response?.headers['retry-after']
      if (retryAfter) {
        const retryAfterMs = parseInt(retryAfter, 10) * 1000
        if (!isNaN(retryAfterMs)) {
          return Math.min(retryAfterMs, 60000) // Cap at 60 seconds
        }
      }
      return Math.min(10000 * Math.pow(2, attemptIndex), 60000)
    }

    // Standard exponential backoff with jitter
    const baseDelay = 1000 * Math.pow(2, attemptIndex)
    const jitter = Math.random() * 0.3 * baseDelay
    return Math.min(baseDelay + jitter, 30000)
  },

  /**
   * Determines if a query should be retried based on the error
   */
  retryOnMount: true,
}

/**
 * Mutation-specific retry configuration
 *
 * More conservative retry settings for mutations (POST, PUT, DELETE).
 * Only retries on network errors and 5xx, not on 4xx client errors.
 *
 * @example
 * ```typescript
 * const mutation = useMutation({
 *   mutationFn: (data) => apiClient.post('/users', data),
 *   ...mutationRetryConfig,
 *   onError: (error) => {
 *     toast.error('Failed to create user')
 *   }
 * })
 * ```
 */
export const mutationRetryConfig = {
  /**
   * Fewer retries for mutations to avoid duplicate operations
   */
  retry: 2,

  /**
   * Exponential backoff for mutations
   */
  retryDelay: (attemptIndex: number) => {
    return Math.min(1000 * Math.pow(2, attemptIndex), 10000)
  },
}

/**
 * Axios interceptor wrapper that adds retry logic
 *
 * Can be used to wrap an axios instance to automatically retry failed requests.
 * This is an alternative to using retryRequest directly.
 *
 * @param axiosInstance - The axios instance to add retry logic to
 * @param options - Retry configuration options
 *
 * @example
 * ```typescript
 * import axios from 'axios'
 * import { withRetry } from '@/utils/retry'
 *
 * const api = axios.create({ baseURL: '/api' })
 * withRetry(api, { maxRetries: 5 })
 *
 * // Now all requests through this instance will auto-retry
 * const data = await api.get('/users')
 * ```
 */
export function withRetry(
  axiosInstance: any,
  options: RetryOptions = {}
): void {
  const config = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
    retryCondition: options.retryCondition || DEFAULT_RETRY_OPTIONS.retryCondition,
  }

  // Add response interceptor for retry logic
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config

      // Prevent infinite retry loops
      if (!originalRequest) {
        return Promise.reject(error)
      }

      // Initialize retry tracking
      if (!originalRequest._retryCount) {
        originalRequest._retryCount = 0
      }

      // Check if we should retry
      const shouldRetry = config.retryCondition(error)
      const hasRetriesLeft = originalRequest._retryCount < config.maxRetries

      if (!shouldRetry || !hasRetriesLeft) {
        return Promise.reject(error)
      }

      // Increment retry count
      originalRequest._retryCount++

      // Calculate delay
      const delay = calculateRetryDelay(originalRequest._retryCount - 1, error, {
        baseDelay: config.baseDelay,
        maxDelay: config.maxDelay,
        maxRetries: config.maxRetries,
      })

      // Log retry in development
      if (import.meta.env.DEV) {
        console.warn(
          `[Interceptor Retry] Attempt ${originalRequest._retryCount}/${config.maxRetries}. Retrying in ${delay}ms...`
        )
      }

      // Call onRetry callback if provided
      if (options.onRetry) {
        options.onRetry(error, originalRequest._retryCount, delay)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))

      // Retry the request
      return axiosInstance(originalRequest)
    }
  )
}

/**
 * Creates a retry-enabled wrapper around a function
 *
 * Useful for creating reusable API functions with built-in retry logic.
 *
 * @template T - The return type of the function
 * @param fn - The function to wrap
 * @param options - Retry configuration options
 * @returns A new function with retry logic
 *
 * @example
 * ```typescript
 * // Create reusable functions with retry built-in
 * const fetchUsers = createRetryWrapper(
 *   () => apiClient.get('/users'),
 *   { maxRetries: 5 }
 * )
 *
 * const fetchUserById = createRetryWrapper(
 *   (id: string) => apiClient.get(`/users/${id}`),
 *   { maxRetries: 3 }
 * )
 *
 * // Use them directly
 * const users = await fetchUsers()
 * const user = await fetchUserById('123')
 * ```
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: any[]) => {
    return retryRequest(() => fn(...args), options)
  }) as T
}

export default retryRequest
