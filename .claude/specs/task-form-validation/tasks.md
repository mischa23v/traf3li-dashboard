# Task Form Validation - Implementation Tasks

## Phase 1: Schema Enhancement

### Task 1.1: Add Strict Task Form Schema
**File:** `src/features/tasks/data/schema.ts`

- [ ] Import `INPUT_MAX_LENGTHS` from `@/utils/validation-patterns`
- [ ] Import `isContentSafe` from `@/utils/sanitize`
- [ ] Create `safeStringSchema` helper for XSS-safe text validation
- [ ] Create `tagSchema` for individual tag validation (alphanumeric, max 30 chars)
- [ ] Create `taskFormSchemaStrict` with:
  - [ ] `title`: required, min 3, max 200, XSS-safe
  - [ ] `dueDate`: required string (non-empty)
  - [ ] `description`: optional, max 5000, XSS-safe
  - [ ] `tags`: optional array, max 10 items, each tag validated
  - [ ] `estimatedMinutes`: optional, min 0, max 9999
  - [ ] Enum fields with defaults (status, priority, taskType, label)
  - [ ] Optional date/time fields (dueTime, startDate)
  - [ ] Optional relational IDs (clientId, caseId, assignedTo)
- [ ] Create `subtaskInputSchema` with:
  - [ ] `id`: string
  - [ ] `title`: required, max 200, XSS-safe
  - [ ] `autoReset`: optional boolean
- [ ] Export both new schemas

**Verification:**
```bash
npm run build
```

---

### Task 1.2: Create Validation Hook
**File:** `src/features/tasks/hooks/useTaskFormValidation.ts` (NEW)

- [ ] Create new file with hook implementation
- [ ] Implement `ValidationState` interface
- [ ] Implement `validateField()` - validate single field with Zod
- [ ] Implement `checkContentSafety()` - detect XSS patterns (warning only)
- [ ] Implement `handleBlur()` - update touched/errors/warnings state
- [ ] Implement `validateForm()` - validate entire form + subtasks
- [ ] Implement `sanitizeFormData()` - apply sanitizeHtml to text fields
- [ ] Implement `clearError()` - clear error for specific field
- [ ] Return all state and functions from hook
- [ ] Add proper TypeScript types

**Verification:**
```bash
npm run build
```

---

## Phase 2: Form Component Updates

### Task 2.1: Integrate Validation Hook
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Import `useTaskFormValidation` hook
- [ ] Import `sanitizeHtml` from `@/utils/sanitize`
- [ ] Remove old `errors` and `touched` useState (lines 121-122)
- [ ] Remove disabled `validateField` function (lines 124-127)
- [ ] Remove disabled `validateForm` function (lines 136-139)
- [ ] Add hook destructuring at component top
- [ ] Update `handleChange` to clear errors on input
- [ ] Keep existing `handleBlur` but integrate with hook

**Verification:**
- Build passes
- No TypeScript errors

---

### Task 2.2: Update Title Field
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Add `data-error` attribute for scroll-to-error
- [ ] Add warning display for XSS detection
- [ ] Add character counter component
- [ ] Update className to use validation state styling

**Verification:**
- Empty title shows error on blur
- XSS input shows warning
- Character count displays

---

### Task 2.3: Update Due Date Field
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Add `data-error` attribute
- [ ] Update className for error state
- [ ] Add onBlur handler

**Verification:**
- Empty due date shows error on blur

---

### Task 2.4: Update Description Field
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Add character counter (current / 5000)
- [ ] Add warning display for XSS detection
- [ ] Add `data-error` attribute
- [ ] Add onBlur handler

**Verification:**
- Character counter shows remaining
- XSS input shows warning
- Long text shows limit error

---

### Task 2.5: Update Tags Input
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Validate tag before adding (length, characters, duplicate)
- [ ] Show inline error if tag invalid
- [ ] Prevent adding if > 10 tags
- [ ] Sanitize tag content on add
- [ ] Add visual feedback for validation

**Verification:**
- Invalid tag shows error
- Duplicate tag shows warning
- Tags > 10 blocked
- XSS in tag is sanitized

---

### Task 2.6: Update Estimated Time Field
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Add validation for negative values
- [ ] Add validation for max value (9999)
- [ ] Round decimals to integer
- [ ] Add onBlur handler

**Verification:**
- Negative value shows error
- Value > 9999 shows error

---

### Task 2.7: Update Subtasks Input
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Validate subtask title before adding
- [ ] Sanitize subtask title on add
- [ ] Show error if title empty/invalid
- [ ] Add length validation (max 200)

**Verification:**
- Empty subtask not added
- XSS in subtask is sanitized
- Long title shows error

---

### Task 2.8: Update Form Submit Handler
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Call `validateForm()` before submission
- [ ] Scroll to first error if validation fails
- [ ] Call `sanitizeFormData()` before API call
- [ ] Sanitize subtasks before including in payload

**Verification:**
- Invalid form doesn't submit
- Scrolls to first error
- API receives sanitized data

---

## Phase 3: Visual Feedback

### Task 3.1: Add Validation State Styling
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Create `getFieldClassName()` helper function
- [ ] Red border for errors
- [ ] Yellow border for warnings
- [ ] Green border for valid (touched + no error)
- [ ] Apply to all input fields

**Verification:**
- Visual states display correctly
- RTL layout maintained

---

### Task 3.2: Add Character Counter Component
**File:** `src/features/tasks/components/create-task-view.tsx`

- [ ] Create inline `CharacterCount` component
- [ ] Show remaining characters
- [ ] Yellow when < 10% remaining
- [ ] Red when over limit
- [ ] Add to title and description fields

**Verification:**
- Counter updates on input
- Colors change at thresholds

---

## Phase 4: Testing

### Task 4.1: Manual Testing
- [ ] Test empty form submission (should fail)
- [ ] Test title: empty, too short, too long, XSS
- [ ] Test due date: empty
- [ ] Test description: too long, XSS
- [ ] Test tags: special chars, too long, too many, duplicate
- [ ] Test estimated time: negative, too large
- [ ] Test subtasks: empty, XSS
- [ ] Test valid form submission (should succeed)
- [ ] Test Arabic RTL layout
- [ ] Test English LTR layout

### Task 4.2: Build Verification
```bash
npm run build
npm run lint
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1.1 - 1.2 | Schema + Hook |
| 2 | 2.1 - 2.8 | Form Integration |
| 3 | 3.1 - 3.2 | Visual Feedback |
| 4 | 4.1 - 4.2 | Testing |

**Estimated Total Tasks:** 12 implementation tasks + testing

## Dependencies

- Existing: `sanitize.ts`, `validation-patterns.ts`, `schema.ts`
- No new packages required
- No backend changes required (frontend only)
