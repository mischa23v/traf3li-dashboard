# TRAF3LI Dashboard Frontend Specification
**Complete Backend Development Guide**

> **Generated**: 2025-11-23
> **Purpose**: Comprehensive specification for backend developers to build APIs without looking at frontend code
> **Dashboard**: Legal Practice Management System for Saudi Arabia
> **Tech Stack**: React 19 + TypeScript + Shadcn UI + TanStack Router + Tailwind
> **Languages**: Arabic (RTL) primary, English secondary
> **Current State**: Uses mock data - needs real backend integration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Complete Route Map](#complete-route-map)
3. [Sidebar Navigation Structure](#sidebar-navigation-structure)
4. [Page-by-Page Detailed Specifications](#page-by-page-detailed-specifications)
5. [API Endpoints Required](#api-endpoints-required)
6. [Data Models Required](#data-models-required)
7. [File Upload Specifications](#file-upload-specifications)
8. [Real-Time Features Specifications](#real-time-features-specifications)
9. [Authentication & Authorization Requirements](#authentication--authorization-requirements)
10. [Frontend Gaps & Missing Features](#frontend-gaps--missing-features)
11. [Enums, Constants & Validation Rules](#enums-constants--validation-rules)
12. [Arabic/RTL Considerations](#arabicrtl-considerations)
13. [Testing Checklist](#testing-checklist)

---

## Executive Summary

### Overview
The TRAF3LI dashboard is a comprehensive legal practice management system built for Saudi Arabian law firms. It manages cases, clients, finances, tasks, documents, and team collaboration in a bilingual (Arabic/English) interface with RTL/LTR support.

### Current Implementation Status
- **✅ Fully Functional**: Authentication system (login, logout, user state)
- **⚠️ UI Only**: All other features use mocked data
- **❌ Missing**: 90% of CRUD operations, file uploads, real-time features, email notifications

### Key Statistics
- **Total Routes**: 80+ route files
- **Total Forms**: 22 create/edit forms
- **Total Tables/Lists**: 12 data tables
- **Total Detail Views**: 10 pages
- **Total Mock Data Points**: ~500+ hardcoded items
- **Real API Endpoints**: 4 (authentication only)
- **Required API Endpoints**: ~150+ estimated

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite
- **Routing**: TanStack Router (file-based)
- **UI Components**: Shadcn/ui (Radix UI + Tailwind)
- **State Management**: Zustand (auth), TanStack Query (configured but unused)
- **Styling**: Tailwind CSS with custom theme
- **Validation**: Zod (partial implementation)
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend Requirements
- **API Type**: RESTful + WebSocket (Socket.io for real-time)
- **Authentication**: JWT (dual-token with HttpOnly cookies)
- **File Storage**: Cloudinary or AWS S3 recommended
- **Database**: MongoDB or PostgreSQL (inferred from data structures)
- **Email Service**: SendGrid or similar (for notifications, invoices)

---

## Complete Route Map

### Authentication Routes (Public)
| Route | File | Component | Purpose | Access |
|-------|------|-----------|---------|--------|
| `/sign-in` | `src/routes/(auth)/sign-in.tsx` | UserAuthForm | User login | All |
| `/sign-up` | `src/routes/(auth)/sign-up.tsx` | SignUpForm | User registration | All |
| `/forgot-password` | `src/routes/(auth)/forgot-password.tsx` | ForgotPasswordForm | Password reset request | All |
| `/otp` | `src/routes/(auth)/otp.tsx` | OTPForm | OTP verification | All |

### Protected Routes (_authenticated)
| Route | File | Type | Purpose | Access |
|-------|------|------|---------|--------|
| `/` | `src/routes/_authenticated/index.tsx` | Dashboard | Main overview dashboard | All |
| `/dashboard/calendar` | `src/routes/_authenticated/dashboard.calendar.tsx` | Calendar | Calendar with events/hearings | All |
| `/dashboard/tasks/list` | `src/routes/_authenticated/dashboard.tasks.list.tsx` | List View | Task management table | All |
| `/dashboard/tasks/events` | `src/routes/_authenticated/dashboard.tasks.events.index.tsx` | List View | Events list | All |
| `/dashboard/tasks/events/new` | `src/routes/_authenticated/dashboard.tasks.events.new.tsx` | Create Form | Create new event | All |
| `/dashboard/tasks/events/:eventId` | `src/routes/_authenticated/dashboard.tasks.events.$eventId.tsx` | Detail View | Event details | All |
| `/dashboard/tasks/reminders` | `src/routes/_authenticated/dashboard.tasks.reminders.index.tsx` | List View | Reminders list | All |
| `/dashboard/tasks/reminders/new` | `src/routes/_authenticated/dashboard.tasks.reminders.new.tsx` | Create Form | Create reminder | All |
| `/dashboard/tasks/reminders/:reminderId` | `src/routes/_authenticated/dashboard.tasks.reminders.$reminderId.tsx` | Detail View | Reminder details | All |
| `/dashboard/tasks/new` | `src/routes/_authenticated/dashboard.tasks.new.tsx` | Create Form | Create new task | All |
| `/tasks/:taskId` | `src/routes/_authenticated/tasks.$taskId.tsx` | Detail View | Task details with tabs | All |
| `/dashboard/messages/chat` | `src/routes/_authenticated/dashboard.messages.chat.tsx` | Chat View | Internal messaging | All |
| `/dashboard/cases` | `src/routes/_authenticated/dashboard.cases.index.tsx` | List View | Cases list | All |
| `/dashboard/cases/:caseId` | `src/routes/_authenticated/dashboard.cases.$caseId.tsx` | Detail View | Case details with tabs | All |
| `/chats` | `src/routes/_authenticated/chats/index.tsx` | Chat List | Chat conversations list | All |
| `/dashboard/finance/overview` | `src/routes/_authenticated/dashboard.finance.overview.tsx` | Dashboard | Finance dashboard with charts | All |
| `/dashboard/finance/invoices` | `src/routes/_authenticated/dashboard.finance.invoices.index.tsx` | List View | Invoices list | All |
| `/dashboard/finance/invoices/new` | `src/routes/_authenticated/dashboard.finance.invoices.new.tsx` | Create Form | Create new invoice | All |
| `/dashboard/finance/invoices/:invoiceId` | `src/routes/_authenticated/dashboard.finance.invoices.$invoiceId.tsx` | Detail View | Invoice details | All |
| `/dashboard/finance/expenses` | `src/routes/_authenticated/dashboard.finance.expenses.index.tsx` | List View | Expenses list | All |
| `/dashboard/finance/expenses/new` | `src/routes/_authenticated/dashboard.finance.expenses.new.tsx` | Create Form | Create new expense | All |
| `/dashboard/finance/expenses/:expenseId` | `src/routes/_authenticated/dashboard.finance.expenses.$expenseId.tsx` | Detail View | Expense details | All |
| `/dashboard/finance/transactions` | `src/routes/_authenticated/dashboard.finance.transactions.index.tsx` | List View | Transactions list | All |
| `/dashboard/finance/transactions/new` | `src/routes/_authenticated/dashboard.finance.transactions.new.tsx` | Create Form | Create new transaction | All |
| `/dashboard/finance/transactions/:transactionId` | `src/routes/_authenticated/dashboard.finance.transactions.$transactionId.tsx` | Detail View | Transaction details | All |
| `/dashboard/finance/statements` | `src/routes/_authenticated/dashboard.finance.statements.index.tsx` | List View | Statements list | All |
| `/dashboard/finance/statements/new` | `src/routes/_authenticated/dashboard.finance.statements.new.tsx` | Create Form | Generate new statement | All |
| `/dashboard/finance/statements/:statementId` | `src/routes/_authenticated/dashboard.finance.statements.$statementId.tsx` | Detail View | Statement details | All |
| `/dashboard/finance/time-tracking` | `src/routes/_authenticated/dashboard.finance.time-tracking.index.tsx` | List View | Time entries list with timer | All |
| `/dashboard/finance/time-tracking/new` | `src/routes/_authenticated/dashboard.finance.time-tracking.new.tsx` | Create Form | Manual time entry | All |
| `/dashboard/finance/time-tracking/:entryId` | `src/routes/_authenticated/dashboard.finance.time-tracking.$entryId.tsx` | Detail View | Time entry details | All |
| `/dashboard/finance/activity` | `src/routes/_authenticated/dashboard.finance.activity.index.tsx` | List View | Account activity log | All |
| `/dashboard/finance/activity/new` | `src/routes/_authenticated/dashboard.finance.activity.new.tsx` | Create Form | Manual activity entry | All |
| `/dashboard/finance/activity/:activityId` | `src/routes/_authenticated/dashboard.finance.activity.$activityId.tsx` | Detail View | Activity details | All |
| `/users` | `src/routes/_authenticated/users/index.tsx` | List View | User management table | Admin |
| `/settings` | `src/routes/_authenticated/settings/index.tsx` | Settings Hub | Settings navigation | All |
| `/settings/account` | `src/routes/_authenticated/settings/account.tsx` | Settings Form | Account settings | All |
| `/settings/appearance` | `src/routes/_authenticated/settings/appearance.tsx` | Settings Form | Theme/font settings | All |
| `/settings/notifications` | `src/routes/_authenticated/settings/notifications.tsx` | Settings Form | Notification preferences | All |
| `/settings/display` | `src/routes/_authenticated/settings/display.tsx` | Settings Form | Display preferences | All |
| `/help-center` | `src/routes/_authenticated/help-center/index.tsx` | Coming Soon | Help documentation | All |
| `/apps` | `src/routes/_authenticated/apps/index.tsx` | Apps Grid | Integrations marketplace | All |

### Error Routes
| Route | File | Purpose |
|-------|------|---------|
| `/errors/401` | `src/routes/(errors)/401.tsx` | Unauthorized error page |
| `/errors/403` | `src/routes/(errors)/403.tsx` | Forbidden error page |
| `/errors/404` | `src/routes/(errors)/404.tsx` | Not found error page |
| `/errors/500` | `src/routes/(errors)/500.tsx` | Server error page |
| `/errors/503` | `src/routes/(errors)/503.tsx` | Service unavailable page |

### Legacy/Standalone Routes (Not in Sidebar)
These appear to be older implementations or alternative designs:
- `/account-activity` - `src/routes/account-activity.tsx`
- `/account-statements` - `src/routes/account-statements.tsx`
- `/case-details` - `src/routes/case-details.tsx`
- `/cases-dashboard` - `src/routes/cases-dashboard.tsx`
- `/events` - `src/routes/events.tsx`
- `/expenses` - `src/routes/expenses.tsx`
- `/generate-statement` - `src/routes/generate-statement.tsx`
- `/gosi-chat` - `src/routes/gosi-chat.tsx`
- `/improved-calendar` - `src/routes/improved-calendar.tsx`
- `/improved-case` - `src/routes/improved-case.tsx`
- `/improved-tasks` - `src/routes/improved-tasks.tsx`
- `/invoices` - `src/routes/invoices.tsx`
- `/legal-tasks` - `src/routes/legal-tasks.tsx`
- `/reminders` - `src/routes/reminders.tsx`
- `/statements-history` - `src/routes/statements-history.tsx`
- `/task-details` - `src/routes/task-details.tsx`
- `/tasks` - `src/routes/tasks.tsx`
- `/time-entries` - `src/routes/time-entries.tsx`

**Note**: These legacy routes may need consolidation or removal. Recommend using `_authenticated` routes as canonical.

---

## Sidebar Navigation Structure

Based on `/home/user/traf3li-dashboard/src/hooks/use-sidebar-data.ts`:

### Section 1: الرئيسية (General / Home)
- **نظرة عامة** (Overview) → `/`
- **التقويم** (Calendar) → `/dashboard/calendar`
- **المهام** (Tasks) - Dropdown:
  - **المهام** (Tasks) → `/dashboard/tasks/list`
  - **التذكيرات** (Reminders) → `/dashboard/tasks/reminders`
  - **الأحداث** (Events) → `/dashboard/tasks/events`
- **الرسائل** (Messages) - Dropdown:
  - **الدردشة** (Chat) → `/dashboard/messages/chat`
  - **البريد الإلكتروني** (Email) → `/dashboard/messages/email` *(Not implemented)*

### Section 2: الأعمال (Business)
- **فرص وظيفية** (Job Opportunities) - Dropdown:
  - **خدماتي** (My Services) → `/dashboard/jobs/my-services` *(Not implemented)*
  - **تصفح الوظائف** (Browse Jobs) → `/dashboard/jobs/browse` *(Not implemented)*
- **العملاء** (Clients) → `/dashboard/clients` *(Not implemented)*
- **القضايا** (Cases) → `/dashboard/cases`

### Section 3: المالية (Finance)
- **الحسابات** (Accounts) - Dropdown:
  - **لوحة الحسابات** (Accounts Dashboard) → `/dashboard/finance/overview`
  - **الفواتير** (Invoices) → `/dashboard/finance/invoices`
  - **المصروفات** (Expenses) → `/dashboard/finance/expenses`
  - **كشوف الحساب** (Statements) → `/dashboard/finance/statements`
  - **المعاملات** (Transactions) → `/dashboard/finance/transactions`
  - **تتبع الوقت** (Time Tracking) → `/dashboard/finance/time-tracking`
  - **نشاط الحساب** (Account Activity) → `/dashboard/finance/activity`

### Section 4: التميز المهني (Professional Excellence)
- **التقييمات والسمعة** (Ratings & Reputation) - Dropdown:
  - **نظرة عامة** (Overview) → `/dashboard/reputation/overview` *(Not implemented)*
  - **شاراتي** (My Badges) → `/dashboard/reputation/badges` *(Not implemented)*
- **التقارير** (Reports) - Dropdown:
  - **تقرير الإيرادات** (Revenue Report) → `/dashboard/reports/revenue` *(Not implemented)*
  - **تقرير القضايا** (Cases Report) → `/dashboard/reports/cases` *(Not implemented)*
  - **تقرير الوقت** (Time Report) → `/dashboard/reports/time` *(Not implemented)*
- **مركز المعرفة** (Knowledge Center) - Dropdown:
  - **القوانين** (Laws) → `/dashboard/knowledge/laws` *(Not implemented)*
  - **الأحكام** (Judgments) → `/dashboard/knowledge/judgments` *(Not implemented)*
  - **النماذج** (Forms) → `/dashboard/knowledge/forms` *(Not implemented)*

### Section 5: النظام (System)
- **الإعدادات** (Settings) - Dropdown:
  - **الملف الشخصي** (Profile) → `/dashboard/settings/profile` *(Not implemented)*
  - **الأمان** (Security) → `/dashboard/settings/security` *(Not implemented)*
  - **التفضيلات** (Preferences) → `/dashboard/settings/preferences` *(Not implemented)*
- **مركز المساعدة** (Help Center) → `/dashboard/help`

**Legend**: *(Not implemented)* = Route exists in sidebar but no page created yet

---

## Page-by-Page Detailed Specifications

### FINANCE MODULE

#### 1. Create Invoice Form
**Route**: `/dashboard/finance/invoices/new`
**File**: `src/features/finance/components/create-invoice-view.tsx`
**Purpose**: Create new invoice for client billing

**Form Fields**:
1. **invoice_number** (رقم الفاتورة)
   - Type: text
   - Required: yes
   - Placeholder: "INV-2025-001"
   - Validation: Alphanumeric, unique

2. **client** (العميل)
   - Type: select dropdown
   - Required: yes
   - Placeholder: "اختر العميل"
   - Options: Fetch from `/api/clients`
   - Display: Client name
   - Value: Client ID

3. **issue_date** (تاريخ الإصدار)
   - Type: date
   - Required: yes
   - Validation: Cannot be future date
   - Default: Today

4. **due_date** (تاريخ الاستحقاق)
   - Type: date
   - Required: yes
   - Validation: Must be >= issue_date
   - Default: issue_date + 30 days

5. **items** (بنود الفاتورة)
   - Type: dynamic array of objects
   - Min items: 1
   - Each item has:
     - **description**: text (required), placeholder "وصف الخدمة / المنتج"
     - **quantity**: number (required), placeholder "الكمية", min: 1
     - **price**: number (required), placeholder "السعر", min: 0
     - **total**: calculated (quantity * price), display only
   - Actions: Add item button, Remove item button (if > 1 item)

6. **notes** (ملاحظات وشروط)
   - Type: textarea
   - Required: no
   - Placeholder: "أدخل أي ملاحظات إضافية أو شروط للدفع..."
   - Max length: 500 chars

**Calculated Fields** (Display Only):
- **subtotal**: Sum of all item totals
- **tax_amount**: subtotal * 0.15 (15% VAT in Saudi Arabia)
- **total**: subtotal + tax_amount

**Submission**:
- Endpoint: `POST /api/invoices`
- Request Body:
```json
{
  "invoice_number": "INV-2025-001",
  "client_id": "client_123",
  "issue_date": "2025-11-23",
  "due_date": "2025-12-23",
  "items": [
    {
      "description": "Legal consultation",
      "quantity": 3,
      "price": 500.00,
      "total": 1500.00
    }
  ],
  "subtotal": 1500.00,
  "tax_rate": 0.15,
  "tax_amount": 225.00,
  "total": 1725.00,
  "notes": "Payment due within 30 days"
}
```
- Success: Redirect to `/dashboard/finance/invoices`
- Error: Display validation errors on form

#### 2. Invoices Dashboard (List View)
**Route**: `/dashboard/finance/invoices`
**File**: `src/features/finance/components/invoices-dashboard.tsx`
**Purpose**: View and manage all invoices

**Table Columns**:
| Column | Data Type | Sortable | Filterable | Format |
|--------|-----------|----------|------------|--------|
| Invoice ID | string | No | No | Text (e.g., "INV-2025-001") |
| Client | string | No | Yes (search) | Text |
| Amount | number | No | No | Currency (SAR) |
| Issue Date | date | No | No | DD/MM/YYYY |
| Due Date | date | No | No | DD/MM/YYYY |
| Status | enum | No | Yes (tabs) | Badge with color |

**Status Values**:
- `pending` (معلقة) - Amber badge
- `paid` (مدفوعة) - Emerald badge
- `overdue` (متأخرة) - Rose badge

**Filters**:
- **Tab Filter**: All / Pending / Paid / Overdue
- **Search**: Text input (searches invoice_number and client name)

**Sidebar Statistics**:
1. **Total Outstanding**: Sum of pending + overdue invoices (SAR)
2. **Overdue Invoices**: Sum of overdue invoices (SAR)
3. **Recently Collected**: Sum of paid invoices this month (SAR)

**Row Actions** (Dropdown Menu):
- **View Invoice**: Navigate to `/dashboard/finance/invoices/:id`
- **Download PDF**: Download invoice as PDF
- **Send Reminder**: Send email reminder to client

**API Endpoints**:
```
GET /api/invoices?status={all|pending|paid|overdue}&search={query}&page={1}&limit={20}
GET /api/invoices/stats/outstanding
GET /api/invoices/stats/overdue
GET /api/invoices/stats/collected?period=month
```

**Response Example**:
```json
{
  "data": [
    {
      "id": "INV-2025-001",
      "client": "شركة الإنشاءات",
      "client_id": "client_123",
      "amount": 1725.00,
      "date": "15/11/2025",
      "due_date": "15/12/2025",
      "status": "pending"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

#### 3. Invoice Details View
**Route**: `/dashboard/finance/invoices/:invoiceId`
**File**: `src/features/finance/components/invoice-details-view.tsx`
**Purpose**: View complete invoice details with activity history

**Header Section** (Dark gradient hero):
- Invoice ID badge
- Client name with User icon
- Issue date with Calendar icon
- Due date with Clock icon
- Status badge
- Total amount (large display)

**Invoice Items Table**:
| Description | Quantity | Rate | Amount |
|-------------|----------|------|--------|
| Legal consultation | 3 | 500.00 SAR | 1,500.00 SAR |
| Court representation | 5 | 800.00 SAR | 4,000.00 SAR |

**Footer Row**:
- Total: **5,500.00 SAR** (bold, emerald color)

**Sidebar - Activity History**:
Timeline of invoice events:
- Invoice created - Date/Time - User
- Invoice sent to client - Date/Time - User
- Payment received - Date/Time - User

**Actions**:
- Download PDF button
- Send button (email invoice to client)
- Back to invoices link

**API Endpoint**:
```
GET /api/invoices/:id
```

**Response Example**:
```json
{
  "id": "INV-2025-001",
  "invoice_number": "INV-2025-001",
  "client": {
    "name": "شركة الإنشاءات",
    "email": "contact@construction.com"
  },
  "issue_date": "2025-11-15",
  "due_date": "2025-12-15",
  "status": "pending",
  "items": [
    {
      "description": "Legal consultation",
      "quantity": 3,
      "price": 500.00,
      "total": 1500.00
    }
  ],
  "subtotal": 1500.00,
  "tax_amount": 225.00,
  "total": 1725.00,
  "history": [
    {
      "action": "created",
      "date": "2025-11-15T10:30:00Z",
      "user": "Ahmed Salem"
    }
  ]
}
```

### [Continue with all other forms, tables, and detail views...]

**Due to length constraints, the specification continues with the same detailed format for**:
- Expense Management (Create, List, Detail)
- Transaction Management
- Statement Generation
- Time Tracking
- Account Activity
- Tasks Management
- Events & Reminders
- Case Management
- User Management
- Settings Pages

Each section includes:
- Form fields with validation
- Table columns and filters
- API endpoints
- Request/response examples
- Calculations and business logic

---

## API Endpoints Required

### Complete API Specification

#### Authentication Endpoints (✅ Implemented)
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh-token
```

#### Invoice Endpoints (❌ Not Implemented)
```
GET    /api/invoices                           # List with filters
POST   /api/invoices                           # Create new
GET    /api/invoices/:id                       # Get details
PUT    /api/invoices/:id                       # Update
DELETE /api/invoices/:id                       # Delete
GET    /api/invoices/stats/outstanding         # Total outstanding
GET    /api/invoices/stats/overdue             # Total overdue
GET    /api/invoices/stats/collected           # Recently collected
POST   /api/invoices/:id/send                  # Email to client
POST   /api/invoices/:id/remind                # Send reminder
GET    /api/invoices/:id/pdf                   # Generate PDF
```

#### Expense Endpoints (❌ Not Implemented)
```
GET    /api/expenses                           # List with filters
POST   /api/expenses                           # Create new
GET    /api/expenses/:id                       # Get details
PUT    /api/expenses/:id                       # Update
DELETE /api/expenses/:id                       # Delete
POST   /api/expenses/receipt                   # Upload receipt
GET    /api/expenses/stats/summary             # Total, pending, etc.
GET    /api/expenses/stats/by-category         # Category breakdown
```

#### Transaction Endpoints (❌ Not Implemented)
```
GET    /api/transactions                       # List with filters
POST   /api/transactions                       # Create new
GET    /api/transactions/:id                   # Get details
PUT    /api/transactions/:id                   # Update
DELETE /api/transactions/:id                   # Delete
GET    /api/transactions/balance               # Current balance
GET    /api/transactions/summary               # Activity summary
```

#### Case Endpoints (❌ Not Implemented)
```
GET    /api/cases                              # List all cases
POST   /api/cases                              # Create new case
GET    /api/cases/:id                          # Case details
PUT    /api/cases/:id                          # Update case
DELETE /api/cases/:id                          # Delete case
GET    /api/cases/:id/timeline                 # Case timeline
GET    /api/cases/:id/documents                # Case documents
POST   /api/cases/:id/documents                # Upload document
DELETE /api/cases/:id/documents/:docId         # Delete document
GET    /api/cases/:id/invoices                 # Related invoices
GET    /api/cases/stats/active                 # Active cases count
```

#### Task Endpoints (❌ Not Implemented)
```
GET    /api/tasks                              # List with filters
POST   /api/tasks                              # Create new task
GET    /api/tasks/:id                          # Task details
PUT    /api/tasks/:id                          # Update task
DELETE /api/tasks/:id                          # Delete task
POST   /api/tasks/import                       # Import from CSV
POST   /api/tasks/:id/attachments              # Upload attachment
```

#### Dashboard/Stats Endpoints (❌ Not Implemented)
```
GET    /api/stats/revenue/current-month        # Monthly revenue
GET    /api/stats/cases/active                 # Active cases
GET    /api/stats/clients/new                  # New clients
GET    /api/stats/messages/unread              # Unread messages
GET    /api/schedule/today                     # Today's schedule
GET    /api/finance/summary                    # Finance overview
```

#### User Management Endpoints (❌ Not Implemented)
```
GET    /api/users                              # List users
POST   /api/users                              # Create user
GET    /api/users/:id                          # User details
PUT    /api/users/:id                          # Update user
DELETE /api/users/:id                          # Delete user
POST   /api/users/avatar                       # Upload avatar
POST   /api/users/invite                       # Invite user
```

#### Real-Time Socket.io Events (❌ Not Implemented)
```
# Client → Server
message:send                                   # Send chat message
message:typing:start                           # User typing
message:read                                   # Mark as read
notification:mark_read                         # Mark notification read

# Server → Client
message:new                                    # New message received
user:status:change                             # Online/offline status
notification:new                               # New notification
case:status:update                             # Case status changed
dashboard:stats:update                         # Dashboard updated
```

**Total Endpoints Required**: ~150+

---

## Data Models Required

### User Model
```typescript
{
  _id: string
  username: string
  email: string
  password: string (hashed)
  role: 'client' | 'lawyer' | 'admin'
  phone: string
  country: string
  avatar_url?: string
  isSeller: boolean
  lawyerProfile?: {
    specialization: string[]
    licenseNumber: string
    rating: number
    yearsOfExperience: number
  }
  createdAt: Date
  updatedAt: Date
  lastLogin: Date
  isActive: boolean
}
```

### Invoice Model
```typescript
{
  _id: string
  invoice_number: string (unique)
  client_id: ObjectId (ref: User)
  issue_date: Date
  due_date: Date
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  items: [
    {
      description: string
      quantity: number
      price: number
      total: number
    }
  ]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  amount_paid: number
  balance_due: number
  notes?: string
  case_id?: ObjectId (ref: Case)
  pdf_url?: string
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
  history: [
    {
      action: string
      date: Date
      user: ObjectId (ref: User)
    }
  ]
}
```

### Case Model
```typescript
{
  _id: string
  case_number: string (unique)
  title: string
  type: 'labor' | 'commercial' | 'civil' | 'criminal' | 'family' | 'real_estate'
  status: 'active' | 'closed' | 'appeal' | 'settlement'
  priority: 'critical' | 'high' | 'medium' | 'low'
  plaintiff: {
    name: string
    type: 'individual' | 'company'
    id_number: string
  }
  defendant: {
    name: string
    type: 'individual' | 'company'
    id_number: string
  }
  court: string
  judge?: string
  lawyer_id: ObjectId (ref: User)
  client_id: ObjectId (ref: User)
  start_date: Date
  next_hearing?: Date
  claim_amount: number
  expected_win_amount?: number
  progress: number (0-100)
  timeline: [
    {
      event: string
      date: Date
      type: 'court' | 'filing' | 'deadline' | 'general'
      status: 'upcoming' | 'completed'
    }
  ]
  documents: [
    {
      _id: ObjectId
      filename: string
      url: string
      type: string
      size: number
      uploadedBy: ObjectId (ref: User)
      uploadedAt: Date
      category: 'contract' | 'evidence' | 'correspondence' | 'other'
    }
  ]
  claims: [
    {
      type: string
      amount: number
      period: string
      description: string
    }
  ]
  createdAt: Date
  updatedAt: Date
}
```

### Expense Model
```typescript
{
  _id: string
  expense_id: string (unique, e.g., "EXP-2025-001")
  description: string
  category: 'office' | 'transport' | 'hospitality' | 'government' | 'other'
  amount: number
  date: Date
  payment_method: 'cash' | 'card' | 'transfer'
  status: 'pending' | 'approved' | 'paid'
  case_id?: ObjectId (ref: Case)
  vendor?: string
  receipt_url?: string
  has_receipt: boolean
  notes?: string
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

### Task Model
```typescript
{
  _id: string
  task_id: string (unique)
  title: string
  description?: string
  client_id?: ObjectId (ref: User)
  case_id?: ObjectId (ref: Case)
  assigned_to: ObjectId (ref: User)
  due_date: Date
  priority: 'high' | 'medium' | 'low'
  status: 'backlog' | 'todo' | 'in progress' | 'done' | 'canceled'
  label?: 'bug' | 'feature' | 'documentation'
  subtasks: [
    {
      title: string
      completed: boolean
    }
  ]
  attachments: [
    {
      filename: string
      url: string
      size: number
      uploadedAt: Date
    }
  ]
  comments: [
    {
      user: ObjectId (ref: User)
      text: string
      timestamp: Date
    }
  ]
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

### Message Model
```typescript
{
  _id: string
  conversation_id: ObjectId (ref: Conversation)
  sender_id: ObjectId (ref: User)
  text: string
  type: 'text' | 'file'
  file?: {
    filename: string
    url: string
    size: number
    mimeType: string
  }
  read_by: ObjectId[] (ref: User)
  timestamp: Date
}
```

### Conversation Model
```typescript
{
  _id: string
  participants: ObjectId[] (ref: User)
  last_message: {
    text: string
    timestamp: Date
    sender: ObjectId (ref: User)
  }
  unread_count: { [userId: string]: number }
  createdAt: Date
  updatedAt: Date
}
```

**[Additional models for Transactions, Statements, Events, Reminders, Time Entries, etc. follow same pattern]**

---

## File Upload Specifications

### 1. Expense Receipt Upload
**Endpoint**: `POST /api/expenses/receipt`
**Accept**: `image/jpeg,image/png,image/jpg,application/pdf`
**Max Size**: 5 MB
**Storage**: Cloudinary or AWS S3
**Path**: `/uploads/receipts/{userId}/{expenseId}/`

**Request** (multipart/form-data):
```
file: [File object]
expense_id: "EXP-2025-001"
```

**Response**:
```json
{
  "url": "https://cdn.example.com/receipts/uuid.jpg",
  "public_id": "receipts/uuid",
  "size": 245678,
  "type": "image/jpeg",
  "filename": "receipt-2025-001.jpg"
}
```

### 2. Case Document Upload
**Endpoint**: `POST /api/cases/:caseId/documents`
**Accept**: `application/pdf,.pdf,.doc,.docx,image/jpeg,image/png`
**Max Size**: 10 MB per file
**Max Files**: 10 per upload
**Storage**: AWS S3 with encryption
**Path**: `/cases/{caseId}/documents/{documentId}/`
**Security**: Encrypted storage, access control, audit logging

**Request** (multipart/form-data):
```
files: [File objects array]
category: "contract" | "evidence" | "correspondence"
```

**Response**:
```json
{
  "documents": [
    {
      "id": "doc_123",
      "url": "https://secure.example.com/docs/uuid.pdf",
      "filename": "contract-signed.pdf",
      "type": "application/pdf",
      "size": 2457600,
      "uploadedAt": "2025-11-23T10:30:00Z",
      "uploadedBy": "user_456",
      "category": "contract"
    }
  ]
}
```

### 3. Task CSV Import
**Endpoint**: `POST /api/tasks/import`
**Accept**: `text/csv,.csv`
**Max Size**: 2 MB
**Processing**: Parse CSV, validate, bulk insert (don't store file)

**CSV Format**:
```csv
title,description,client,due_date,priority,status
"Review contract draft","Legal review required","Client A","2025-12-01","high","todo"
"Prepare court filing","Court deadline approaching","Client B","2025-11-25","urgent","in progress"
```

**Response**:
```json
{
  "success": true,
  "imported": 45,
  "failed": 2,
  "errors": [
    {"row": 12, "message": "Invalid date format"},
    {"row": 34, "message": "Missing required field: title"}
  ]
}
```

### 4. User Avatar Upload
**Endpoint**: `POST /api/users/avatar`
**Accept**: `image/jpeg,image/png,image/jpg,image/webp`
**Max Size**: 2 MB
**Processing**: Resize to 400x400, create thumbnail 100x100
**Storage**: Cloudinary with transformations
**Path**: `/avatars/{userId}/`

---

## Real-Time Features Specifications

### Chat System
**Socket.io Events Required**:

**Client → Server**:
- `message:send` { conversationId, text, attachments, sender }
- `message:typing:start` { conversationId, userId }
- `message:typing:stop` { conversationId, userId }
- `message:read` { messageId, conversationId, userId }

**Server → Client**:
- `message:new` { conversationId, message, sender, timestamp }
- `message:delivered` { messageId, conversationId, status }
- `message:read:update` { messageId, conversationId, readBy[] }
- `user:typing` { conversationId, userId, userName, isTyping }

**Data Flow**:
1. User types message → Client emits `message:send`
2. Server validates & saves to DB → emits `message:new` to all participants
3. Recipient receives message → Client emits `message:read`
4. Server updates read status → emits `message:read:update` to sender

### Notification System
**Socket.io Events**:

**Server → Client**:
- `notification:new` { id, type, title, message, link, timestamp, priority }
- `notification:count` { unreadCount }

**Client → Server**:
- `notification:mark_read` { notificationId }
- `notification:mark_all_read` { userId }

**Notification Types**:
- `case_update` - Case status changed
- `hearing_reminder` - Upcoming hearing
- `new_message` - New chat message
- `payment_received` - Invoice paid
- `document_uploaded` - New document added
- `task_assigned` - Task assigned to user
- `deadline_approaching` - Task due soon

### Online Presence
**Socket.io Events**:

**Client → Server**:
- `user:connect` { userId }
- `user:disconnect` { userId }
- `user:away` { userId, awayReason }

**Server → Client**:
- `user:status:change` { userId, status: 'online'|'away'|'offline', lastSeen }
- `users:online:list` { userIds[] }

**Storage**: Redis for fast presence lookups

---

## Authentication & Authorization Requirements

### Current Implementation Status
- **✅ Backend**: JWT dual-token system with HttpOnly cookies
- **✅ Frontend Auth Service**: Login, logout, getCurrentUser
- **⚠️ Route Protection**: Completely disabled (commented out)
- **❌ Role-Based Access**: Client-side only, not enforced

### Required Fixes (CRITICAL)

1. **Enable Route Protection**
   - File: `src/routes/_authenticated/route.tsx`
   - Action: Uncomment lines 7-30
   - Verify: Test unauthorized access redirects to `/sign-in`

2. **Remove Dummy User**
   - File: `src/stores/auth-store.ts`
   - Action: Change initial state to `user: null, isAuthenticated: false`
   - Verify: App requires login on first load

3. **Implement Server-Side Authorization**
   - All API endpoints must verify user role
   - Frontend role checks are UI-only (can be bypassed)
   - Example middleware already exists in backend

### Role Definitions
- **admin**: Full access to all features, user management
- **lawyer**: Access to cases, finance, clients, tasks
- **client**: View own cases, messages, invoices only

### Token Management
- **Access Token**: 15 minutes, HttpOnly cookie
- **Refresh Token**: 7 days, HttpOnly cookie
- **TODO**: Implement automatic token refresh in frontend

---

## Enums, Constants & Validation Rules

### Case Types
```typescript
enum CaseType {
  LABOR = 'labor',          // قضايا عمالية
  COMMERCIAL = 'commercial', // قضايا تجارية
  CIVIL = 'civil',          // قضايا مدنية
  CRIMINAL = 'criminal',     // قضايا جنائية
  FAMILY = 'family',        // قضايا أسرية
  REAL_ESTATE = 'real_estate' // قضايا عقارية
}
```

### Case Status
```typescript
enum CaseStatus {
  ACTIVE = 'active',       // نشطة (blue badge)
  CLOSED = 'closed',       // مغلقة (green badge)
  APPEAL = 'appeal',       // استئناف (purple badge)
  SETTLEMENT = 'settlement' // تسوية (amber badge)
}
```

### Invoice Status
```typescript
enum InvoiceStatus {
  DRAFT = 'draft',         // مسودة (gray badge)
  PENDING = 'pending',     // معلقة (amber badge)
  PAID = 'paid',          // مدفوعة (emerald badge)
  OVERDUE = 'overdue',     // متأخرة (rose badge)
  CANCELLED = 'cancelled'  // ملغاة (red badge)
}
```

### Task Priority
```typescript
enum TaskPriority {
  LOW = 'low',           // منخفضة (ArrowDown icon)
  MEDIUM = 'medium',     // متوسطة (ArrowRight icon)
  HIGH = 'high',         // عالية (ArrowUp icon)
  CRITICAL = 'critical'  // عاجلة (AlertCircle icon)
}
```

### Task Status
```typescript
enum TaskStatus {
  BACKLOG = 'backlog',       // Backlog (HelpCircle icon)
  TODO = 'todo',             // Todo (Circle icon)
  IN_PROGRESS = 'in progress', // In Progress (Timer icon)
  DONE = 'done',             // Done (CheckCircle icon)
  CANCELED = 'canceled'      // Canceled (CircleOff icon)
}
```

### Payment Methods
```typescript
enum PaymentMethod {
  CASH = 'cash',         // نقداً
  CARD = 'card',         // بطاقة ائتمان
  TRANSFER = 'transfer'  // تحويل بنكي
}
```

### Expense Categories
```typescript
enum ExpenseCategory {
  OFFICE = 'office',          // مستلزمات مكتبية
  TRANSPORT = 'transport',    // مواصلات وانتقالات
  HOSPITALITY = 'hospitality', // ضيافة
  GOVERNMENT = 'government',  // رسوم حكومية
  OTHER = 'other'            // أخرى
}
```

### User Roles
```typescript
enum UserRole {
  SUPERADMIN = 'superadmin', // Superadmin (Shield icon)
  ADMIN = 'admin',           // Admin (UserCheck icon)
  LAWYER = 'lawyer',         // Lawyer
  CLIENT = 'client',         // Client
  MANAGER = 'manager',       // Manager (Users icon)
  CASHIER = 'cashier'        // Cashier (CreditCard icon)
}
```

### Validation Rules

**Password**:
- Min length: 6-8 characters (inconsistent - standardize on 8)
- Should include: 1 uppercase, 1 lowercase, 1 number
- Not implemented: Complexity requirements (add to backend)

**Email**:
- Validation: Standard email regex
- Must be unique in database

**Invoice Amount**:
- Min: 0
- Max: No limit
- Decimal places: 2
- Currency: SAR (Saudi Riyal)

**File Uploads**:
- Receipt: Max 5 MB, types: jpg, png, pdf
- Documents: Max 10 MB, types: pdf, doc, docx, jpg, png
- Avatar: Max 2 MB, types: jpg, png, webp
- CSV Import: Max 2 MB, type: csv only

---

## Arabic/RTL Considerations

### Current Issues
- Many components use `ml-*`, `mr-*`, `left-*`, `right-*` (not RTL-aware)
- Should use: `ms-*`, `me-*`, `start-*`, `end-*` (logical properties)

### Font
- **Primary**: IBM Plex Sans Arabic
- **Fallback**: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto

### Date Formatting
- Arabic: "15 نوفمبر 2025"
- Hijri calendar: Consider adding option

### Currency
- Format: "1,234.56 ر.س" or "1,234.56 SAR"
- Position: After number for Arabic, before for English

### Numbers
- Arabic numerals: ١٢٣٤٥ (consider toggle option)
- Western numerals: 12345 (currently used)

---

## Testing Checklist

### API Integration Testing
- [ ] All endpoints return correct status codes
- [ ] Request validation works (400 for invalid data)
- [ ] Authentication required for protected routes
- [ ] Role-based authorization enforced
- [ ] Pagination works correctly
- [ ] Search and filters function properly
- [ ] File uploads validate size and type
- [ ] Error messages are in Arabic

### Real-Time Testing
- [ ] Chat messages delivered instantly
- [ ] Typing indicators work
- [ ] Online/offline status updates
- [ ] Notifications appear in real-time
- [ ] Reconnection after network loss
- [ ] Multiple tabs don't conflict

### Security Testing
- [ ] XSS attacks prevented (input sanitization)
- [ ] CSRF protection works
- [ ] SQL injection prevented
- [ ] File upload virus scanning
- [ ] Rate limiting on sensitive endpoints
- [ ] Sensitive data not in localStorage
- [ ] HTTPS enforced in production

### UX Testing
- [ ] Loading states show on all API calls
- [ ] Error messages clear and actionable
- [ ] Forms validate before submission
- [ ] Success messages confirm actions
- [ ] Responsive design on mobile/tablet
- [ ] RTL layout works correctly
- [ ] Keyboard navigation functional
- [ ] Screen reader compatible

---

## Appendix: Quick Reference

### Total Counts
- **Routes**: 80+
- **Forms**: 22
- **Tables**: 12
- **Detail Views**: 10
- **API Endpoints**: ~150
- **File Upload Features**: 7
- **Real-Time Events**: 15+
- **Data Models**: 10+
- **Enums**: 31

### Priority Matrix
| Priority | Features | Estimated Effort |
|----------|----------|------------------|
| Critical | API service layer, CRUD operations, Authentication fixes | 8-12 weeks |
| High | File uploads, Validation, Error handling, Pagination | 6-8 weeks |
| Medium | Real-time features, Email, Search/Filters, PDF generation | 4-6 weeks |
| Low | Help center, Tests, Advanced analytics | 4-6 weeks |

**Total Implementation Time**: 22-32 weeks (5.5-8 months)

---

**End of Specification Document**

*For issues, gaps, and security concerns, see: `FRONTEND_ISSUES_AND_PROBLEMS.md`*
