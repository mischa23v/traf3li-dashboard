/**
 * Error Handling Utilities
 *
 * PROBLEM: The codebase has many silent error catches like:
 * .catch(() => {})
 * .catch(() => setHasAccess(false))
 *
 * This makes debugging impossible. Errors should be:
 * 1. Logged (at minimum)
 * 2. Reported to error tracking
 * 3. Handled with appropriate fallback
 *
 * This module provides utilities for consistent error handling.
 */

import { logger } from './logger'

// ==================== TYPES ====================

export interface ErrorContext {
  /** Where the error occurred */
  location: string
  /** What operation was being attempted */
  operation: string
  /** Additional context data */
  data?: Record<string, unknown>
  /** Whether this error should be reported to error tracking */
  report?: boolean
}

export interface HandledError {
  /** Original error */
  error: Error
  /** Error message (possibly translated) */
  message: string
  /** Error code for programmatic handling */
  code: string
  /** Whether the error was handled gracefully */
  handled: boolean
}

// ==================== ERROR HANDLER ====================

/**
 * Handle an error with proper logging and optional reporting
 *
 * @example
 * fetchData()
 *   .catch(err => handleError(err, {
 *     location: 'UserProfile',
 *     operation: 'fetchUserData',
 *   }))
 */
export function handleError(
  error: unknown,
  context: ErrorContext
): HandledError {
  // Normalize error to Error object
  const err = error instanceof Error ? error : new Error(String(error))

  // Log the error with context
  logger.error(`[${context.location}] ${context.operation} failed`, err, context.data)

  // Return structured error info
  return {
    error: err,
    message: err.message,
    code: getErrorCode(err),
    handled: true,
  }
}

/**
 * Create a catch handler that logs but allows graceful fallback
 *
 * @example
 * fetchOptionalData()
 *   .catch(createCatchHandler('Dashboard', 'loadWidgetData', null))
 *   .then(data => setData(data)) // data will be null if error
 */
export function createCatchHandler<T>(
  location: string,
  operation: string,
  fallbackValue: T
): (error: unknown) => T {
  return (error: unknown): T => {
    handleError(error, { location, operation })
    return fallbackValue
  }
}

/**
 * Wrap an async function with error handling
 *
 * @example
 * const safeLoadData = withErrorHandling(
 *   loadData,
 *   { location: 'API', operation: 'loadData' },
 *   [] // Return empty array on error
 * )
 */
export function withErrorHandling<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  context: Omit<ErrorContext, 'data'>,
  fallbackValue: TResult
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args)
    } catch (error) {
      handleError(error, { ...context, data: { args } })
      return fallbackValue
    }
  }
}

/**
 * Create a safe version of a promise that never throws
 * Returns [result, null] on success, [null, error] on failure
 *
 * @example
 * const [data, error] = await safeAsync(fetchData())
 * if (error) {
 *   // Handle error case
 * }
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  context?: ErrorContext
): Promise<[T, null] | [null, HandledError]> {
  try {
    const result = await promise
    return [result, null]
  } catch (error) {
    const handledError = context
      ? handleError(error, context)
      : handleError(error, {
          location: 'Unknown',
          operation: 'async operation',
        })
    return [null, handledError]
  }
}

/**
 * Run a callback safely, catching and logging any errors
 *
 * @example
 * safely(() => {
 *   // Code that might throw
 *   JSON.parse(untrustedInput)
 * }, 'Parser', 'parseJSON', defaultValue)
 */
export function safely<T>(
  fn: () => T,
  location: string,
  operation: string,
  fallbackValue: T
): T {
  try {
    return fn()
  } catch (error) {
    handleError(error, { location, operation })
    return fallbackValue
  }
}

/**
 * Parse JSON safely with error handling
 */
export function safeJsonParse<T>(
  json: string,
  fallbackValue: T,
  location = 'JSON'
): T {
  return safely(
    () => JSON.parse(json) as T,
    location,
    'parseJSON',
    fallbackValue
  )
}

/**
 * Stringify JSON safely with error handling (handles circular refs)
 */
export function safeJsonStringify(
  value: unknown,
  location = 'JSON'
): string | null {
  return safely(
    () => JSON.stringify(value),
    location,
    'stringifyJSON',
    null
  )
}

// ==================== ERROR CODE EXTRACTION ====================

/**
 * Extract error code from various error types
 */
function getErrorCode(error: Error): string {
  // Axios error
  if ('code' in error && typeof error.code === 'string') {
    return error.code
  }

  // API error with status
  if ('status' in error && typeof error.status === 'number') {
    return `HTTP_${error.status}`
  }

  // Response error
  if ('response' in error && typeof error.response === 'object' && error.response !== null) {
    const response = error.response as { status?: number }
    if (response.status) {
      return `HTTP_${response.status}`
    }
  }

  // Network error
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'NETWORK_ERROR'
  }

  // Generic
  return 'UNKNOWN_ERROR'
}

// ==================== REACT HOOKS ====================

/**
 * Hook-friendly error handler for React components
 *
 * @example
 * const handleFetchError = useErrorHandler('UserList', 'fetchUsers')
 *
 * useEffect(() => {
 *   fetchUsers().catch(handleFetchError)
 * }, [])
 */
export function createReactErrorHandler(
  location: string,
  operation: string,
  onError?: (error: HandledError) => void
) {
  return (error: unknown): void => {
    const handled = handleError(error, { location, operation })
    onError?.(handled)
  }
}

// ==================== PROMISE UTILITIES ====================

/**
 * Add timeout to a promise
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError = 'Operation timed out'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
  })

  return Promise.race([promise, timeout])
}

/**
 * Retry a promise with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelayMs?: number
    maxDelayMs?: number
    shouldRetry?: (error: unknown) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = () => true,
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelayMs
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

export default {
  handleError,
  createCatchHandler,
  withErrorHandling,
  safeAsync,
  safely,
  safeJsonParse,
  safeJsonStringify,
  createReactErrorHandler,
  withTimeout,
  withRetry,
}
