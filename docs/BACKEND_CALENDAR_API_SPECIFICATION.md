# Backend Calendar API Specification

## Overview

This document provides a comprehensive API specification for the Calendar system that integrates with Tasks, Events, Reminders, and Case Hearings. Backend developers should implement these endpoints to enable full calendar functionality.

---

## Table of Contents

1. [Calendar Unified API](#1-calendar-unified-api)
2. [Events API](#2-events-api)
3. [Reminders API](#3-reminders-api)
4. [Tasks API](#4-tasks-api)
5. [Case Hearings Integration](#5-case-hearings-integration)
6. [Data Models](#6-data-models)
7. [Error Handling](#7-error-handling)
8. [Authentication](#8-authentication)

---

## 1. Calendar Unified API

The unified calendar API aggregates data from Events, Tasks, and Reminders into a single view.

### Base URL
```
/api/calendar
```

### 1.1 Get Unified Calendar View

**Endpoint:** `GET /api/calendar`

**Description:** Returns combined events, tasks, and reminders for a date range.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string (ISO 8601) | Yes | Start of date range |
| endDate | string (ISO 8601) | Yes | End of date range |
| type | string | No | Filter by type: 'event', 'task', 'reminder' |
| caseId | string | No | Filter by case ID |

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_123",
        "type": "event",
        "title": "جلسة محكمة",
        "description": "جلسة في قضية الشركة",
        "startDate": "2025-01-15T09:00:00Z",
        "endDate": "2025-01-15T11:00:00Z",
        "allDay": false,
        "eventType": "hearing",
        "location": "محكمة الرياض",
        "status": "scheduled",
        "color": "#ef4444",
        "caseId": "case_456",
        "caseName": "قضية شركة ABC",
        "caseNumber": "1446/123",
        "priority": "high",
        "createdBy": {
          "_id": "user_789",
          "username": "محمد أحمد",
          "image": "https://..."
        },
        "attendees": []
      }
    ],
    "tasks": [
      {
        "id": "task_123",
        "type": "task",
        "title": "إعداد المذكرة",
        "description": "إعداد مذكرة الدفاع",
        "startDate": "2025-01-14T00:00:00Z",
        "allDay": true,
        "status": "todo",
        "color": "#8b5cf6",
        "caseId": "case_456",
        "caseName": "قضية شركة ABC",
        "priority": "high",
        "assignedTo": {
          "_id": "user_789",
          "username": "محمد أحمد"
        }
      }
    ],
    "reminders": [
      {
        "id": "reminder_123",
        "type": "reminder",
        "title": "تذكير بالجلسة",
        "description": "جلسة المحكمة غداً",
        "startDate": "2025-01-14T09:00:00Z",
        "reminderTime": "09:00",
        "reminderType": "hearing",
        "status": "pending",
        "color": "#a855f7",
        "priority": "high"
      }
    ],
    "combined": [...], // All items merged and sorted by date
    "summary": {
      "totalItems": 15,
      "eventCount": 5,
      "taskCount": 7,
      "reminderCount": 3
    }
  },
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  }
}
```

### 1.2 Get Calendar By Date

**Endpoint:** `GET /api/calendar/date/:date`

**Description:** Returns all items for a specific date.

**URL Parameters:**
- `date` - ISO 8601 date string (YYYY-MM-DD)

**Response:** Same structure as unified calendar view.

### 1.3 Get Calendar By Month

**Endpoint:** `GET /api/calendar/month/:year/:month`

**Description:** Returns all items for a specific month.

**URL Parameters:**
- `year` - Year (e.g., 2025)
- `month` - Month (1-12)

**Response:** Same structure as unified calendar view.

### 1.4 Get Upcoming Items

**Endpoint:** `GET /api/calendar/upcoming`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | number | 7 | Number of days to look ahead |

**Response:** Same structure as unified calendar view.

### 1.5 Get Overdue Items

**Endpoint:** `GET /api/calendar/overdue`

**Description:** Returns all overdue tasks, events, and reminders.

**Response:** Same structure with `isOverdue: true` flag on items.

### 1.6 Get Calendar Statistics

**Endpoint:** `GET /api/calendar/stats`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Optional start date |
| endDate | string | Optional end date |

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 25,
    "totalTasks": 42,
    "totalReminders": 18,
    "upcomingHearings": 5,
    "overdueItems": 3,
    "completedThisMonth": 15,
    "byType": {
      "hearing": 8,
      "meeting": 12,
      "deadline": 5
    },
    "byPriority": {
      "critical": 2,
      "high": 8,
      "medium": 10,
      "low": 5
    }
  }
}
```

---

## 2. Events API

### Base URL
```
/api/events
```

### 2.1 Get Events

**Endpoint:** `GET /api/events`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by event type |
| status | string | Filter by status |
| startDate | string | Start date range |
| endDate | string | End date range |
| caseId | string | Filter by case |
| page | number | Pagination page |
| limit | number | Items per page |

### 2.2 Create Event

**Endpoint:** `POST /api/events`

**Request Body:**
```json
{
  "title": "جلسة محكمة - قضية ABC",
  "description": "جلسة الاستماع الأولى",
  "type": "hearing",
  "startDate": "2025-01-15T09:00:00Z",
  "endDate": "2025-01-15T11:00:00Z",
  "allDay": false,
  "location": {
    "type": "physical",
    "address": "محكمة الرياض",
    "city": "الرياض"
  },
  "caseId": "case_456",
  "status": "scheduled",
  "priority": "high",
  "attendees": [
    {
      "userId": "user_123",
      "role": "required",
      "rsvpStatus": "pending"
    }
  ],
  "reminders": [
    {
      "type": "email",
      "beforeMinutes": 1440
    },
    {
      "type": "push",
      "beforeMinutes": 60
    }
  ]
}
```

**Event Types:**
- `hearing` - Court hearing
- `court_session` - Court session
- `meeting` - General meeting
- `deadline` - Deadline
- `task` - Task event
- `conference` - Conference
- `consultation` - Consultation
- `document_review` - Document review
- `training` - Training session
- `other` - Other

**Event Statuses:**
- `scheduled`
- `in_progress`
- `completed`
- `cancelled`
- `postponed`
- `rescheduled`

### 2.3 Update Event

**Endpoint:** `PUT /api/events/:id`

**Request Body:** Partial event object with fields to update.

### 2.4 Delete Event

**Endpoint:** `DELETE /api/events/:id`

### 2.5 Complete Event

**Endpoint:** `POST /api/events/:id/complete`

### 2.6 Cancel Event

**Endpoint:** `POST /api/events/:id/cancel`

**Request Body:**
```json
{
  "reason": "تم تأجيل الجلسة"
}
```

### 2.7 RSVP to Event

**Endpoint:** `POST /api/events/:id/rsvp`

**Request Body:**
```json
{
  "status": "accepted",
  "notes": "سأحضر"
}
```

**RSVP Statuses:**
- `accepted`
- `declined`
- `tentative`

### 2.8 Get Upcoming Events

**Endpoint:** `GET /api/events/upcoming`

**Query Parameters:**
- `days` - Number of days (default: 7)

### 2.9 Export Event to ICS

**Endpoint:** `GET /api/events/:id/export/ics`

**Response:** ICS file download

### 2.10 Import Events from ICS

**Endpoint:** `POST /api/events/import/ics`

**Request Body:** `multipart/form-data` with ICS file

---

## 3. Reminders API

### Base URL
```
/api/reminders
```

### 3.1 Get Reminders

**Endpoint:** `GET /api/reminders`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by reminder type |
| status | string | Filter by status |
| priority | string | Filter by priority |

### 3.2 Create Reminder

**Endpoint:** `POST /api/reminders`

**Request Body:**
```json
{
  "title": "تذكير بجلسة المحكمة",
  "description": "الجلسة غداً الساعة 9 صباحاً",
  "type": "hearing",
  "reminderDate": "2025-01-14T08:00:00Z",
  "priority": "high",
  "relatedCase": "case_456",
  "relatedEvent": "event_123",
  "notification": {
    "channels": ["push", "email", "sms"],
    "escalation": {
      "enabled": true,
      "escalateTo": "user_manager",
      "afterMinutes": 30
    }
  }
}
```

**Reminder Types:**
- `task`
- `hearing`
- `deadline`
- `meeting`
- `payment`
- `general`
- `follow_up`
- `court_date`
- `document_submission`
- `client_call`

**Reminder Statuses:**
- `pending`
- `snoozed`
- `triggered`
- `completed`
- `dismissed`
- `expired`

### 3.3 Complete Reminder

**Endpoint:** `POST /api/reminders/:id/complete`

### 3.4 Dismiss Reminder

**Endpoint:** `POST /api/reminders/:id/dismiss`

### 3.5 Snooze Reminder

**Endpoint:** `POST /api/reminders/:id/snooze`

**Request Body:**
```json
{
  "minutes": 30,
  "reason": "مشغول حالياً"
}
```

**OR**
```json
{
  "until": "2025-01-14T10:00:00Z"
}
```

### 3.6 Get Upcoming Reminders

**Endpoint:** `GET /api/reminders/upcoming`

### 3.7 Get Overdue Reminders

**Endpoint:** `GET /api/reminders/overdue`

---

## 4. Tasks API

### Base URL
```
/api/tasks
```

### 4.1 Get Tasks

**Endpoint:** `GET /api/tasks`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| priority | string | Filter by priority |
| assignedTo | string | Filter by assigned user |
| caseId | string | Filter by case |
| dueDate | string | Filter by due date |

### 4.2 Create Task

**Endpoint:** `POST /api/tasks`

**Request Body:**
```json
{
  "title": "إعداد مذكرة الدفاع",
  "description": "إعداد المذكرة للجلسة القادمة",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-01-14T23:59:59Z",
  "assignedTo": "user_123",
  "caseId": "case_456",
  "label": "legal",
  "subtasks": [
    {
      "title": "مراجعة المستندات",
      "completed": false
    },
    {
      "title": "كتابة المذكرة",
      "completed": false
    }
  ],
  "reminders": [
    {
      "type": "notification",
      "beforeMinutes": 1440
    }
  ]
}
```

**Task Statuses:**
- `backlog`
- `todo`
- `in_progress`
- `done`
- `canceled`

**Task Priorities:**
- `none`
- `low`
- `medium`
- `high`
- `critical`

### 4.3 Update Task Status

**Endpoint:** `PATCH /api/tasks/:id/status`

**Request Body:**
```json
{
  "status": "in_progress"
}
```

### 4.4 Complete Task

**Endpoint:** `POST /api/tasks/:id/complete`

**Request Body:**
```json
{
  "completionNotes": "تم الانتهاء بنجاح"
}
```

### 4.5 Get Upcoming Tasks

**Endpoint:** `GET /api/tasks/upcoming`

### 4.6 Get Overdue Tasks

**Endpoint:** `GET /api/tasks/overdue`

### 4.7 Get Tasks Due Today

**Endpoint:** `GET /api/tasks/due-today`

---

## 5. Case Hearings Integration

### CRITICAL: Auto-Create Calendar Events

When a hearing is added to a case, the backend MUST automatically:

1. **Create a Calendar Event:**
```javascript
// When POST /api/cases/:id/hearing is called:
const hearing = await createHearing(caseId, hearingData);

// Automatically create event
await createEvent({
  title: `جلسة محكمة - ${case.title}`,
  description: hearingData.notes || `جلسة محكمة - قضية رقم ${case.caseNumber}`,
  type: 'hearing',
  startDate: hearingData.date,
  endDate: hearingData.date,
  location: { type: 'physical', address: hearingData.location },
  caseId: caseId,
  status: 'scheduled',
  priority: 'high',
});
```

2. **Create a Reminder (1 day before):**
```javascript
const hearingDate = new Date(hearingData.date);
const reminderDate = new Date(hearingDate);
reminderDate.setDate(reminderDate.getDate() - 1);

await createReminder({
  title: `تذكير: جلسة محكمة - ${case.title}`,
  description: `موعد الجلسة غداً في ${hearingData.location}`,
  type: 'hearing',
  reminderDate: reminderDate.toISOString(),
  priority: 'high',
  relatedCase: caseId,
  notification: {
    channels: ['push', 'email'],
  },
});
```

### Case Hearing Endpoints

**Add Hearing:**
```
POST /api/cases/:id/hearing
```

**Request Body:**
```json
{
  "date": "2025-01-15T09:00:00Z",
  "location": "محكمة الرياض",
  "notes": "جلسة الاستماع الأولى"
}
```

**Response:** Updated case with hearings array + auto-created event/reminder IDs.

**Update Hearing:**
```
PATCH /api/cases/:id/hearings/:hearingId
```

**Delete Hearing:**
```
DELETE /api/cases/:id/hearings/:hearingId
```

---

## 6. Data Models

### CalendarEvent (Unified)
```typescript
interface CalendarEvent {
  id: string;
  type: 'event' | 'task' | 'reminder';
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  eventType?: string;
  location?: string;
  status: string;
  color: string;
  caseId?: string;
  caseName?: string;
  caseNumber?: string;
  createdBy?: {
    _id: string;
    username: string;
    image?: string;
  };
  attendees?: any[];
  priority?: string;
  reminderTime?: string;
  reminderType?: string;
  notificationSent?: boolean;
  isOverdue?: boolean;
  assignedTo?: any;
}
```

### Event
```typescript
interface Event {
  _id: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  allDay: boolean;
  timezone?: string;
  location?: EventLocation;
  status: EventStatus;
  priority: EventPriority;
  color?: string;
  tags?: string[];
  caseId?: string;
  taskId?: string;
  clientId?: string;
  createdBy: string;
  attendees: EventAttendee[];
  reminders: EventReminder[];
  recurrence?: RecurrenceConfig;
  agenda?: AgendaItem[];
  meetingNotes?: string;
  actionItems?: ActionItem[];
  attachments?: EventAttachment[];
  comments?: EventComment[];
  calendarSync?: CalendarSync[];
  billable?: boolean;
  billedHours?: number;
  billingRate?: number;
  history?: EventHistory[];
  createdAt: string;
  updatedAt: string;
}
```

### Reminder
```typescript
interface Reminder {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  message?: string;
  reminderDate: string;
  reminderTime?: string;
  timezone?: string;
  dueDate?: string;
  type: ReminderType;
  priority: ReminderPriority;
  status: ReminderStatus;
  tags?: string[];
  relatedCase?: string;
  relatedTask?: string;
  relatedEvent?: string;
  relatedClient?: string;
  assignedTo?: string;
  snooze?: SnoozeConfig;
  recurring?: RecurringConfig;
  notification: NotificationConfig;
  notes?: string;
  acknowledgment?: ReminderAcknowledgment;
  history?: ReminderHistory[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### Task
```typescript
interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  label?: TaskLabel;
  tags?: string[];
  dueDate?: string;
  dueTime?: string;
  startDate?: string;
  completedAt?: string;
  assignedTo?: string;
  createdBy: string;
  caseId?: string;
  clientId?: string;
  parentTaskId?: string;
  subtasks?: Subtask[];
  checklists?: Checklist[];
  timeTracking?: TimeTracking;
  recurring?: RecurringConfig;
  reminders?: TaskReminder[];
  attachments?: Attachment[];
  comments?: Comment[];
  history?: TaskHistory[];
  isTemplate?: boolean;
  templateId?: string;
  points?: number;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "حقل العنوان مطلوب",
    "details": {
      "field": "title",
      "type": "required"
    }
  }
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data |
| NOT_FOUND | 404 | Resource not found |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Access denied |
| CONFLICT | 409 | Resource conflict |
| INTERNAL_ERROR | 500 | Server error |

---

## 8. Authentication

All endpoints require authentication via JWT token or session cookie.

### Headers
```
Authorization: Bearer <token>
```

OR

### Cookies
```
Set-Cookie: session=<session_id>; HttpOnly; Secure; SameSite=Strict
```

---

## Implementation Checklist

### Required Endpoints

- [ ] `GET /api/calendar` - Unified calendar view
- [ ] `GET /api/calendar/date/:date`
- [ ] `GET /api/calendar/month/:year/:month`
- [ ] `GET /api/calendar/upcoming`
- [ ] `GET /api/calendar/overdue`
- [ ] `GET /api/calendar/stats`
- [ ] Events CRUD
- [ ] Reminders CRUD
- [ ] Tasks CRUD
- [ ] Case Hearings → Auto-create events/reminders

### Data Aggregation

The `/api/calendar` endpoint MUST aggregate data from:
1. Events collection
2. Tasks collection
3. Reminders collection

And return them in a unified format that the frontend can display.

### Real-time Sync

Consider implementing WebSocket or Server-Sent Events for:
- Real-time calendar updates
- Reminder notifications
- Event changes

---

## Contact

For questions about this API specification, contact the frontend team.

**Last Updated:** November 27, 2025
