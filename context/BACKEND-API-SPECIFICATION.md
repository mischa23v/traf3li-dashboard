# Backend API Specification
## Tasks, Reminders, and Events Management System

This document provides comprehensive API specifications for backend implementation of the Tasks, Reminders, and Events management system.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Tasks API](#tasks-api)
3. [Reminders API](#reminders-api)
4. [Events API](#events-api)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Pagination & Filtering](#pagination--filtering)

---

## Authentication

All endpoints require JWT Bearer token authentication:

```
Authorization: Bearer <token>
```

---

## Tasks API

### Base URL: `/api/v1/tasks`

### Data Model

```typescript
interface Task {
  _id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'
  priority: 'none' | 'low' | 'medium' | 'high' | 'critical'
  label?: 'bug' | 'feature' | 'documentation' | 'enhancement' | 'question' | 'legal' | 'administrative' | 'urgent'
  tags?: string[]
  dueDate?: string // ISO date
  dueTime?: string // HH:mm format
  startDate?: string
  assignedTo?: string // User ID or populated User object
  createdBy: string // User ID
  caseId?: string // Related case
  clientId?: string // Related client
  parentTaskId?: string // For sub-tasks
  subtasks?: Subtask[]
  checklists?: Checklist[]
  timeTracking?: TimeTracking
  recurring?: RecurringConfig
  reminders?: TaskReminder[]
  attachments?: Attachment[]
  comments?: Comment[]
  history?: HistoryEntry[]
  points?: number // Gamification
  progress?: number // 0-100, auto-calculated from subtasks
  createdAt: string
  updatedAt: string
}

interface Subtask {
  _id: string
  title: string
  completed: boolean
  completedAt?: string
  autoReset?: boolean // Reset on recurring task completion
}

interface RecurringConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  type?: 'due_date' | 'completion_date'
  daysOfWeek?: number[] // 0-6 for Sunday-Saturday
  dayOfMonth?: number
  weekOfMonth?: number
  interval?: number // For custom frequency
  endDate?: string
  maxOccurrences?: number
  occurrencesCompleted?: number
  assigneeStrategy?: 'fixed' | 'round_robin' | 'random' | 'least_assigned'
  assigneePool?: string[] // User IDs for rotation
}

interface TimeTracking {
  estimatedMinutes?: number
  actualMinutes?: number
  sessions?: TimeSession[]
}

interface TimeSession {
  _id: string
  startedAt: string
  endedAt?: string
  duration?: number // minutes
  userId: string
  notes?: string
}
```

### Endpoints

#### Basic CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Get all tasks with filters |
| GET | `/tasks/:id` | Get single task |
| POST | `/tasks` | Create new task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

#### Get All Tasks
```http
GET /api/v1/tasks?status=todo&priority=high&assignedTo=userId&caseId=caseId&page=1&limit=20&sortBy=dueDate&sortOrder=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### Create Task
```http
POST /api/v1/tasks
Content-Type: application/json

{
  "title": "Complete legal documentation",
  "description": "Prepare all required documents",
  "status": "todo",
  "priority": "high",
  "label": "legal",
  "tags": ["urgent", "client-A"],
  "dueDate": "2025-12-01",
  "dueTime": "14:00",
  "assignedTo": "user_id",
  "caseId": "case_id",
  "clientId": "client_id",
  "subtasks": [
    { "title": "Gather documents", "completed": false },
    { "title": "Review by lawyer", "completed": false }
  ],
  "recurring": {
    "enabled": true,
    "frequency": "weekly",
    "daysOfWeek": [0, 3],
    "assigneeStrategy": "round_robin",
    "assigneePool": ["user1", "user2", "user3"]
  },
  "reminders": [
    { "type": "due_date", "beforeMinutes": 60 },
    { "type": "due_date", "beforeMinutes": 1440 }
  ],
  "timeTracking": {
    "estimatedMinutes": 120
  }
}
```

#### Status Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/tasks/:id/status` | Update task status |
| POST | `/tasks/:id/complete` | Mark task as done |
| POST | `/tasks/:id/reopen` | Reopen completed task |

#### Subtasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/:id/subtasks` | Add subtask |
| PATCH | `/tasks/:id/subtasks/:subtaskId` | Update subtask |
| POST | `/tasks/:id/subtasks/:subtaskId/toggle` | Toggle completion |
| DELETE | `/tasks/:id/subtasks/:subtaskId` | Delete subtask |
| PATCH | `/tasks/:id/subtasks/reorder` | Reorder subtasks |

#### Time Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/:id/time-tracking/start` | Start time tracking |
| POST | `/tasks/:id/time-tracking/stop` | Stop time tracking |
| POST | `/tasks/:id/time-tracking/manual` | Add manual time entry |
| GET | `/tasks/:id/time-tracking` | Get time tracking summary |

**Start Time Tracking:**
```http
POST /api/v1/tasks/:id/time-tracking/start
```

**Stop Time Tracking:**
```http
POST /api/v1/tasks/:id/time-tracking/stop
{
  "notes": "Completed document review"
}
```

**Manual Entry:**
```http
POST /api/v1/tasks/:id/time-tracking/manual
{
  "duration": 45,
  "date": "2025-11-27",
  "notes": "Research time"
}
```

#### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/:id/comments` | Add comment |
| PATCH | `/tasks/:id/comments/:commentId` | Update comment |
| DELETE | `/tasks/:id/comments/:commentId` | Delete comment |

```http
POST /api/v1/tasks/:id/comments
{
  "content": "Please review by end of day",
  "mentions": ["user_id_1", "user_id_2"]
}
```

#### Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/:id/attachments` | Upload file (multipart/form-data) |
| DELETE | `/tasks/:id/attachments/:attachmentId` | Delete attachment |

#### Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/upcoming?days=7` | Tasks due within X days |
| GET | `/tasks/overdue` | Overdue tasks |
| GET | `/tasks/due-today` | Tasks due today |
| GET | `/tasks/my-tasks` | Current user's assigned tasks |
| GET | `/tasks/stats` | Task statistics |

**Stats Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "backlog": 20,
      "todo": 45,
      "in_progress": 30,
      "done": 50,
      "canceled": 5
    },
    "byPriority": {
      "critical": 5,
      "high": 20,
      "medium": 60,
      "low": 40,
      "none": 25
    },
    "overdue": 8,
    "dueToday": 12,
    "completedThisWeek": 25
  }
}
```

#### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/templates` | Get task templates |
| POST | `/tasks/templates/:templateId/create` | Create task from template |
| POST | `/tasks/:id/save-as-template` | Save task as template |

#### Bulk Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/tasks/bulk` | Bulk update |
| DELETE | `/tasks/bulk` | Bulk delete |
| POST | `/tasks/bulk/complete` | Bulk complete |
| POST | `/tasks/bulk/assign` | Bulk assign |

```http
PATCH /api/v1/tasks/bulk
{
  "ids": ["task1", "task2", "task3"],
  "updates": {
    "status": "in_progress",
    "assignedTo": "new_user_id"
  }
}
```

#### Import/Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/import` | Import from CSV |
| GET | `/tasks/export?format=csv` | Export tasks |

#### Recurring Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks/:id/recurring/skip` | Skip next occurrence |
| POST | `/tasks/:id/recurring/stop` | Stop recurring |
| GET | `/tasks/:id/recurring/history` | Get recurrence history |

---

## Reminders API

### Base URL: `/api/v1/reminders`

### Data Model

```typescript
interface Reminder {
  _id: string
  title: string
  description?: string
  message?: string
  userId: string
  assignedTo?: string
  reminderDate: string // ISO date
  reminderTime: string // HH:mm
  timezone?: string // e.g., 'Asia/Riyadh'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  type: 'task' | 'hearing' | 'deadline' | 'meeting' | 'payment' | 'general' | 'follow_up' | 'court_date' | 'document_submission' | 'client_call'
  status: 'pending' | 'snoozed' | 'triggered' | 'completed' | 'dismissed' | 'expired'
  tags?: string[]
  relatedCase?: string
  relatedTask?: string
  relatedEvent?: string
  relatedClient?: string
  snooze?: SnoozeConfig
  maxSnoozeCount?: number
  recurring?: RecurringConfig
  isRecurringInstance?: boolean
  parentReminderId?: string
  notification: NotificationConfig
  acknowledgment?: ReminderAcknowledgment
  history?: HistoryEntry[]
  createdAt: string
  updatedAt: string
}

interface SnoozeConfig {
  snoozedAt?: string
  snoozeUntil?: string
  snoozeCount: number
  reason?: string
}

interface NotificationConfig {
  channels: ('push' | 'email' | 'sms' | 'whatsapp' | 'in_app')[]
  advanceNotifications?: number[] // minutes before
  escalationEnabled?: boolean
  escalationDelayMinutes?: number
  escalationContacts?: string[]
  soundEnabled?: boolean
  vibrationEnabled?: boolean
  doNotDisturbOverride?: boolean
}

interface ReminderAcknowledgment {
  acknowledgedAt?: string
  acknowledgedBy?: string
  action?: 'seen' | 'actioned' | 'delegated'
  notes?: string
  delegatedTo?: string
}

interface RecurringConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  endType?: 'never' | 'after_occurrences' | 'on_date'
  daysOfWeek?: number[]
  dayOfMonth?: number
  interval?: number
  endDate?: string
  maxOccurrences?: number
  occurrencesCompleted?: number
  skipWeekends?: boolean
  skipHolidays?: boolean
}
```

### Endpoints

#### Basic CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reminders` | Get all reminders |
| GET | `/reminders/:id` | Get single reminder |
| POST | `/reminders` | Create reminder |
| PUT | `/reminders/:id` | Update reminder |
| DELETE | `/reminders/:id` | Delete reminder |

#### Create Reminder
```http
POST /api/v1/reminders
{
  "title": "Court hearing preparation deadline",
  "description": "Complete all documents for case #12345",
  "reminderDate": "2025-12-01",
  "reminderTime": "09:00",
  "timezone": "Asia/Riyadh",
  "priority": "high",
  "type": "deadline",
  "assignedTo": "user_id",
  "relatedCase": "case_id",
  "relatedClient": "client_id",
  "maxSnoozeCount": 3,
  "notification": {
    "channels": ["in_app", "email", "push"],
    "advanceNotifications": [1440, 60, 15],
    "escalationEnabled": true,
    "escalationDelayMinutes": 60,
    "escalationContacts": ["manager_id"]
  },
  "recurring": {
    "enabled": true,
    "frequency": "weekly",
    "daysOfWeek": [0, 3],
    "skipWeekends": true,
    "skipHolidays": true
  }
}
```

#### Status Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reminders/:id/complete` | Mark as completed |
| POST | `/reminders/:id/dismiss` | Dismiss reminder |
| POST | `/reminders/:id/reopen` | Reopen reminder |

#### Snooze Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reminders/:id/snooze` | Snooze reminder |
| POST | `/reminders/:id/cancel-snooze` | Cancel snooze |

**Snooze Reminder:**
```http
POST /api/v1/reminders/:id/snooze
{
  "duration": 60,  // minutes
  "reason": "In a meeting"
}
```

**Pre-defined Snooze Endpoints (convenience):**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reminders/:id/snooze/15m` | Snooze 15 minutes |
| POST | `/reminders/:id/snooze/1h` | Snooze 1 hour |
| POST | `/reminders/:id/snooze/1d` | Snooze 1 day |
| POST | `/reminders/:id/snooze/tomorrow` | Snooze until tomorrow 9am |
| POST | `/reminders/:id/snooze/next-week` | Snooze until next Monday 9am |

#### Delegation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reminders/:id/delegate` | Delegate to user |

```http
POST /api/v1/reminders/:id/delegate
{
  "delegateTo": "user_id",
  "notes": "Please handle this while I'm away"
}
```

#### Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reminders/upcoming?days=7` | Upcoming reminders |
| GET | `/reminders/overdue` | Overdue reminders |
| GET | `/reminders/today` | Today's reminders |
| GET | `/reminders/snoozed` | Snoozed reminders |
| GET | `/reminders/my-reminders` | User's reminders |
| GET | `/reminders/stats` | Reminder statistics |

#### Recurring Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reminders/:id/recurring/skip` | Skip next occurrence |
| POST | `/reminders/:id/recurring/stop` | Stop recurring |
| GET | `/reminders/:id/recurring/history` | Get recurrence history |

#### Notification Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/reminders/:id/notification` | Update notification config |
| POST | `/reminders/:id/notification/test` | Send test notification |
| POST | `/reminders/:id/acknowledge` | Mark as acknowledged/seen |

#### Bulk Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/reminders/bulk` | Bulk update |
| DELETE | `/reminders/bulk` | Bulk delete |
| POST | `/reminders/bulk/complete` | Bulk complete |
| POST | `/reminders/bulk/snooze` | Bulk snooze |
| POST | `/reminders/bulk/dismiss` | Bulk dismiss |

#### Import/Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/reminders/import` | Import from CSV/JSON |
| GET | `/reminders/export?format=csv` | Export reminders |

#### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reminders/templates` | Get templates |
| POST | `/reminders/templates/:templateId/create` | Create from template |
| POST | `/reminders/:id/save-as-template` | Save as template |

---

## Events API

### Base URL: `/api/v1/events`

### Data Model

```typescript
interface Event {
  _id: string
  title: string
  description?: string
  notes?: string
  type: 'hearing' | 'meeting' | 'deadline' | 'task' | 'conference' | 'consultation' | 'court_session' | 'document_review' | 'training' | 'other'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'rescheduled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  color?: string // Hex color for calendar display
  tags?: string[]
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  allDay?: boolean
  timezone?: string
  duration?: number // minutes
  location?: string | EventLocation
  caseId?: string
  taskId?: string
  clientId?: string
  attendees?: EventAttendee[]
  organizer?: string // User ID
  reminders?: EventReminder[]
  recurrence?: RecurrenceConfig
  isRecurringInstance?: boolean
  parentEventId?: string
  attachments?: Attachment[]
  comments?: Comment[]
  calendarSync?: CalendarSync[]
  agenda?: AgendaItem[]
  meetingNotes?: string
  actionItems?: ActionItem[]
  billable?: boolean
  billedHours?: number
  billingRate?: number
  history?: HistoryEntry[]
  createdAt: string
  updatedAt: string
}

interface EventLocation {
  type: 'physical' | 'virtual' | 'hybrid'
  address?: string
  room?: string
  building?: string
  city?: string
  country?: string
  coordinates?: { lat: number; lng: number }
  platform?: 'zoom' | 'teams' | 'meet' | 'webex' | 'custom'
  meetingUrl?: string
  meetingId?: string
  password?: string
  dialInNumbers?: string[]
}

interface EventAttendee {
  _id: string
  userId?: string
  name: string
  email?: string
  phone?: string
  role: 'organizer' | 'required' | 'optional' | 'presenter' | 'observer'
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'tentative'
  rsvpAt?: string
  rsvpNotes?: string
  checkInAt?: string
  checkOutAt?: string
  attended?: boolean
}

interface EventReminder {
  _id: string
  type: 'notification' | 'email' | 'sms'
  beforeMinutes: number
  sent?: boolean
  sentAt?: string
}

interface AgendaItem {
  order: number
  title: string
  duration?: number // minutes
  presenter?: string
  notes?: string
  completed?: boolean
}

interface ActionItem {
  _id: string
  description: string
  assignedTo?: string
  dueDate?: string
  completed: boolean
  completedAt?: string
}

interface CalendarSync {
  provider: 'google' | 'outlook' | 'apple' | 'ics'
  externalId?: string
  syncedAt?: string
  lastError?: string
}

interface RecurrenceConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  daysOfWeek?: number[]
  dayOfMonth?: number
  weekOfMonth?: number
  interval?: number
  endDate?: string
  maxOccurrences?: number
  excludedDates?: string[]
}
```

### Endpoints

#### Basic CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | Get all events |
| GET | `/events/calendar` | Get events in calendar format |
| GET | `/events/:id` | Get single event |
| POST | `/events` | Create event |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |

#### Create Event
```http
POST /api/v1/events
{
  "title": "Client Consultation",
  "description": "Initial consultation for new case",
  "type": "consultation",
  "status": "scheduled",
  "priority": "high",
  "color": "#3B82F6",
  "tags": ["consultation", "new-client"],
  "startDate": "2025-12-01",
  "startTime": "10:00",
  "endDate": "2025-12-01",
  "endTime": "11:30",
  "allDay": false,
  "duration": 90,
  "timezone": "Asia/Riyadh",
  "location": {
    "type": "hybrid",
    "address": "Main Office, Floor 5",
    "room": "Meeting Room A",
    "platform": "zoom",
    "meetingUrl": "https://zoom.us/j/123456789",
    "meetingId": "123 456 789",
    "password": "abc123"
  },
  "caseId": "case_id",
  "clientId": "client_id",
  "attendees": [
    { "name": "John Doe", "email": "john@example.com", "role": "required" },
    { "name": "Jane Smith", "email": "jane@example.com", "role": "optional" }
  ],
  "reminders": [
    { "type": "notification", "beforeMinutes": 15 },
    { "type": "email", "beforeMinutes": 1440 }
  ],
  "agenda": [
    { "order": 1, "title": "Introductions", "duration": 5 },
    { "order": 2, "title": "Case Overview", "duration": 20 },
    { "order": 3, "title": "Discussion", "duration": 45 },
    { "order": 4, "title": "Next Steps", "duration": 20 }
  ],
  "recurrence": {
    "enabled": true,
    "frequency": "weekly",
    "daysOfWeek": [1], // Monday
    "endDate": "2026-01-01"
  },
  "billable": true,
  "billingRate": 500
}
```

#### Calendar View
```http
GET /api/v1/events/calendar?view=month&date=2025-12-01
GET /api/v1/events/calendar?view=week&date=2025-12-01
GET /api/v1/events/calendar?view=day&date=2025-12-01
```

#### Status Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:id/complete` | Mark event as completed |
| POST | `/events/:id/cancel` | Cancel event |
| POST | `/events/:id/reschedule` | Reschedule event |
| POST | `/events/:id/start` | Mark as in_progress |

**Complete Event:**
```http
POST /api/v1/events/:id/complete
{
  "notes": "Meeting went well, follow-up scheduled",
  "billedHours": 1.5
}
```

**Cancel Event:**
```http
POST /api/v1/events/:id/cancel
{
  "reason": "Client requested postponement",
  "notifyAttendees": true
}
```

**Reschedule Event:**
```http
POST /api/v1/events/:id/reschedule
{
  "newStartDate": "2025-12-05",
  "newStartTime": "14:00",
  "newEndTime": "15:30",
  "reason": "Schedule conflict",
  "notifyAttendees": true
}
```

#### Attendee Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:id/attendees` | Add attendee |
| PATCH | `/events/:id/attendees/:attendeeId` | Update attendee |
| DELETE | `/events/:id/attendees/:attendeeId` | Remove attendee |
| POST | `/events/:id/rsvp` | RSVP to event (current user) |
| POST | `/events/:id/send-invitations` | Send invitations |
| POST | `/events/:id/attendees/:attendeeId/check-in` | Check in attendee |
| POST | `/events/:id/attendees/:attendeeId/check-out` | Check out attendee |

**RSVP:**
```http
POST /api/v1/events/:id/rsvp
{
  "status": "accepted",  // accepted | declined | tentative
  "notes": "Looking forward to it"
}
```

**Check In:**
```http
POST /api/v1/events/:id/attendees/:attendeeId/check-in
{
  "timestamp": "2025-12-01T10:05:00Z"
}
```

#### Agenda & Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/events/:id/agenda` | Update agenda |
| PATCH | `/events/:id/notes` | Update meeting notes |
| POST | `/events/:id/action-items` | Add action item |
| POST | `/events/:id/action-items/:actionItemId/toggle` | Toggle action item |

**Update Agenda:**
```http
PATCH /api/v1/events/:id/agenda
{
  "agenda": [
    { "order": 1, "title": "Opening", "duration": 5, "completed": true },
    { "order": 2, "title": "Main Discussion", "duration": 30 }
  ]
}
```

**Add Action Item:**
```http
POST /api/v1/events/:id/action-items
{
  "description": "Send follow-up documents to client",
  "assignedTo": "user_id",
  "dueDate": "2025-12-05"
}
```

#### Query Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/upcoming?days=7` | Upcoming events |
| GET | `/events/today` | Today's events |
| GET | `/events/my-events` | Current user's events |
| GET | `/events/pending-rsvp` | Events pending RSVP |
| GET | `/events/stats` | Event statistics |

#### Recurring Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:id/recurring/skip` | Skip occurrence |
| POST | `/events/:id/recurring/stop` | Stop recurring |
| GET | `/events/:id/recurring/instances` | Get all instances |
| PUT | `/events/:id/recurring/instance/:instanceDate` | Update single instance |

**Update Single Instance:**
```http
PUT /api/v1/events/:id/recurring/instance/2025-12-08
{
  "startTime": "11:00",
  "endTime": "12:30",
  "notes": "Moved to later time"
}
```

#### Calendar Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/:id/calendar-sync` | Sync to external calendar |
| GET | `/events/:id/export/ics` | Export as ICS file |
| POST | `/events/import/ics` | Import from ICS file |

**Sync to Calendar:**
```http
POST /api/v1/events/:id/calendar-sync
{
  "provider": "google",
  "calendarId": "primary"
}
```

#### Bulk Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/events/bulk` | Bulk update |
| DELETE | `/events/bulk` | Bulk delete |
| POST | `/events/bulk/cancel` | Bulk cancel |

#### Templates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events/templates` | Get templates |
| POST | `/events/templates/:templateId/create` | Create from template |
| POST | `/events/:id/save-as-template` | Save as template |

#### Availability

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events/check-availability` | Check attendee availability |
| POST | `/events/find-slots` | Find available time slots |

**Check Availability:**
```http
POST /api/v1/events/check-availability
{
  "attendees": ["user_id_1", "user_id_2"],
  "startDate": "2025-12-01",
  "endDate": "2025-12-07",
  "duration": 60
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conflicts": [
      {
        "userId": "user_id_1",
        "conflicts": [
          { "date": "2025-12-02", "time": "10:00-11:00", "event": "Existing Meeting" }
        ]
      }
    ]
  }
}
```

**Find Available Slots:**
```http
POST /api/v1/events/find-slots
{
  "attendees": ["user_id_1", "user_id_2"],
  "startDate": "2025-12-01",
  "endDate": "2025-12-07",
  "duration": 60,
  "workingHours": { "start": "09:00", "end": "17:00" },
  "excludeWeekends": true
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "title", "message": "Title is required" }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination & Filtering

### Pagination Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `sortBy` | string | `createdAt` | Field to sort by |
| `sortOrder` | string | `desc` | Sort order (asc/desc) |

### Filter Parameters

#### Tasks Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `priority` | string | Filter by priority |
| `label` | string | Filter by label |
| `assignedTo` | string | Filter by assignee |
| `caseId` | string | Filter by case |
| `clientId` | string | Filter by client |
| `dueDateFrom` | string | Due date from |
| `dueDateTo` | string | Due date to |
| `tags` | string[] | Filter by tags |
| `search` | string | Search in title/description |
| `isRecurring` | boolean | Filter recurring tasks |

#### Reminders Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `priority` | string | Filter by priority |
| `type` | string | Filter by type |
| `assignedTo` | string | Filter by assignee |
| `relatedCase` | string | Filter by case |
| `dateFrom` | string | Date from |
| `dateTo` | string | Date to |
| `search` | string | Search in title/description |

#### Events Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `type` | string | Filter by type |
| `priority` | string | Filter by priority |
| `caseId` | string | Filter by case |
| `clientId` | string | Filter by client |
| `startDateFrom` | string | Start date from |
| `startDateTo` | string | Start date to |
| `attendee` | string | Filter by attendee |
| `search` | string | Search in title/description |

---

## Webhooks (Optional)

Configure webhooks to receive notifications for events:

| Event | Payload |
|-------|---------|
| `task.created` | Full task object |
| `task.updated` | Task with changes |
| `task.completed` | Task object |
| `task.deleted` | Task ID |
| `reminder.triggered` | Reminder object |
| `reminder.snoozed` | Reminder with snooze info |
| `event.created` | Full event object |
| `event.rsvp` | Event with RSVP details |
| `event.cancelled` | Event with reason |

---

## Implementation Notes

### Database Indexes

Recommended indexes for optimal performance:

```javascript
// Tasks
db.tasks.createIndex({ "status": 1, "dueDate": 1 })
db.tasks.createIndex({ "assignedTo": 1, "status": 1 })
db.tasks.createIndex({ "caseId": 1 })
db.tasks.createIndex({ "createdAt": -1 })
db.tasks.createIndex({ "title": "text", "description": "text" })

// Reminders
db.reminders.createIndex({ "status": 1, "reminderDate": 1 })
db.reminders.createIndex({ "assignedTo": 1, "status": 1 })
db.reminders.createIndex({ "reminderDate": 1, "reminderTime": 1 })

// Events
db.events.createIndex({ "startDate": 1, "startTime": 1 })
db.events.createIndex({ "status": 1, "startDate": 1 })
db.events.createIndex({ "caseId": 1 })
db.events.createIndex({ "attendees.userId": 1 })
```

### Background Jobs

Required background job processors:

1. **Reminder Trigger Job**: Check and trigger reminders at scheduled times
2. **Recurring Task Generator**: Create instances of recurring tasks
3. **Recurring Reminder Generator**: Create instances of recurring reminders
4. **Recurring Event Generator**: Create instances of recurring events
5. **Overdue Notification Job**: Notify about overdue items
6. **Escalation Job**: Handle reminder escalations
7. **Calendar Sync Job**: Sync with external calendars

### Notification Service Integration

The notification system should support:
- Push notifications (Firebase/APNs)
- Email (SMTP/SendGrid/etc.)
- SMS (Twilio/etc.)
- WhatsApp (Twilio/etc.)
- In-app notifications (WebSocket/SSE)

---

*Last Updated: November 2025*
*Version: 1.0.0*
