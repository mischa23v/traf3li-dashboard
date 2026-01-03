/**
 * Task Form Validation Hook
 *
 * Specialized validation hook for task creation/edit forms.
 * Uses the centralized useFormValidation hook with task-specific schema.
 */

import { useMemo } from 'react'
import { useFormValidation, ValidationSchema } from '@/hooks/useFormValidation'
import { INPUT_MAX_LENGTHS } from '@/utils/validation-patterns'

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
// Validation Schema
// ============================================================================

const createTaskValidationSchema = (): ValidationSchema => ({
  title: {
    required: true,
    minLength: TASK_FORM_LIMITS.title.min,
    maxLength: TASK_FORM_LIMITS.title.max,
    warningThreshold: TASK_FORM_LIMITS.title.warningThreshold,
  },
  dueDate: {
    required: true,
    customValidator: (value: string) => {
      if (!value) return 'تاريخ الاستحقاق مطلوب'

      // Validate date format and ensure it's not in the past
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return 'تاريخ غير صحيح'
      }

      // Note: We allow past dates for flexibility, but you could add:
      // const today = new Date()
      // today.setHours(0, 0, 0, 0)
      // if (date < today) return 'لا يمكن اختيار تاريخ في الماضي'

      return null
    }
  },
  description: {
    maxLength: TASK_FORM_LIMITS.description.max,
    warningThreshold: TASK_FORM_LIMITS.description.warningThreshold,
  },
  // Optional fields - no required validation
  status: {},
  priority: {},
  label: {},
  tags: {},
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
  // Memoize schema to prevent unnecessary re-renders
  const schema = useMemo(() => createTaskValidationSchema(), [])

  // Use the centralized validation hook
  const validation = useFormValidation<TaskFormData>(schema, formData)

  // Calculate character counts for fields that need them
  const titleCount = validation.getCharacterCount('title', formData.title)
  const descriptionCount = validation.getCharacterCount('description', formData.description)

  return {
    ...validation,
    // Character counts
    titleCount,
    descriptionCount,
    // Limits for UI display
    limits: TASK_FORM_LIMITS,
  }
}

export default useTaskFormValidation
