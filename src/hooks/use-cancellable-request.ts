import { useEffect, useRef, useCallback } from 'react'
import { isAbortError } from '@/lib/request-cancellation'

interface UseCancellableRequestOptions {
  /** Whether to cancel previous request when new one is made */
  cancelOnNewRequest?: boolean
}

/**
 * Hook for making cancellable API requests
 * Automatically cancels pending requests on unmount or when new requests are made
 */
export function useCancellableRequest(options: UseCancellableRequestOptions = {}) {
  const { cancelOnNewRequest = true } = options
  const controllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      // Cancel any pending requests on unmount
      controllerRef.current?.abort('Component unmounted')
    }
  }, [])

  const makeRequest = useCallback(async <T>(
    requestFn: (signal: AbortSignal) => Promise<T>
  ): Promise<T | null> => {
    // Cancel previous request if option enabled
    if (cancelOnNewRequest && controllerRef.current) {
      controllerRef.current.abort('New request started')
    }

    // Create new controller
    controllerRef.current = new AbortController()

    try {
      const result = await requestFn(controllerRef.current.signal)

      // Only return result if component is still mounted
      if (!isMountedRef.current) {
        return null
      }

      return result
    } catch (error: any) {
      // Don't throw for cancelled requests
      if (isAbortError(error)) {
        return null
      }
      throw error
    }
  }, [cancelOnNewRequest])

  const cancelRequest = useCallback((reason?: string) => {
    controllerRef.current?.abort(reason || 'Request cancelled by user')
  }, [])

  const isRequestPending = useCallback(() => {
    return controllerRef.current !== null && !controllerRef.current.signal.aborted
  }, [])

  return {
    makeRequest,
    cancelRequest,
    isRequestPending,
  }
}

/**
 * Hook for debounced cancellable requests (useful for search inputs)
 */
export function useDebouncedRequest<T>(
  requestFn: (value: string, signal: AbortSignal) => Promise<T>,
  delay: number = 300
) {
  const { makeRequest, cancelRequest } = useCancellableRequest()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedRequest = useCallback(async (value: string): Promise<T | null> => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Cancel previous request
    cancelRequest('New debounced request')

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await makeRequest((signal) => requestFn(value, signal))
          resolve(result)
        } catch (error) {
          resolve(null)
        }
      }, delay)
    })
  }, [makeRequest, cancelRequest, requestFn, delay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { debouncedRequest, cancelRequest }
}

export default useCancellableRequest
