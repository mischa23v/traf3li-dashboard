/**
 * Task Form Validation Hook
 *
 * Specialized validation hook for task creation/edit forms.
 * Uses the centralized useFormValidation hook with task-specific schema.
 * Includes XSS protection for text fields.
 */

import { useMemo, useCallback, useRef } from 'react'
import { useFormValidation, ValidationSchema } from '@/hooks/useFormValidation'
import { INPUT_MAX_LENGTHS } from '@/utils/validation-patterns'
import { isContentSafe, sanitizeHtml } from '@/utils/sanitize'

// ============================================================================
// Task Form Limits
// ============================================================================

export const TASK_FORM_LIMITS = {
  title: {
    min: 3,
    max: INPUT_MAX_LENGTHS.title, // 200
    warningThreshold: 80, // Show warning at 80% (160 chars)
  },
  description: {
    max: INPUT_MAX_LENGTHS.description, // 5000
    warningThreshold: 90,
  },
  tags: {
    maxCount: 10,
    maxTagLength: 30,
  },
  subtasks: {
    maxCount: 20,
    maxTitleLength: 200,
  },
}

// XSS Error Messages (bilingual)
const XSS_ERROR = {
  ar: 'المحتوى يحتوي على أكواد غير مسموحة',
  en: 'Content contains potentially unsafe code',
}

// ============================================================================
// Task Form Data Interface
// ============================================================================

export interface TaskFormData {
  title: string
  description: string
  status: string
  priority: string
  label: string
  tags: string[]
  dueDate: string
  dueTime: string
  startDate: string
  clientId: string
  caseId: string
  assignedTo: string
  estimatedMinutes: number
}

// ============================================================================
// XSS Validator
// ============================================================================

const xssValidator = (value: string): string | null => {
  if (!value || typeof value !== 'string') return null
  if (!isContentSafe(value)) {
    return XSS_ERROR.ar
  }
  return null
}

// ============================================================================
// Validation Schema
// ============================================================================

const createTaskValidationSchema = (): ValidationSchema => ({
  title: {
    required: true,
    minLength: TASK_FORM_LIMITS.title.min,
    maxLength: TASK_FORM_LIMITS.title.max,
    warningThreshold: TASK_FORM_LIMITS.title.warningThreshold,
    customValidator: xssValidator,
  },
  dueDate: {
    required: true,
    customValidator: (value: string) => {
      if (!value) return 'تاريخ الاستحقاق مطلوب'

      // Validate date format
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صحيح'
      }

      return null
    }
  },
  description: {
    maxLength: TASK_FORM_LIMITS.description.max,
    warningThreshold: TASK_FORM_LIMITS.description.warningThreshold,
    customValidator: xssValidator,
  },
  // Optional fields - no required validation
  status: {},
  priority: {},
  label: {},
  tags: {
    customValidator: (value: string[]) => {
      if (!value || !Array.isArray(value)) return null
      // Check each tag for XSS
      for (const tag of value) {
        if (!isContentSafe(tag)) {
          return XSS_ERROR.ar
        }
      }
      return null
    }
  },
  dueTime: {},
  startDate: {},
  clientId: {},
  caseId: {},
  assignedTo: {},
  estimatedMinutes: {},
})

// ============================================================================
// Hook
// ============================================================================

export function useTaskFormValidation(formData: TaskFormData) {
  // Ref to track first error field for scrolling
  const firstErrorRef = useRef<string | null>(null)

  // Memoize schema to prevent unnecessary re-renders
  const schema = useMemo(() => createTaskValidationSchema(), [])

  // Use the centralized validation hook
  const validation = useFormValidation<TaskFormData>(schema, formData)

  // Calculate character counts for fields that need them
  const titleCount = validation.getCharacterCount('title', formData.title)
  const descriptionCount = validation.getCharacterCount('description', formData.description)

  // Scroll to first error field
  const scrollToFirstError = useCallback((firstErrorField: string | null) => {
    if (!firstErrorField) return

    // Find the element by data-field attribute or id
    const element = document.querySelector(
      `[data-field="${firstErrorField}"], #${firstErrorField}, [name="${firstErrorField}"]`
    ) as HTMLElement | null

    if (element) {
      // Scroll with offset for header
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })

      // Focus the element after scrolling
      setTimeout(() => {
        element.focus()
      }, 300)
    }
  }, [])

  // Enhanced validate form with scroll-to-error
  const validateFormWithScroll = useCallback((data: TaskFormData) => {
    const result = validation.validateForm(data)

    if (!result.isValid && result.firstErrorField) {
      firstErrorRef.current = result.firstErrorField
      scrollToFirstError(result.firstErrorField)
    }

    return result
  }, [validation, scrollToFirstError])

  // Sanitize form data before submission
  const sanitizeFormData = useCallback((data: TaskFormData): TaskFormData => {
    return {
      ...data,
      title: sanitizeHtml(data.title),
      description: sanitizeHtml(data.description),
      tags: data.tags.map(tag => sanitizeHtml(tag)),
    }
  }, [])

  return {
    ...validation,
    // Override validateForm with scroll version
    validateForm: validateFormWithScroll,
    // Character counts
    titleCount,
    descriptionCount,
    // Limits for UI display
    limits: TASK_FORM_LIMITS,
    // Additional utilities
    scrollToFirstError,
    sanitizeFormData,
    firstErrorRef,
  }
}

export default useTaskFormValidation
