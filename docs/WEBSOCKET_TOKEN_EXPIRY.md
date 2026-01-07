# WebSocket Token Expiry Handling

> **Last Verified Against Backend**: January 2026
> **Backend File**: `src/configs/socket.js` (token verification middleware)

---

## Overview

The WebSocket server performs periodic token validity checks every **60 seconds**. When a token expires or becomes invalid, the server emits events and **immediately disconnects** the client.

---

## Backend Implementation Summary

### Token Check Interval

```javascript
const TOKEN_CHECK_INTERVAL = 60 * 1000  // 60 seconds
```

### Token Source (Priority)

1. `socket.handshake.auth?.token` (recommended)
2. `socket.handshake.query?.token` (fallback)

### Token Expiry Times

| User Type | Access Token TTL |
|-----------|------------------|
| Normal users | 15 minutes |
| Anonymous users | 24 hours |

---

## Server Events

### `auth:token_expired`

Emitted when token TTL is exceeded during periodic check.

```typescript
// Event payload
interface SocketAuthTokenExpiredPayload {
  message: string  // "Your session has expired. Please refresh to continue."
  code: 'TOKEN_EXPIRED'
}
```

**CRITICAL**: Server disconnects **IMMEDIATELY** after emitting this event. There is NO grace period.

### `auth:token_invalid`

Emitted when token verification fails (revoked, tampered, malformed).

```typescript
// Event payload
interface SocketAuthTokenInvalidPayload {
  message: string  // "Your session is no longer valid. Please log in again."
  code: 'TOKEN_INVALID'
}
```

**CRITICAL**: Server disconnects **IMMEDIATELY** after emitting this event.

**Causes**:
- User logged out from another device
- Admin revoked user's sessions
- Token was manually invalidated
- JWT verification failed

---

## Client Event: `auth:refresh_token`

Client can emit this event to update the socket's authentication token.

### Request

```typescript
socket.emit('auth:refresh_token', newToken, (response) => {
  // Handle response
})
```

### Response

```typescript
interface SocketAuthRefreshTokenResponse {
  success: boolean
  expiresAt?: Date | string  // Date object from backend
  error?: string             // Only if success: false
}

// Success response
{ success: true, expiresAt: Date }  // Note: Date object, NOT ISO string

// Failure responses
{ success: false, error: 'Invalid token provided' }
{ success: false, error: 'Invalid token' }
{ success: false, error: 'User mismatch' }
{ success: false, error: 'Refresh failed' }
```

### User Mismatch Validation

The backend validates that the new token belongs to the same user:

```javascript
// Backend validation
if (newDecoded.id !== socket.userId) {
  callback({ success: false, error: 'User mismatch' })
  return
}
```

**IMPORTANT**: Use `decoded.id` for user ID extraction. The backend does NOT use:
- `decoded.userId` (does not exist)
- `decoded.sub` (does not exist)

---

## Connection Error Codes

When connection fails, the error message contains one of these codes:

| Error Code | Description | Recovery |
|------------|-------------|----------|
| `AUTHENTICATION_REQUIRED` | No token provided in handshake | Login required |
| `INVALID_TOKEN` | Token failed JWT verification | Try HTTP token refresh, then reconnect |
| `USER_NOT_FOUND` | User not found in database | Login required |
| `USER_DISABLED` | User account is disabled | Contact admin |
| `AUTHENTICATION_FAILED` | Generic auth failure | Login required |

---

## JWT Token Payload Structure

```typescript
interface AccessTokenPayload {
  // Primary identifier (USE THIS!)
  id: string                    // User ID (MongoDB ObjectId)

  // User info
  email: string
  role: 'client' | 'lawyer' | 'admin'

  // Standard JWT claims
  iat: number                   // Issued at
  exp: number                   // Expiration
  iss: 'traf3li'               // Issuer
  aud: 'traf3li-users'         // Audience

  // Custom claims (Supabase-style naming)
  is_anonymous: boolean
  firm_id?: string | null
  user_id: string              // Duplicate of 'id' for custom claims
  is_solo_lawyer?: boolean     // Only for solo lawyers

  // NOT in payload (do not use):
  // - userId (does not exist)
  // - sub (does not exist)
}
```

---

## Socket Server Properties

After successful authentication, the socket has these properties:

```javascript
socket.userId       // User ID from decoded.id
socket.tokenExpiry  // Date object (NOT string!)
socket.user         // Full user object from database
```

**Note**: Property is `socket.tokenExpiry` (Date), not `socket.tokenExp`.

---

## Frontend Implementation Examples

### Setting Up Token Expiry Handlers

```typescript
// In socket-provider.tsx or socketService.ts

socket.on('auth:token_expired', async (payload) => {
  console.warn('[Socket] Token expired:', payload.message)

  // Get fresh token from HTTP layer
  const newToken = await refreshAccessToken()

  if (newToken) {
    // Reconnect with new token (socket already disconnected!)
    reconnectWithToken(newToken)
  } else {
    // Redirect to login
    window.location.href = '/sign-in?reason=token_expired'
  }
})

socket.on('auth:token_invalid', (payload) => {
  console.error('[Socket] Token invalid:', payload.message)

  // Must re-authenticate - redirect to login
  logout()
  window.location.href = '/sign-in?reason=token_invalid'
})
```

### Proactive Token Refresh (Before Expiry)

Since there's no grace period, implement proactive refresh:

```typescript
// Schedule refresh before expiry
const scheduleTokenRefresh = (expiresAt: Date) => {
  const now = new Date()
  const timeUntilExpiry = expiresAt.getTime() - now.getTime()

  // Refresh 2 minutes before expiry
  const refreshTime = timeUntilExpiry - (2 * 60 * 1000)

  if (refreshTime > 0) {
    setTimeout(async () => {
      const newToken = await refreshAccessToken()
      if (newToken && socket?.connected) {
        socket.emit('auth:refresh_token', newToken, (response) => {
          if (response.success && response.expiresAt) {
            scheduleTokenRefresh(new Date(response.expiresAt))
          }
        })
      }
    }, refreshTime)
  }
}
```

### Handling expiresAt Date Type

```typescript
socket.emit('auth:refresh_token', newToken, (response) => {
  if (response.success && response.expiresAt) {
    // Handle both Date and string formats
    const expiresAtDate = response.expiresAt instanceof Date
      ? response.expiresAt
      : new Date(response.expiresAt)

    console.log('Token expires at:', expiresAtDate.toISOString())
  }
})
```

### Reconnecting With New Token

```typescript
const reconnectWithToken = (newToken: string) => {
  // Old socket is already disconnected by server
  const newSocket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    auth: {
      token: newToken  // Pass token in handshake auth
    }
  })

  // Re-register event handlers...
}
```

---

## Common Mistakes to Avoid

### 1. Using Wrong JWT Field for User ID

```typescript
// WRONG - these fields don't exist!
const userId = decoded.userId
const userId = decoded.sub

// CORRECT
const userId = decoded.id
```

### 2. Assuming Grace Period Exists

```typescript
// WRONG - assuming 60-second grace period
socket.on('auth:token_expired', () => {
  // Taking time to show dialog, fetch token, etc.
  setTimeout(() => {
    refreshSocketToken(newToken)  // Too late! Socket already disconnected
  }, 5000)
})

// CORRECT - prepare before expiry or reconnect immediately
socket.on('auth:token_expired', async () => {
  // Socket is ALREADY disconnected!
  const newToken = await refreshAccessToken()
  reconnectWithToken(newToken)  // Create new connection
})
```

### 3. Treating expiresAt as String

```typescript
// WRONG - assuming ISO string
const expiresAt: string = response.expiresAt

// CORRECT - handle both types
const expiresAt = response.expiresAt instanceof Date
  ? response.expiresAt
  : new Date(response.expiresAt)
```

### 4. Using socket.tokenExp Property

```typescript
// WRONG - property doesn't exist
const expiry = socket.tokenExp

// CORRECT - backend uses tokenExpiry
// (Note: This is server-side property, not accessible client-side)
```

---

## Testing Token Expiry

### Manual Testing

1. Login to application
2. Wait for token check interval (60 seconds)
3. Artificially expire token in backend or wait full TTL
4. Observe `auth:token_expired` event
5. Verify socket disconnects immediately
6. Verify frontend handles reconnection

### Test Token Refresh Flow

1. Connect socket with valid token
2. Generate new token via HTTP `/api/auth/refresh`
3. Emit `auth:refresh_token` with new token
4. Verify response contains `{ success: true, expiresAt: Date }`
5. Verify socket remains connected

### Test User Mismatch

1. Connect socket as User A
2. Generate token for User B
3. Emit `auth:refresh_token` with User B's token
4. Verify response: `{ success: false, error: 'User mismatch' }`
5. Verify socket remains connected (no disconnect on failed refresh)

---

## Related Documentation

- [Authentication System Reference](./AUTH_SYSTEM_REFERENCE.md)
- [HTTP Cookie Auth](./HTTPONLY_COOKIE_AUTH.md)

---

## Changelog

| Date | Change |
|------|--------|
| Jan 2026 | Initial documentation based on backend verification |
| Jan 2026 | Confirmed: No grace period, immediate disconnect |
| Jan 2026 | Confirmed: decoded.id (not userId or sub) |
| Jan 2026 | Confirmed: expiresAt is Date object |
| Jan 2026 | Confirmed: Anonymous users get 24h tokens |
