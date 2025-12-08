/**
 * useApiError Hook Helpers
 * Helper components for convenient error display with useApiError hook
 */

import React from 'react'
import { ErrorDisplay as ErrorDisplayComponent } from '@/components/error-display'
import type { useApiError } from './useApiError'

type UseApiErrorReturn = ReturnType<typeof useApiError>

interface ErrorDisplayWrapperProps {
  errorState: Pick<
    UseApiErrorReturn,
    'validationErrors' | 'showErrorModal' | 'error' | 'requestId' | 'status' | 'closeErrorModal'
  >
  className?: string
}

/**
 * ErrorDisplay component wrapper that works with useApiError hook
 *
 * @example
 * ```tsx
 * import { useApiError } from '@/hooks/useApiError'
 * import { ErrorDisplayWrapper } from '@/hooks/useApiError.helpers'
 *
 * const MyComponent = () => {
 *   const errorState = useApiError()
 *
 *   return (
 *     <form>
 *       <ErrorDisplayWrapper errorState={errorState} />
 *       {/* form fields *\/}
 *     </form>
 *   )
 * }
 * ```
 */
export const ErrorDisplayWrapper: React.FC<ErrorDisplayWrapperProps> = ({
  errorState,
  className,
}) => {
  return (
    <ErrorDisplayComponent
      validationErrors={errorState.validationErrors}
      showErrorModal={errorState.showErrorModal}
      errorMessage={errorState.error}
      requestId={errorState.requestId}
      status={errorState.status}
      onCloseModal={errorState.closeErrorModal}
      className={className}
    />
  )
}

/**
 * Create a hook that returns ErrorDisplay component bound to error state
 * This provides a more convenient API similar to the original design
 *
 * @example
 * ```tsx
 * import { useApiError } from '@/hooks/useApiError'
 * import { useErrorDisplay } from '@/hooks/useApiError.helpers'
 *
 * const MyComponent = () => {
 *   const errorState = useApiError()
 *   const ErrorDisplay = useErrorDisplay(errorState)
 *
 *   return (
 *     <form>
 *       <ErrorDisplay />
 *       {/* form fields *\/}
 *     </form>
 *   )
 * }
 * ```
 */
export const useErrorDisplay = (errorState: UseApiErrorReturn) => {
  return React.useCallback(
    ({ className }: { className?: string } = {}) => (
      <ErrorDisplayWrapper errorState={errorState} className={className} />
    ),
    [errorState]
  )
}
