/**
 * ErrorDisplay Component
 * Unified component that displays ValidationErrors or ErrorModal based on error type
 * Designed to work seamlessly with useApiError hook
 */

import { ValidationErrors } from './ValidationErrors'
import { ErrorModal } from './ErrorModal'

interface ValidationError {
  field: string
  message: string
}

interface ErrorDisplayProps {
  validationErrors?: ValidationError[]
  showErrorModal?: boolean
  errorMessage?: string
  requestId?: string
  status?: number
  onCloseModal?: () => void
  className?: string
}

export const ErrorDisplay = ({
  validationErrors = [],
  showErrorModal = false,
  errorMessage = '',
  requestId,
  status,
  onCloseModal,
  className,
}: ErrorDisplayProps) => {
  return (
    <>
      {/* Show validation errors inline */}
      {validationErrors.length > 0 && (
        <ValidationErrors errors={validationErrors} className={className} />
      )}

      {/* Show error modal */}
      {showErrorModal && errorMessage && (
        <ErrorModal
          open={showErrorModal}
          onClose={onCloseModal || (() => {})}
          message={errorMessage}
          requestId={requestId}
          status={status}
        />
      )}
    </>
  )
}

export default ErrorDisplay
