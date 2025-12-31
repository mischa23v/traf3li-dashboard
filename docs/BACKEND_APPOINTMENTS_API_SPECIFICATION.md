# Appointments API Backend Specification

## Overview

This document provides detailed backend implementation instructions for the Appointments module. It covers all API endpoints the frontend expects, request/response formats, and which UI features are complete vs pending backend implementation.

---

## Table of Contents

1. [API Endpoints Summary](#api-endpoints-summary)
2. [Detailed Endpoint Specifications](#detailed-endpoint-specifications)
3. [Data Models](#data-models)
4. [UI Features Status](#ui-features-status)
5. [Calendar Integration Requirements](#calendar-integration-requirements)
6. [Critical Implementation Notes](#critical-implementation-notes)

---

## API Endpoints Summary

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/appointments/slots` | Get available slots (CRMSettings) | **REQUIRED - Primary** |
| GET | `/appointments/available-slots` | Get available slots (AvailabilitySlot model) | Optional |
| GET | `/appointments` | List appointments | Required |
| GET | `/appointments/:id` | Get single appointment | Required |
| POST | `/appointments` | Book/Create appointment | Required |
| PUT | `/appointments/:id` | Update appointment | Required |
| DELETE | `/appointments/:id` | Cancel appointment | Required |
| PUT | `/appointments/:id/confirm` | Confirm appointment | Required |
| PUT | `/appointments/:id/complete` | Complete appointment | Required |
| PUT | `/appointments/:id/no-show` | Mark as no-show | Required |
| POST | `/appointments/:id/reschedule` | Reschedule appointment | Required |
| GET | `/appointments/availability` | Get availability schedule | Required |
| POST | `/appointments/availability` | Create availability slot | Required |
| PUT | `/appointments/availability/:id` | Update availability slot | Required |
| DELETE | `/appointments/availability/:id` | Delete availability slot | Required |
| POST | `/appointments/availability/bulk` | Bulk update availability | Required |
| GET | `/appointments/blocked-times` | Get blocked times | Required |
| POST | `/appointments/blocked-times` | Create blocked time | Required |
| DELETE | `/appointments/blocked-times/:id` | Delete blocked time | Required |
| GET | `/appointments/settings` | Get settings | Required |
| PUT | `/appointments/settings` | Update settings | Required |
| GET | `/appointments/stats` | Get statistics | Required |

---

## Detailed Endpoint Specifications

### 1. GET `/appointments/slots` (PRIMARY SLOTS ENDPOINT)

**CRITICAL: This is the primary endpoint the frontend uses for slot availability.**

The frontend calls this endpoint to show available time slots when booking appointments.

#### Request
```
GET /appointments/slots?date=2025-12-31&assignedTo=lawyer123&duration=30
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date in YYYY-MM-DD format |
| `assignedTo` | string | No | Lawyer ID to get slots for |
| `duration` | number | No | Slot duration in minutes (default: 30) |

#### Response
```json
{
  "success": true,
  "data": {
    "date": "2025-12-31",
    "dayOfWeek": "wednesday",
    "working": true,
    "workingHours": {
      "enabled": true,
      "start": "09:00",
      "end": "17:00"
    },
    "slots": [
      {
        "start": "09:00",
        "end": "09:30",
        "available": true
      },
      {
        "start": "09:30",
        "end": "10:00",
        "available": true
      },
      {
        "start": "10:00",
        "end": "10:30",
        "available": false,
        "conflictReason": "booked"
      }
    ]
  }
}
```

#### Backend Logic
1. Read working hours from `CRMSettings.workingHours[dayOfWeek]`
2. Check if `working: true` for that day
3. Generate slots based on duration parameter
4. Mark slots as unavailable if:
   - Already booked (check Appointment model)
   - Blocked time exists (check BlockedTime model)
   - Time has passed (for today's date)

---

### 2. GET `/appointments/available-slots` (ALTERNATIVE ENDPOINT)

**Note: Frontend can use this but currently uses `/slots` instead.**

Uses the AvailabilitySlot model instead of CRMSettings.

#### Request
```
GET /appointments/available-slots?lawyerId=XXX&startDate=2025-12-31&endDate=2025-12-31&duration=30
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lawyerId` | string | Yes | Lawyer ID |
| `startDate` | string | Yes | Start date YYYY-MM-DD |
| `endDate` | string | Yes | End date YYYY-MM-DD |
| `duration` | number | No | Slot duration (default: 30) |

#### Response
```json
{
  "success": true,
  "data": {
    "slots": [
      {
        "start": "09:00",
        "end": "09:30",
        "available": true
      }
    ],
    "dateRange": {
      "start": "2025-12-31",
      "end": "2025-12-31"
    }
  }
}
```

---

### 3. GET `/appointments`

List appointments with filtering and pagination.

#### Request
```
GET /appointments?status=pending&startDate=2025-01-01&endDate=2025-01-31&page=1&limit=20&clientId=XXX&caseId=YYY
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: pending, confirmed, completed, cancelled, no_show |
| `startDate` | string | No | Filter from date |
| `endDate` | string | No | Filter to date |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `clientId` | string | No | Filter by client |
| `caseId` | string | No | Filter by case |

#### Response
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "apt-123",
        "lawyerId": "lawyer-456",
        "clientId": "client-789",
        "clientName": "أحمد محمد",
        "clientEmail": "ahmed@example.com",
        "clientPhone": "+966501234567",
        "date": "2025-12-31",
        "startTime": "09:00",
        "endTime": "09:30",
        "duration": 30,
        "type": "consultation",
        "status": "confirmed",
        "source": "manual",
        "notes": "Initial consultation for divorce case",
        "locationType": "video",
        "meetingLink": "https://meet.google.com/xxx",
        "location": null,
        "caseId": "case-123",
        "caseName": "قضية طلاق",
        "price": 500,
        "currency": "SAR",
        "isPaid": false,
        "reminderSent": true,
        "reminderSentAt": "2025-12-30T09:00:00Z",
        "createdAt": "2025-12-25T10:00:00Z",
        "updatedAt": "2025-12-28T14:30:00Z",
        "createdBy": {
          "id": "user-123",
          "name": "محمد المحامي",
          "type": "lawyer"
        }
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20
  }
}
```

---

### 4. GET `/appointments/:id`

Get single appointment details.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "apt-123",
    "lawyerId": "lawyer-456",
    "clientName": "أحمد محمد",
    "clientEmail": "ahmed@example.com",
    "clientPhone": "+966501234567",
    "date": "2025-12-31",
    "startTime": "09:00",
    "endTime": "09:30",
    "duration": 30,
    "type": "consultation",
    "status": "confirmed",
    "source": "manual",
    "notes": "Notes here",
    "locationType": "video",
    "meetingLink": "https://meet.google.com/xxx",
    "createdAt": "2025-12-25T10:00:00Z",
    "updatedAt": "2025-12-28T14:30:00Z",
    "createdBy": {
      "id": "user-123",
      "name": "محمد",
      "type": "lawyer"
    }
  }
}
```

---

### 5. POST `/appointments`

Create/Book a new appointment.

#### Request Body
```json
{
  "date": "2025-12-31",
  "startTime": "09:00",
  "duration": 30,
  "type": "consultation",
  "clientName": "أحمد محمد",
  "clientEmail": "ahmed@example.com",
  "clientPhone": "+966501234567",
  "clientId": "client-123",
  "notes": "Initial consultation",
  "caseId": "case-456",
  "source": "manual",
  "locationType": "video",
  "meetingLink": "https://meet.google.com/xxx",
  "location": null,
  "assignedTo": "lawyer-789"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | Date YYYY-MM-DD |
| `startTime` | string | Yes | Time HH:MM (24-hour) |
| `duration` | number | No | Duration in minutes (15, 30, 45, 60, 90, 120) |
| `type` | string | Yes | consultation, follow_up, case_review, initial_meeting, other |
| `clientName` | string | Yes | Client full name |
| `clientEmail` | string | Yes | Client email (RFC 5322 compliant) |
| `clientPhone` | string | Yes | Client phone (Saudi format +9665XXXXXXXX) |
| `clientId` | string | No | Existing client ID |
| `notes` | string | No | Appointment notes |
| `caseId` | string | No | Link to case |
| `source` | string | No | marketplace, manual, client_dashboard, website |
| `locationType` | string | No | video, in-person, phone |
| `meetingLink` | string | No | Video call link |
| `location` | string | No | Physical address |
| `assignedTo` | string | No | Assign to specific lawyer (for admins) |

#### Validation Rules
- `clientEmail`: RFC 5322 compliant email validation
- `clientPhone`: Saudi phone format: `+9665XXXXXXXX` or `05XXXXXXXX`
- `startTime`: Must be within working hours
- `date`: Cannot be in the past
- Slot must be available (not booked, not blocked)

#### Response
```json
{
  "success": true,
  "data": {
    "id": "apt-new-123",
    "lawyerId": "lawyer-789",
    "clientName": "أحمد محمد",
    "date": "2025-12-31",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "pending",
    "...": "..."
  }
}
```

---

### 6. PUT `/appointments/:id`

Update appointment details.

#### Request Body
```json
{
  "date": "2025-12-31",
  "startTime": "10:00",
  "duration": 45,
  "type": "follow_up",
  "status": "confirmed",
  "notes": "Updated notes",
  "meetingLink": "https://zoom.us/xxx",
  "location": "123 Main St"
}
```

All fields are optional. Only provided fields are updated.

---

### 7. DELETE `/appointments/:id`

Cancel an appointment.

#### Request Body (Optional)
```json
{
  "reason": "Client requested cancellation"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "apt-123",
    "status": "cancelled",
    "cancelledAt": "2025-12-30T10:00:00Z",
    "cancelledBy": "user-123",
    "cancellationReason": "Client requested cancellation"
  }
}
```

---

### 8. PUT `/appointments/:id/confirm`

Confirm a pending appointment.

#### Response
```json
{
  "success": true,
  "data": {
    "id": "apt-123",
    "status": "confirmed",
    "updatedAt": "2025-12-30T10:00:00Z"
  }
}
```

---

### 9. PUT `/appointments/:id/complete`

Mark appointment as completed.

#### Request Body (Optional)
```json
{
  "notes": "Session completed. Client satisfied."
}
```

---

### 10. PUT `/appointments/:id/no-show`

Mark appointment as no-show (client didn't attend).

---

### 11. POST `/appointments/:id/reschedule`

Reschedule an existing appointment.

#### Request Body
```json
{
  "date": "2026-01-05",
  "startTime": "14:00"
}
```

#### Backend Logic
1. Validate new slot is available
2. Update appointment date/time
3. Optionally track reschedule count
4. Send notification to client

---

### 12. GET `/appointments/availability`

Get lawyer's weekly availability schedule.

#### Request
```
GET /appointments/availability?lawyerId=XXX
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "avail-1",
      "lawyerId": "lawyer-123",
      "dayOfWeek": 0,
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true,
      "slotDuration": 30,
      "breakBetweenSlots": 5,
      "maxAppointmentsPerSlot": 1,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-12-01T00:00:00Z"
    },
    {
      "id": "avail-2",
      "lawyerId": "lawyer-123",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "isActive": true,
      "slotDuration": 30,
      "breakBetweenSlots": 5
    }
  ]
}
```

---

### 13. POST `/appointments/availability`

Create availability slot.

#### Request Body
```json
{
  "dayOfWeek": 0,
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "breakBetweenSlots": 5,
  "isActive": true,
  "targetLawyerId": "lawyer-xyz"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `dayOfWeek` | number | 0=Sunday, 1=Monday, ..., 6=Saturday |
| `startTime` | string | Start time HH:MM |
| `endTime` | string | End time HH:MM |
| `slotDuration` | number | Minutes per slot (15, 30, 45, 60, 90, 120) |
| `breakBetweenSlots` | number | Buffer minutes between appointments |
| `isActive` | boolean | Is this day active for booking |
| `targetLawyerId` | string | For firm admins managing other lawyers |

---

### 14. POST `/appointments/availability/bulk`

Bulk update entire week's availability.

#### Request Body
```json
{
  "slots": [
    {
      "dayOfWeek": 0,
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 30,
      "isActive": true
    },
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 30,
      "isActive": true
    },
    {
      "dayOfWeek": 5,
      "startTime": "09:00",
      "endTime": "12:00",
      "slotDuration": 30,
      "isActive": true
    },
    {
      "dayOfWeek": 6,
      "startTime": "00:00",
      "endTime": "00:00",
      "slotDuration": 30,
      "isActive": false
    }
  ]
}
```

---

### 15. GET `/appointments/blocked-times`

Get blocked time periods.

#### Request
```
GET /appointments/blocked-times?startDate=2025-12-01&endDate=2025-12-31&targetLawyerId=XXX
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "block-1",
      "lawyerId": "lawyer-123",
      "startDateTime": "2025-12-25T00:00:00Z",
      "endDateTime": "2025-12-26T23:59:59Z",
      "reason": "Holiday - Christmas",
      "isAllDay": true,
      "isRecurring": false,
      "createdAt": "2025-12-01T00:00:00Z"
    }
  ]
}
```

---

### 16. POST `/appointments/blocked-times`

Block time for vacation, meetings, etc.

#### Request Body
```json
{
  "startDateTime": "2025-12-25T00:00:00Z",
  "endDateTime": "2025-12-26T23:59:59Z",
  "reason": "Holiday",
  "isAllDay": true,
  "isRecurring": false,
  "recurrencePattern": null,
  "targetLawyerId": "lawyer-xyz"
}
```

For recurring blocks:
```json
{
  "startDateTime": "2025-01-03T12:00:00Z",
  "endDateTime": "2025-01-03T13:00:00Z",
  "reason": "Weekly team meeting",
  "isAllDay": false,
  "isRecurring": true,
  "recurrencePattern": {
    "frequency": "weekly",
    "interval": 1,
    "endDate": "2025-12-31"
  }
}
```

---

### 17. GET `/appointments/settings`

Get appointment settings for current user/lawyer.

#### Response
```json
{
  "success": true,
  "data": {
    "lawyerId": "lawyer-123",
    "defaultDuration": 30,
    "defaultBreakTime": 5,
    "allowOnlineBooking": true,
    "requireApproval": false,
    "advanceBookingDays": 30,
    "minNoticeHours": 24,
    "cancellationPolicyHours": 24,
    "autoConfirm": true,
    "sendReminders": true,
    "reminderHoursBefore": [24, 1],
    "allowRescheduling": true,
    "maxReschedulesPerAppointment": 2,
    "timezone": "Asia/Riyadh",
    "enablePricing": true,
    "defaultPrice": 500,
    "currency": "SAR",
    "requirePaymentUpfront": false,
    "enabledTypes": ["consultation", "follow_up", "case_review", "initial_meeting", "other"],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-12-15T00:00:00Z"
  }
}
```

---

### 18. PUT `/appointments/settings`

Update appointment settings.

#### Request Body
```json
{
  "defaultDuration": 45,
  "allowOnlineBooking": true,
  "requireApproval": true,
  "advanceBookingDays": 60,
  "minNoticeHours": 48,
  "autoConfirm": false,
  "sendReminders": true,
  "reminderHoursBefore": [48, 24, 2],
  "enablePricing": true,
  "defaultPrice": 750,
  "enabledTypes": ["consultation", "follow_up"]
}
```

---

### 19. GET `/appointments/stats`

Get appointment statistics.

#### Request
```
GET /appointments/stats?startDate=2025-01-01&endDate=2025-12-31
```

#### Response
```json
{
  "success": true,
  "data": {
    "total": 250,
    "pending": 12,
    "confirmed": 45,
    "completed": 180,
    "cancelled": 10,
    "noShow": 3,
    "todayCount": 5,
    "weekCount": 18,
    "monthCount": 45,
    "revenueTotal": 125000,
    "revenuePending": 6000
  }
}
```

---

## Data Models

### Appointment Model

```typescript
interface Appointment {
  id: string
  lawyerId: string
  clientId?: string

  // Client info
  clientName: string
  clientEmail: string
  clientPhone: string

  // Scheduling
  date: string          // YYYY-MM-DD
  startTime: string     // HH:MM (24-hour)
  endTime: string       // HH:MM (24-hour)
  duration: number      // 15, 30, 45, 60, 90, 120

  // Classification
  type: 'consultation' | 'follow_up' | 'case_review' | 'initial_meeting' | 'other'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  source: 'marketplace' | 'manual' | 'client_dashboard' | 'website'

  // Location
  locationType?: 'video' | 'in-person' | 'phone'
  meetingLink?: string
  location?: string

  // Related records
  caseId?: string
  caseName?: string
  notes?: string

  // Pricing
  price?: number
  currency?: string
  isPaid?: boolean
  paymentId?: string

  // Reminders
  reminderSent?: boolean
  reminderSentAt?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    type: 'lawyer' | 'client' | 'system'
  }

  // Cancellation
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
}
```

### AvailabilitySlot Model

```typescript
interface AvailabilitySlot {
  id: string
  lawyerId: string
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0=Sunday
  startTime: string   // "09:00"
  endTime: string     // "17:00"
  isActive: boolean
  slotDuration: number  // minutes
  breakBetweenSlots: number  // minutes
  maxAppointmentsPerSlot?: number
  createdAt: string
  updatedAt: string
}
```

### BlockedTime Model

```typescript
interface BlockedTime {
  id: string
  lawyerId: string
  startDateTime: string  // ISO string
  endDateTime: string    // ISO string
  reason?: string
  isAllDay: boolean
  isRecurring: boolean
  recurrencePattern?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: string
  }
  createdAt: string
  updatedAt: string
}
```

---

## UI Features Status

### Fully Implemented (Frontend Complete)

| Feature | Description | API Used |
|---------|-------------|----------|
| Weekly Calendar View | 7-day calendar with appointment cards | GET /appointments |
| List View | Tabular list with sorting/filtering | GET /appointments |
| Book Appointment | Dialog with slot selection | POST /appointments, GET /slots |
| View Details | Appointment details dialog | GET /appointments/:id |
| Confirm Appointment | Single click confirm | PUT /appointments/:id/confirm |
| Complete Appointment | Mark as done | PUT /appointments/:id/complete |
| Cancel Appointment | Cancel with reason | DELETE /appointments/:id |
| Mark No-Show | Mark client didn't attend | PUT /appointments/:id/no-show |
| Working Hours Display | Shows if day is working | GET /slots → workingHours |
| Non-Working Day Warning | Warns if selecting non-working day | GET /slots → working: false |
| Location Type Selector | Video/In-person/Phone options | locationType field |
| Statistics Dashboard | Today/Week/Month counts | GET /appointments/stats |
| Bulk Selection | Select multiple appointments | Client-side |
| Search & Filter | By name, email, phone, status, type | Client-side + API |
| Team Member Filter | Filter by assigned lawyer | lawyerId filter |

### Partially Implemented (Needs Backend Work)

| Feature | Frontend Status | Backend Required |
|---------|-----------------|------------------|
| Block Time | Dialog exists | POST /blocked-times |
| Availability Settings | Dialog exists | GET/POST /availability |
| Price Display | Field exists | price field population |
| Payment Status | UI ready | isPaid, paymentId fields |
| Reminders | UI shows | reminderSent field |

### Not Implemented (UI Placeholder Only)

| Feature | Description | Backend Required |
|---------|-------------|------------------|
| Google Calendar Sync | OAuth flow needed | OAuth endpoints (see below) |
| Outlook Calendar Sync | OAuth flow needed | OAuth endpoints (see below) |
| Apple Calendar Sync | OAuth flow needed | OAuth endpoints (see below) |
| ICS Import (to DB) | File parsing | Event import endpoint |
| Real-time Notifications | WebSocket/Push | WebSocket server |

---

## Calendar Integration Requirements

### ICS Export/Import (Working)

Frontend handles ICS file generation and download. No backend needed.

### OAuth Calendar Sync (NOT IMPLEMENTED)

For Google/Outlook/Apple calendar sync, backend must implement:

#### Required OAuth Endpoints

```
POST /api/oauth/google/authorize
  → Returns authorization URL

GET /api/oauth/google/callback?code=XXX
  → Handles OAuth callback, stores tokens

POST /api/oauth/microsoft/authorize
  → Returns authorization URL

GET /api/oauth/microsoft/callback?code=XXX
  → Handles OAuth callback

POST /api/oauth/apple/authorize
  → Returns authorization URL (CalDAV)

GET /api/oauth/apple/callback?code=XXX
  → Handles OAuth callback
```

#### Calendar Sync Endpoints

```
POST /api/calendar/sync/:provider
  → Trigger bi-directional sync

GET /api/calendar/events/:provider
  → Fetch events from external calendar

POST /api/calendar/push/:provider
  → Push local appointments to external calendar
```

#### Token Storage

Store OAuth tokens securely:
```typescript
interface OAuthToken {
  userId: string
  provider: 'google' | 'microsoft' | 'apple'
  accessToken: string
  refreshToken: string
  expiresAt: Date
  scope: string[]
}
```

---

## Critical Implementation Notes

### 1. Slot Generation Algorithm

When generating slots for `/appointments/slots`:

```javascript
function generateSlots(date, workingHours, duration, existingAppointments, blockedTimes) {
  const slots = []
  let currentTime = parseTime(workingHours.start)
  const endTime = parseTime(workingHours.end)

  while (currentTime + duration <= endTime) {
    const slotStart = formatTime(currentTime)
    const slotEnd = formatTime(currentTime + duration)

    const isBooked = existingAppointments.some(apt =>
      apt.date === date && timesOverlap(apt.startTime, apt.endTime, slotStart, slotEnd)
    )

    const isBlocked = blockedTimes.some(block =>
      dateTimeOverlaps(block.startDateTime, block.endDateTime, date, slotStart, slotEnd)
    )

    const isPast = isToday(date) && currentTime < getCurrentTime()

    slots.push({
      start: slotStart,
      end: slotEnd,
      available: !isBooked && !isBlocked && !isPast,
      conflictReason: isBooked ? 'booked' : isBlocked ? 'blocked' : isPast ? 'past' : undefined
    })

    currentTime += duration
  }

  return slots
}
```

### 2. Validation Rules

#### Email Validation (RFC 5322)
```javascript
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
```

#### Saudi Phone Validation
```javascript
const saudiPhoneRegex = /^(\+966|966|0)?5\d{8}$/
```

### 3. Timezone Handling

All times should be handled in `Asia/Riyadh` timezone by default. Store timestamps in UTC but convert for display.

### 4. Authorization

- Solo lawyers: Can only manage their own appointments
- Firm admins: Can use `assignedTo` and `targetLawyerId` to manage other lawyers
- The frontend sends `assignedTo` when booking for another lawyer

### 5. Cache Invalidation

The frontend invalidates these query keys after mutations:
- `['appointments', 'list', ...]` - After any appointment change
- `['appointments', 'available-slots', ...]` - After booking/cancel/complete
- `['appointments', 'stats']` - After status changes
- `['appointments', 'availability']` - After availability updates
- `['appointments', 'blocked-times']` - After blocking time

---

## Error Response Format

All errors should return:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_NOT_AVAILABLE",
    "message": "The selected time slot is no longer available",
    "messageAr": "الفترة الزمنية المحددة لم تعد متاحة"
  }
}
```

Common error codes:
- `SLOT_NOT_AVAILABLE` - Slot was booked by someone else
- `PAST_DATE` - Cannot book in the past
- `OUTSIDE_HOURS` - Time is outside working hours
- `INVALID_DURATION` - Invalid duration value
- `LAWYER_NOT_FOUND` - Invalid lawyer ID
- `APPOINTMENT_NOT_FOUND` - Invalid appointment ID
- `UNAUTHORIZED` - User cannot modify this appointment
- `VALIDATION_ERROR` - Field validation failed

---

## Field Name Mapping (Backend Auto-Converts)

The backend now supports BOTH frontend and backend field names. Auto-mapping is applied:

| Frontend Sends | Backend Also Accepts | Description |
|----------------|---------------------|-------------|
| `clientName` | `customerName` | Both work - auto-mapped |
| `clientEmail` | `customerEmail` | Both work - auto-mapped |
| `clientPhone` | `customerPhone` | Both work - auto-mapped |
| `notes` | `customerNotes` | Both work - auto-mapped |
| `lawyerId` | `assignedTo` | Both work - auto-mapped |
| `date` + `startTime` | `scheduledTime` | Both work - auto-converted |

### Location Type Mapping

| Frontend Sends | Backend Stores |
|----------------|---------------|
| `video` | `virtual` |
| `in-person` | `office` |
| `phone` | `phone` |

### Status Mapping

| Frontend Sends | Backend Stores |
|----------------|---------------|
| `pending` | `scheduled` |
| `confirmed` | `confirmed` |
| `cancelled` | `cancelled` |
| `completed` | `completed` |
| `no_show` | `no_show` |

---

## Summary

| Category | Count |
|----------|-------|
| Total Endpoints | 19 |
| Required for Core Functionality | 19 |
| Optional (Calendar OAuth) | 6 |
| UI Features Complete | 16 |
| UI Features Pending Backend | 5 |

The frontend is production-ready for all core appointment functionality. Calendar OAuth sync is a future enhancement requiring backend OAuth implementation.
