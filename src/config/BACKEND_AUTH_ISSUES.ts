/**
 * ============================================================================
 * 🚨 BACKEND AUTHENTICATION ISSUES - FOR BACKEND TEAM REVIEW
 * ============================================================================
 *
 * This file documents all known issues with the backend authentication system
 * that are causing problems in the frontend. Each issue includes:
 * - What the frontend expects
 * - What the backend is currently doing (or not doing)
 * - How to fix it
 *
 * Last Updated: 2025-12-29
 * Frontend: dashboard.traf3li.com (Cloudflare/Vercel)
 * Backend: api.traf3li.com (Render)
 *
 * ============================================================================
 */

// ============================================================================
// 🚨 CRITICAL ISSUE #1: SSO CALLBACK NOT RETURNING TOKENS
// ============================================================================
//
// PROBLEM:
// The POST /api/auth/sso/callback endpoint returns user data but NOT tokens.
// This means users appear logged in but subsequent API calls fail with 401.
//
// FRONTEND EXPECTS (from oauthService.ts:269-419):
// ```json
// {
//   "error": false,
//   "message": "Success",
//   "user": { "_id": "...", "email": "...", ... },
//   "accessToken": "eyJhbG...",    // ← REQUIRED AT ROOT LEVEL
//   "refreshToken": "eyJhbG...",   // ← REQUIRED AT ROOT LEVEL
//   "csrfToken": "optional",
//   "isNewUser": false
// }
// ```
//
// CURRENT BACKEND RESPONSE (suspected):
// ```json
// {
//   "error": false,
//   "message": "Success",
//   "user": { ... },
//   "isNewUser": false
//   // ❌ NO accessToken
//   // ❌ NO refreshToken
// }
// ```
//
// EVIDENCE:
// - Frontend has aggressive error logging at lines 311-330 checking multiple locations
// - Frontend tries: data.accessToken, data.token, data.tokens, data.data?.accessToken
// - Error message: "🚨🚨🚨 BACKEND DID NOT RETURN TOKENS! 🚨🚨🚨"
//
// FIX REQUIRED:
// In the SSO callback controller, add tokens to response:
// ```javascript
// res.json({
//   error: false,
//   message: 'Login successful',
//   user: userData,
//   accessToken: jwt.sign({ userId, email, role, firmId }, ACCESS_SECRET, { expiresIn: '15m' }),
//   refreshToken: jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' }),
//   isNewUser: isNewUser
// });
// ```
export const ISSUE_SSO_TOKENS_MISSING = {
  severity: 'CRITICAL',
  endpoint: 'POST /api/auth/sso/callback',
  symptom: 'Users login via SSO but get 401 on all subsequent requests',
  frontendFile: 'src/services/oauthService.ts:311-330',
  fix: 'Return accessToken and refreshToken at root level of response',
} as const;

// ============================================================================
// 🚨 CRITICAL ISSUE #2: CSRF COOKIE NOT ACCESSIBLE CROSS-ORIGIN
// ============================================================================
//
// PROBLEM:
// Frontend (dashboard.traf3li.com) cannot read CSRF cookie from backend (api.traf3li.com)
// because the cookie is either:
// - Set with httpOnly: true (JS can't read it)
// - Set with SameSite: Strict or Lax (blocks cross-origin)
// - Missing Domain attribute for subdomain sharing
//
// FRONTEND EXPECTS (from lib/api.ts:291-334):
// Cookie readable via document.cookie with names: csrfToken, csrf-token, or XSRF-TOKEN
//
// CURRENT BEHAVIOR:
// - Frontend logs "No csrf-token found!" on every mutating request
// - Falls back to cached token from response headers (x-csrf-token)
// - May cause 403 CSRF errors on POST/PUT/PATCH/DELETE requests
//
// FIX REQUIRED:
// Set cookie with correct attributes:
// ```javascript
// res.cookie('csrfToken', token, {
//   httpOnly: false,         // ← REQUIRED: JS must read this cookie
//   secure: true,            // ← REQUIRED: HTTPS only
//   sameSite: 'none',        // ← REQUIRED: Cross-origin requests
//   domain: '.traf3li.com',  // ← RECOMMENDED: Share across subdomains
//   path: '/',
//   maxAge: 3600000          // 1 hour
// });
//
// // ALSO return in response header as fallback:
// res.setHeader('x-csrf-token', token);
// ```
//
// GET /api/auth/csrf MUST return token in body too:
// ```javascript
// res.json({ csrfToken: token });
// ```
export const ISSUE_CSRF_COOKIE = {
  severity: 'CRITICAL',
  endpoint: 'GET /api/auth/csrf + all mutating endpoints',
  symptom: '403 errors on POST/PUT/PATCH/DELETE, "No csrf-token found" in console',
  frontendFile: 'src/lib/api.ts:291-402',
  fix: 'Set cookie with httpOnly:false, sameSite:none, secure:true; return in body',
} as const;

// ============================================================================
// 🚨 CRITICAL ISSUE #3: TOKEN REFRESH ENDPOINT
// ============================================================================
//
// PROBLEM:
// The POST /api/auth/refresh endpoint may not be:
// - Accepting refreshToken in request body
// - Returning BOTH new accessToken AND new refreshToken
//
// FRONTEND EXPECTS (from lib/api.ts:232-263):
// Request:
// ```json
// {
//   "refreshToken": "eyJhbG..."
// }
// ```
//
// Response:
// ```json
// {
//   "accessToken": "new_eyJhbG...",
//   "refreshToken": "new_eyJhbG..."
// }
// ```
//
// FIX REQUIRED:
// ```javascript
// app.post('/api/auth/refresh', async (req, res) => {
//   const { refreshToken } = req.body;  // ← Get from BODY, not header
//
//   // Validate and decode
//   const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
//
//   // Generate BOTH new tokens (token rotation)
//   const newAccessToken = jwt.sign({ ... }, ACCESS_SECRET, { expiresIn: '15m' });
//   const newRefreshToken = jwt.sign({ ... }, REFRESH_SECRET, { expiresIn: '7d' });
//
//   // Invalidate old refresh token in database (optional but recommended)
//
//   res.json({
//     accessToken: newAccessToken,    // ← REQUIRED
//     refreshToken: newRefreshToken   // ← REQUIRED
//   });
// });
// ```
export const ISSUE_TOKEN_REFRESH = {
  severity: 'CRITICAL',
  endpoint: 'POST /api/auth/refresh',
  symptom: 'Users get logged out unexpectedly, "Session expired" messages',
  frontendFile: 'src/lib/api.ts:232-263',
  fix: 'Accept refreshToken in body, return both accessToken and refreshToken',
} as const;

// ============================================================================
// ⚠️ HIGH PRIORITY ISSUE #4: LOGIN RESPONSE MISSING MFA FLAGS
// ============================================================================
//
// PROBLEM:
// The login response may not include MFA-related fields that frontend needs.
//
// FRONTEND EXPECTS (from authService.ts User interface):
// ```json
// {
//   "error": false,
//   "message": "Success",
//   "user": {
//     "_id": "...",
//     "email": "...",
//     "role": "lawyer",
//     "mfaEnabled": true,      // ← REQUIRED: Is MFA enabled?
//     "mfaPending": false,     // ← REQUIRED: Needs MFA verification?
//     "mfaMethod": "totp",     // ← REQUIRED if mfaEnabled
//     "firmId": "...",         // ← REQUIRED for firm members
//     "firm": { ... },         // ← REQUIRED: Firm details
//     "isSoloLawyer": false,   // ← REQUIRED: For solo lawyers
//     "permissions": { ... }   // ← REQUIRED: For RBAC
//   },
//   "accessToken": "...",
//   "refreshToken": "..."
// }
// ```
//
// IF MFA IS REQUIRED (user needs to verify):
// ```json
// {
//   "error": false,
//   "mfaRequired": true,     // ← This triggers MFA flow
//   "userId": "...",          // ← Needed for MFA verify call
//   "user": null,             // ← No user until MFA verified
//   "accessToken": null,      // ← No tokens until MFA verified
//   "refreshToken": null
// }
// ```
export const ISSUE_LOGIN_MFA = {
  severity: 'HIGH',
  endpoint: 'POST /api/auth/login',
  symptom: 'MFA flow broken, users with MFA enabled can bypass it',
  frontendFile: 'src/services/authService.ts:93-148',
  fix: 'Include mfaEnabled, mfaPending, mfaMethod, firmId, firm, permissions in response',
} as const;

// ============================================================================
// ⚠️ HIGH PRIORITY ISSUE #5: CORS CONFIGURATION
// ============================================================================
//
// PROBLEM:
// Cross-origin requests may fail if CORS is not properly configured for
// the frontend domain with credentials support.
//
// REQUIRED CORS CONFIGURATION:
// ```javascript
// const corsOptions = {
//   origin: [
//     'https://dashboard.traf3li.com',
//     'https://traf3li.com',
//     'http://localhost:5173',  // Dev
//     'http://localhost:3000'   // Dev
//   ],
//   credentials: true,  // ← REQUIRED for cookies
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: [
//     'Content-Type',
//     'Authorization',
//     'X-CSRF-Token',
//     'X-Device-Fingerprint',
//     'X-Requested-With'
//   ],
//   exposedHeaders: [
//     'x-csrf-token',
//     'x-session-idle-warning',
//     'x-session-idle-remaining',
//     'x-session-absolute-warning',
//     'x-session-absolute-remaining'
//   ]
// };
//
// app.use(cors(corsOptions));
// ```
export const ISSUE_CORS = {
  severity: 'HIGH',
  endpoint: 'All endpoints',
  symptom: 'Network errors, CORS errors in console, cookies not sent',
  frontendFile: 'src/lib/api.ts',
  fix: 'Configure CORS with credentials:true and proper origins',
} as const;

// ============================================================================
// ⚠️ HIGH PRIORITY ISSUE #6: OTP VERIFY MISSING TOKENS
// ============================================================================
//
// PROBLEM:
// POST /api/auth/verify-otp may not return tokens after successful verification.
//
// FRONTEND EXPECTS (from authService.ts:891-933):
// ```json
// {
//   "error": false,
//   "message": "Success",
//   "user": { ... },
//   "accessToken": "...",    // ← REQUIRED
//   "refreshToken": "..."    // ← REQUIRED
// }
// ```
export const ISSUE_OTP_TOKENS = {
  severity: 'HIGH',
  endpoint: 'POST /api/auth/verify-otp',
  symptom: 'OTP verification succeeds but user not authenticated',
  frontendFile: 'src/services/authService.ts:891-933',
  fix: 'Return accessToken and refreshToken after successful OTP verification',
} as const;

// ============================================================================
// 📝 MEDIUM PRIORITY ISSUE #7: FORGOT PASSWORD CAPTCHA VALIDATION
// ============================================================================
//
// PROBLEM:
// POST /api/auth/forgot-password MUST validate the captchaToken.
// This prevents email enumeration attacks.
//
// REQUEST FORMAT:
// ```json
// {
//   "email": "user@example.com",
//   "captchaToken": "cloudflare_turnstile_token",
//   "captchaProvider": "turnstile"
// }
// ```
//
// CAPTCHA VALIDATION:
// - Verify token with Cloudflare Turnstile API
// - Return error code "CAPTCHA_VERIFICATION_FAILED" if invalid
export const ISSUE_CAPTCHA = {
  severity: 'MEDIUM',
  endpoint: 'POST /api/auth/forgot-password',
  symptom: 'Security vulnerability if CAPTCHA not validated',
  frontendFile: 'src/features/auth/forgot-password/components/forgot-password-form.tsx',
  fix: 'Validate captchaToken with Cloudflare Turnstile API',
} as const;

// ============================================================================
// 📝 MEDIUM PRIORITY ISSUE #8: RATE LIMIT RESPONSE FORMAT
// ============================================================================
//
// PROBLEM:
// 429 responses should include waitTime/retryAfter for UI display.
//
// EXPECTED 429 RESPONSE:
// ```json
// {
//   "error": true,
//   "message": "Too many requests",
//   "code": "RATE_LIMITED",
//   "waitTime": 60,        // ← Seconds to wait
//   "retryAfter": 60       // ← Alternative field name
// }
// ```
//
// ALSO SET HEADER:
// ```
// Retry-After: 60
// ```
export const ISSUE_RATE_LIMIT = {
  severity: 'MEDIUM',
  endpoint: 'All rate-limited endpoints',
  symptom: 'UI shows wrong wait time on rate limit',
  frontendFile: 'src/lib/api.ts:596-620, 936-980',
  fix: 'Include waitTime/retryAfter in 429 response body and Retry-After header',
} as const;

// ============================================================================
// 📝 MEDIUM PRIORITY ISSUE #9: ACCOUNT LOCKOUT RESPONSE FORMAT
// ============================================================================
//
// PROBLEM:
// 423 (Account Locked) responses should include remaining lockout time.
//
// EXPECTED 423 RESPONSE:
// ```json
// {
//   "error": true,
//   "message": "Account locked",
//   "code": "ACCOUNT_LOCKED",
//   "remainingTime": 15    // ← Minutes remaining
// }
// ```
export const ISSUE_ACCOUNT_LOCKOUT = {
  severity: 'MEDIUM',
  endpoint: 'POST /api/auth/login',
  symptom: 'UI shows wrong lockout time',
  frontendFile: 'src/lib/api.ts:912-933',
  fix: 'Include remainingTime (minutes) in 423 response',
} as const;

// ============================================================================
// 📝 MEDIUM PRIORITY ISSUE #10: SESSION TIMEOUT HEADERS
// ============================================================================
//
// PROBLEM:
// Backend should send warning headers before session expires.
//
// EXPECTED HEADERS ON RESPONSES:
// ```
// x-session-idle-warning: true         // When 5 min before idle timeout
// x-session-idle-remaining: 300        // Seconds remaining
// x-session-absolute-warning: true     // When 5 min before absolute timeout
// x-session-absolute-remaining: 300    // Seconds remaining
// ```
//
// Frontend listens for these and shows warning dialog.
export const ISSUE_SESSION_HEADERS = {
  severity: 'MEDIUM',
  endpoint: 'All authenticated endpoints',
  symptom: 'Users get logged out without warning',
  frontendFile: 'src/lib/api.ts:844-865',
  fix: 'Send x-session-* headers when approaching timeout',
} as const;

// ============================================================================
// VERIFICATION COMMANDS
// ============================================================================
//
// Run these curl commands to verify your backend:
//
// 1. Check CSRF endpoint:
// curl -v https://api.traf3li.com/api/auth/csrf
// ✓ Should return: { "csrfToken": "..." }
// ✓ Should set cookie: csrfToken=...
//
// 2. Check login returns tokens:
// curl -X POST https://api.traf3li.com/api/auth/login \
//   -H "Content-Type: application/json" \
//   -d '{"username":"test@test.com","password":"test123"}' | jq
// ✓ Should include: accessToken, refreshToken, user.mfaEnabled
//
// 3. Check SSO callback returns tokens:
// curl -X POST https://api.traf3li.com/api/auth/sso/callback \
//   -H "Content-Type: application/json" \
//   -d '{"provider":"google","code":"test","state":"test"}' | jq
// ✓ Should include: accessToken, refreshToken
//
// 4. Check token refresh:
// curl -X POST https://api.traf3li.com/api/auth/refresh \
//   -H "Content-Type: application/json" \
//   -d '{"refreshToken":"YOUR_TOKEN"}' | jq
// ✓ Should return: accessToken, refreshToken
//
// 5. Check CORS headers:
// curl -v -X OPTIONS https://api.traf3li.com/api/auth/login \
//   -H "Origin: https://dashboard.traf3li.com" \
//   -H "Access-Control-Request-Method: POST"
// ✓ Should include: Access-Control-Allow-Origin, Access-Control-Allow-Credentials
//

export const ALL_ISSUES = {
  CRITICAL: [
    ISSUE_SSO_TOKENS_MISSING,
    ISSUE_CSRF_COOKIE,
    ISSUE_TOKEN_REFRESH,
  ],
  HIGH: [
    ISSUE_LOGIN_MFA,
    ISSUE_CORS,
    ISSUE_OTP_TOKENS,
  ],
  MEDIUM: [
    ISSUE_CAPTCHA,
    ISSUE_RATE_LIMIT,
    ISSUE_ACCOUNT_LOCKOUT,
    ISSUE_SESSION_HEADERS,
  ],
} as const;

export default ALL_ISSUES;
