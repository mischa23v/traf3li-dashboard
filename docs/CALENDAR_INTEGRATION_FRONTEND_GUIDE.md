# Calendar Integration Frontend Guide

## TypeScript Schema Definitions

```typescript
// ═══════════════════════════════════════════════════════════════
// GOOGLE CALENDAR TYPES
// ═══════════════════════════════════════════════════════════════

interface GoogleCalendarStatus {
  success: boolean;
  connected: boolean;
  data: {
    isConnected: boolean;
    email: string | null;
    displayName: string | null;
    expiresAt: string; // ISO 8601
    scopes: string[];
    calendars: GoogleCalendar[];
    selectedCalendars: SelectedCalendar[];
    primaryCalendarId: string;
    showExternalEvents: boolean;
    autoSync: AutoSyncSettings;
    syncStats: SyncStats;
    connectedAt: string; // ISO 8601
    lastSyncedAt: string | null; // ISO 8601
  } | null;
}

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor: string;
  foregroundColor: string;
  primary?: boolean;
  accessRole: 'owner' | 'writer' | 'reader';
  timeZone: string;
}

interface SelectedCalendar {
  calendarId: string;
  name: string;
  backgroundColor: string;
  isPrimary: boolean;
  syncEnabled: boolean;
}

interface AutoSyncSettings {
  enabled: boolean;
  direction: 'both' | 'import_only' | 'export_only';
  syncInterval: number; // minutes
  conflictResolution: 'google_wins' | 'traf3li_wins' | 'newest_wins' | 'manual';
  syncPastEvents: boolean;
  syncDaysBack: number;
  syncDaysForward: number;
}

interface SyncStats {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  eventsImported: number;
  eventsExported: number;
  lastImportCount: number;
  lastExportCount: number;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  htmlLink: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

// ═══════════════════════════════════════════════════════════════
// MICROSOFT CALENDAR TYPES
// ═══════════════════════════════════════════════════════════════

interface MicrosoftCalendarStatus {
  success: boolean;
  data: {
    connected: boolean;
    email?: string;
    displayName?: string;
    expiresAt?: string; // ISO 8601
    lastSyncedAt?: string | null;
    syncSettings?: MicrosoftSyncSettings;
  };
}

interface MicrosoftSyncSettings {
  enabled: boolean;
  syncInterval: 'manual' | 'hourly' | 'daily';
  syncDirection: 'to_microsoft' | 'from_microsoft' | 'bidirectional';
  defaultCalendarId: string | null;
  syncPastDays: number;
  syncFutureDays: number;
  lastSync: string | null;
}

interface MicrosoftCalendar {
  id: string;
  name: string;
  color: string;
  isDefaultCalendar: boolean;
  canEdit: boolean;
  owner: { name: string; address: string };
}

interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  body?: { contentType: string; content: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  attendees?: Array<{
    emailAddress: { name: string; address: string };
    status: { response: string };
  }>;
  webLink: string;
}

// ═══════════════════════════════════════════════════════════════
// APPOINTMENT CALENDAR TYPES
// ═══════════════════════════════════════════════════════════════

interface CalendarConnectionStatus {
  success: boolean;
  data: {
    connections: {
      google: {
        connected: boolean;
        email?: string;
        autoSyncEnabled?: boolean;
      };
      microsoft: {
        connected: boolean;
        email?: string;
        autoSyncEnabled?: boolean;
      };
    };
    message: {
      en: string;
      ar: string;
    };
  };
}

interface CalendarLinks {
  success: boolean;
  data: {
    appointmentId: string;
    appointmentNumber: string;
    scheduledTime: string; // ISO 8601
    links: {
      google: string;
      outlook: string;
      office365: string;
      yahoo: string;
      apple: string; // ICS download URL
    };
    labels: {
      google: string;
      outlook: string;
      office365: string;
      yahoo: string;
      apple: string;
    };
  };
}

interface SyncResult {
  success: boolean;
  data: {
    syncResult: {
      google?: {
        success: boolean;
        eventId?: string;
        error?: string;
      };
      microsoft?: {
        success: boolean;
        eventId?: string;
        error?: string;
      };
    };
  };
}
```

---

## API Endpoints Reference

### Google Calendar Endpoints

#### 1. Get OAuth Authorization URL

```typescript
// GET /api/google-calendar/auth
// Initiates OAuth flow - redirect user to returned URL

const response = await fetch('/api/google-calendar/auth', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "authUrl": "https://accounts.google.com/o/oauth2/auth?client_id=...&redirect_uri=...&scope=..."
}

// Usage: Redirect user to authUrl
window.location.href = response.authUrl;
```

#### 2. Get Connection Status

```typescript
// GET /api/google-calendar/status

const response = await fetch('/api/google-calendar/status', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response (connected):
{
  "success": true,
  "connected": true,
  "data": {
    "isConnected": true,
    "email": "user@gmail.com",
    "displayName": "John Doe",
    "expiresAt": "2026-01-15T10:00:00.000Z",
    "scopes": [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events"
    ],
    "calendars": [
      {
        "id": "primary",
        "summary": "John Doe",
        "backgroundColor": "#039be5",
        "primary": true,
        "accessRole": "owner"
      },
      {
        "id": "work@company.com",
        "summary": "Work Calendar",
        "backgroundColor": "#7986cb",
        "accessRole": "writer"
      }
    ],
    "selectedCalendars": [
      {
        "calendarId": "primary",
        "name": "John Doe",
        "backgroundColor": "#039be5",
        "isPrimary": true,
        "syncEnabled": true
      }
    ],
    "primaryCalendarId": "primary",
    "showExternalEvents": true,
    "autoSync": {
      "enabled": true,
      "direction": "both",
      "syncInterval": 15,
      "conflictResolution": "newest_wins"
    },
    "syncStats": {
      "totalSyncs": 42,
      "successfulSyncs": 40,
      "eventsImported": 156,
      "eventsExported": 89
    },
    "connectedAt": "2025-12-01T09:00:00.000Z",
    "lastSyncedAt": "2026-01-01T08:30:00.000Z"
  }
}

// Response (not connected):
{
  "success": true,
  "connected": false,
  "data": null
}
```

#### 3. Disconnect Google Calendar

```typescript
// POST /api/google-calendar/disconnect

const response = await fetch('/api/google-calendar/disconnect', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message": "Google Calendar disconnected successfully"
}
```

#### 4. Get User's Calendars

```typescript
// GET /api/google-calendar/calendars

const response = await fetch('/api/google-calendar/calendars', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": [
    {
      "id": "primary",
      "summary": "John Doe",
      "description": "Personal calendar",
      "backgroundColor": "#039be5",
      "foregroundColor": "#ffffff",
      "primary": true,
      "accessRole": "owner",
      "timeZone": "Asia/Riyadh"
    }
  ]
}
```

#### 5. Get Events from Calendar

```typescript
// GET /api/google-calendar/calendars/:calendarId/events?startDate=...&endDate=...

const calendarId = 'primary'; // or encodeURIComponent('work@company.com')
const startDate = '2026-01-01T00:00:00Z';
const endDate = '2026-01-31T23:59:59Z';

const response = await fetch(
  `/api/google-calendar/calendars/${calendarId}/events?startDate=${startDate}&endDate=${endDate}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

// Response:
{
  "success": true,
  "data": [
    {
      "id": "abc123xyz",
      "summary": "Team Meeting",
      "description": "Weekly sync",
      "start": { "dateTime": "2026-01-15T10:00:00+03:00", "timeZone": "Asia/Riyadh" },
      "end": { "dateTime": "2026-01-15T11:00:00+03:00", "timeZone": "Asia/Riyadh" },
      "location": "Conference Room A",
      "status": "confirmed",
      "htmlLink": "https://calendar.google.com/calendar/event?eid=..."
    }
  ],
  "count": 1
}
```

#### 6. Create Event in Google Calendar

```typescript
// POST /api/google-calendar/calendars/:calendarId/events

const response = await fetch('/api/google-calendar/calendars/primary/events', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Client Consultation",
    description: "Initial consultation with new client",
    startDateTime: "2026-01-20T14:00:00+03:00",
    endDateTime: "2026-01-20T15:00:00+03:00",
    timezone: "Asia/Riyadh",
    location: "Office",
    attendees: [
      { email: "client@example.com", name: "Ahmed Ali" }
    ],
    reminders: [
      { type: "popup", beforeMinutes: 30 },
      { type: "email", beforeMinutes: 60 }
    ]
  })
});

// Response:
{
  "success": true,
  "message": "Event created in Google Calendar",
  "data": {
    "id": "xyz789abc",
    "htmlLink": "https://calendar.google.com/calendar/event?eid=..."
  }
}
```

#### 7. Update Event in Google Calendar

```typescript
// PUT /api/google-calendar/calendars/:calendarId/events/:eventId

const response = await fetch('/api/google-calendar/calendars/primary/events/xyz789abc', {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Client Consultation (Updated)",
    startDateTime: "2026-01-20T15:00:00+03:00",
    endDateTime: "2026-01-20T16:00:00+03:00"
  })
});

// Response:
{
  "success": true,
  "message": "Event updated in Google Calendar",
  "data": { "id": "xyz789abc" }
}
```

#### 8. Delete Event from Google Calendar

```typescript
// DELETE /api/google-calendar/calendars/:calendarId/events/:eventId

const response = await fetch('/api/google-calendar/calendars/primary/events/xyz789abc', {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message": "Event deleted from Google Calendar"
}
```

#### 9. Update Selected Calendars

```typescript
// PUT /api/google-calendar/settings/calendars

const response = await fetch('/api/google-calendar/settings/calendars', {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    calendars: [
      {
        calendarId: "primary",
        name: "Personal",
        backgroundColor: "#039be5",
        isPrimary: true,
        syncEnabled: true
      },
      {
        calendarId: "work@company.com",
        name: "Work",
        backgroundColor: "#7986cb",
        isPrimary: false,
        syncEnabled: true
      }
    ],
    primaryCalendarId: "primary"
  })
});

// Response:
{
  "success": true,
  "message": "Calendar selection updated",
  "data": {
    "selectedCalendars": [...],
    "primaryCalendarId": "primary"
  }
}
```

#### 10. Toggle Show External Events

```typescript
// PUT /api/google-calendar/settings/show-external-events

const response = await fetch('/api/google-calendar/settings/show-external-events', {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    showExternalEvents: true // or false
  })
});

// Response:
{
  "success": true,
  "message": "External events enabled",
  "data": { "showExternalEvents": true }
}
```

#### 11. Import from Google Calendar

```typescript
// POST /api/google-calendar/import
// (Alias: POST /api/google-calendar/sync/import)

const response = await fetch('/api/google-calendar/import', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message": "Successfully imported 5 event(s) from Google Calendar",
  "data": {
    "imported": 5,
    "skipped": 2,
    "errors": []
  }
}
```

#### 12. Export Event to Google Calendar

```typescript
// POST /api/google-calendar/export
// (Alias: POST /api/google-calendar/sync/export/:eventId)

// Option 1: eventId in body (spec-compliant)
const response = await fetch('/api/google-calendar/export', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: "507f1f77bcf86cd799439011"
  })
});

// Option 2: eventId in URL (legacy)
const response = await fetch('/api/google-calendar/sync/export/507f1f77bcf86cd799439011', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message": "Event created in Google Calendar",
  "data": {
    "action": "created",
    "googleEventId": "abc123xyz"
  }
}
```

#### 13. Get Sync Settings

```typescript
// GET /api/google-calendar/sync/settings

const response = await fetch('/api/google-calendar/sync/settings', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": {
    "autoSync": {
      "enabled": true,
      "direction": "both",
      "syncInterval": 15,
      "conflictResolution": "newest_wins",
      "syncPastEvents": false,
      "syncDaysBack": 30,
      "syncDaysForward": 90
    },
    "syncStats": {
      "totalSyncs": 42,
      "successfulSyncs": 40,
      "failedSyncs": 2,
      "eventsImported": 156,
      "eventsExported": 89
    },
    "lastSyncedAt": "2026-01-01T08:30:00.000Z",
    "lastSyncError": null
  }
}
```

#### 14. Enable Auto-Sync

```typescript
// POST /api/google-calendar/sync/auto/enable

const response = await fetch('/api/google-calendar/sync/auto/enable', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    direction: "both", // "both" | "import_only" | "export_only"
    syncInterval: 15, // minutes
    conflictResolution: "newest_wins", // "google_wins" | "traf3li_wins" | "newest_wins" | "manual"
    syncPastEvents: false,
    syncDaysBack: 30,
    syncDaysForward: 90
  })
});

// Response:
{
  "success": true,
  "message": "Auto-sync enabled successfully",
  "data": { "autoSync": {...} }
}
```

#### 15. Disable Auto-Sync

```typescript
// POST /api/google-calendar/sync/auto/disable

const response = await fetch('/api/google-calendar/sync/auto/disable', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message": "Auto-sync disabled successfully"
}
```

---

### Microsoft Calendar Endpoints

#### 1. Get OAuth Authorization URL

```typescript
// GET /api/microsoft-calendar/auth

const response = await fetch('/api/microsoft-calendar/auth', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": {
    "authUrl": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...",
    "state": "encrypted_state_token"
  }
}
```

#### 2. Get Connection Status

```typescript
// GET /api/microsoft-calendar/status

const response = await fetch('/api/microsoft-calendar/status', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response (connected):
{
  "success": true,
  "data": {
    "connected": true,
    "email": "user@outlook.com",
    "displayName": "John Doe",
    "expiresAt": "2026-01-15T10:00:00.000Z",
    "lastSyncedAt": "2026-01-01T08:30:00.000Z",
    "syncSettings": {
      "enabled": true,
      "syncInterval": "hourly",
      "syncDirection": "bidirectional",
      "defaultCalendarId": "AAMk...",
      "syncPastDays": 30,
      "syncFutureDays": 90
    }
  }
}

// Response (not connected):
{
  "success": true,
  "data": {
    "connected": false
  }
}
```

#### 3. Disconnect Microsoft Calendar

```typescript
// POST /api/microsoft-calendar/disconnect

const response = await fetch('/api/microsoft-calendar/disconnect', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message": "Microsoft Calendar disconnected successfully",
  "message_en": "Microsoft Calendar disconnected successfully"
}
```

#### 4. Refresh Token (Manual)

```typescript
// POST /api/microsoft-calendar/refresh-token

const response = await fetch('/api/microsoft-calendar/refresh-token', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": {
    "expiresAt": "2026-01-01T12:00:00.000Z"
  }
}
```

#### 5. Get User's Calendars

```typescript
// GET /api/microsoft-calendar/calendars

const response = await fetch('/api/microsoft-calendar/calendars', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": [
    {
      "id": "AAMkAGI2...",
      "name": "Calendar",
      "color": "auto",
      "isDefaultCalendar": true,
      "canEdit": true,
      "owner": {
        "name": "John Doe",
        "address": "user@outlook.com"
      }
    }
  ]
}
```

#### 6. Get Events from Microsoft Calendar

```typescript
// GET /api/microsoft-calendar/events?calendarId=...&startDate=...&endDate=...

const response = await fetch(
  '/api/microsoft-calendar/events?startDate=2026-01-01&endDate=2026-01-31',
  { headers: { Authorization: `Bearer ${token}` } }
);

// Response:
{
  "success": true,
  "data": [
    {
      "id": "AAMkAGI2...",
      "subject": "Team Meeting",
      "body": { "contentType": "html", "content": "<p>Agenda...</p>" },
      "start": { "dateTime": "2026-01-15T10:00:00", "timeZone": "Arab Standard Time" },
      "end": { "dateTime": "2026-01-15T11:00:00", "timeZone": "Arab Standard Time" },
      "location": { "displayName": "Conference Room" },
      "webLink": "https://outlook.office365.com/..."
    }
  ]
}
```

#### 7. Create Event in Microsoft Calendar

```typescript
// POST /api/microsoft-calendar/events

const response = await fetch('/api/microsoft-calendar/events', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    calendarId: "AAMkAGI2...", // optional, uses default if omitted
    subject: "Client Meeting",
    body: { contentType: "text", content: "Discuss project requirements" },
    start: { dateTime: "2026-01-20T14:00:00", timeZone: "Arab Standard Time" },
    end: { dateTime: "2026-01-20T15:00:00", timeZone: "Arab Standard Time" },
    location: { displayName: "Office" },
    attendees: [
      { emailAddress: { address: "client@example.com", name: "Ahmed" } }
    ]
  })
});

// Response:
{
  "success": true,
  "message_en": "Event created successfully",
  "data": { "id": "AAMkAGI2..." }
}
```

#### 8. Update Event in Microsoft Calendar

```typescript
// PUT /api/microsoft-calendar/events/:eventId

const response = await fetch('/api/microsoft-calendar/events/AAMkAGI2...', {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    calendarId: "AAMkAGI2...",
    subject: "Client Meeting (Updated)",
    start: { dateTime: "2026-01-20T15:00:00", timeZone: "Arab Standard Time" },
    end: { dateTime: "2026-01-20T16:00:00", timeZone: "Arab Standard Time" }
  })
});

// Response:
{
  "success": true,
  "message_en": "Event updated successfully",
  "data": { "id": "AAMkAGI2..." }
}
```

#### 9. Delete Event from Microsoft Calendar

```typescript
// DELETE /api/microsoft-calendar/events/:eventId?calendarId=...

const response = await fetch(
  '/api/microsoft-calendar/events/AAMkAGI2...?calendarId=AAMkABC...',
  {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }
);

// Response:
{
  "success": true,
  "message_en": "Event deleted successfully"
}
```

#### 10. Import from Microsoft Calendar

```typescript
// POST /api/microsoft-calendar/import
// (Alias: POST /api/microsoft-calendar/sync/from-microsoft)

const response = await fetch('/api/microsoft-calendar/import', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    calendarId: "AAMkAGI2...", // optional
    startDate: "2026-01-01",   // optional
    endDate: "2026-01-31"      // optional
  })
});

// Response:
{
  "success": true,
  "message_en": "Successfully synced from Microsoft Calendar",
  "data": {
    "imported": 8,
    "updated": 2,
    "skipped": 1
  }
}
```

#### 11. Export Event to Microsoft Calendar

```typescript
// POST /api/microsoft-calendar/export
// (Alias: POST /api/microsoft-calendar/sync/to-microsoft/:eventId)

// Option 1: eventId in body (spec-compliant)
const response = await fetch('/api/microsoft-calendar/export', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: "507f1f77bcf86cd799439011"
  })
});

// Option 2: eventId in URL (legacy)
const response = await fetch('/api/microsoft-calendar/sync/to-microsoft/507f1f77bcf86cd799439011', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message_en": "Successfully synced to Microsoft Calendar",
  "data": {
    "microsoftEventId": "AAMkAGI2..."
  }
}
```

#### 12. Get Sync Settings

```typescript
// GET /api/microsoft-calendar/sync/settings

const response = await fetch('/api/microsoft-calendar/sync/settings', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": {
    "autoSyncEnabled": true,
    "syncDirection": "bidirectional",
    "syncInterval": "hourly",
    "selectedCalendars": ["AAMkAGI2..."],
    "syncPastDays": 30,
    "syncFutureDays": 90,
    "lastSyncAt": "2026-01-01T08:30:00.000Z"
  }
}
```

#### 13. Enable Auto-Sync

```typescript
// POST /api/microsoft-calendar/sync/enable-auto-sync

const response = await fetch('/api/microsoft-calendar/sync/enable-auto-sync', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    syncInterval: "hourly", // "manual" | "hourly" | "daily"
    syncDirection: "bidirectional", // "to_microsoft" | "from_microsoft" | "bidirectional"
    defaultCalendarId: "AAMkAGI2...",
    syncPastDays: 30,
    syncFutureDays: 90
  })
});

// Response:
{
  "success": true,
  "message_en": "Auto-sync enabled successfully",
  "data": { "syncSettings": {...} }
}
```

#### 14. Disable Auto-Sync

```typescript
// POST /api/microsoft-calendar/sync/disable-auto-sync

const response = await fetch('/api/microsoft-calendar/sync/disable-auto-sync', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "message_en": "Auto-sync disabled successfully"
}
```

---

### Appointment Calendar Endpoints

#### 1. Get Calendar Connection Status

```typescript
// GET /api/v1/appointments/calendar-status

const response = await fetch('/api/v1/appointments/calendar-status', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": {
    "connections": {
      "google": {
        "connected": true,
        "email": "user@gmail.com",
        "autoSyncEnabled": true
      },
      "microsoft": {
        "connected": false
      }
    },
    "message": {
      "en": "Calendar connected. Appointments will sync automatically.",
      "ar": "التقويم متصل. ستتم مزامنة المواعيد تلقائياً."
    }
  }
}
```

#### 2. Get "Add to Calendar" Links

```typescript
// GET /api/v1/appointments/:id/calendar-links

const response = await fetch('/api/v1/appointments/507f1f77bcf86cd799439011/calendar-links', {
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": {
    "appointmentId": "507f1f77bcf86cd799439011",
    "appointmentNumber": "APT-2026-0001",
    "scheduledTime": "2026-01-15T10:00:00.000Z",
    "links": {
      "google": "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Consultation&dates=20260115T100000Z/20260115T110000Z&details=...",
      "outlook": "https://outlook.live.com/calendar/0/deeplink/compose?subject=Consultation&startdt=2026-01-15T10:00:00Z&enddt=2026-01-15T11:00:00Z&...",
      "office365": "https://outlook.office.com/calendar/0/deeplink/compose?subject=Consultation&...",
      "yahoo": "https://calendar.yahoo.com/?v=60&title=Consultation&st=20260115T100000Z&...",
      "apple": "/api/v1/appointments/507f1f77bcf86cd799439011/calendar.ics"
    },
    "labels": {
      "google": "Add to Google Calendar",
      "outlook": "Add to Outlook.com",
      "office365": "Add to Office 365",
      "yahoo": "Add to Yahoo Calendar",
      "apple": "Download .ics file"
    }
  }
}
```

#### 3. Manually Sync Appointment to Calendars

```typescript
// POST /api/v1/appointments/:id/sync-calendar

const response = await fetch('/api/v1/appointments/507f1f77bcf86cd799439011/sync-calendar', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});

// Response:
{
  "success": true,
  "data": {
    "syncResult": {
      "google": {
        "success": true,
        "eventId": "abc123xyz",
        "action": "created"
      },
      "microsoft": {
        "success": false,
        "error": "Not connected"
      }
    },
    "message": {
      "en": "Appointment synced to Google Calendar",
      "ar": "تمت مزامنة الموعد مع تقويم جوجل"
    }
  }
}
```

#### 4. Download ICS File

```typescript
// GET /api/v1/appointments/:id/calendar.ics

// Direct download (opens Save dialog or downloads automatically)
window.location.href = '/api/v1/appointments/507f1f77bcf86cd799439011/calendar.ics';

// Or fetch and create blob
const response = await fetch('/api/v1/appointments/507f1f77bcf86cd799439011/calendar.ics');
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'appointment.ics';
a.click();

// Response: ICS file (text/calendar)
// BEGIN:VCALENDAR
// VERSION:2.0
// PRODID:-//Traf3li//Appointments//EN
// BEGIN:VEVENT
// DTSTART:20260115T100000Z
// DTEND:20260115T110000Z
// SUMMARY:Consultation with Ahmed Ali
// ...
// END:VEVENT
// END:VCALENDAR
```

---

## Usage Examples

### Complete OAuth Flow (React)

```tsx
// CalendarSettings.tsx
import { useState, useEffect } from 'react';

export function CalendarSettings() {
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null);
  const [microsoftStatus, setMicrosoftStatus] = useState<MicrosoftCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    const [google, microsoft] = await Promise.all([
      fetch('/api/google-calendar/status').then(r => r.json()),
      fetch('/api/microsoft-calendar/status').then(r => r.json())
    ]);
    setGoogleStatus(google);
    setMicrosoftStatus(microsoft);
    setLoading(false);
  };

  const connectGoogle = async () => {
    const res = await fetch('/api/google-calendar/auth');
    const { authUrl } = await res.json();
    window.location.href = authUrl;
  };

  const connectMicrosoft = async () => {
    const res = await fetch('/api/microsoft-calendar/auth');
    const { data } = await res.json();
    window.location.href = data.authUrl;
  };

  const disconnectGoogle = async () => {
    await fetch('/api/google-calendar/disconnect', { method: 'POST' });
    loadStatus();
  };

  const disconnectMicrosoft = async () => {
    await fetch('/api/microsoft-calendar/disconnect', { method: 'POST' });
    loadStatus();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Google Calendar */}
      <div>
        <h3>Google Calendar</h3>
        {googleStatus?.connected ? (
          <>
            <p>Connected as {googleStatus.data?.email}</p>
            <button onClick={disconnectGoogle}>Disconnect</button>
          </>
        ) : (
          <button onClick={connectGoogle}>Connect Google Calendar</button>
        )}
      </div>

      {/* Microsoft Calendar */}
      <div>
        <h3>Microsoft Calendar</h3>
        {microsoftStatus?.data?.connected ? (
          <>
            <p>Connected as {microsoftStatus.data.email}</p>
            <button onClick={disconnectMicrosoft}>Disconnect</button>
          </>
        ) : (
          <button onClick={connectMicrosoft}>Connect Microsoft Calendar</button>
        )}
      </div>
    </div>
  );
}
```

### Add to Calendar Dropdown Component

```tsx
// AddToCalendarDropdown.tsx
interface Props {
  appointmentId: string;
}

export function AddToCalendarDropdown({ appointmentId }: Props) {
  const [links, setLinks] = useState<CalendarLinks['data'] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/appointments/${appointmentId}/calendar-links`)
      .then(r => r.json())
      .then(data => setLinks(data.data));
  }, [appointmentId]);

  if (!links) return null;

  return (
    <div className="dropdown">
      <button onClick={() => setOpen(!open)}>Add to Calendar</button>
      {open && (
        <div className="dropdown-menu">
          <a href={links.links.google} target="_blank" rel="noopener">
            {links.labels.google}
          </a>
          <a href={links.links.outlook} target="_blank" rel="noopener">
            {links.labels.outlook}
          </a>
          <a href={links.links.yahoo} target="_blank" rel="noopener">
            {links.labels.yahoo}
          </a>
          <a href={links.links.apple} download>
            {links.labels.apple}
          </a>
        </div>
      )}
    </div>
  );
}
```

### Sync Settings Panel

```tsx
// SyncSettingsPanel.tsx
export function SyncSettingsPanel() {
  const [settings, setSettings] = useState<AutoSyncSettings | null>(null);

  const enableAutoSync = async (config: Partial<AutoSyncSettings>) => {
    await fetch('/api/google-calendar/sync/auto/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    loadSettings();
  };

  const disableAutoSync = async () => {
    await fetch('/api/google-calendar/sync/auto/disable', { method: 'POST' });
    loadSettings();
  };

  const toggleExternalEvents = async (show: boolean) => {
    await fetch('/api/google-calendar/settings/show-external-events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showExternalEvents: show })
    });
  };

  return (
    <div>
      <h3>Auto-Sync Settings</h3>

      <label>
        <input
          type="checkbox"
          checked={settings?.enabled}
          onChange={(e) => e.target.checked
            ? enableAutoSync({ direction: 'both', syncInterval: 15 })
            : disableAutoSync()
          }
        />
        Enable Auto-Sync
      </label>

      {settings?.enabled && (
        <>
          <select
            value={settings.direction}
            onChange={(e) => enableAutoSync({ direction: e.target.value as any })}
          >
            <option value="both">Bidirectional</option>
            <option value="import_only">Import Only</option>
            <option value="export_only">Export Only</option>
          </select>

          <select
            value={settings.syncInterval}
            onChange={(e) => enableAutoSync({ syncInterval: parseInt(e.target.value) })}
          >
            <option value="5">Every 5 minutes</option>
            <option value="15">Every 15 minutes</option>
            <option value="30">Every 30 minutes</option>
            <option value="60">Every hour</option>
          </select>
        </>
      )}
    </div>
  );
}
```

---

## Error Handling

All endpoints return errors in a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: string;      // Arabic message
  error_en: string;   // English message
  code?: string;      // Error code for specific handling
  details?: string;   // Technical details (dev only)
}

// Example error responses:

// 400 Bad Request
{
  "success": false,
  "error": "معرف الحدث مطلوب",
  "error_en": "eventId is required"
}

// 401 Unauthorized
{
  "success": false,
  "error": "غير مصرح",
  "error_en": "Unauthorized"
}

// 404 Not Found
{
  "success": false,
  "error": "Google Calendar غير متصل",
  "error_en": "Google Calendar not connected"
}

// 429 Too Many Requests
{
  "success": false,
  "error": "عمليات مزامنة كثيرة جداً - حاول مرة أخرى بعد 5 دقائق",
  "error_en": "Too many sync operations - Try again after 5 minutes",
  "code": "SYNC_RATE_LIMIT_EXCEEDED"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "فشل الاتصال بـ Google Calendar",
  "error_en": "Failed to connect to Google Calendar",
  "details": "Token refresh failed"
}
```
