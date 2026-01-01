# Calendar Integration Backend Specification

This document specifies the backend API requirements for Google and Microsoft Calendar integration.

## Google Calendar Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/google-calendar/auth` | Get OAuth authorization URL |
| POST | `/google-calendar/disconnect` | Disconnect Google Calendar |
| GET | `/google-calendar/status` | Get connection status |
| GET | `/google-calendar/calendars` | List user's calendars |
| GET | `/google-calendar/calendars/:id/events` | Get events from calendar |
| POST | `/google-calendar/calendars/:id/events` | Create event |
| PUT | `/google-calendar/calendars/:id/events/:eventId` | Update event |
| DELETE | `/google-calendar/calendars/:id/events/:eventId` | Delete event |
| PUT | `/google-calendar/settings/calendars` | Update selected calendars |
| POST | `/google-calendar/watch/:calendarId` | Setup push notifications |
| DELETE | `/google-calendar/watch/:channelId` | Stop push notifications |
| GET | `/google-calendar/sync/settings` | Get sync settings |
| PUT | `/google-calendar/sync/auto` | Toggle auto-sync |
| PUT | `/google-calendar/settings/show-external-events` | Toggle external events visibility |
| POST | `/google-calendar/import` | Import from Google to TRAF3LI |
| POST | `/google-calendar/export` | Export from TRAF3LI to Google |

### GET `/google-calendar/auth`
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/auth?..."
  }
}
```

### GET `/google-calendar/status`
```json
{
  "success": true,
  "connected": true,
  "data": {
    "isConnected": true,
    "email": "user@gmail.com",
    "expiresAt": "2026-01-15T10:00:00Z",
    "scopes": ["calendar.readonly", "calendar.events"],
    "calendars": [...],
    "selectedCalendars": ["primary"],
    "primaryCalendarId": "primary",
    "showExternalEvents": true
  }
}
```

### GET `/google-calendar/sync/settings`
```json
{
  "success": true,
  "data": {
    "autoSyncEnabled": true,
    "syncDirection": "bidirectional",
    "selectedCalendars": ["primary"],
    "syncInterval": 15,
    "lastSyncAt": "2026-01-01T10:00:00Z"
  }
}
```

---

## Microsoft Calendar Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/microsoft-calendar/auth` | Get OAuth authorization URL |
| POST | `/microsoft-calendar/disconnect` | Disconnect Microsoft Calendar |
| GET | `/microsoft-calendar/status` | Get connection status |
| POST | `/microsoft-calendar/refresh-token` | Refresh OAuth token |
| GET | `/microsoft-calendar/calendars` | List user's calendars |
| GET | `/microsoft-calendar/calendars/:id/events` | Get events from calendar |
| POST | `/microsoft-calendar/calendars/:id/events` | Create event |
| PUT | `/microsoft-calendar/calendars/:id/events/:eventId` | Update event |
| DELETE | `/microsoft-calendar/calendars/:id/events/:eventId` | Delete event |
| PUT | `/microsoft-calendar/sync/auto` | Toggle auto-sync |
| POST | `/microsoft-calendar/import` | Import from Microsoft to TRAF3LI |
| POST | `/microsoft-calendar/export` | Export from TRAF3LI to Microsoft |

### GET `/microsoft-calendar/auth`
```json
{
  "success": true,
  "data": {
    "authUrl": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?..."
  }
}
```

### GET `/microsoft-calendar/status`
```json
{
  "success": true,
  "data": {
    "connected": true,
    "email": "user@outlook.com",
    "displayName": "John Doe",
    "expiresAt": "2026-01-15T10:00:00Z",
    "calendars": [...]
  }
}
```

---

## Appointment Calendar Sync Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments/calendar-status` | Get both Google & Microsoft status |
| GET | `/appointments/:id/calendar-links` | Get "Add to Calendar" links |
| POST | `/appointments/:id/sync-calendar` | Sync appointment to calendars |
| GET | `/appointments/:id/calendar.ics` | Download ICS file |

### GET `/appointments/calendar-status`
```json
{
  "success": true,
  "data": {
    "google": {
      "connected": true,
      "email": "user@gmail.com"
    },
    "microsoft": {
      "connected": false
    }
  }
}
```

### GET `/appointments/:id/calendar-links`
```json
{
  "success": true,
  "data": {
    "appointmentId": "apt-123",
    "appointmentNumber": "APT-2026-001",
    "scheduledTime": "2026-01-15T10:00:00Z",
    "links": {
      "google": "https://calendar.google.com/calendar/render?action=TEMPLATE&...",
      "outlook": "https://outlook.live.com/calendar/0/deeplink/compose?...",
      "yahoo": "https://calendar.yahoo.com/?v=60&...",
      "ics": "/appointments/apt-123/calendar.ics"
    }
  }
}
```

### POST `/appointments/:id/sync-calendar`
```json
{
  "success": true,
  "data": {
    "syncResult": {
      "google": {
        "success": true,
        "eventId": "google-event-123"
      },
      "microsoft": {
        "success": false,
        "error": "Not connected"
      }
    }
  }
}
```

---

## OAuth Implementation Guide

### Google Calendar OAuth Flow

1. **User clicks "Connect Google Calendar"**
   - Frontend calls `GET /google-calendar/auth`
   - Backend returns Google OAuth URL
   - Frontend redirects to Google

2. **Google redirects back with code**
   - Backend callback receives code
   - Exchange code for tokens
   - Store tokens securely (encrypted)
   - Redirect to frontend success page

3. **Token Refresh**
   - Use refresh token when access token expires
   - Update stored tokens

### Required Google Scopes
```
https://www.googleapis.com/auth/calendar.readonly
https://www.googleapis.com/auth/calendar.events
```

### Microsoft Calendar OAuth Flow

1. **User clicks "Connect Microsoft Calendar"**
   - Frontend calls `GET /microsoft-calendar/auth`
   - Backend returns Microsoft OAuth URL
   - Frontend redirects to Microsoft

2. **Microsoft redirects back with code**
   - Backend callback receives code
   - Exchange code for tokens
   - Store tokens securely
   - Redirect to frontend success page

### Required Microsoft Scopes
```
Calendars.ReadWrite
User.Read
offline_access
```

---

## Database Models for Calendar Integration

### OAuthToken Model
```typescript
interface OAuthToken {
  _id: ObjectId
  userId: ObjectId
  provider: 'google' | 'microsoft'
  accessToken: string      // Encrypted
  refreshToken: string     // Encrypted
  expiresAt: Date
  scopes: string[]
  email: string
  displayName?: string
  selectedCalendars?: string[]
  showExternalEvents?: boolean
  autoSyncEnabled?: boolean
  syncDirection?: 'bidirectional' | 'import' | 'export'
  lastSyncAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### SyncedEvent Model (for tracking bi-directional sync)
```typescript
interface SyncedEvent {
  _id: ObjectId
  userId: ObjectId
  provider: 'google' | 'microsoft'
  externalEventId: string
  appointmentId?: ObjectId
  lastSyncAt: Date
  syncDirection: 'imported' | 'exported'
  createdAt: Date
  updatedAt: Date
}
```

---

## Enterprise Standards

### 1. Input Validation (Max Lengths)
| Field | Max Length |
|-------|------------|
| name | 100 |
| email | 254 (RFC 5321) |
| phone | 20 |
| notes | 2000 |
| subject | 200 |
| meetingLink | 500 |
| location | 500 |

### 2. Data Masking (PDPL Compliance)
- Email: `ahmed@example.com` → `a*****@e******.com`
- Phone: `+966501234567` → `+966***4567`

Backend should apply masking when returning data to:
- Non-owner viewers
- Audit logs
- Exports

### 3. Smart Retry Configuration
Frontend implements exponential backoff with jitter. Backend should:
- Return proper HTTP status codes
- Include `Retry-After` header for 429
- Use 500 for server errors
- Use 4xx for client errors

### 4. Optimistic Updates
Frontend updates UI immediately. Backend must:
- Return the updated object on success
- Include all fields needed for UI display
- Return proper error codes for rollback
