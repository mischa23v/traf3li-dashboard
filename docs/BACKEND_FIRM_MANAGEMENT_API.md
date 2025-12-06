# Backend API: Firm Management & Solo Lawyer Mode

## Overview

This document outlines the backend API requirements for supporting:
1. **Solo Lawyer Mode** - Lawyers who work independently without a firm
2. **Firm Creation** - Lawyers creating their own law office/firm
3. **Firm Invitations** - Joining an existing firm via invitation

---

## 1. User Registration Updates

### Endpoint: `POST /api/auth/register`

**Updated Request Body** (add `lawyerWorkMode` field):

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "lawyer | client",
  "lawyerMode": "marketplace | dashboard",

  // NEW FIELD - Only for lawyers
  "lawyerWorkMode": "solo | create_firm | join_firm",

  // Required if lawyerWorkMode is "create_firm"
  "firmData": {
    "name": "string",           // اسم المكتب
    "nameEn": "string",         // English name (optional)
    "licenseNumber": "string",  // رقم ترخيص المكتب
    "region": "string",         // المنطقة
    "city": "string",           // المدينة
    "address": "string",        // العنوان
    "phone": "string",          // رقم الهاتف
    "email": "string"           // البريد الإلكتروني
  },

  // Required if lawyerWorkMode is "join_firm"
  "invitationCode": "string",

  // ... other existing fields
}
```

**Response for solo lawyer:**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "lawyer",
    "isSoloLawyer": true,
    "firmId": null
  },
  "message": "تم إنشاء الحساب بنجاح كمحامي مستقل"
}
```

**Response for firm creation:**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "lawyer",
    "isSoloLawyer": false,
    "firmId": "uuid",
    "firmRole": "owner"
  },
  "firm": {
    "id": "uuid",
    "name": "string",
    "licenseNumber": "string"
  },
  "message": "تم إنشاء الحساب والمكتب بنجاح"
}
```

---

## 2. Firm Management Endpoints

### 2.1 Create Firm (for existing users)

**Endpoint:** `POST /api/firms`

**Description:** Allow an existing lawyer (who signed up as solo) to create a firm later.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "مكتب المحامي أحمد للمحاماة",
  "nameEn": "Ahmed Law Office",
  "licenseNumber": "1234567890",
  "region": "الرياض",
  "city": "الرياض",
  "address": "شارع الملك فهد، حي العليا",
  "phone": "0112345678",
  "email": "info@ahmedlaw.com",
  "website": "https://ahmedlaw.com",
  "description": "مكتب متخصص في القضايا التجارية والعمالية",
  "specializations": ["commercial", "labor", "companies"]
}
```

**Response (201 Created):**
```json
{
  "firm": {
    "id": "uuid",
    "name": "مكتب المحامي أحمد للمحاماة",
    "nameEn": "Ahmed Law Office",
    "licenseNumber": "1234567890",
    "region": "الرياض",
    "city": "الرياض",
    "address": "شارع الملك فهد، حي العليا",
    "phone": "0112345678",
    "email": "info@ahmedlaw.com",
    "website": "https://ahmedlaw.com",
    "ownerId": "user-uuid",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "تم إنشاء المكتب بنجاح"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - User is not a lawyer
- `409 Conflict` - User already has a firm

---

### 2.2 Get Current User's Firm

**Endpoint:** `GET /api/firms/my-firm`

**Response (200 OK):**
```json
{
  "firm": {
    "id": "uuid",
    "name": "string",
    "nameEn": "string",
    "licenseNumber": "string",
    "region": "string",
    "city": "string",
    "address": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "ownerId": "uuid",
    "status": "active | suspended | inactive",
    "membersCount": 5,
    "createdAt": "datetime",
    "updatedAt": "datetime"
  },
  "userRole": "owner | admin | member | departed"
}
```

**Response (404 Not Found) - Solo lawyer or no firm:**
```json
{
  "error": "لا يوجد مكتب مرتبط بحسابك",
  "code": "NO_FIRM_ASSOCIATED",
  "isSoloLawyer": true
}
```

---

### 2.3 Update Firm

**Endpoint:** `PUT /api/firms/:firmId`

**Authorization:** Only firm owner or admin can update.

**Request Body:**
```json
{
  "name": "string",
  "nameEn": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "description": "string"
}
```

---

## 3. Invitation System

### 3.1 Create Invitation

**Endpoint:** `POST /api/firms/:firmId/invitations`

**Authorization:** Firm owner or admin only.

**Request Body:**
```json
{
  "email": "newlawyer@example.com",
  "role": "admin | member",
  "expiresInDays": 7,
  "message": "ندعوك للانضمام إلى مكتبنا"
}
```

**Response (201 Created):**
```json
{
  "invitation": {
    "id": "uuid",
    "code": "INV-ABC123XYZ",
    "firmId": "uuid",
    "firmName": "مكتب المحامي أحمد",
    "email": "newlawyer@example.com",
    "role": "member",
    "status": "pending",
    "expiresAt": "2024-01-22T10:00:00Z",
    "invitedBy": "uuid",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "inviteLink": "https://app.trafeli.com/join-firm?code=INV-ABC123XYZ",
  "message": "تم إرسال الدعوة بنجاح"
}
```

---

### 3.2 Get Pending Invitations

**Endpoint:** `GET /api/firms/:firmId/invitations`

**Query Parameters:**
- `status`: `pending | accepted | expired | cancelled`

**Response:**
```json
{
  "invitations": [
    {
      "id": "uuid",
      "code": "INV-ABC123XYZ",
      "email": "string",
      "role": "admin | member",
      "status": "pending",
      "expiresAt": "datetime",
      "invitedBy": {
        "id": "uuid",
        "name": "string"
      },
      "createdAt": "datetime"
    }
  ],
  "total": 5
}
```

---

### 3.3 Validate Invitation Code

**Endpoint:** `GET /api/invitations/:code`

**Description:** Public endpoint to validate an invitation code.

**Response (200 OK):**
```json
{
  "valid": true,
  "invitation": {
    "firmName": "مكتب المحامي أحمد",
    "firmNameEn": "Ahmed Law Office",
    "role": "member",
    "expiresAt": "2024-01-22T10:00:00Z",
    "invitedEmail": "newlawyer@example.com"
  }
}
```

**Response (400 Bad Request) - Invalid/Expired:**
```json
{
  "valid": false,
  "error": "الدعوة غير صالحة أو منتهية الصلاحية",
  "code": "INVITATION_INVALID"
}
```

---

### 3.4 Accept Invitation (Join Firm)

**Endpoint:** `POST /api/invitations/:code/accept`

**Authorization:** Authenticated user.

**Request Body:**
```json
{
  "acceptTerms": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "firm": {
    "id": "uuid",
    "name": "مكتب المحامي أحمد",
    "role": "member"
  },
  "message": "تم الانضمام إلى المكتب بنجاح"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid or expired invitation
- `403 Forbidden` - User is not a lawyer
- `409 Conflict` - User already has a firm

---

### 3.5 Cancel Invitation

**Endpoint:** `DELETE /api/firms/:firmId/invitations/:invitationId`

**Authorization:** Firm owner or admin only.

---

## 4. User Permissions Update

### 4.1 Get My Permissions

**Endpoint:** `GET /api/firms/my-permissions`

**Updated Response for Solo Lawyer (200 OK):**
```json
{
  "isSoloLawyer": true,
  "firmId": null,
  "role": null,
  "permissions": {
    "modules": {
      "cases": "full",
      "clients": "full",
      "calendar": "full",
      "tasks": "full",
      "documents": "full",
      "finance": "full",
      "time_tracking": "full",
      "investments": "full"
    },
    "special": {
      "canInviteMembers": false,
      "canManageBilling": true,
      "canAccessReports": true,
      "canExportData": true
    }
  },
  "status": "active"
}
```

**Updated Response for Firm Member (200 OK):**
```json
{
  "isSoloLawyer": false,
  "firmId": "uuid",
  "firmName": "مكتب المحامي أحمد",
  "role": "owner | admin | member | departed",
  "permissions": {
    "modules": { ... },
    "special": { ... }
  },
  "status": "active"
}
```

---

## 5. Solo Lawyer Features

### 5.1 Convert Solo to Firm

**Endpoint:** `POST /api/users/convert-to-firm`

**Description:** Allow a solo lawyer to create a firm and convert their account.

**Request Body:**
```json
{
  "firmData": {
    "name": "string",
    "licenseNumber": "string",
    "region": "string",
    "city": "string",
    // ... other firm fields
  },
  "migrateExistingData": true
}
```

**Response:**
```json
{
  "success": true,
  "firm": { ... },
  "message": "تم إنشاء المكتب ونقل بياناتك بنجاح"
}
```

---

### 5.2 Leave Firm (for firm members)

**Endpoint:** `POST /api/firms/:firmId/leave`

**Authorization:** Authenticated firm member (not owner).

**Request Body:**
```json
{
  "reason": "string",
  "convertToSolo": true
}
```

---

## 6. Database Schema Updates

### Users Table Updates
```sql
ALTER TABLE users ADD COLUMN is_solo_lawyer BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN lawyer_work_mode VARCHAR(20); -- 'solo', 'firm_owner', 'firm_member'
```

### Firms Table
```sql
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  license_number VARCHAR(50) UNIQUE,
  region VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  description TEXT,
  owner_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, inactive
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Firm Members Table
```sql
CREATE TABLE firm_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- owner, admin, member, departed
  joined_at TIMESTAMP DEFAULT NOW(),
  departed_at TIMESTAMP,
  UNIQUE(firm_id, user_id)
);
```

### Invitations Table
```sql
CREATE TABLE firm_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, expired, cancelled
  invited_by UUID REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  accepted_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 7. Email Notifications

### 7.1 Invitation Email Template

**Subject:** دعوة للانضمام إلى {firmName}

**Body (Arabic):**
```
مرحباً،

تمت دعوتك للانضمام إلى مكتب "{firmName}" على منصة ترافلي.

الدور: {role}
صالحة حتى: {expiresAt}

للانضمام، اضغط على الرابط التالي:
{inviteLink}

إذا لم تكن ترغب في الانضمام، يمكنك تجاهل هذه الرسالة.

مع تحيات،
فريق ترافلي
```

---

## 8. Frontend Integration Notes

### Sign-up Flow Changes
1. Add new step after "لوحة التحكم فقط" selection:
   - **محامي مستقل** - Work independently without a firm
   - **إنشاء مكتب جديد** - Create a new law firm
   - **الانضمام لمكتب موجود** - Join existing firm via invitation code

### No-Firm Page Updates
1. Show "إنشاء مكتب جديد" button that opens firm creation form
2. Show "لدي كود دعوة" option for joining existing firm
3. Show "المتابعة كمحامي مستقل" option

### Permissions Check Updates
1. Check `isSoloLawyer` flag in permissions response
2. Solo lawyers get full permissions without needing a firm
3. Update route guards to handle solo lawyer mode

---

## 9. API Error Codes

| Code | Arabic Message | English Description |
|------|---------------|---------------------|
| `NO_FIRM_ASSOCIATED` | لا يوجد مكتب مرتبط بحسابك | User has no firm |
| `FIRM_NOT_FOUND` | المكتب غير موجود | Firm not found |
| `INVITATION_INVALID` | الدعوة غير صالحة | Invalid invitation |
| `INVITATION_EXPIRED` | الدعوة منتهية الصلاحية | Invitation expired |
| `ALREADY_HAS_FIRM` | لديك مكتب مرتبط بالفعل | User already has a firm |
| `NOT_FIRM_OWNER` | لست مالك المكتب | Not firm owner |
| `CANNOT_LEAVE_AS_OWNER` | لا يمكنك مغادرة المكتب كمالك | Owner cannot leave |

---

## 10. Testing Scenarios

1. **Solo Lawyer Registration** - Register as solo, access dashboard
2. **Firm Creation on Registration** - Create firm during signup
3. **Solo to Firm Conversion** - Solo lawyer creates firm later
4. **Join via Invitation** - Register/login with invitation code
5. **Invitation Management** - Create, view, cancel invitations
6. **Leave Firm** - Member leaves and converts to solo
