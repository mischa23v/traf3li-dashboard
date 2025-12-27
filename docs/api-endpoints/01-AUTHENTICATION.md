# Authentication API Endpoints

## Base URL: `/api/auth`

## Implemented Endpoints (Main Backend)

| Method | Endpoint | Parameters | Returns | Auth Required |
|--------|----------|------------|---------|---------------|
| POST | `/auth/register` | email, password, firstName, lastName, isSeller, phone, country, role | `{ error, message, userId }` | No |
| POST | `/auth/login` | username (or email), password, captchaToken | `{ error, message, user }` + Sets accessToken cookie | No |
| POST | `/auth/logout` | None | `{ error, message }` + Clears cookie | No |
| GET | `/auth/me` | None | `{ error, message, user }` | Yes |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 15 minutes |
| `/auth/register` | 3 attempts | 1 hour |
| `/auth/forgot-password` | 3 attempts | 15 minutes |

## Token Configuration

- **Token Type**: JWT
- **Expiry**: 7 days (accessToken)
- **Storage**: HttpOnly cookie
- **Alternative**: Authorization header (Bearer token)

## NOT IMPLEMENTED (Expected by Frontend)

### OTP Endpoints
| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/auth/send-otp` | ❌ NOT IMPLEMENTED |
| POST | `/auth/verify-otp` | ❌ NOT IMPLEMENTED |
| POST | `/auth/resend-otp` | ❌ NOT IMPLEMENTED |
| GET | `/auth/otp-status` | ❌ NOT IMPLEMENTED |

### Password Management
| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/auth/forgot-password` | ⚠️ PARTIAL (test only) |
| POST | `/auth/reset-password` | ⚠️ PARTIAL (test only) |
| POST | `/auth/change-password` | ⚠️ PARTIAL (test only) |
| GET | `/auth/password/status` | ❌ NOT IMPLEMENTED |
| GET | `/auth/reset-password/validate` | ❌ NOT IMPLEMENTED |
| POST | `/auth/password/check-breach` | ❌ NOT IMPLEMENTED |

### Session Management
| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/auth/sessions` | ❌ NOT IMPLEMENTED |
| POST | `/auth/refresh-token` | ⚠️ PARTIAL (test only) |

### MFA Endpoints
| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/auth/mfa/status` | ❌ NOT IMPLEMENTED |
| POST | `/auth/mfa/setup` | ❌ NOT IMPLEMENTED |
| POST | `/auth/mfa/verify-setup` | ❌ NOT IMPLEMENTED |
| POST | `/auth/mfa/verify` | ❌ NOT IMPLEMENTED |

### SSO Endpoints
| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/auth/sso/providers` | ❌ NOT IMPLEMENTED |
| GET | `/auth/sso/:provider/authorize` | ❌ NOT IMPLEMENTED |
| GET | `/auth/sso/:provider/callback` | ❌ NOT IMPLEMENTED |

### Magic Link
| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/auth/magic-link/send` | ❌ NOT IMPLEMENTED |
| POST | `/auth/magic-link/verify` | ❌ NOT IMPLEMENTED |

### Other
| Method | Endpoint | Status |
|--------|----------|--------|
| POST | `/auth/check-availability` | ❌ NOT IMPLEMENTED |

## Middleware

### userMiddleware
- Validates JWT from cookies or Authorization header
- Sets `req.userID` and `req.isSeller`

### authenticate
- Cookie-only validation
- Returns 401 if no token

### authorize
- Role-based access control
- Supports: admin, lawyer, client roles
