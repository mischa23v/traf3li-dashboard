/**
 * ValidationErrors Component
 * Displays field validation errors from API responses
 */

import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ValidationError {
  field: string
  message: string
}

interface ValidationErrorsProps {
  errors: ValidationError[]
  className?: string
}

export const ValidationErrors = ({ errors, className }: ValidationErrorsProps) => {
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>أخطاء التحقق</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index}>
              <strong>{error.field}:</strong> {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}

export default ValidationErrors
