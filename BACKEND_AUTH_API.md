# Backend Authentication API Documentation

## Overview
This document describes the authentication API endpoints required by the Traf3li dashboard front-end.

**Base URL:** `https://api.traf3li.com/api`

---

## Authentication Flow

### Sign-In Flow
1. User submits credentials → POST `/auth/login`
2. Backend sends OTP to user's phone
3. User submits OTP → Backend validates and returns token
4. Frontend stores token and navigates to dashboard

### Sign-Up Flow
1. User completes multi-step registration form
2. User submits all data → POST `/auth/register`
3. Backend creates account and sends verification
4. User redirected to sign-in page

---

## API Endpoints

### 1. Sign In (Login)

**Endpoint:** `POST /auth/login`

**Purpose:** Authenticate user credentials and send OTP

**Request Body:**
```json
{
  "username": "test",  // Can be username OR email
  "password": "test123"
}
```

**Success Response (200):**
```json
{
  "error": false,
  "message": "OTP sent successfully",
  "user": {
    "_id": "user_id_here",
    "username": "test",
    "email": "test@example.com",
    "phone": "+966500000000"
  }
}
```

**Error Response (401):**
```json
{
  "error": true,
  "message": "Invalid credentials"
}
```

**Validation Rules:**
- Username/email is required
- Password is required
- Password minimum 6 characters

**Backend Actions:**
1. Validate credentials against database
2. Generate 6-digit OTP
3. Send OTP via SMS to user's phone
4. Store OTP with 5-minute expiration
5. Return user data (without password!)

---

### 2. Verify OTP

**Endpoint:** `POST /auth/verify-otp`

**Purpose:** Verify OTP and complete authentication

**Request Body:**
```json
{
  "userId": "user_id_here",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "error": false,
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "username": "test",
    "email": "test@example.com",
    "role": "admin",
    "country": "SA",
    "phone": "+966500000000",
    "isSeller": false,
    "lawyerProfile": null  // or lawyer profile object if role is lawyer
  }
}
```

**Error Response (401):**
```json
{
  "error": true,
  "message": "Invalid or expired OTP"
}
```

**Backend Actions:**
1. Validate OTP against stored value
2. Check OTP hasn't expired (5 minutes)
3. Create session/JWT token
4. Set HttpOnly cookie with token (recommended)
5. Delete used OTP from storage
6. Return user data with token

**Important:**
- Store session token in HttpOnly cookie for security
- Cookie should have these settings:
  - `httpOnly: true`
  - `secure: true` (in production)
  - `sameSite: 'lax'`
  - `maxAge: 7 days`

---

### 3. Resend OTP

**Endpoint:** `POST /auth/resend-otp`

**Purpose:** Resend OTP to user

**Request Body:**
```json
{
  "userId": "user_id_here"
}
```

**Success Response (200):**
```json
{
  "error": false,
  "message": "OTP resent successfully"
}
```

**Rate Limiting:**
- Maximum 3 requests per 15 minutes per user
- Return 429 status if exceeded

---

### 4. Sign Up (Register)

**Endpoint:** `POST /auth/register`

**Purpose:** Create new user account

**Request Body (Client):**
```json
{
  "userType": "client",
  "firstName": "محمد",
  "lastName": "أحمد",
  "username": "mohammed_ahmed",
  "email": "mohammed@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "phone": "0512345678",
  "agreedTerms": true,
  "agreedPrivacy": true,
  "agreedConflict": true
}
```

**Request Body (Lawyer - Marketplace):**
```json
{
  "userType": "lawyer",
  "lawyerMode": "marketplace",

  // Basic Info (Step 1)
  "firstName": "محمد",
  "lastName": "أحمد",
  "username": "mohammed_ahmed",
  "email": "mohammed@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "phone": "0512345678",

  // Location (Step 2)
  "nationality": "سعودي",
  "region": "الرياض",
  "city": "الرياض",

  // License (Step 3)
  "isLicensed": true,
  "licenseNumber": "123456",

  // Courts (Step 4)
  "courts": {
    "general": { "selected": true, "caseCount": "11-30" },
    "criminal": { "selected": true, "caseCount": "1-10" },
    "commercial": { "selected": false, "caseCount": "" }
  },

  // Experience (Step 5)
  "yearsOfExperience": "5",
  "workType": "مكتب محاماة",
  "firmName": "مكتب محمد أحمد للمحاماة",
  "specializations": ["labor", "commercial", "realestate"],
  "languages": ["العربية", "الإنجليزية"],
  "bio": "محامي متخصص في القضايا التجارية والعمالية...",

  // Khebra (Step 6)
  "isRegisteredKhebra": true,

  // Marketplace (Step 7)
  "serviceType": "both",  // "consultation", "representation", or "both"
  "pricingModel": ["hourly", "fixed"],
  "acceptsRemote": "كلاهما",  // "نعم", "لا", or "كلاهما"

  // Agreements (Step 8)
  "agreedTerms": true,
  "agreedPrivacy": true,
  "agreedConflict": true
}
```

**Request Body (Lawyer - Dashboard Only):**
```json
{
  "userType": "lawyer",
  "lawyerMode": "dashboard",

  // Basic Info
  "firstName": "محمد",
  "lastName": "أحمد",
  "username": "mohammed_ahmed",
  "email": "mohammed@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "phone": "0512345678",

  // Agreements
  "agreedTerms": true,
  "agreedPrivacy": true,
  "agreedConflict": true
}
```

**Success Response (201):**
```json
{
  "error": false,
  "message": "Account created successfully",
  "userId": "new_user_id"
}
```

**Error Response (400):**
```json
{
  "error": true,
  "message": "Username already exists"
}
```

**Validation Rules:**
- All fields marked as required in frontend must be validated
- Email must be unique and valid format
- Username must be unique, 3-20 characters, alphanumeric + underscore
- Password minimum 6 characters
- Phone must be valid Saudi format (05xxxxxxxx)
- Passwords must match
- All agreements must be true

**Backend Actions:**
1. Validate all input data
2. Check for duplicate email/username
3. Hash password (use bcrypt, min 10 rounds)
4. Create user record in database
5. Set `isSeller: true` if lawyerMode is "marketplace"
6. Send verification email (optional)
7. Return success response

**DO NOT:**
- Store plain text passwords
- Return password in response
- Log passwords in any way

---

### 5. Check Current User

**Endpoint:** `GET /auth/me`

**Purpose:** Get currently authenticated user

**Headers:**
```
Cookie: session_token=xxx
```

**Success Response (200):**
```json
{
  "error": false,
  "user": {
    "_id": "user_id",
    "username": "test",
    "email": "test@example.com",
    "role": "admin",
    "country": "SA",
    "phone": "+966500000000",
    "isSeller": false
  }
}
```

**Error Response (401):**
```json
{
  "error": true,
  "message": "Not authenticated"
}
```

---

### 6. Logout

**Endpoint:** `POST /auth/logout`

**Purpose:** End user session

**Headers:**
```
Cookie: session_token=xxx
```

**Success Response (200):**
```json
{
  "error": false,
  "message": "Logged out successfully"
}
```

**Backend Actions:**
1. Clear session from database
2. Clear session cookie
3. Return success

---

### 7. Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Purpose:** Send password reset OTP

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Success Response (200):**
```json
{
  "error": false,
  "message": "Reset code sent to email"
}
```

**Backend Actions:**
1. Validate email exists
2. Generate 6-digit OTP
3. Send OTP via SMS to user's phone
4. Store OTP with 10-minute expiration
5. Return success (don't reveal if email exists for security)

---

### 8. Reset Password

**Endpoint:** `POST /auth/reset-password`

**Purpose:** Reset password with OTP

**Request Body:**
```json
{
  "email": "test@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "error": false,
  "message": "Password reset successfully"
}
```

**Backend Actions:**
1. Validate OTP
2. Check OTP not expired
3. Hash new password
4. Update user password
5. Delete used OTP
6. Invalidate all existing sessions
7. Return success

---

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['client', 'lawyer', 'admin']),
  phone: String (required),
  country: String (default: 'SA'),
  isSeller: Boolean (default: false),

  // Lawyer-specific fields
  lawyerProfile: {
    specialization: [String],
    licenseNumber: String,
    yearsExperience: Number,
    courts: Object,
    nationality: String,
    region: String,
    city: String,
    workType: String,
    firmName: String,
    languages: [String],
    bio: String,
    isRegisteredKhebra: Boolean,
    serviceType: String,
    pricingModel: [String],
    acceptsRemote: String,
    verified: Boolean (default: false)
  },

  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  otp: String,
  type: String (enum: ['login', 'reset']),
  expiresAt: Date,
  createdAt: Date
}
```

**Index:** `userId, expiresAt` with TTL

---

## Security Requirements

### Password Security
- Hash with bcrypt, minimum 10 rounds
- Never store plain text passwords
- Never log passwords
- Enforce minimum 6 characters

### Session Management
- Use HttpOnly cookies for session tokens
- Set secure flag in production
- Implement CSRF protection
- Session timeout: 7 days
- Allow concurrent sessions: No (logout on new login)

### Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 15 minutes |
| `/auth/verify-otp` | 5 attempts | 5 minutes |
| `/auth/resend-otp` | 3 attempts | 15 minutes |
| `/auth/register` | 3 attempts | 1 hour |
| `/auth/forgot-password` | 3 attempts | 15 minutes |

### OTP Security
- 6 digits, numeric only
- Valid for 5 minutes (login)
- Valid for 10 minutes (password reset)
- Delete after successful verification
- Maximum 5 verification attempts

### Data Validation
- Sanitize all user input
- Validate email format
- Validate phone format (Saudi: 05xxxxxxxx)
- Check for SQL injection
- Prevent XSS attacks

---

## CORS Configuration

Allow these origins:
```javascript
[
  'https://traf3li.com',
  'https://www.traf3li.com',
  'https://dashboard.traf3li.com',
  'http://localhost:5173' // Development only
]
```

Allow credentials: `true`

---

## Error Codes

| Status | Meaning | Use Case |
|--------|---------|----------|
| 200 | Success | Successful operation |
| 201 | Created | User registered successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid credentials or token |
| 403 | Forbidden | Account suspended/banned |
| 404 | Not Found | User not found |
| 409 | Conflict | Username/email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal server error |

---

## Testing

### Test Credentials (Development Only)
```
Username: test
Email: test@example.com
Password: test123
OTP: 123456 (bypass OTP in dev mode)
```

### Test Cases
1. ✅ Register new user (client)
2. ✅ Register new lawyer (marketplace)
3. ✅ Register new lawyer (dashboard only)
4. ✅ Login with username
5. ✅ Login with email
6. ✅ Verify OTP
7. ✅ Resend OTP
8. ✅ Forgot password
9. ✅ Reset password
10. ✅ Check current user
11. ✅ Logout
12. ❌ Login with wrong password
13. ❌ Verify with wrong OTP
14. ❌ Register with duplicate email
15. ❌ Rate limit exceeded

---

## Deployment Checklist

- [ ] All endpoints implemented
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting active
- [ ] Password hashing with bcrypt
- [ ] HttpOnly cookies for sessions
- [ ] Input validation and sanitization
- [ ] Error handling and logging
- [ ] OTP expiration working
- [ ] Database indexes created
- [ ] SMS service configured
- [ ] Email service configured (optional)
- [ ] Test credentials removed in production
- [ ] API documentation shared with team

---

## Support

For backend implementation questions, contact the development team.

**API Version:** 1.0
**Last Updated:** November 24, 2024
