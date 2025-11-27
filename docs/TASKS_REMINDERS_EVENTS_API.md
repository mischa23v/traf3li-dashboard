# Tasks, Reminders & Events API Specification

Complete backend API documentation for production-ready Tasks, Reminders, and Events modules.

**Version:** 2.0
**Last Updated:** November 2024

---

## Table of Contents

1. [Tasks Module](#1-tasks-module)
2. [Reminders Module](#2-reminders-module)
3. [Events Module](#3-events-module)
4. [Common Patterns](#4-common-patterns)
5. [Database Schemas](#5-database-schemas)

---

## 1. Tasks Module

### 1.1 Data Types

```typescript
// Enums
TaskStatus: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'
TaskPriority: 'none' | 'low' | 'medium' | 'high' | 'critical'
TaskLabel: 'bug' | 'feature' | 'documentation' | 'enhancement' | 'question' | 'legal' | 'administrative' | 'urgent'
RecurrenceFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
RecurrenceType: 'due_date' | 'completion_date'
AssigneeStrategy: 'fixed' | 'round_robin' | 'random' | 'least_assigned'
```

### 1.2 CRUD Endpoints

#### GET /api/tasks
Get all tasks with filters and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string/array | Filter by status |
| priority | string/array | Filter by priority |
| label | string | Filter by label |
| assignedTo | string | Filter by assigned user ID |
| createdBy | string | Filter by creator user ID |
| caseId | string | Filter by case ID |
| clientId | string | Filter by client ID |
| isTemplate | boolean | Get only templates |
| hasSubtasks | boolean | Filter by subtask presence |
| isRecurring | boolean | Filter recurring tasks |
| overdue | boolean | Get only overdue tasks |
| dueDateFrom | string | Due date range start (ISO) |
| dueDateTo | string | Due date range end (ISO) |
| search | string | Full-text search |
| tags | array | Filter by tags |
| sortBy | string | Sort field |
| sortOrder | 'asc'/'desc' | Sort direction |
| page | number | Page number |
| limit | number | Items per page |

**Response:**
```json
{
  "tasks": [...],
  "total": 100,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

#### GET /api/tasks/:id
Get single task by ID with all relations populated.

**Response:**
```json
{
  "task": {
    "_id": "...",
    "title": "...",
    "description": "...",
    "status": "todo",
    "priority": "high",
    "label": "legal",
    "tags": ["urgent", "contract"],
    "dueDate": "2024-12-01",
    "dueTime": "14:00",
    "startDate": "2024-11-25",
    "assignedTo": { "_id": "...", "firstName": "...", "lastName": "...", "avatar": "..." },
    "createdBy": { "_id": "...", "firstName": "...", "lastName": "..." },
    "caseId": { "_id": "...", "caseNumber": "...", "title": "..." },
    "clientId": { "_id": "...", "fullName": "...", "phone": "..." },
    "subtasks": [
      { "_id": "...", "title": "...", "completed": false, "order": 0, "autoReset": false }
    ],
    "timeTracking": {
      "estimatedMinutes": 120,
      "actualMinutes": 45,
      "sessions": [
        { "_id": "...", "startedAt": "...", "endedAt": "...", "duration": 30, "userId": "...", "notes": "..." }
      ]
    },
    "recurring": {
      "enabled": true,
      "frequency": "weekly",
      "type": "due_date",
      "daysOfWeek": [1, 3, 5],
      "assigneeStrategy": "round_robin",
      "assigneePool": ["userId1", "userId2"]
    },
    "reminders": [
      { "_id": "...", "type": "notification", "beforeMinutes": 30, "sent": false }
    ],
    "attachments": [...],
    "comments": [...],
    "history": [...],
    "progress": 33,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### POST /api/tasks
Create new task.

**Request Body:**
```json
{
  "title": "Review contract", // required
  "description": "Review and provide feedback",
  "status": "todo",
  "priority": "high",
  "label": "legal",
  "tags": ["contract", "review"],
  "dueDate": "2024-12-01",
  "dueTime": "14:00",
  "startDate": "2024-11-25",
  "assignedTo": "userId",
  "caseId": "caseId",
  "clientId": "clientId",
  "parentTaskId": "parentId", // for sub-tasks
  "subtasks": [
    { "title": "Read document", "completed": false, "order": 0, "autoReset": false }
  ],
  "recurring": {
    "enabled": true,
    "frequency": "weekly",
    "type": "due_date",
    "daysOfWeek": [1, 3],
    "endDate": "2025-01-01"
  },
  "reminders": [
    { "type": "notification", "beforeMinutes": 30 }
  ],
  "estimatedMinutes": 120,
  "isTemplate": false,
  "templateId": "templateId" // if creating from template
}
```

#### PUT /api/tasks/:id
Update task.

#### DELETE /api/tasks/:id
Delete task (soft delete recommended).

### 1.3 Status Endpoints

#### PATCH /api/tasks/:id/status
Update task status only.

**Request Body:**
```json
{
  "status": "in_progress"
}
```

#### POST /api/tasks/:id/complete
Mark task as complete. For recurring tasks, creates next occurrence.

**Request Body:**
```json
{
  "completionNotes": "Task completed successfully"
}
```

**Backend Logic for Recurring Tasks:**
1. Mark current task as 'done'
2. Set completedAt timestamp
3. If recurring.enabled:
   - Calculate next due date based on recurring.type
   - If type is 'due_date': next = current due date + interval
   - If type is 'completion_date': next = now + interval
   - Create new task instance with reset subtasks (if autoReset)
   - Handle assignee rotation if assigneeStrategy != 'fixed'

#### POST /api/tasks/:id/reopen
Reopen a completed or canceled task.

### 1.4 Subtask Endpoints

#### POST /api/tasks/:id/subtasks
Add subtask to task.

**Request Body:**
```json
{
  "title": "Subtask title",
  "completed": false,
  "autoReset": false
}
```

**Backend Logic:**
- Assign order = max(existing orders) + 1
- Recalculate parent task progress

#### PATCH /api/tasks/:id/subtasks/:subtaskId
Update subtask.

#### POST /api/tasks/:id/subtasks/:subtaskId/toggle
Toggle subtask completion. Recalculate task progress.

#### DELETE /api/tasks/:id/subtasks/:subtaskId
Delete subtask. Recalculate task progress.

#### PATCH /api/tasks/:id/subtasks/reorder
Reorder subtasks.

**Request Body:**
```json
{
  "subtaskIds": ["id1", "id2", "id3"]
}
```

### 1.5 Time Tracking Endpoints

#### POST /api/tasks/:id/time-tracking/start
Start time tracking session. Only one active session per user per task.

**Response:**
```json
{
  "task": {...},
  "session": { "_id": "...", "startedAt": "...", "userId": "..." }
}
```

#### POST /api/tasks/:id/time-tracking/stop
Stop active time tracking session.

**Request Body:**
```json
{
  "notes": "Completed initial review"
}
```

**Backend Logic:**
- Find active session (no endedAt)
- Set endedAt = now
- Calculate duration = (endedAt - startedAt) in minutes
- Update task.timeTracking.actualMinutes

#### POST /api/tasks/:id/time-tracking/manual
Add manual time entry.

**Request Body:**
```json
{
  "minutes": 45,
  "date": "2024-11-25",
  "notes": "Phone call with client"
}
```

#### GET /api/tasks/:id/time-tracking
Get time tracking summary.

### 1.6 Comments Endpoints

#### POST /api/tasks/:id/comments
Add comment.

**Request Body:**
```json
{
  "text": "Comment text",
  "mentions": ["userId1", "userId2"]
}
```

**Backend Logic:**
- Parse mentions from text (e.g., @username)
- Send notifications to mentioned users

#### PATCH /api/tasks/:id/comments/:commentId
Update comment. Set isEdited = true.

#### DELETE /api/tasks/:id/comments/:commentId
Delete comment.

### 1.7 Attachments Endpoints

#### POST /api/tasks/:id/attachments
Upload attachment. Multipart form-data.

**Response:**
```json
{
  "attachment": {
    "_id": "...",
    "fileName": "contract.pdf",
    "fileUrl": "https://...",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "uploadedBy": "userId",
    "uploadedAt": "...",
    "thumbnailUrl": "..." // for images
  }
}
```

#### DELETE /api/tasks/:id/attachments/:attachmentId
Delete attachment. Also delete file from storage.

### 1.8 Query Endpoints

#### GET /api/tasks/upcoming
Get upcoming tasks (next N days).

**Query Parameters:**
- days: number (default: 7)

#### GET /api/tasks/overdue
Get overdue tasks.

#### GET /api/tasks/due-today
Get tasks due today.

#### GET /api/tasks/my-tasks
Get tasks assigned to current user.

#### GET /api/tasks/stats
Get task statistics.

**Query Parameters:**
- caseId: string
- assignedTo: string
- dateFrom: string
- dateTo: string

**Response:**
```json
{
  "stats": {
    "total": 150,
    "byStatus": {
      "backlog": 20,
      "todo": 50,
      "in_progress": 30,
      "done": 45,
      "canceled": 5
    },
    "byPriority": {
      "critical": 10,
      "high": 30,
      "medium": 60,
      "low": 40,
      "none": 10
    },
    "overdue": 8,
    "dueToday": 5,
    "dueThisWeek": 25,
    "completedThisWeek": 15,
    "completedThisMonth": 45,
    "averageCompletionTime": 180,
    "totalTimeTracked": 5400
  }
}
```

### 1.9 Templates Endpoints

#### GET /api/tasks/templates
Get all task templates.

#### POST /api/tasks/templates/:templateId/create
Create task from template.

**Request Body:**
```json
{
  "dueDate": "2024-12-01",
  "assignedTo": "userId",
  "caseId": "caseId"
}
```

#### POST /api/tasks/:id/save-as-template
Save task as template.

**Request Body:**
```json
{
  "name": "Contract Review Template"
}
```

### 1.10 Bulk Operations

#### PATCH /api/tasks/bulk
Bulk update tasks.

**Request Body:**
```json
{
  "taskIds": ["id1", "id2", "id3"],
  "status": "in_progress",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": 3,
  "failed": 0,
  "errors": []
}
```

#### DELETE /api/tasks/bulk
Bulk delete tasks.

#### POST /api/tasks/bulk/complete
Bulk complete tasks.

#### POST /api/tasks/bulk/assign
Bulk assign tasks.

**Request Body:**
```json
{
  "taskIds": ["id1", "id2"],
  "assignedTo": "userId"
}
```

### 1.11 Import/Export

#### POST /api/tasks/import
Import tasks from CSV.

#### GET /api/tasks/export
Export tasks to CSV.

### 1.12 Recurring Task Operations

#### POST /api/tasks/:id/recurring/skip
Skip next occurrence of recurring task.

#### POST /api/tasks/:id/recurring/stop
Stop recurring task.

#### GET /api/tasks/:id/recurring/history
Get recurring task history/instances.

---

## 2. Reminders Module

### 2.1 Data Types

```typescript
ReminderPriority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
ReminderType: 'task' | 'hearing' | 'deadline' | 'meeting' | 'payment' | 'general' | 'follow_up' | 'court_date' | 'document_submission' | 'client_call'
ReminderStatus: 'pending' | 'snoozed' | 'triggered' | 'completed' | 'dismissed' | 'expired'
NotificationChannel: 'push' | 'email' | 'sms' | 'whatsapp' | 'in_app'
RecurrenceEndType: 'never' | 'after_occurrences' | 'on_date'
```

### 2.2 CRUD Endpoints

#### GET /api/reminders
Get all reminders with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string/array | Filter by status |
| priority | string/array | Filter by priority |
| type | string/array | Filter by type |
| assignedTo | string | Filter by user |
| relatedCase | string | Filter by case |
| relatedClient | string | Filter by client |
| isRecurring | boolean | Filter recurring |
| tags | array | Filter by tags |
| startDate | string | Date range start |
| endDate | string | Date range end |
| search | string | Full-text search |
| overdue | boolean | Only overdue |
| today | boolean | Only today's |
| upcoming | boolean | Only upcoming |

#### GET /api/reminders/:id
Get single reminder.

#### POST /api/reminders
Create reminder.

**Request Body:**
```json
{
  "title": "Call client", // required
  "description": "Follow up on case progress",
  "message": "Short notification message",
  "notes": "Internal notes",
  "reminderDate": "2024-12-01", // required
  "reminderTime": "14:00", // required
  "timezone": "Asia/Riyadh",
  "priority": "high",
  "type": "client_call",
  "tags": ["follow-up", "important"],
  "assignedTo": "userId",
  "relatedCase": "caseId",
  "relatedTask": "taskId",
  "relatedEvent": "eventId",
  "relatedClient": "clientId",
  "maxSnoozeCount": 3,
  "recurring": {
    "enabled": true,
    "frequency": "weekly",
    "daysOfWeek": [1, 3],
    "endType": "on_date",
    "endDate": "2025-01-01",
    "skipWeekends": true
  },
  "notification": {
    "channels": ["push", "email"],
    "advanceNotifications": [30, 15, 5],
    "escalationEnabled": true,
    "escalationDelayMinutes": 30,
    "escalationTo": ["managerId"]
  }
}
```

#### PUT /api/reminders/:id
Update reminder.

#### DELETE /api/reminders/:id
Delete reminder.

### 2.3 Status Endpoints

#### POST /api/reminders/:id/complete
Mark as completed.

**Request Body:**
```json
{
  "notes": "Completion notes"
}
```

#### POST /api/reminders/:id/dismiss
Dismiss reminder.

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

#### POST /api/reminders/:id/reopen
Reopen completed/dismissed reminder.

### 2.4 Snooze Endpoints

#### POST /api/reminders/:id/snooze
Snooze reminder.

**Request Body (options):**
```json
{
  "minutes": 15
}
// OR
{
  "hours": 1
}
// OR
{
  "days": 1
}
// OR
{
  "until": "2024-12-01T14:00:00Z"
}
```

**Backend Logic:**
1. Check if snoozeCount < maxSnoozeCount
2. Update status to 'snoozed'
3. Calculate snoozeUntil datetime
4. Store snooze info
5. Reschedule notification job

#### POST /api/reminders/:id/cancel-snooze
Cancel snooze and restore to pending.

### 2.5 Delegation

#### POST /api/reminders/:id/delegate
Delegate reminder to another user.

**Request Body:**
```json
{
  "toUserId": "newUserId",
  "message": "Please handle this"
}
```

### 2.6 Query Endpoints

#### GET /api/reminders/upcoming
Get upcoming reminders.

#### GET /api/reminders/overdue
Get overdue reminders.

#### GET /api/reminders/today
Get today's reminders.

#### GET /api/reminders/snoozed
Get snoozed reminders.

#### GET /api/reminders/my-reminders
Get current user's reminders.

#### GET /api/reminders/stats
Get reminder statistics.

### 2.7 Recurring Operations

#### POST /api/reminders/:id/recurring/skip
Skip next occurrence.

#### POST /api/reminders/:id/recurring/stop
Stop recurring.

#### GET /api/reminders/:id/recurring/history
Get recurrence history.

### 2.8 Notification Operations

#### PATCH /api/reminders/:id/notification
Update notification config.

#### POST /api/reminders/:id/notification/test
Send test notification.

**Request Body:**
```json
{
  "channel": "email"
}
```

#### POST /api/reminders/:id/acknowledge
Acknowledge notification (mark as seen).

### 2.9 Bulk Operations

#### PATCH /api/reminders/bulk
Bulk update.

#### DELETE /api/reminders/bulk
Bulk delete.

#### POST /api/reminders/bulk/complete
Bulk complete.

#### POST /api/reminders/bulk/snooze
Bulk snooze.

#### POST /api/reminders/bulk/dismiss
Bulk dismiss.

### 2.10 Import/Export

#### POST /api/reminders/import
Import reminders.

#### GET /api/reminders/export
Export reminders.

### 2.11 Templates

#### GET /api/reminders/templates
Get templates.

#### POST /api/reminders/templates/:templateId/create
Create from template.

#### POST /api/reminders/:id/save-as-template
Save as template.

---

## 3. Events Module

### 3.1 Data Types

```typescript
EventType: 'hearing' | 'meeting' | 'deadline' | 'task' | 'conference' | 'consultation' | 'court_session' | 'document_review' | 'training' | 'other'
EventStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'rescheduled'
EventPriority: 'low' | 'medium' | 'high' | 'critical'
RSVPStatus: 'pending' | 'accepted' | 'declined' | 'tentative' | 'no_response'
CalendarProvider: 'google' | 'outlook' | 'apple' | 'ics'
```

### 3.2 CRUD Endpoints

#### GET /api/events
Get all events.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| startDate | string | Date range start |
| endDate | string | Date range end |
| type | string/array | Filter by type |
| status | string/array | Filter by status |
| priority | string/array | Filter by priority |
| caseId | string | Filter by case |
| clientId | string | Filter by client |
| attendeeId | string | Filter by attendee |
| organizerId | string | Filter by organizer |
| isRecurring | boolean | Filter recurring |
| isAllDay | boolean | Filter all-day |
| view | string | Calendar view type |

#### GET /api/events/calendar
Get calendar view data.

**Query Parameters:**
- view: 'day' | 'week' | 'month' | 'year'
- date: string (ISO date)

**Response:**
```json
{
  "events": [...],
  "tasks": [...],
  "reminders": [...],
  "dateRange": {
    "start": "2024-11-01",
    "end": "2024-11-30"
  },
  "summary": {
    "totalEvents": 25,
    "byType": {...},
    "byStatus": {...}
  }
}
```

#### GET /api/events/:id
Get single event.

#### POST /api/events
Create event.

**Request Body:**
```json
{
  "title": "Client Meeting", // required
  "description": "Quarterly review meeting",
  "notes": "Prepare financial reports",
  "type": "meeting", // required
  "status": "scheduled",
  "priority": "high",
  "color": "#3B82F6",
  "tags": ["quarterly", "review"],
  "startDate": "2024-12-01", // required
  "startTime": "14:00",
  "endDate": "2024-12-01",
  "endTime": "15:30",
  "allDay": false,
  "timezone": "Asia/Riyadh",
  "duration": 90,
  "location": {
    "type": "hybrid",
    "address": "123 Business St",
    "city": "Riyadh",
    "room": "Conference Room A",
    "platform": "zoom",
    "meetingUrl": "https://zoom.us/...",
    "meetingId": "123456789",
    "password": "abc123"
  },
  "caseId": "caseId",
  "clientId": "clientId",
  "attendees": [
    {
      "userId": "userId1",
      "role": "required",
      "rsvpStatus": "pending"
    },
    {
      "email": "external@example.com",
      "name": "John Smith",
      "role": "optional",
      "isExternal": true,
      "organization": "ABC Corp"
    }
  ],
  "reminders": [
    { "type": "notification", "beforeMinutes": 30 },
    { "type": "email", "beforeMinutes": 1440 }
  ],
  "recurrence": {
    "enabled": true,
    "frequency": "weekly",
    "daysOfWeek": [1],
    "endDate": "2025-06-01"
  },
  "agenda": [
    { "title": "Opening", "duration": 5, "presenter": "userId" },
    { "title": "Financial Review", "duration": 30 },
    { "title": "Q&A", "duration": 20 }
  ],
  "billable": true,
  "billingRate": 500
}
```

#### PUT /api/events/:id
Update event.

#### DELETE /api/events/:id
Delete event.

### 3.3 Status Endpoints

#### POST /api/events/:id/complete
Mark event as completed.

**Request Body:**
```json
{
  "meetingNotes": "Discussed quarterly targets...",
  "actionItems": [
    { "description": "Send report", "assignedTo": "userId", "dueDate": "2024-12-05" }
  ]
}
```

#### POST /api/events/:id/cancel
Cancel event.

**Request Body:**
```json
{
  "reason": "Client unavailable",
  "notifyAttendees": true
}
```

#### POST /api/events/:id/reschedule
Reschedule event.

**Request Body:**
```json
{
  "newStartDate": "2024-12-02",
  "newEndDate": "2024-12-02",
  "reason": "Schedule conflict",
  "notifyAttendees": true
}
```

#### POST /api/events/:id/start
Start event (mark as in_progress).

### 3.4 Attendee Endpoints

#### POST /api/events/:id/attendees
Add attendee.

**Request Body:**
```json
{
  "userId": "userId",
  // OR for external
  "email": "external@example.com",
  "name": "John Smith",
  "isExternal": true,
  "role": "required"
}
```

#### PATCH /api/events/:id/attendees/:attendeeId
Update attendee.

#### DELETE /api/events/:id/attendees/:attendeeId
Remove attendee.

**Query Parameters:**
- notifyAttendee: boolean

#### POST /api/events/:id/rsvp
RSVP to event (for current user).

**Request Body:**
```json
{
  "status": "accepted",
  "note": "Looking forward to it",
  "proposedTime": "2024-12-02T10:00:00Z" // optional, if declining
}
```

#### POST /api/events/:id/send-invitations
Send invitations to all pending attendees.

**Response:**
```json
{
  "sent": 5,
  "failed": 1
}
```

#### POST /api/events/:id/attendees/:attendeeId/check-in
Check in attendee (for in-person events).

#### POST /api/events/:id/attendees/:attendeeId/check-out
Check out attendee.

### 3.5 Agenda & Notes Endpoints

#### PATCH /api/events/:id/agenda
Update event agenda.

**Request Body:**
```json
{
  "agenda": [
    { "order": 0, "title": "Opening", "duration": 5 },
    { "order": 1, "title": "Main Topic", "duration": 45 }
  ]
}
```

#### PATCH /api/events/:id/notes
Update meeting notes.

**Request Body:**
```json
{
  "meetingNotes": "Discussion points..."
}
```

#### POST /api/events/:id/action-items
Add action item.

#### POST /api/events/:id/action-items/:actionItemId/toggle
Toggle action item completion.

### 3.6 Attachments Endpoints

#### POST /api/events/:id/attachments
Upload attachment.

#### DELETE /api/events/:id/attachments/:attachmentId
Delete attachment.

### 3.7 Comments Endpoints

#### POST /api/events/:id/comments
Add comment.

#### PATCH /api/events/:id/comments/:commentId
Update comment.

#### DELETE /api/events/:id/comments/:commentId
Delete comment.

### 3.8 Query Endpoints

#### GET /api/events/upcoming
Get upcoming events.

#### GET /api/events/today
Get today's events.

#### GET /api/events/my-events
Get current user's events (as attendee or organizer).

#### GET /api/events/pending-rsvp
Get events awaiting RSVP from current user.

#### GET /api/events/stats
Get event statistics.

### 3.9 Recurring Event Endpoints

#### POST /api/events/:id/recurring/skip
Skip next occurrence.

#### POST /api/events/:id/recurring/stop
Stop recurring event.

#### GET /api/events/:id/recurring/instances
Get recurring event instances.

**Query Parameters:**
- startDate: string
- endDate: string

#### PUT /api/events/:id/recurring/instance/:instanceDate
Update single instance of recurring event (creates exception).

### 3.10 Calendar Sync Endpoints

#### POST /api/events/:id/calendar-sync
Sync with external calendar.

**Request Body:**
```json
{
  "provider": "google"
}
```

#### GET /api/events/:id/export/ics
Export event to ICS format.

#### POST /api/events/import/ics
Import events from ICS file.

### 3.11 Bulk Operations

#### PATCH /api/events/bulk
Bulk update events.

#### DELETE /api/events/bulk
Bulk delete events.

#### POST /api/events/bulk/cancel
Bulk cancel events.

### 3.12 Templates

#### GET /api/events/templates
Get event templates.

#### POST /api/events/templates/:templateId/create
Create event from template.

#### POST /api/events/:id/save-as-template
Save event as template.

### 3.13 Availability Endpoints

#### POST /api/events/check-availability
Check availability for attendees.

**Request Body:**
```json
{
  "attendeeIds": ["userId1", "userId2"],
  "startDate": "2024-12-01T14:00:00Z",
  "endDate": "2024-12-01T15:00:00Z"
}
```

**Response:**
```json
{
  "available": false,
  "conflicts": [
    {
      "userId": "userId1",
      "events": [{ "_id": "...", "title": "...", "startDate": "..." }]
    }
  ],
  "suggestedSlots": [
    { "start": "2024-12-01T16:00:00Z", "end": "2024-12-01T17:00:00Z" }
  ]
}
```

#### POST /api/events/find-slots
Find available time slots for all attendees.

**Request Body:**
```json
{
  "attendeeIds": ["userId1", "userId2"],
  "duration": 60,
  "dateRange": {
    "start": "2024-12-01",
    "end": "2024-12-07"
  }
}
```

---

## 4. Common Patterns

### 4.1 Authentication
All endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <token>
```

### 4.2 Error Responses
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {...}
}
```

### 4.3 Pagination Response
```json
{
  "data": [...],
  "total": 100,
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### 4.4 Audit Logging
All mutations should log to history array:
```json
{
  "action": "updated",
  "userId": "userId",
  "timestamp": "2024-11-25T10:00:00Z",
  "oldValue": {...},
  "newValue": {...}
}
```

### 4.5 Real-time Updates
Consider implementing WebSocket notifications for:
- New task assignments
- Task status changes
- Reminder triggers
- RSVP responses
- Event updates

---

## 5. Database Schemas

### 5.1 Task Schema (MongoDB)
```javascript
const TaskSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: String,
  status: { type: String, enum: ['backlog', 'todo', 'in_progress', 'done', 'canceled'], default: 'todo', index: true },
  priority: { type: String, enum: ['none', 'low', 'medium', 'high', 'critical'], default: 'medium', index: true },
  label: { type: String, enum: ['bug', 'feature', 'documentation', 'enhancement', 'question', 'legal', 'administrative', 'urgent'] },
  tags: [{ type: String, index: true }],
  dueDate: { type: Date, index: true },
  dueTime: String,
  startDate: Date,
  completedAt: Date,
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', index: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
  parentTaskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  subtasks: [{
    title: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    order: Number,
    autoReset: Boolean
  }],
  timeTracking: {
    estimatedMinutes: Number,
    actualMinutes: { type: Number, default: 0 },
    sessions: [{
      startedAt: Date,
      endedAt: Date,
      duration: Number,
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      notes: String
    }]
  },
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom'] },
    type: { type: String, enum: ['due_date', 'completion_date'] },
    daysOfWeek: [Number],
    dayOfMonth: Number,
    interval: Number,
    endDate: Date,
    maxOccurrences: Number,
    occurrencesCompleted: { type: Number, default: 0 },
    assigneeStrategy: { type: String, enum: ['fixed', 'round_robin', 'random', 'least_assigned'] },
    assigneePool: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastAssigneeIndex: Number
  },
  reminders: [{
    type: { type: String, enum: ['notification', 'email', 'sms', 'push'] },
    beforeMinutes: Number,
    sent: { type: Boolean, default: false },
    sentAt: Date
  }],
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: Date,
    thumbnailUrl: String
  }],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: Date,
    updatedAt: Date,
    isEdited: Boolean
  }],
  history: [{
    action: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
    details: String
  }],
  isTemplate: { type: Boolean, default: false, index: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'Task' },
  points: Number,
  estimatedMinutes: Number,
  actualMinutes: Number,
  progress: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ updatedAt: -1 });
TaskSchema.index({ 'recurring.enabled': 1 });
TaskSchema.index({ title: 'text', description: 'text' });
```

### 5.2 Reminder Schema
```javascript
const ReminderSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: String,
  message: String,
  notes: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reminderDate: { type: Date, required: true, index: true },
  reminderTime: { type: String, required: true },
  timezone: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent', 'critical'], default: 'medium', index: true },
  type: { type: String, enum: ['task', 'hearing', 'deadline', 'meeting', 'payment', 'general', 'follow_up', 'court_date', 'document_submission', 'client_call'], index: true },
  status: { type: String, enum: ['pending', 'snoozed', 'triggered', 'completed', 'dismissed', 'expired'], default: 'pending', index: true },
  tags: [String],
  relatedCase: { type: Schema.Types.ObjectId, ref: 'Case', index: true },
  relatedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
  relatedEvent: { type: Schema.Types.ObjectId, ref: 'Event' },
  relatedClient: { type: Schema.Types.ObjectId, ref: 'Client' },
  snooze: {
    snoozedAt: Date,
    snoozeUntil: Date,
    snoozeCount: { type: Number, default: 0 },
    reason: String
  },
  maxSnoozeCount: { type: Number, default: 5 },
  recurring: {
    enabled: { type: Boolean, default: false },
    frequency: String,
    daysOfWeek: [Number],
    dayOfMonth: Number,
    interval: Number,
    endType: { type: String, enum: ['never', 'after_occurrences', 'on_date'] },
    endDate: Date,
    maxOccurrences: Number,
    occurrencesCompleted: { type: Number, default: 0 },
    skipWeekends: Boolean,
    skipHolidays: Boolean
  },
  notification: {
    channels: [{ type: String, enum: ['push', 'email', 'sms', 'whatsapp', 'in_app'] }],
    advanceNotifications: [Number],
    escalationEnabled: Boolean,
    escalationDelayMinutes: Number,
    escalationTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    overrideDnd: Boolean,
    soundEnabled: Boolean,
    vibrationEnabled: Boolean
  },
  notificationSent: { type: Boolean, default: false },
  notificationSentAt: Date,
  lastNotificationAt: Date,
  completedAt: Date,
  history: [{
    action: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
    details: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }]
}, {
  timestamps: true
});
```

### 5.3 Event Schema
```javascript
const EventSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: String,
  notes: String,
  type: { type: String, enum: ['hearing', 'meeting', 'deadline', 'task', 'conference', 'consultation', 'court_session', 'document_review', 'training', 'other'], required: true, index: true },
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed', 'rescheduled'], default: 'scheduled', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  color: { type: String, default: '#3B82F6' },
  tags: [String],
  startDate: { type: Date, required: true, index: true },
  startTime: String,
  endDate: Date,
  endTime: String,
  allDay: { type: Boolean, default: false },
  timezone: String,
  duration: Number,
  location: {
    type: { type: String, enum: ['physical', 'virtual', 'hybrid'] },
    address: String,
    city: String,
    country: String,
    room: String,
    building: String,
    coordinates: { lat: Number, lng: Number },
    platform: String,
    meetingUrl: String,
    meetingId: String,
    password: String,
    dialInNumbers: [{ country: String, number: String }],
    parkingInfo: String,
    directions: String
  },
  caseId: { type: Schema.Types.ObjectId, ref: 'Case', index: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  clientId: { type: Schema.Types.ObjectId, ref: 'Client', index: true },
  attendees: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: String,
    name: String,
    role: { type: String, enum: ['organizer', 'required', 'optional', 'resource'] },
    rsvpStatus: { type: String, enum: ['pending', 'accepted', 'declined', 'tentative', 'no_response'], default: 'pending' },
    rsvpResponseAt: Date,
    rsvpNote: String,
    notificationSent: { type: Boolean, default: false },
    notificationSentAt: Date,
    checkInTime: Date,
    checkOutTime: Date,
    attended: Boolean,
    isExternal: Boolean,
    organization: String,
    phone: String
  }],
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reminders: [{
    type: { type: String, enum: ['notification', 'email', 'sms', 'push', 'whatsapp'] },
    beforeMinutes: Number,
    sent: { type: Boolean, default: false },
    sentAt: Date,
    failed: Boolean,
    failureReason: String
  }],
  recurrence: {
    enabled: { type: Boolean, default: false },
    frequency: String,
    daysOfWeek: [Number],
    dayOfMonth: Number,
    weekOfMonth: Number,
    interval: Number,
    endDate: Date,
    maxOccurrences: Number,
    occurrencesCompleted: { type: Number, default: 0 },
    excludedDates: [Date],
    skipWeekends: Boolean,
    skipHolidays: Boolean
  },
  isRecurringInstance: { type: Boolean, default: false },
  parentEventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  instanceDate: Date,
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: Date,
    description: String
  }],
  comments: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: Date,
    updatedAt: Date,
    isEdited: Boolean
  }],
  calendarSync: [{
    provider: { type: String, enum: ['google', 'outlook', 'apple', 'ics'] },
    externalId: String,
    lastSyncedAt: Date,
    syncEnabled: Boolean,
    syncError: String
  }],
  agenda: [{
    order: Number,
    title: String,
    duration: Number,
    presenter: String,
    notes: String,
    completed: Boolean
  }],
  meetingNotes: String,
  actionItems: [{
    description: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    dueDate: Date,
    completed: { type: Boolean, default: false }
  }],
  billable: { type: Boolean, default: false },
  billedHours: Number,
  billingRate: Number,
  history: [{
    action: String,
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
    details: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Indexes
EventSchema.index({ startDate: 1, endDate: 1 });
EventSchema.index({ 'attendees.userId': 1 });
EventSchema.index({ 'attendees.email': 1 });
EventSchema.index({ title: 'text', description: 'text' });
```

---

## Implementation Notes

### Background Jobs
Implement the following cron jobs/workers:

1. **Reminder Trigger Job** (every minute)
   - Check for reminders where reminderDate/Time <= now
   - Send notifications via configured channels
   - Update status to 'triggered'
   - Handle escalation if enabled

2. **Recurring Task Creator** (daily)
   - Find tasks with recurring.enabled where next due date is today
   - Create new task instances

3. **Event Reminder Job** (every minute)
   - Check event reminders
   - Send notifications to attendees

4. **Overdue Task Notification** (hourly)
   - Find overdue tasks
   - Send notifications to assignees

5. **Snooze Expiry Job** (every minute)
   - Check snoozed reminders where snoozeUntil <= now
   - Update status to 'pending'
   - Trigger notification

### Notification Service
Implement a notification service that handles:
- Push notifications (FCM/APNS)
- Email (SendGrid/SES)
- SMS (Twilio)
- WhatsApp Business API
- In-app notifications (WebSocket)

### Calendar Integration
For external calendar sync:
- Google Calendar API
- Microsoft Graph API (Outlook)
- Apple Calendar (CalDAV)
- ICS file generation/parsing
