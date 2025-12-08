# Backend Requirements for Traf3li Dashboard

This document outlines all backend API requirements, data models, and integrations needed for the Traf3li Dashboard frontend to achieve production readiness.

## Table of Contents
1. [API Endpoints Required](#api-endpoints-required)
2. [Authentication & Security](#authentication--security)
3. [Real-time Features](#real-time-features)
4. [Data Models](#data-models)
5. [Third-Party Integrations](#third-party-integrations)
6. [Performance Requirements](#performance-requirements)
7. [Saudi-Specific Requirements](#saudi-specific-requirements)

---

## API Endpoints Required

### 1. Authentication (`/api/auth/*`)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/auth/register` | POST | User registration | `{ email, password, userType, phone, ... }` | `{ user, token }` |
| `/api/auth/login` | POST | User login | `{ email, password }` | `{ user, token, refreshToken }` |
| `/api/auth/refresh` | POST | Refresh access token | `{ refreshToken }` | `{ token }` |
| `/api/auth/logout` | POST | Logout user | - | `{ success }` |
| `/api/auth/forgot-password` | POST | Request password reset | `{ email }` | `{ message }` |
| `/api/auth/reset-password` | POST | Reset password | `{ token, password }` | `{ success }` |
| `/api/auth/verify-email` | POST | Verify email | `{ token }` | `{ success }` |
| `/api/auth/me` | GET | Get current user | - | `{ user }` |

**Important Security Requirements:**
- Implement CSRF token validation using `X-CSRF-Token` header
- Use httpOnly cookies for session management
- Rate limit: 5 attempts per minute for login/register
- Password requirements: min 8 chars, 1 uppercase, 1 number

### 2. Cases Management (`/api/cases/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cases` | GET | List cases with pagination & filters |
| `/api/cases` | POST | Create new case |
| `/api/cases/:id` | GET | Get case details |
| `/api/cases/:id` | PATCH | Update case |
| `/api/cases/:id` | DELETE | Delete case |
| `/api/cases/:id/documents` | GET | Get case documents |
| `/api/cases/:id/activities` | GET | Get case activity log |
| `/api/cases/:id/parties` | GET/POST | Manage case parties |
| `/api/cases/:id/hearings` | GET/POST | Manage hearings |
| `/api/cases/:id/workflows` | GET/POST | Manage workflows |

**Query Parameters for List:**
```
?page=1&limit=20&sort=-createdAt&status=active&search=keyword
```

### 3. Clients Management (`/api/clients/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clients` | GET/POST | List/Create clients |
| `/api/clients/:id` | GET/PATCH/DELETE | Manage single client |
| `/api/clients/:id/cases` | GET | Get client's cases |
| `/api/clients/:id/documents` | GET | Get client documents |
| `/api/clients/:id/invoices` | GET | Get client invoices |
| `/api/clients/check-duplicate` | POST | Check for duplicate client |

### 4. Documents Management (`/api/documents/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/documents` | GET | List documents |
| `/api/documents` | POST | Upload document (multipart/form-data) |
| `/api/documents/:id` | GET | Get document details |
| `/api/documents/:id` | DELETE | Delete document |
| `/api/documents/:id/download` | GET | Download document |
| `/api/documents/:id/versions` | GET | Get document versions |
| `/api/documents/:id/share` | POST | Share document |

**File Upload Requirements:**
- Max file size: 50MB
- Supported types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
- Store in cloud storage (S3/Azure Blob)
- Generate thumbnails for images

### 5. Tasks & Calendar (`/api/tasks/*`, `/api/events/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tasks` | GET/POST | List/Create tasks |
| `/api/tasks/:id` | GET/PATCH/DELETE | Manage task |
| `/api/tasks/:id/activities` | GET | Get task activities |
| `/api/events` | GET/POST | List/Create calendar events |
| `/api/events/:id` | GET/PATCH/DELETE | Manage event |
| `/api/reminders` | GET/POST | List/Create reminders |
| `/api/reminders/:id/snooze` | POST | Snooze reminder |

### 6. Finance (`/api/finance/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/finance/invoices` | GET/POST | List/Create invoices |
| `/api/finance/invoices/:id` | GET/PATCH/DELETE | Manage invoice |
| `/api/finance/invoices/:id/send` | POST | Send invoice to client |
| `/api/finance/payments` | GET/POST | List/Record payments |
| `/api/finance/time-entries` | GET/POST | Time tracking entries |
| `/api/finance/expenses` | GET/POST | Expense management |
| `/api/finance/retainers` | GET/POST | Retainer management |
| `/api/finance/reports/*` | GET | Financial reports |

### 7. HR Module (`/api/hr/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hr/employees` | GET/POST | Employee management |
| `/api/hr/attendance` | GET/POST | Attendance records |
| `/api/hr/leave-requests` | GET/POST | Leave management |
| `/api/hr/payroll` | GET/POST | Payroll processing |
| `/api/hr/performance-reviews` | GET/POST | Performance reviews |

### 8. CRM Module (`/api/crm/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/crm/leads` | GET/POST | Lead management |
| `/api/crm/leads/:id/score` | GET | Get lead score |
| `/api/crm/leads/:id/convert` | POST | Convert lead to client |
| `/api/crm/activities` | GET/POST | CRM activities |
| `/api/crm/email-campaigns` | GET/POST | Email marketing |

### 9. Reports & Analytics (`/api/reports/*`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports/dashboard` | GET | Dashboard statistics |
| `/api/reports/cases` | GET | Case reports |
| `/api/reports/financial` | GET | Financial reports |
| `/api/reports/productivity` | GET | Team productivity |
| `/api/reports/export` | POST | Export report (PDF/Excel) |

---

## Authentication & Security

### CSRF Protection

The frontend expects CSRF tokens. Implement:

```javascript
// Backend should set this cookie on login
Set-Cookie: csrf_token=xxx; HttpOnly=false; SameSite=Strict; Secure

// Frontend sends this header on state-changing requests
X-CSRF-Token: xxx
```

### JWT Token Structure

```javascript
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "admin|lawyer|staff|client",
  "firmId": "firm_id",
  "permissions": ["cases.read", "cases.write", ...],
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Role-Based Access Control (RBAC)

Required roles:
- `super_admin` - Platform administrator
- `firm_admin` - Law firm owner/admin
- `lawyer` - Licensed lawyer
- `staff` - Support staff
- `client` - Client portal access

### Required Headers

```
Authorization: Bearer <token>
X-CSRF-Token: <csrf_token>
Accept-Language: ar|en
X-Timezone: Asia/Riyadh
```

---

## Real-time Features

### WebSocket Events (Socket.io)

The frontend connects to `wss://api.traf3li.com` and expects these events:

**Incoming Events (Server → Client):**

```javascript
// Notification received
socket.on('notification', {
  _id: string,
  type: 'task_reminder' | 'hearing_reminder' | 'case_update' | 'message' | 'payment',
  title: string,
  titleAr: string,
  message: string,
  messageAr: string,
  link?: string,
  read: boolean,
  createdAt: Date
})

// Real-time updates
socket.on('case:updated', { caseId, changes })
socket.on('document:uploaded', { documentId, caseId })
socket.on('message:received', { from, message })
socket.on('task:assigned', { taskId, assignedTo })
```

**Outgoing Events (Client → Server):**

```javascript
// Join room for real-time updates
socket.emit('join:firm', firmId)
socket.emit('join:case', caseId)

// Mark notification as read
socket.emit('notification:read', notificationId)

// Typing indicator for chat
socket.emit('typing:start', { conversationId })
socket.emit('typing:stop', { conversationId })
```

---

## Data Models

### User Model

```typescript
interface User {
  _id: string
  email: string
  phone: string  // Saudi format: +966XXXXXXXXX
  username: string
  fullName: string
  fullNameAr: string
  nationalId?: string  // 10 digits, starts with 1 or 2
  role: 'super_admin' | 'firm_admin' | 'lawyer' | 'staff' | 'client'
  firmId?: string
  avatar?: string
  licenseNumber?: string  // For lawyers
  barAssociationNumber?: string
  status: 'active' | 'inactive' | 'pending_verification'
  preferences: {
    language: 'ar' | 'en'
    timezone: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}
```

### Case Model

```typescript
interface Case {
  _id: string
  caseNumber: string  // Auto-generated: CASE-2024-001
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  type: 'civil' | 'criminal' | 'commercial' | 'labor' | 'family' | 'administrative'
  status: 'draft' | 'active' | 'pending' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  courtType: string
  courtBranch: string
  courtCaseNumber?: string  // External court reference
  clientId: string
  lawyerIds: string[]
  assignedTo: string
  parties: CaseParty[]
  hearings: Hearing[]
  documents: string[]  // Document IDs
  tags: string[]
  billingType: 'hourly' | 'fixed' | 'contingency' | 'retainer'
  estimatedValue?: number
  currency: 'SAR' | 'USD'
  openedAt: Date
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Client Model

```typescript
interface Client {
  _id: string
  type: 'individual' | 'company'
  name: string
  nameAr: string
  email: string
  phone: string
  secondaryPhone?: string
  // For individuals
  nationalId?: string
  // For companies
  commercialRegistration?: string  // سجل تجاري
  taxNumber?: string  // VAT number
  legalRepresentative?: string
  address: {
    street: string
    city: string
    region: string
    postalCode: string
    country: string
  }
  status: 'active' | 'inactive' | 'blacklisted'
  source: 'referral' | 'website' | 'social' | 'walk_in' | 'other'
  leadScore?: number
  createdAt: Date
  updatedAt: Date
}
```

---

## Third-Party Integrations

### 1. Saudi Government APIs (Required)

**Absher Integration:**
- Verify Saudi National ID
- Endpoint: Contact SAMA for API access

**Najiz Integration (نجيز):**
- Court case lookup
- Hearing schedules
- Case filing

**SADAD Integration:**
- Payment processing for Saudi bills
- Endpoint: Through SADAD service provider

### 2. Payment Gateways

**Required Integrations:**
- **Moyasar** (Primary) - Credit cards, MADA, Apple Pay
- **SADAD** - Bill payments
- **Bank transfers** - Manual reconciliation

```javascript
// Payment webhook endpoint
POST /api/webhooks/moyasar
POST /api/webhooks/sadad
```

### 3. SMS/WhatsApp

**SMS Provider (Unifonic/Twilio):**
- OTP verification
- Appointment reminders
- Payment notifications

**WhatsApp Business API:**
- Client communication
- Document sharing

### 4. Email Service

**Recommended: SendGrid or Amazon SES**

Templates needed:
- Welcome email (AR/EN)
- Password reset
- Invoice sent
- Hearing reminder
- Document shared
- Case update

### 5. Cloud Storage

**Recommended: AWS S3 or Azure Blob**

Configuration:
```javascript
{
  bucket: 'traf3li-documents',
  region: 'me-south-1',  // Bahrain for Saudi proximity
  encryption: 'AES-256',
  versioning: true,
  lifecycle: {
    moveToGlacier: 365,  // days
    deleteAfter: 2555    // 7 years (legal requirement)
  }
}
```

---

## Performance Requirements

### Response Time Targets

| Endpoint Type | Target | Max |
|---------------|--------|-----|
| Authentication | < 200ms | 500ms |
| List endpoints | < 300ms | 1000ms |
| Detail endpoints | < 200ms | 500ms |
| File upload | < 2s | 10s |
| Reports | < 2s | 10s |

### Pagination

All list endpoints must support:

```javascript
{
  data: [],
  meta: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasNext: true,
    hasPrev: false
  }
}
```

### Caching Strategy

```
Cache-Control: private, max-age=300  // 5 min for dynamic data
Cache-Control: public, max-age=31536000  // 1 year for static assets
```

Use Redis for:
- Session storage
- Rate limiting
- API response caching
- Real-time pub/sub

---

## Saudi-Specific Requirements

### 1. Data Residency

**MANDATORY:** All data must be stored within Saudi Arabia or approved locations per PDPL (Personal Data Protection Law).

Recommended:
- Primary: AWS Bahrain (me-south-1)
- Backup: Local Saudi data center

### 2. Validation Rules

**Saudi National ID (رقم الهوية):**
```javascript
function validateNationalId(id) {
  if (!/^[12]\d{9}$/.test(id)) return false
  // Luhn algorithm validation
  return luhnCheck(id)
}
```

**Saudi Phone Number:**
```javascript
function validateSaudiPhone(phone) {
  return /^(\+966|966|0)?5\d{8}$/.test(phone)
}
```

**Saudi IBAN:**
```javascript
function validateSaudiIban(iban) {
  return /^SA\d{2}[A-Z0-9]{22}$/.test(iban)
}
```

**Commercial Registration (سجل تجاري):**
```javascript
function validateCR(cr) {
  return /^\d{10}$/.test(cr)
}
```

### 3. Hijri Calendar Support

All date fields must support both Gregorian and Hijri:

```javascript
{
  createdAt: "2024-01-15T10:30:00Z",
  createdAtHijri: "1445-07-04"
}
```

### 4. Bilingual Support

All user-facing text must have Arabic and English versions:

```javascript
{
  title: "Case opened",
  titleAr: "تم فتح القضية",
  description: "New case has been created",
  descriptionAr: "تم إنشاء قضية جديدة"
}
```

### 5. VAT Compliance

All invoices must include:
- VAT registration number
- VAT amount (15%)
- QR code for Zatca compliance

```javascript
{
  subtotal: 1000,
  vatRate: 0.15,
  vatAmount: 150,
  total: 1150,
  zatcaQrCode: "base64_encoded_qr"
}
```

---

## API Response Format

### Success Response

```javascript
{
  success: true,
  data: { ... },
  meta: {
    page: 1,
    limit: 20,
    total: 100
  }
}
```

### Error Response

```javascript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Validation failed",
    messageAr: "فشل التحقق",
    details: [
      { field: "email", message: "Invalid email format" }
    ]
  }
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## Environment Variables

The backend should support these environment configurations:

```env
# Database
MONGODB_URI=mongodb://...
REDIS_URL=redis://...

# Authentication
JWT_SECRET=xxx
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CSRF_SECRET=xxx

# External APIs
MOYASAR_API_KEY=xxx
UNIFONIC_API_KEY=xxx
SENDGRID_API_KEY=xxx
AWS_ACCESS_KEY=xxx
AWS_SECRET_KEY=xxx
S3_BUCKET=xxx

# Saudi APIs
ABSHER_API_KEY=xxx
NAJIZ_API_KEY=xxx
SADAD_MERCHANT_ID=xxx

# Feature Flags
ENABLE_WHATSAPP=true
ENABLE_SMS=true
ENABLE_ANALYTICS=true
```

---

## Monitoring & Logging

### Required Logging

Log all API requests with:
- Request ID (UUID)
- User ID
- Endpoint
- Method
- Response time
- Status code
- IP address

### Health Check Endpoint

```
GET /api/health

Response:
{
  status: "healthy",
  version: "1.0.0",
  timestamp: "2024-01-15T10:30:00Z",
  services: {
    database: "connected",
    redis: "connected",
    storage: "connected"
  }
}
```

### Metrics to Track

- API response times (p50, p95, p99)
- Error rates by endpoint
- Active users
- Database query times
- WebSocket connections
- File upload success rate

---

## Migration Notes

When migrating from existing systems:

1. **Data Migration**
   - Export all client data
   - Map existing case statuses to new schema
   - Preserve document history

2. **User Migration**
   - Send password reset emails
   - Map old roles to new RBAC

3. **Document Migration**
   - Re-upload to new storage
   - Generate new signed URLs
   - Maintain version history

---

## Contact

For questions about backend implementation:
- Review frontend code at `/src/services/` for API expectations
- Check `/src/hooks/` for data structure usage
- See `/src/types/` for TypeScript interfaces

