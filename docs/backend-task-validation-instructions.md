# Backend Instructions: Task Form Validation & API Contract

This document details all frontend changes made for task form validation that require corresponding backend updates.

---

## 1. Enum Value Alignment (CRITICAL)

The frontend enum values must match the backend API exactly. The following values are now used:

### Task Status Enum
**Frontend file:** `src/features/tasks/data/schema.ts`, `src/services/tasksService.ts`

```typescript
type TaskStatus = 'todo' | 'pending' | 'in_progress' | 'done' | 'canceled'
```

| Value | Arabic Label | Description |
|-------|-------------|-------------|
| `todo` | للتنفيذ | Task is ready to be worked on |
| `pending` | قيد الانتظار | Task is waiting/blocked |
| `in_progress` | جاري العمل | Task is actively being worked on |
| `done` | مكتملة | Task is completed |
| `canceled` | ملغية | Task was canceled |

**Backend must accept these exact values. Old values `backlog`, `complete` are NO LONGER USED.**

---

### Task Priority Enum
**Frontend file:** `src/features/tasks/data/schema.ts`, `src/services/tasksService.ts`

```typescript
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
```

| Value | Arabic Label | Description |
|-------|-------------|-------------|
| `low` | منخفضة | Low priority |
| `medium` | متوسطة | Medium priority (default) |
| `high` | عالية | High priority |
| `urgent` | عاجلة | Urgent priority |

**Backend must accept these exact values. Old values `none`, `critical` are NO LONGER USED.**

---

### Deadline Type Enum
**Frontend file:** `src/services/tasksService.ts`

```typescript
type DeadlineType = 'statutory' | 'court_ordered' | 'contractual' | 'internal'
```

| Value | Arabic Label | Description |
|-------|-------------|-------------|
| `statutory` | قانوني | Legal/statutory deadline |
| `court_ordered` | محكمة | Court-ordered deadline |
| `contractual` | تعاقدي | Contractual deadline |
| `internal` | داخلي | Internal deadline |

**Old value `none` is NO LONGER USED.**

---

## 2. Required Fields

When creating a task, the following fields are **REQUIRED**:

| Field | Type | Validation |
|-------|------|------------|
| `title` | string | Min 3 chars, Max 200 chars, XSS-safe |
| `dueDate` | string (ISO date) | Must be valid date format |

### Default Values for Optional Fields

When not provided, the frontend sends these defaults:
- `status`: `'todo'`
- `priority`: `'medium'`

---

## 3. Field Validation Rules

### Title Field
- **Required:** Yes
- **Min Length:** 3 characters
- **Max Length:** 200 characters
- **XSS Protection:** Must reject content containing:
  - `<script>` tags
  - `javascript:` protocols
  - Event handlers (`onclick=`, `onerror=`, `onload=`)
  - `<iframe>` tags
  - `data:text/html` protocols

### Description Field
- **Required:** No
- **Max Length:** 5,000 characters
- **XSS Protection:** Same as title

### Tags Field
- **Required:** No
- **Type:** Array of strings
- **Max Count:** 10 tags
- **Max Tag Length:** 30 characters per tag
- **XSS Protection:** Each tag must be XSS-safe

### Due Date Field
- **Required:** Yes
- **Format:** ISO date string (YYYY-MM-DD)
- **Validation:** Must be a valid date

### Estimated Minutes Field
- **Required:** No
- **Type:** number
- **Min Value:** 0

---

## 4. Task Creation Payload Example

```json
{
  "title": "مراجعة العقد النهائي",
  "description": "مراجعة جميع البنود القانونية في العقد",
  "status": "todo",
  "priority": "high",
  "taskType": "other",
  "label": "documentation",
  "tags": ["عقود", "مراجعة"],
  "dueDate": "2026-01-15",
  "dueTime": "14:00",
  "clientId": "client_123",
  "caseId": "case_456",
  "assignedTo": "user_789",
  "estimatedMinutes": 60,
  "subtasks": [
    {
      "title": "مراجعة البند الأول",
      "completed": false,
      "order": 0
    }
  ],
  "recurring": {
    "enabled": true,
    "frequency": "weekly",
    "type": "due_date",
    "daysOfWeek": [0, 2, 4],
    "interval": 1,
    "assigneeStrategy": "fixed"
  },
  "reminders": [
    {
      "type": "notification",
      "beforeMinutes": 30
    }
  ]
}
```

---

## 5. Error Response Format

When validation fails, the backend should return:

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "title": "يجب أن يكون على الأقل 3 أحرف",
    "dueDate": "تاريخ الاستحقاق مطلوب"
  }
}
```

---

## 6. XSS Protection Requirements

The backend MUST validate and sanitize the following fields for XSS:

1. **title** - Reject requests with XSS patterns
2. **description** - Reject requests with XSS patterns
3. **tags[]** - Reject requests where any tag contains XSS patterns

### XSS Patterns to Block

```regex
/<script/i
/javascript:/i
/onerror\s*=/i
/onclick\s*=/i
/onload\s*=/i
/<iframe/i
/data:text\/html/i
```

### Recommended Response for XSS Detection

```json
{
  "status": "error",
  "message": "Content contains potentially unsafe code",
  "errors": {
    "title": "المحتوى يحتوي على أكواد غير مسموحة"
  }
}
```

---

## 7. Basic/Advanced Mode (Frontend Only)

The form now has a Basic/Advanced mode toggle:

- **Basic Mode:** Shows only required fields (title, status, priority, dueDate)
- **Advanced Mode:** Shows all fields

This is purely a frontend UI feature. The backend API remains unchanged - it should accept the same payload regardless of which mode was used.

---

## 8. Migration Checklist

If the backend currently uses different enum values, here's the migration plan:

### Status Values Migration
| Old Value | New Value |
|-----------|-----------|
| `backlog` | `todo` |
| `complete` | `done` |

### Priority Values Migration
| Old Value | New Value |
|-----------|-----------|
| `none` | (remove or map to `low`) |
| `critical` | `urgent` |

### Deadline Type Migration
| Old Value | New Value |
|-----------|-----------|
| `none` | (remove field or default to `internal`) |

---

## 9. API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update existing task |
| GET | `/api/tasks` | List tasks (with filters) |
| GET | `/api/tasks/:id` | Get single task |
| DELETE | `/api/tasks/:id` | Delete task |

---

## 10. Contact

For questions about this specification, contact the frontend team.

**Last Updated:** January 2026
**Frontend Version:** Task Form Validation v1.0
