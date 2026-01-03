# Task Form Validation - Requirements

## Overview
Implement gold-standard form validation for the task creation form (`/dashboard/tasks/new`) with centralized, reusable validation infrastructure.

## CRITICAL: Backend API Contract Alignment (BLOCKING)

### Enum Mismatches to Fix FIRST

#### Priority Enum
| Backend (CORRECT) | Frontend schema.ts (WRONG) |
|-------------------|---------------------------|
| `low` | exists |
| `medium` | exists |
| `high` | exists |
| `urgent` | MISSING - must add |
| - | `none` REMOVE |
| - | `critical` REMOVE |

**Action**: Update frontend `taskPriorityEnum` to `['low', 'medium', 'high', 'urgent']`

#### Status Enum
| Backend (CORRECT) | Frontend schema.ts (WRONG) |
|-------------------|---------------------------|
| `todo` | exists |
| `pending` | MISSING - must add |
| `in_progress` | exists |
| `done` | exists |
| `canceled` | exists |
| - | `backlog` REMOVE |

**Action**: Update frontend `taskStatusEnum` to `['todo', 'pending', 'in_progress', 'done', 'canceled']`

### Backend API Fields for POST /api/tasks

Allowed Fields:
title, description, priority, status, label, tags, dueDate, dueTime, startDate,
assignedTo, caseId, clientId, parentTaskId, subtasks, checklists, timeTracking,
recurring, reminders, notes, points

#### Fields Requiring XSS Protection (from API contract)
| Field | Type | Max Length | XSS Risk |
|-------|------|------------|----------|
| `title` | string | 200 | HIGH |
| `description` | string (HTML) | 5000 | HIGH |
| `notes` | string (HTML) | 5000 | HIGH |
| `tags[]` | string[] | 30/tag | HIGH |
| `subtasks[].title` | string | 200 | HIGH |
| `label` | string | 50 | MEDIUM |

#### Numeric Fields
| Field | Type | Validation |
|-------|------|------------|
| `points` | number | >= 0 |
| `timeTracking.estimatedMinutes` | number | >= 0 |

### API Response Shapes
Success: `{ "success": true, "message": "...", "data": { task } }`
Error: `{ "success": false, "message": "Error message" }`

## Scale Assessment

### Scope Analysis
- **85+ forms** in codebase could benefit from centralized validation
- **Priority forms**: Tasks, Reminders, Events (share similar fields)
- **Current state**: Task form has validation **DISABLED** (returns empty string/true)

### Reusable Infrastructure (Already Exists)
| Utility | Location | Purpose |
|---------|----------|---------|
| `sanitizeHtml()` | `src/utils/sanitize.ts` | XSS protection |
| `isContentSafe()` | `src/utils/sanitize.ts` | Dangerous pattern detection |
| `INPUT_MAX_LENGTHS` | `src/utils/validation-patterns.ts` | Character limits |
| `ValidationErrors` | `src/components/validation-errors.tsx` | Error display component |
| `taskFormSchema` | `src/features/tasks/data/schema.ts` | Zod schema (needs enhancement) |

### New Centralized Components Needed
| Component | Location | Purpose |
|-----------|----------|---------|
| `useFormValidation` | `src/hooks/useFormValidation.ts` | Centralized validation hook |
| `useTaskFormValidation` | `src/features/tasks/hooks/` | Task-specific validation |
| `CharacterCount` | `src/components/ui/character-count.tsx` | Character counter component |

## User Stories

### US-0: Backend API Alignment (BLOCKING - DO FIRST)
**As a** developer
**I want** frontend enums to match backend API contract
**So that** form submissions don't fail with 400 errors

**Acceptance Criteria:**
- **BEFORE** any validation work, fix `taskPriorityEnum` to `['low', 'medium', 'high', 'urgent']`
- **BEFORE** any validation work, fix `taskStatusEnum` to `['todo', 'pending', 'in_progress', 'done', 'canceled']`
- **TEST** by submitting a task in browser and verifying backend accepts it
- **VERIFY** response shape matches `{ success: true, data: {...} }`
- **UPDATE** all UI components that reference old enum values

### US-1: Required Field Validation
**As a** user creating a task
**I want** clear validation on required fields
**So that** I know exactly what information is needed

**Acceptance Criteria (EARS Format):**
- **WHEN** user submits form with empty Title **THEN** show error "عنوان المهمة مطلوب"
- **WHEN** user submits form with empty Due Date **THEN** show error "تاريخ الاستحقاق مطلوب"
- **WHEN** user submits form with Title < 3 characters **THEN** show error "يجب أن يكون على الأقل 3 أحرف"
- **WHEN** user blurs a required field that is empty **THEN** show validation error immediately

### US-2: XSS Protection
**As a** system
**I want** all text inputs sanitized
**So that** malicious scripts cannot be injected

**Acceptance Criteria:**
- **WHEN** user enters `<script>alert('xss')</script>` in Title **THEN** show error "المحتوى يحتوي على عناصر غير مسموح بها"
- **WHEN** user enters `<img onerror=alert(1)>` in Description **THEN** show error and block submission
- **WHEN** user enters XSS in Notes field **THEN** show error and block submission
- **WHEN** user adds tag with javascript protocol **THEN** reject the tag
- **WHEN** user adds subtask with XSS payload **THEN** reject and show error
- **WHEN** form submits **THEN** sanitize all string fields with `sanitizeHtml()` before API call

### US-3: Character Limits with Feedback
**As a** user entering text
**I want** to see how many characters remain
**So that** I don't exceed limits unexpectedly

**Acceptance Criteria:**
- **WHEN** Title reaches 160 characters (80% of 200) **THEN** show warning color on counter
- **WHEN** Title exceeds 200 characters **THEN** show error and prevent submission
- **WHEN** Description reaches 4500 characters (90% of 5000) **THEN** show warning
- **WHEN** Notes reaches 4500 characters (90% of 5000) **THEN** show warning
- Character counter format: `{remaining} حرف متبقي`
- **DO NOT** show counter alongside validation error (confusing)

### US-4: Basic/Advanced Mode Toggle
**As a** user
**I want** a simplified form view option
**So that** I can quickly create tasks with minimal fields

**Acceptance Criteria:**
- **WHEN** page loads **THEN** show Basic/Advanced toggle at top-left of form
- **WHEN** Basic mode selected **THEN** show only: Title, Due Date, Priority, Assigned To
- **WHEN** Advanced mode selected **THEN** show all fields (current behavior)
- **WHEN** switching modes **THEN** preserve entered data
- Toggle should have good RTL-aware design

### US-5: Scroll to First Error
**As a** user submitting an invalid form
**I want** the page to scroll to the first error
**So that** I can immediately see what needs fixing

**Acceptance Criteria:**
- **WHEN** user clicks Save/Submit with validation errors **THEN** scroll to first invalid field
- **WHEN** scrolling **THEN** add offset so field is visible below any fixed headers
- **WHEN** multiple errors exist **THEN** scroll to topmost error only
- Field should receive focus after scroll

### US-6: Field-Level Validation on Blur
**As a** user filling out the form
**I want** immediate feedback when I leave a field
**So that** I can fix errors as I go

**Acceptance Criteria:**
- **WHEN** user blurs Title field **THEN** validate immediately
- **WHEN** user blurs Due Date field **THEN** validate immediately
- **WHEN** field becomes valid after correction **THEN** clear error immediately
- **WHILE** user is typing **THEN** do NOT show validation errors (wait for blur)

## Security Requirements

### XSS Attack Vectors to Block
| Field | Risk Level | Attack Pattern | Mitigation |
|-------|------------|----------------|------------|
| Title | HIGH | `<script>`, event handlers | `isContentSafe()` check |
| Description | HIGH | `<script>`, `<iframe>`, data: URLs | `isContentSafe()` check |
| Notes | HIGH | `<script>`, `<iframe>`, data: URLs | `isContentSafe()` check |
| Tags | HIGH | JavaScript in tag names | `isContentSafe()` per tag |
| Subtasks | HIGH | Script injection in subtask titles | `isContentSafe()` check |
| Label | MEDIUM | Event handlers | `isContentSafe()` check |
| Points | MEDIUM | Non-numeric input | Zod number validation |

### Sanitization Strategy
1. **Client-side validation**: `isContentSafe()` blocks dangerous patterns
2. **Pre-submit sanitization**: `sanitizeHtml()` on all string fields
3. **Backend validation**: Should mirror client validation (verify backend works)

## Technical Constraints

### Must Use Existing Patterns
- Zod schema validation (from `schema.ts`)
- React Hook Form pattern (reference: `create-client-view.tsx`)
- Existing `ValidationErrors` component
- Existing sanitization utilities

### RTL/Bilingual Support
- All error messages in Arabic
- Form layout must work in RTL mode
- Character counter text in Arabic

## Out of Scope
- Backend validation implementation (frontend only)
- Other form validations (tasks only for now)
- Custom validation rules beyond security and required fields

## Dependencies
- Verify backend accepts task submissions (test before implementing)
- Existing Zod schemas may need enhancement

## Definition of Done
- [ ] Priority enum fixed: `['low', 'medium', 'high', 'urgent']`
- [ ] Status enum fixed: `['todo', 'pending', 'in_progress', 'done', 'canceled']`
- [ ] Task submission works end-to-end (verified in browser)
- [ ] All required fields show validation on blur and submit
- [ ] XSS patterns blocked on Title, Description, Notes, Tags, Subtasks
- [ ] Character counters show for Title, Description, Notes
- [ ] Basic/Advanced toggle works with proper field visibility
- [ ] Scroll-to-first-error works on submit
- [ ] No TypeScript errors (`npm run build`)
- [ ] Tested in browser (Arabic RTL)
- [ ] No console errors
