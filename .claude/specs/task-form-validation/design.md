# Task Form Validation - Technical Design

## Overview

This document outlines the technical architecture for implementing frontend validation on the task creation form (`/dashboard/tasks/new`). The implementation will re-enable and enhance the disabled validation functions, integrate existing sanitization utilities, and provide real-time user feedback.

## Current State Analysis

### Disabled Validation (create-task-view.tsx)
```typescript
// Lines 124-139 - DISABLED validation functions
const validateField = (_field: string, _value: any): string => {
    return '' // Always returns empty (no error)
}

const validateForm = (): boolean => {
    return true // Always passes
}
```

### Existing Infrastructure to Reuse

| Resource | Location | Purpose |
|----------|----------|---------|
| `sanitizeHtml()` | `src/utils/sanitize.ts` | Remove XSS payloads |
| `escapeHtml()` | `src/utils/sanitize.ts` | Escape HTML entities |
| `isContentSafe()` | `src/utils/sanitize.ts` | Detect dangerous patterns |
| `INPUT_MAX_LENGTHS` | `src/utils/validation-patterns.ts` | Standard length limits |
| `taskFormSchema` | `src/features/tasks/data/schema.ts` | Zod schema (minimal) |

## Architecture

### 1. Enhanced Zod Schema

Create a strict validation schema in `schema.ts`:

```typescript
// src/features/tasks/data/schema.ts - Enhanced taskFormSchema

import { z } from 'zod'
import { INPUT_MAX_LENGTHS } from '@/utils/validation-patterns'
import { isContentSafe } from '@/utils/sanitize'

// Custom refinement for XSS-safe content
const safeStringSchema = (minLength: number, maxLength: number, fieldName: string) =>
  z.string()
    .trim()
    .min(minLength, { message: `الحد الأدنى ${minLength} أحرف` })
    .max(maxLength, { message: `الحد الأقصى ${maxLength} حرف` })
    .refine(
      (val) => isContentSafe(val),
      { message: 'يحتوي على محتوى غير مسموح به' }
    )

// Tag validation schema
const tagSchema = z.string()
  .trim()
  .min(1, { message: 'الوسم مطلوب' })
  .max(30, { message: 'الحد الأقصى 30 حرف للوسم' })
  .regex(/^[\p{L}\p{N}\s_-]+$/u, { message: 'استخدم أحرف وأرقام فقط' })

export const taskFormSchemaStrict = z.object({
  // Required fields
  title: safeStringSchema(3, INPUT_MAX_LENGTHS.title, 'العنوان'),
  dueDate: z.string().min(1, { message: 'تاريخ الاستحقاق مطلوب' }),

  // Optional with validation
  description: z.string()
    .max(INPUT_MAX_LENGTHS.description, { message: `الحد الأقصى ${INPUT_MAX_LENGTHS.description} حرف` })
    .refine(
      (val) => !val || isContentSafe(val),
      { message: 'يحتوي على محتوى غير مسموح به' }
    )
    .optional()
    .default(''),

  // Tags array
  tags: z.array(tagSchema)
    .max(10, { message: 'الحد الأقصى 10 وسوم' })
    .optional()
    .default([]),

  // Estimated time
  estimatedMinutes: z.number()
    .min(0, { message: 'الوقت يجب أن يكون موجباً' })
    .max(9999, { message: 'القيمة كبيرة جداً' })
    .optional()
    .default(0),

  // Enum fields (safe - limited to options)
  status: taskStatusEnum.default('todo'),
  priority: taskPriorityEnum.default('medium'),
  taskType: taskTypeEnum.default('other'),
  label: taskLabelEnum.optional(),

  // Optional date/time
  dueTime: z.string().optional(),
  startDate: z.string().optional(),

  // Relational IDs (validated as ObjectId format)
  clientId: z.string().optional(),
  caseId: z.string().optional(),
  assignedTo: z.string().optional(),
})
```

### 2. Subtask Validation Schema

```typescript
export const subtaskInputSchema = z.object({
  id: z.string(),
  title: z.string()
    .trim()
    .min(1, { message: 'عنوان المهمة الفرعية مطلوب' })
    .max(INPUT_MAX_LENGTHS.title, { message: `الحد الأقصى ${INPUT_MAX_LENGTHS.title} حرف` })
    .refine(
      (val) => isContentSafe(val),
      { message: 'يحتوي على محتوى غير مسموح به' }
    ),
  autoReset: z.boolean().optional(),
})
```

### 3. Validation Hook

Create a custom hook for real-time validation:

```typescript
// src/features/tasks/hooks/useTaskFormValidation.ts

import { useState, useCallback } from 'react'
import { ZodError } from 'zod'
import { taskFormSchemaStrict, subtaskInputSchema } from '../data/schema'
import { sanitizeHtml, isContentSafe } from '@/utils/sanitize'

interface ValidationState {
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  warnings: Record<string, string>
}

export function useTaskFormValidation() {
  const [state, setState] = useState<ValidationState>({
    errors: {},
    touched: {},
    isValid: false,
    warnings: {},
  })

  // Validate single field on blur
  const validateField = useCallback((field: string, value: any): string => {
    try {
      const fieldSchema = taskFormSchemaStrict.shape[field]
      if (fieldSchema) {
        fieldSchema.parse(value)
      }
      return ''
    } catch (error) {
      if (error instanceof ZodError) {
        return error.errors[0]?.message || 'قيمة غير صالحة'
      }
      return 'قيمة غير صالحة'
    }
  }, [])

  // Check for dangerous content (warning only)
  const checkContentSafety = useCallback((field: string, value: string): string => {
    if (typeof value === 'string' && !isContentSafe(value)) {
      return 'تم اكتشاف محتوى قد يكون خطيراً - سيتم تنظيفه عند الحفظ'
    }
    return ''
  }, [])

  // Handle field blur
  const handleBlur = useCallback((field: string, value: any) => {
    const error = validateField(field, value)
    const warning = typeof value === 'string' ? checkContentSafety(field, value) : ''

    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: true },
      errors: { ...prev.errors, [field]: error },
      warnings: { ...prev.warnings, [field]: warning },
    }))
  }, [validateField, checkContentSafety])

  // Validate entire form before submission
  const validateForm = useCallback((formData: any, subtasks: any[]): boolean => {
    try {
      // Validate main form
      taskFormSchemaStrict.parse(formData)

      // Validate subtasks
      subtasks.forEach(subtask => {
        subtaskInputSchema.parse(subtask)
      })

      setState(prev => ({ ...prev, isValid: true, errors: {} }))
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach(err => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        setState(prev => ({ ...prev, isValid: false, errors }))
      }
      return false
    }
  }, [])

  // Sanitize form data before submission
  const sanitizeFormData = useCallback((formData: any, subtasks: any[]) => {
    return {
      ...formData,
      title: sanitizeHtml(formData.title || ''),
      description: sanitizeHtml(formData.description || ''),
      tags: formData.tags.map((tag: string) => sanitizeHtml(tag)),
    }
  }, [])

  return {
    errors: state.errors,
    touched: state.touched,
    warnings: state.warnings,
    isValid: state.isValid,
    validateField,
    handleBlur,
    validateForm,
    sanitizeFormData,
    clearError: (field: string) => {
      setState(prev => ({
        ...prev,
        errors: { ...prev.errors, [field]: '' },
      }))
    },
  }
}
```

### 4. Implementation in create-task-view.tsx

Replace the disabled validation with the new hook:

```typescript
// create-task-view.tsx changes

import { useTaskFormValidation } from '../hooks/useTaskFormValidation'
import { sanitizeHtml } from '@/utils/sanitize'

export function CreateTaskView() {
  // ... existing code ...

  // Replace the existing validation state with hook
  const {
    errors,
    touched,
    warnings,
    validateField,
    handleBlur,
    validateForm,
    sanitizeFormData,
    clearError,
  } = useTaskFormValidation()

  // Update handleChange to clear errors on input
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      clearError(field)
    }
  }

  // Update handleSubmit with sanitization
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!validateForm(formData, subtasks)) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]')
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Sanitize data before submission
    const sanitizedData = sanitizeFormData(formData, subtasks)
    const sanitizedSubtasks = subtasks.map(s => ({
      ...s,
      title: sanitizeHtml(s.title),
    }))

    const taskData = {
      ...sanitizedData,
      // ... rest of task data construction ...
    }

    createTaskMutation.mutate(taskData, {
      onSuccess: () => {
        navigate({ to: ROUTES.dashboard.tasks.list })
      }
    })
  }
}
```

### 5. Visual Feedback Components

Add visual indicators for validation states:

```typescript
// Validation state indicator for inputs
const getFieldClassName = (field: string) => {
  const hasError = touched[field] && errors[field]
  const hasWarning = touched[field] && warnings[field]
  const isValid = touched[field] && !errors[field] && !warnings[field]

  return cn(
    "rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500",
    hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
    hasWarning && "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500/20",
    isValid && "border-green-500",
  )
}

// Character counter component
const CharacterCount = ({ current, max }: { current: number; max: number }) => {
  const remaining = max - current
  const isNearLimit = remaining < max * 0.1
  const isOverLimit = remaining < 0

  return (
    <span className={cn(
      "text-xs",
      isOverLimit && "text-red-500",
      isNearLimit && !isOverLimit && "text-yellow-500",
      !isNearLimit && "text-slate-400"
    )}>
      {remaining} حرف متبقي
    </span>
  )
}
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Input                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              handleChange() - Clear existing error               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│       handleBlur() - Validate field + Check content safety       │
│                                                                  │
│  ┌─────────────────┐    ┌──────────────────┐                    │
│  │ validateField() │    │ isContentSafe()  │                    │
│  │ (Zod schema)    │    │ (XSS detection)  │                    │
│  └─────────────────┘    └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Display Error/Warning/Valid State                   │
│                                                                  │
│  • Red border + error message (validation failed)                │
│  • Yellow border + warning (XSS detected)                        │
│  • Green border (valid)                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (on submit)
┌─────────────────────────────────────────────────────────────────┐
│                    validateForm()                                │
│                                                                  │
│  • Check all required fields                                     │
│  • Validate all field constraints                                │
│  • Return false + scroll to first error if invalid               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (if valid)
┌─────────────────────────────────────────────────────────────────┐
│                 sanitizeFormData()                               │
│                                                                  │
│  • sanitizeHtml(title)                                          │
│  • sanitizeHtml(description)                                     │
│  • sanitizeHtml(each tag)                                        │
│  • sanitizeHtml(each subtask.title)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Submit to Backend API                           │
└─────────────────────────────────────────────────────────────────┘
```

## Error Messages (Arabic)

| Field | Validation | Error Message |
|-------|------------|---------------|
| title | Required | عنوان المهمة مطلوب |
| title | Min length (3) | الحد الأدنى 3 أحرف |
| title | Max length (200) | الحد الأقصى 200 حرف |
| title | XSS detected | يحتوي على محتوى غير مسموح به |
| description | Max length (5000) | الحد الأقصى 5000 حرف |
| dueDate | Required | تاريخ الاستحقاق مطلوب |
| tags | Max per tag (30) | الحد الأقصى 30 حرف للوسم |
| tags | Max count (10) | الحد الأقصى 10 وسوم |
| tags | Invalid chars | استخدم أحرف وأرقام فقط |
| tags | Duplicate | الوسم موجود مسبقاً |
| estimatedMinutes | Negative | الوقت يجب أن يكون موجباً |
| estimatedMinutes | Too large | القيمة كبيرة جداً |
| subtask.title | Max length (200) | الحد الأقصى 200 حرف |

## Files to Modify

| File | Changes |
|------|---------|
| `src/features/tasks/data/schema.ts` | Add `taskFormSchemaStrict`, `subtaskInputSchema` |
| `src/features/tasks/hooks/useTaskFormValidation.ts` | New file - validation hook |
| `src/features/tasks/components/create-task-view.tsx` | Replace disabled validation, add visual feedback |

## Testing Checklist

- [ ] Empty title shows "عنوان المهمة مطلوب"
- [ ] Title with `<script>` shows security warning
- [ ] Title > 200 chars shows length error
- [ ] Title < 3 chars shows minimum error
- [ ] Empty due date shows "تاريخ الاستحقاق مطلوب"
- [ ] Description > 5000 chars shows length error
- [ ] Tag with special chars shows "استخدم أحرف وأرقام فقط"
- [ ] Tag > 30 chars shows length error
- [ ] More than 10 tags shows count error
- [ ] Duplicate tag shows warning
- [ ] Negative estimated time shows error
- [ ] Estimated time > 9999 shows error
- [ ] Subtask with XSS is sanitized on add
- [ ] Form doesn't submit with validation errors
- [ ] Form scrolls to first error on submit
- [ ] Valid form data is sanitized before API call

## Security Considerations

1. **Defense in Depth**: Frontend validation is UX improvement, not security. Backend MUST validate independently.
2. **Sanitization**: Apply `sanitizeHtml()` to all text fields before submission.
3. **Content Safety**: Use `isContentSafe()` for early warning, but always sanitize.
4. **No Client-Side Bypass**: Validation can be bypassed; rely on backend for security.
