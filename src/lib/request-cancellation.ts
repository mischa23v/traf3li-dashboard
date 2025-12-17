/**
 * Request Cancellation Utility
 *
 * Gold Standard: Cancel stale requests when user navigates away
 * Prevents wasted bandwidth and improves perceived performance
 *
 * Uses AbortController for proper request cancellation
 */

// Store for active AbortControllers by request key
const activeControllers = new Map<string, AbortController>()

// Store for route-based controllers (cancel all requests on navigation)
let navigationController: AbortController | null = null

/**
 * Generate a unique key for a request
 */
export const getRequestKey = (
  method: string,
  url: string,
  params?: Record<string, any>
): string => {
  const normalizedParams = params ? JSON.stringify(params, Object.keys(params).sort()) : ''
  return `${method.toLowerCase()}:${url}:${normalizedParams}`
}

/**
 * Get or create an AbortController for a request
 * If a request with the same key is already in flight, cancel it first
 */
export const getAbortController = (
  method: string,
  url: string,
  params?: Record<string, any>
): AbortController => {
  const key = getRequestKey(method, url, params)

  // Cancel existing request with same key (prevents duplicate requests)
  const existing = activeControllers.get(key)
  if (existing) {
    existing.abort('Superseded by new request')
  }

  // Create new controller
  const controller = new AbortController()
  activeControllers.set(key, controller)

  return controller
}

/**
 * Remove an AbortController after request completes
 */
export const removeAbortController = (
  method: string,
  url: string,
  params?: Record<string, any>
): void => {
  const key = getRequestKey(method, url, params)
  activeControllers.delete(key)
}

/**
 * Cancel a specific request
 */
export const cancelRequest = (
  method: string,
  url: string,
  params?: Record<string, any>,
  reason: string = 'Request cancelled'
): boolean => {
  const key = getRequestKey(method, url, params)
  const controller = activeControllers.get(key)

  if (controller) {
    controller.abort(reason)
    activeControllers.delete(key)
    return true
  }

  return false
}

/**
 * Cancel all active requests
 */
export const cancelAllRequests = (reason: string = 'All requests cancelled'): number => {
  let cancelled = 0

  activeControllers.forEach((controller) => {
    controller.abort(reason)
    cancelled++
  })

  activeControllers.clear()
  return cancelled
}

/**
 * Get a navigation-scoped AbortController
 * All requests using this controller will be cancelled on navigation
 */
export const getNavigationController = (): AbortController => {
  if (!navigationController || navigationController.signal.aborted) {
    navigationController = new AbortController()
  }
  return navigationController
}

/**
 * Cancel all navigation-scoped requests
 * Call this when user navigates to a new page
 */
export const cancelNavigationRequests = (): void => {
  if (navigationController) {
    navigationController.abort('Navigation')
    navigationController = null
  }
}

/**
 * Check if an error is an abort error
 */
export const isAbortError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.name === 'AbortError' || error.name === 'CanceledError'
  }
  if (typeof error === 'object' && error !== null) {
    return (error as any).code === 'ERR_CANCELED'
  }
  return false
}

/**
 * Get count of active requests
 */
export const getActiveRequestCount = (): number => {
  return activeControllers.size
}

/**
 * Create a timeout signal that auto-cancels after specified time
 */
export const createTimeoutSignal = (timeoutMs: number): AbortSignal => {
  const controller = new AbortController()
  setTimeout(() => {
    controller.abort(`Timeout after ${timeoutMs}ms`)
  }, timeoutMs)
  return controller.signal
}

/**
 * Combine multiple abort signals into one
 * Request is cancelled if ANY signal fires
 */
export const combineSignals = (...signals: AbortSignal[]): AbortSignal => {
  const controller = new AbortController()

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason)
      return controller.signal
    }

    signal.addEventListener('abort', () => {
      controller.abort(signal.reason)
    }, { once: true })
  }

  return controller.signal
}
