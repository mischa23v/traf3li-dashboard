# Task Form Validation - Requirements

## Problem Statement

The task creation form (`/dashboard/tasks/new`) has **no frontend validation enabled**. Testing revealed:
- Form submits without checking required fields
- XSS payloads accepted in title, description, tags, and subtasks fields
- Negative numbers accepted in estimated time field
- No input sanitization before submission
- Validation code exists but is explicitly disabled (lines 125-128, 137-139 in `create-task-view.tsx`)

This creates security vulnerabilities (XSS, injection) and poor user experience (backend errors instead of helpful validation messages).

## Target Users
- Primary: Lawyers and legal staff creating tasks
- Secondary: System administrators monitoring for security issues

## Existing Infrastructure

The codebase already has:
- **Zod schemas**: `src/features/tasks/data/schema.ts` - Task schemas defined but not enforced
- **Sanitization utilities**: `src/utils/sanitize.ts` - `escapeHtml`, `sanitizeHtml`, `isContentSafe`
- **Validation patterns**: `src/utils/validation-patterns.ts` - Regex patterns
- **Zod validators**: `src/lib/zod-validators.ts` - Saudi-specific validators
- **Form schema**: `taskFormSchema` in schema.ts (lines 402-428) - Minimal validation

## User Stories

### 1. Required Field Validation
As a lawyer, I want to see clear errors when I miss required fields so that I can complete the form correctly.

**Acceptance Criteria:**
1. WHEN user clicks "Save Task" AND title is empty THEN the system SHALL display "عنوان المهمة مطلوب" error below the title field
2. WHEN user clicks "Save Task" AND dueDate is empty THEN the system SHALL display "تاريخ الاستحقاق مطلوب" error below the date field
3. WHEN required field has error THEN the system SHALL add red border to the field
4. WHEN user focuses on errored field and types THEN the system SHALL clear the error message
5. WHEN form has validation errors THEN the system SHALL NOT submit to backend
6. WHEN form has validation errors THEN the system SHALL scroll to first error field

### 2. Title Field Validation
As a lawyer, I want the title field to reject dangerous content so that the system stays secure.

**Acceptance Criteria:**
1. WHEN title contains `<script>` tags THEN the system SHALL sanitize/remove them before saving
2. WHEN title exceeds 200 characters THEN the system SHALL display "الحد الأقصى 200 حرف" error
3. WHEN title is less than 3 characters THEN the system SHALL display "الحد الأدنى 3 أحرف" error
4. WHEN title contains only whitespace THEN the system SHALL treat it as empty (required error)
5. WHEN title is valid THEN the system SHALL show green checkmark indicator

### 3. Description Field Validation
As a lawyer, I want to enter rich descriptions while staying protected from XSS attacks.

**Acceptance Criteria:**
1. WHEN description contains `<script>`, `<iframe>`, `onerror=` THEN the system SHALL sanitize them
2. WHEN description exceeds 5000 characters THEN the system SHALL display character limit error
3. WHEN description is entered THEN the system SHALL display remaining character count
4. IF description contains detected dangerous patterns THEN the system SHALL show warning icon (but allow submission after sanitization)

### 4. Tags Field Validation
As a lawyer, I want to add meaningful tags without security risks.

**Acceptance Criteria:**
1. WHEN tag contains special characters like `'; --` or `<>` THEN the system SHALL reject with "استخدم أحرف وأرقام فقط" error
2. WHEN single tag exceeds 30 characters THEN the system SHALL display "الحد الأقصى 30 حرف للوسم" error
3. WHEN total tags exceed 10 THEN the system SHALL display "الحد الأقصى 10 وسوم" error
4. WHEN tag already exists in list THEN the system SHALL display "الوسم موجود مسبقاً" error
5. WHEN adding valid tag THEN the system SHALL trim whitespace and add to list

### 5. Estimated Time Validation
As a lawyer, I want to enter realistic time estimates.

**Acceptance Criteria:**
1. WHEN estimated time is negative THEN the system SHALL display "الوقت يجب أن يكون موجباً" error
2. WHEN estimated time exceeds 9999 (166+ hours) THEN the system SHALL display "القيمة كبيرة جداً" error
3. WHEN estimated time contains decimals THEN the system SHALL round to nearest integer
4. IF estimated time is 0 THEN the system SHALL accept it (optional field)

### 6. Subtasks Field Validation
As a lawyer, I want to add subtasks without security vulnerabilities.

**Acceptance Criteria:**
1. WHEN subtask title contains `<script>`, `<iframe>` THEN the system SHALL sanitize before adding
2. WHEN subtask title exceeds 200 characters THEN the system SHALL display length error
3. WHEN subtask title is empty/whitespace THEN the system SHALL NOT add it to list
4. WHEN adding duplicate subtask title THEN the system SHALL show warning but allow

### 7. Real-time Validation Feedback
As a lawyer, I want immediate feedback as I fill out the form.

**Acceptance Criteria:**
1. WHEN user leaves a required field empty (blur) THEN the system SHALL show error immediately
2. WHEN user fixes an error THEN the system SHALL clear the error within 300ms
3. WHEN all required fields are valid THEN the system SHALL enable the submit button with visual indicator
4. WHILE form is submitting THEN the system SHALL show loading state and disable submit

## Edge Cases

- WHEN pasting content with hidden unicode characters THEN the system SHALL normalize and sanitize
- WHEN browser autofill populates fields THEN the system SHALL validate autofilled values
- WHEN user navigates away with unsaved changes THEN the system SHALL prompt for confirmation
- WHEN session expires during form fill THEN the system SHALL preserve form data in localStorage
- WHEN backend returns validation error THEN the system SHALL display backend error message to user

## Out of Scope (Future)
- Rich text editor for description - Requires additional security review
- Drag-and-drop file attachments - Separate feature
- AI-assisted task title suggestions - Nice to have, not security-critical

## Open Questions
- [x] Does backend have matching validation? - Need to verify parity
- [x] Should we sanitize on input or on submit? - **Decision: Both** - sanitize display, validate on blur, re-sanitize on submit
- [ ] Are there specific legal terms that should bypass length limits? - Ask business team

## Dependencies

### Existing (Reuse)
- `src/utils/sanitize.ts` - `sanitizeHtml`, `escapeHtml`, `isContentSafe`
- `src/features/tasks/data/schema.ts` - Extend `taskFormSchema` with strict validation
- `src/lib/zod-validators.ts` - Pattern for building validators
- React Hook Form or similar for form state management (if already in use)

### New (Create)
- Enhanced `taskFormSchema` with security-focused validation
- `useTaskFormValidation` hook for real-time validation
- Validation error display component integration

### Backend
- Confirm backend has matching validation rules
- Ensure backend sanitizes inputs even if frontend is bypassed

## Technical Notes

### Current State (Disabled Validation)
```typescript
// Lines 125-128 in create-task-view.tsx
const validateField = (_field: string, _value: any): string => {
    return '' // Validation disabled!
}

// Lines 137-139
const validateForm = (): boolean => {
    return true // Always passes!
}
```

### Required Changes
1. Re-enable and implement `validateField` function
2. Re-enable and implement `validateForm` function
3. Integrate sanitization before submission
4. Add visual feedback for validation states
5. Update `taskFormSchema` in schema.ts with stricter rules

### Fields Summary

| Field | Required | Max Length | Min Length | Special Validation |
|-------|----------|------------|------------|-------------------|
| title | YES | 200 | 3 | XSS sanitization |
| description | NO | 5000 | - | XSS sanitization |
| status | YES (has default) | - | - | Enum validation |
| priority | YES (has default) | - | - | Enum validation |
| label | NO | - | - | Enum validation |
| tags | NO | 30 per tag | - | Alphanumeric only, max 10 tags |
| dueDate | YES | - | - | Valid date format |
| dueTime | NO | - | - | Valid time format |
| estimatedMinutes | NO | 9999 | 0 | Non-negative integer |
| clientId | NO | - | - | Valid ObjectId |
| caseId | NO | - | - | Valid ObjectId |
| assignedTo | NO | - | - | Valid ObjectId |
| subtask.title | - | 200 | 1 | XSS sanitization |
