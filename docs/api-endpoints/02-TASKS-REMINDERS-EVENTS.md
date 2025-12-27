# Tasks, Reminders & Events API Endpoints

## Tasks API

### Base URL: `/api/tasks`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/tasks` | title, description, priority, status, dueDate, assignedTo, caseId, recurring, tags, notes | Task object | Yes |
| GET | `/tasks` | Query: status, priority, assignedTo, caseId, overdue, page, limit | Tasks array + pagination | Yes |
| GET | `/tasks/upcoming` | Query: days (default 7) | Upcoming tasks | Yes |
| GET | `/tasks/overdue` | None | Overdue tasks | Yes |
| GET | `/tasks/case/:caseId` | caseId | Tasks for case | Yes |
| GET | `/tasks/:_id` | _id | Single task | Yes |
| PATCH | `/tasks/:_id` | Any task fields | Updated task | Yes |
| DELETE | `/tasks/:_id` | _id | Success message | Yes |
| POST | `/tasks/:_id/complete` | _id | Completed task + next recurring | Yes |
| DELETE | `/tasks/bulk` | taskIds[] | Success with count | Yes |

### Task Status Values
- `backlog`, `todo`, `in progress`, `in-progress`, `done`, `canceled`

### Task Priority Values
- `high`, `medium`, `low`

---

## Reminders API

### Base URL: `/api/reminders`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/reminders` | title, description, reminderDate, reminderTime, priority, type, relatedCase, relatedTask, relatedEvent, recurring, notes | Reminder object | Yes |
| GET | `/reminders` | Query: status, priority, type, relatedCase, startDate, endDate, page, limit | Reminders + pagination | Yes |
| GET | `/reminders/upcoming` | Query: days (default 7) | Upcoming reminders | Yes |
| GET | `/reminders/overdue` | None | Overdue reminders | Yes |
| GET | `/reminders/:id` | id | Single reminder | Yes |
| PUT | `/reminders/:id` | Any reminder fields | Updated reminder | Yes |
| DELETE | `/reminders/:id` | id | Success message | Yes |
| POST | `/reminders/:id/complete` | id | Completed reminder | Yes |
| POST | `/reminders/:id/dismiss` | id | Dismissed reminder | Yes |
| DELETE | `/reminders/bulk` | reminderIds[] | Success with count | Yes |

### Reminder Types
- `task`, `hearing`, `deadline`, `meeting`, `payment`, `general`

### Reminder Status
- `pending`, `completed`, `dismissed`

---

## Events API

### Base URL: `/api/events`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| POST | `/events` | title, type, description, startDate, endDate, allDay, location, caseId, taskId, attendees, reminders, notes, color, recurrence | Event object | Yes |
| GET | `/events` | Query: startDate, endDate, type, caseId, status | Events + tasks array | Yes |
| GET | `/events/upcoming` | None | Next 7 days events | Yes |
| GET | `/events/month/:year/:month` | year, month | Events grouped by date | Yes |
| GET | `/events/date/:date` | date (YYYY-MM-DD) | Events + tasks for date | Yes |
| GET | `/events/:id` | id | Single event | Yes |
| PATCH | `/events/:id` | Any event fields | Updated event | Yes |
| DELETE | `/events/:id` | id | Success message | Yes |
| POST | `/events/:id/complete` | id | Completed event | Yes |

### Event Types
- `hearing`, `meeting`, `deadline`, `task`, `other`

### Event Status
- `scheduled`, `completed`, `cancelled`

---

## Calendar API (Unified View)

### Base URL: `/api/calendar`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/calendar` | Query: startDate, endDate, type, caseId | Events, tasks, reminders, combined, summary | Yes |
| GET | `/calendar/upcoming` | Query: days (default 7) | Upcoming items + summary | Yes |
| GET | `/calendar/overdue` | None | Overdue tasks, reminders, past events | Yes |
| GET | `/calendar/stats` | Query: startDate, endDate | Aggregated stats by status | Yes |
| GET | `/calendar/date/:date` | date | Items for specific date | Yes |
| GET | `/calendar/month/:year/:month` | year, month | Items grouped by date | Yes |

---

## Notifications API

### Base URL: `/api/notifications`

| Method | Endpoint | Parameters | Returns | Auth |
|--------|----------|------------|---------|------|
| GET | `/notifications` | Query: read, type, page, limit | Notifications array | Yes |
| GET | `/notifications/unread-count` | None | `{ count }` | Yes |
| PATCH | `/notifications/:id/read` | id | Updated notification | Yes |
| PATCH | `/notifications/mark-all-read` | None | `{ modifiedCount }` | Yes |
| DELETE | `/notifications/:id` | id | Success message | Yes |

### Notification Types
- `order`, `proposal`, `proposal_accepted`, `task`, `message`, `hearing`, `case`, `event`, `review`, `payment`

## Socket.IO Events

| Event | Direction | Data |
|-------|-----------|------|
| `notification:new` | Server → Client | Full notification object |
| `notification:count` | Server → Client | `{ count }` |
