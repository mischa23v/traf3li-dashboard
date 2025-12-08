/**
 * Custom Hook for API Error Handling
 * Provides consistent error handling across the application
 * Supports validation errors, request IDs, and error modals
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import type { ApiError } from '@/lib/api'

export interface ValidationError {
  field: string
  message: string
}

interface ErrorState {
  message: string
  status?: number
  validationErrors: ValidationError[]
  requestId?: string
  showErrorModal: boolean
}

const initialErrorState: ErrorState = {
  message: '',
  status: undefined,
  validationErrors: [],
  requestId: undefined,
  showErrorModal: false,
}

/**
 * Custom hook for handling API errors consistently
 * @returns Object containing error state and handlers
 *
 * @example
 * ```tsx
 * const { handleApiError, validationErrors, ErrorDisplay } = useApiError()
 *
 * const onSubmit = async (data) => {
 *   try {
 *     await api.post('/leads', data)
 *   } catch (err) {
 *     handleApiError(err)
 *   }
 * }
 *
 * return (
 *   <form>
 *     <ErrorDisplay />
 *     {/* form fields *\/}
 *   </form>
 * )
 * ```
 */
export const useApiError = () => {
  const [errorState, setErrorState] = useState<ErrorState>(initialErrorState)

  /**
   * Extract error information from various error types
   */
  const extractErrorInfo = useCallback((error: unknown): Partial<ErrorState> => {
    // Handle ApiError format (from our api.ts)
    if (error && typeof error === 'object' && 'error' in error) {
      const apiError = error as ApiError
      return {
        message: apiError.message || 'حدث خطأ غير متوقع',
        status: apiError.status,
        validationErrors: apiError.errors || [],
        requestId: apiError.requestId,
      }
    }

    // Handle AxiosError
    if (error instanceof AxiosError) {
      const data = error.response?.data as any
      return {
        message: data?.message || error.message || 'حدث خطأ غير متوقع',
        status: error.response?.status,
        validationErrors: data?.errors || [],
        requestId: data?.requestId || error.response?.headers?.['x-request-id'],
      }
    }

    // Handle generic Error
    if (error instanceof Error) {
      return {
        message: error.message || 'حدث خطأ غير متوقع',
        validationErrors: [],
      }
    }

    // Handle string errors
    if (typeof error === 'string') {
      return {
        message: error,
        validationErrors: [],
      }
    }

    // Unknown error type
    return {
      message: 'حدث خطأ غير متوقع',
      validationErrors: [],
    }
  }, [])

  /**
   * Format seconds to human-readable time in Arabic
   */
  const formatSeconds = useCallback((seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} ثانية`
    }
    const minutes = Math.ceil(seconds / 60)
    if (minutes < 60) {
      return `${minutes} دقيقة`
    }
    const hours = Math.ceil(minutes / 60)
    return `${hours} ساعة`
  }, [])

  /**
   * Handle API errors with appropriate user feedback
   * Automatically shows toast for common errors (429, 500, network)
   * Sets state for validation errors (400) and other errors
   */
  const handleApiError = useCallback((error: unknown) => {
    const errorInfo = extractErrorInfo(error)
    const status = errorInfo.status
    const message = errorInfo.message || 'حدث خطأ غير متوقع'

    // Handle 429 Rate Limiting - Show toast
    if (status === 429) {
      const retryAfter = 60 // Default to 60 seconds
      toast.error(`طلبات كثيرة جداً. يرجى الانتظار ${formatSeconds(retryAfter)}.`, {
        description: 'حاول مرة أخرى لاحقاً',
        duration: 5000,
      })
      setErrorState({
        ...initialErrorState,
        message,
        status,
        requestId: errorInfo.requestId,
      })
      return
    }

    // Handle 500 Server Errors - Show toast
    if (status && status >= 500) {
      toast.error(message, {
        description: errorInfo.requestId ? `معرّف الطلب: ${errorInfo.requestId}` : undefined,
        duration: 5000,
      })
      setErrorState({
        ...initialErrorState,
        message,
        status,
        requestId: errorInfo.requestId,
      })
      return
    }

    // Handle Network Errors - Show toast
    if (status === 0 || message.includes('Network Error') || message.includes('الاتصال بالخادم')) {
      toast.error('لا يمكن الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.', {
        duration: 5000,
      })
      setErrorState({
        ...initialErrorState,
        message: 'لا يمكن الاتصال بالخادم',
        status: 0,
      })
      return
    }

    // Handle 400 Validation Errors - Set state for display
    if (status === 400 && errorInfo.validationErrors && errorInfo.validationErrors.length > 0) {
      setErrorState({
        message,
        status,
        validationErrors: errorInfo.validationErrors,
        requestId: errorInfo.requestId,
        showErrorModal: false,
      })
      return
    }

    // Handle other errors - Show in modal
    setErrorState({
      message,
      status,
      validationErrors: [],
      requestId: errorInfo.requestId,
      showErrorModal: true,
    })
  }, [extractErrorInfo, formatSeconds])

  /**
   * Clear all error state
   */
  const clearError = useCallback(() => {
    setErrorState(initialErrorState)
  }, [])

  /**
   * Close error modal
   */
  const closeErrorModal = useCallback(() => {
    setErrorState((prev) => ({
      ...prev,
      showErrorModal: false,
    }))
  }, [])

  return {
    // Error state
    error: errorState.message,
    validationErrors: errorState.validationErrors,
    requestId: errorState.requestId,
    showErrorModal: errorState.showErrorModal,
    status: errorState.status,

    // Handlers
    handleApiError,
    clearError,
    closeErrorModal,
  }
}

export default useApiError
