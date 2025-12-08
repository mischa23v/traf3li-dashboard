import { AxiosError } from 'axios'
import { toast } from 'sonner'

interface ServerError {
  status?: number
  message?: string
  requestId?: string
  errors?: Array<{ field: string; message: string }>
  retryAfter?: number
}

/**
 * Handle server errors with proper user feedback
 * Supports rate limiting, validation errors, and request correlation IDs
 */
export function handleServerError(error: unknown) {
  let errMsg = 'حدث خطأ غير متوقع'
  let description: string | undefined
  let requestId: string | undefined

  // Handle 204 No Content
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'المحتوى غير موجود'
    toast.error(errMsg)
    return
  }

  // Handle Axios errors
  if (error instanceof AxiosError) {
    const data = error.response?.data as ServerError | undefined
    errMsg = data?.message || error.message || 'حدث خطأ غير متوقع'
    requestId = data?.requestId

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after'] || '60', 10)
      errMsg = `طلبات كثيرة جداً. يرجى الانتظار ${formatSeconds(retryAfter)}.`
    }

    // Handle validation errors
    if (data?.errors && data.errors.length > 0) {
      description = data.errors.map(e => e.message).join('\n')
    }
  }

  // Handle our custom API error format
  if (
    error &&
    typeof error === 'object' &&
    'message' in error
  ) {
    const serverError = error as ServerError
    errMsg = serverError.message || errMsg
    requestId = serverError.requestId

    if (serverError.errors && serverError.errors.length > 0) {
      description = serverError.errors.map(e => e.message).join('\n')
    }
  }

  // Show toast with optional description and requestId
  toast.error(errMsg, {
    description: description || (requestId ? `Reference: ${requestId}` : undefined),
    duration: 5000,
  })
}

/**
 * Format seconds to Arabic human-readable time
 */
function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} ثانية`
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `${minutes} دقيقة`
  }
  const hours = Math.ceil(minutes / 60)
  return `${hours} ساعة`
}

/**
 * Map validation errors to form fields
 * @param errors - Array of field validation errors
 * @param setError - React Hook Form setError function
 */
export function mapValidationErrors(
  errors: Array<{ field: string; message: string }>,
  setError: (field: string, error: { message: string }) => void
) {
  errors.forEach((err) => {
    setError(err.field, { message: err.message })
  })
}

/**
 * Extract requestId from error for support tickets
 */
export function getRequestId(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    if ('requestId' in error) {
      return (error as ServerError).requestId
    }
    if (error instanceof AxiosError && error.response?.data?.requestId) {
      return error.response.data.requestId
    }
  }
  return undefined
}
