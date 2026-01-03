/**
 * Centralized Form Validation Hook
 *
 * A reusable hook for form validation that provides:
 * - Field-level validation with touched state tracking
 * - Form-level validation for submit
 * - Character counting with warnings
 * - Async-safe state management
 *
 * Uses validation utilities from @/utils/validation-patterns
 */

import { useState, useCallback, useMemo } from 'react'
import { INPUT_MAX_LENGTHS } from '@/utils/validation-patterns'

// ============================================================================
// Types
// ============================================================================

export interface FieldConfig {
  required?: boolean
  minLength?: number
  maxLength?: number
  warningThreshold?: number // Percentage (0-100) at which to show warning
  pattern?: RegExp
  customValidator?: (value: any, formData: Record<string, any>) => string | null
}

export interface ValidationSchema {
  [fieldName: string]: FieldConfig
}

export interface CharacterCount {
  current: number
  max: number
  remaining: number
  isWarning: boolean
  isError: boolean
}

export interface ValidationState {
  errors: Record<string, string>
  warnings: Record<string, string>
  touched: Record<string, boolean>
}

export interface UseFormValidationReturn<T> {
  // State
  errors: Record<string, string>
  warnings: Record<string, string>
  touched: Record<string, boolean>

  // Actions
  validateField: (field: keyof T, value: any) => string
  validateForm: (formData: T) => { isValid: boolean; firstErrorField: string | null }
  handleBlur: (field: keyof T) => void
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void
  setAllTouched: () => void
  resetValidation: () => void
  clearFieldError: (field: keyof T) => void

  // Character counting
  getCharacterCount: (field: keyof T, value: string) => CharacterCount

  // Helpers
  isFieldValid: (field: keyof T) => boolean
  hasErrors: boolean
}

// ============================================================================
// Default Error Messages (Arabic)
// ============================================================================

const DEFAULT_MESSAGES = {
  required: 'هذا الحقل مطلوب',
  minLength: (min: number) => `يجب أن يكون على الأقل ${min} أحرف`,
  maxLength: (max: number) => `يجب ألا يتجاوز ${max} حرف`,
  pattern: 'صيغة غير صحيحة',
  warningNearLimit: (remaining: number) => `${remaining} حرف متبقي`,
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useFormValidation<T extends Record<string, any>>(
  schema: ValidationSchema,
  formData: T
): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Validate a single field
  const validateField = useCallback((field: keyof T, value: any): string => {
    const config = schema[field as string]
    if (!config) return ''

    // Required check
    if (config.required) {
      if (value === undefined || value === null || value === '') {
        return DEFAULT_MESSAGES.required
      }
      if (typeof value === 'string' && value.trim() === '') {
        return DEFAULT_MESSAGES.required
      }
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return ''
    }

    // Min length check
    if (config.minLength && typeof value === 'string') {
      if (value.trim().length < config.minLength) {
        return DEFAULT_MESSAGES.minLength(config.minLength)
      }
    }

    // Max length check
    if (config.maxLength && typeof value === 'string') {
      if (value.length > config.maxLength) {
        return DEFAULT_MESSAGES.maxLength(config.maxLength)
      }
    }

    // Pattern check
    if (config.pattern && typeof value === 'string') {
      if (!config.pattern.test(value)) {
        return DEFAULT_MESSAGES.pattern
      }
    }

    // Custom validator
    if (config.customValidator) {
      const customError = config.customValidator(value, formData)
      if (customError) return customError
    }

    return ''
  }, [schema, formData])

  // Calculate warning for a field (near character limit)
  const calculateWarning = useCallback((field: keyof T, value: string): string => {
    const config = schema[field as string]
    if (!config?.maxLength || !config.warningThreshold) return ''

    const threshold = Math.floor(config.maxLength * (config.warningThreshold / 100))
    const remaining = config.maxLength - value.length

    if (value.length >= threshold && remaining > 0) {
      return DEFAULT_MESSAGES.warningNearLimit(remaining)
    }

    return ''
  }, [schema])

  // Validate entire form
  const validateForm = useCallback((data: T): { isValid: boolean; firstErrorField: string | null } => {
    const newErrors: Record<string, string> = {}
    const newTouched: Record<string, boolean> = {}
    let firstErrorField: string | null = null

    // Validate all fields in schema
    Object.keys(schema).forEach(field => {
      newTouched[field] = true
      const error = validateField(field as keyof T, data[field])
      if (error) {
        newErrors[field] = error
        if (!firstErrorField) {
          firstErrorField = field
        }
      }
    })

    setErrors(newErrors)
    setTouched(newTouched)

    return {
      isValid: Object.keys(newErrors).length === 0,
      firstErrorField
    }
  }, [schema, validateField])

  // Handle field blur
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const value = formData[field]

    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))

    // Calculate warning if no error
    if (!error && typeof value === 'string') {
      const warning = calculateWarning(field, value)
      setWarnings(prev => ({ ...prev, [field]: warning }))
    } else {
      setWarnings(prev => ({ ...prev, [field]: '' }))
    }
  }, [formData, validateField, calculateWarning])

  // Set a field as touched
  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }))
  }, [])

  // Set all fields as touched
  const setAllTouched = useCallback(() => {
    const allTouched: Record<string, boolean> = {}
    Object.keys(schema).forEach(field => {
      allTouched[field] = true
    })
    setTouched(allTouched)
  }, [schema])

  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({})
    setWarnings({})
    setTouched({})
  }, [])

  // Clear error for a specific field
  const clearFieldError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field as string]
      return newErrors
    })
  }, [])

  // Get character count for a field
  const getCharacterCount = useCallback((field: keyof T, value: string): CharacterCount => {
    const config = schema[field as string]
    const max = config?.maxLength || INPUT_MAX_LENGTHS.title

    return {
      current: value.length,
      max,
      remaining: max - value.length,
      isWarning: config?.warningThreshold
        ? value.length >= Math.floor(max * (config.warningThreshold / 100)) && value.length < max
        : false,
      isError: value.length > max
    }
  }, [schema])

  // Check if a field is valid
  const isFieldValid = useCallback((field: keyof T): boolean => {
    return touched[field as string] && !errors[field as string]
  }, [touched, errors])

  // Check if form has any errors
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== '')
  }, [errors])

  return {
    errors,
    warnings,
    touched,
    validateField,
    validateForm,
    handleBlur,
    setFieldTouched,
    setAllTouched,
    resetValidation,
    clearFieldError,
    getCharacterCount,
    isFieldValid,
    hasErrors
  }
}

export default useFormValidation
