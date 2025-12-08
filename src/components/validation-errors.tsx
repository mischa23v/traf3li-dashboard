import { useTranslation } from 'react-i18next'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ValidationError {
  field: string
  message: string
}

interface ValidationErrorsProps {
  errors?: ValidationError[] | null
  className?: string
}

export function ValidationErrors({ errors, className }: ValidationErrorsProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // Return null if no errors
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'rounded-xl border border-red-200 bg-red-50 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
        <div className="flex-1 space-y-2">
          {/* Title */}
          <h3 className="font-semibold text-red-900">
            {isRTL ? 'خطأ في البيانات' : 'Validation Errors'}
          </h3>

          {/* Error list */}
          <ul className={cn(
            'space-y-1.5 text-sm text-red-700',
            isRTL ? 'pr-0' : 'pl-0'
          )}>
            {errors.map((error, index) => (
              <li
                key={`${error.field}-${index}`}
                className="flex items-start gap-2"
              >
                <span className="text-red-500 font-medium flex-shrink-0">•</span>
                <span>
                  <span className="font-medium">{error.field}:</span>{' '}
                  {error.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
