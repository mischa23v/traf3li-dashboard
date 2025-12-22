# CAPTCHA Integration Documentation

This document explains the CAPTCHA integration system for protecting login and other forms in the Traf3li Dashboard.

## Overview

The CAPTCHA integration provides protection against automated attacks and brute-force login attempts. It supports:

- **reCAPTCHA v2**: Traditional checkbox verification
- **reCAPTCHA v3**: Invisible verification with risk scoring
- **hCaptcha**: Privacy-focused alternative to reCAPTCHA

## Features

### 1. Adaptive CAPTCHA Display
CAPTCHA is shown conditionally based on:
- Number of failed login attempts
- Device recognition (new vs. known devices)
- Risk score calculation
- Admin-configured thresholds

### 2. RTL Support
Full right-to-left (RTL) layout support for Arabic language.

### 3. Multiple Modes
- **Checkbox**: Visible challenge requiring user interaction
- **Invisible**: Automatic verification in the background

### 4. Device Fingerprinting
Recognizes returning users on known devices to reduce friction.

## Architecture

### Components

#### 1. Configuration (`/src/components/auth/captcha-config.ts`)
Central configuration for CAPTCHA providers and settings.

```typescript
export interface CaptchaConfig {
  provider: CaptchaProvider
  mode: CaptchaMode
  siteKey: string
  threshold: number
  enabled: boolean
  requireAfterFailedAttempts: number
  alwaysForNewDevices: boolean
  riskScoreThreshold: number
}
```

#### 2. Service (`/src/services/captchaService.ts`)
Handles CAPTCHA token verification and settings management.

Key functions:
- `verifyCaptchaToken()`: Verify CAPTCHA token with backend
- `getCaptchaSettings()`: Get current CAPTCHA configuration
- `updateCaptchaSettings()`: Update settings (admin only)
- `checkCaptchaRequired()`: Check if CAPTCHA should be shown
- `getDeviceFingerprint()`: Generate device fingerprint
- `calculateRiskScore()`: Calculate risk score for login attempt

#### 3. Hook (`/src/hooks/useCaptcha.ts`)
React hook for loading and executing CAPTCHA challenges.

```typescript
const captcha = useCaptcha({
  provider: 'recaptcha-v3',
  siteKey: 'your-site-key',
  mode: 'invisible',
  action: 'login',
  onSuccess: (token) => console.log('CAPTCHA token:', token),
  onError: (error) => console.error('CAPTCHA error:', error),
})

// Execute CAPTCHA
const token = await captcha.execute()
```

#### 4. Component (`/src/components/auth/captcha-challenge.tsx`)
React component for rendering CAPTCHA challenges.

```tsx
<CaptchaChallenge
  ref={captchaRef}
  provider="recaptcha-v3"
  siteKey="your-site-key"
  mode="invisible"
  action="login"
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

#### 5. Settings UI (`/src/features/settings/components/captcha-settings.tsx`)
Admin interface for configuring CAPTCHA.

## Setup

### 1. Environment Variables

Add to `.env`:

```bash
# CAPTCHA Configuration
VITE_CAPTCHA_ENABLED=true
VITE_CAPTCHA_PROVIDER=recaptcha-v3
VITE_CAPTCHA_MODE=invisible
VITE_RECAPTCHA_V2_SITE_KEY=your-v2-site-key
VITE_RECAPTCHA_V3_SITE_KEY=your-v3-site-key
VITE_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
VITE_RECAPTCHA_THRESHOLD=0.5
VITE_CAPTCHA_FAILED_ATTEMPTS_THRESHOLD=3
VITE_CAPTCHA_NEW_DEVICES=false
VITE_CAPTCHA_RISK_THRESHOLD=50
```

### 2. Get API Keys

#### reCAPTCHA
1. Visit https://www.google.com/recaptcha/admin
2. Register your site
3. Choose v2 or v3
4. Get your site key and secret key
5. Add site key to environment variables

#### hCaptcha
1. Visit https://www.hcaptcha.com/
2. Sign up and create a site
3. Get your site key and secret key
4. Add site key to environment variables

### 3. Backend Integration

Your backend needs to verify CAPTCHA tokens. Example endpoint:

```typescript
POST /api/v1/auth/captcha/verify
{
  "token": "captcha-token",
  "provider": "recaptcha-v3",
  "action": "login"
}
```

Response:
```typescript
{
  "success": true,
  "score": 0.9,  // For reCAPTCHA v3
  "action": "login",
  "challenge_ts": "2024-01-01T00:00:00Z",
  "hostname": "traf3li.com"
}
```

### 4. Content Security Policy

The CSP in `index.html` already includes required domains:
- `https://www.google.com` (reCAPTCHA)
- `https://www.gstatic.com` (reCAPTCHA)
- `https://js.hcaptcha.com` (hCaptcha)
- `https://hcaptcha.com` (hCaptcha)

## Usage in Forms

### Sign-In Form Integration

The sign-in form (`/src/features/auth/sign-in/components/user-auth-form.tsx`) includes full CAPTCHA integration:

1. **Configuration Loading**: Loads CAPTCHA settings on mount
2. **Conditional Display**: Shows CAPTCHA based on triggers
3. **Token Submission**: Includes CAPTCHA token with login request
4. **Error Handling**: Resets CAPTCHA on failed attempts

Example flow:
```typescript
// 1. Load config
useEffect(() => {
  getCaptchaConfig().then(setCaptchaConfig)
}, [])

// 2. Check if required
const showCaptcha = useMemo(() => {
  return attemptNumber >= config.requireAfterFailedAttempts
}, [attemptNumber, config])

// 3. Execute and submit
const token = await captchaRef.current?.execute()
await login({ ...data, captchaToken: token })

// 4. Reset on failure
if (loginFailed) {
  captchaRef.current?.reset()
}
```

### Adding CAPTCHA to Other Forms

To add CAPTCHA to any form:

1. Import components:
```typescript
import { CaptchaChallenge, type CaptchaChallengeRef } from '@/components/auth/captcha-challenge'
import { getCaptchaConfig } from '@/services/captchaService'
```

2. Add state:
```typescript
const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | null>(null)
const [captchaToken, setCaptchaToken] = useState('')
const captchaRef = useRef<CaptchaChallengeRef>(null)
```

3. Load config:
```typescript
useEffect(() => {
  getCaptchaConfig().then(setCaptchaConfig)
}, [])
```

4. Add component to form:
```tsx
{captchaConfig?.enabled && (
  <CaptchaChallenge
    ref={captchaRef}
    provider={captchaConfig.provider}
    siteKey={captchaConfig.siteKey}
    mode={captchaConfig.mode}
    action="your-action-name"
    onSuccess={setCaptchaToken}
    onError={handleError}
  />
)}
```

5. Include token in submission:
```typescript
const formData = {
  ...data,
  captchaToken,
  captchaProvider: captchaConfig?.provider,
}
```

## Admin Configuration

Administrators can configure CAPTCHA through the settings UI:

1. Navigate to Settings > Security > CAPTCHA
2. Enable/disable CAPTCHA
3. Select provider (reCAPTCHA v2/v3, hCaptcha)
4. Configure site keys
5. Set trigger thresholds:
   - Failed attempts threshold
   - Risk score threshold
   - New device behavior
6. For reCAPTCHA v3, set score threshold (0.0-1.0)

## Risk Score Calculation

The system calculates a risk score (0-100) based on:

- **Failed Attempts** (up to 50 points): Each failed attempt adds 20 points
- **New Device** (20 points): Unknown device fingerprint
- **Rapid Attempts** (20 points): Multiple attempts in short time
- **Suspicious Activity** (10 points): Other anomalies

CAPTCHA is shown when risk score exceeds the configured threshold.

## Device Recognition

Device fingerprinting uses:
- User agent
- Screen resolution
- Color depth
- Hardware concurrency
- Device memory
- Timezone
- Canvas fingerprint

Recognized devices are stored in `localStorage` under the key `known_devices`.

## Security Considerations

1. **Site Keys vs. Secret Keys**:
   - Only site keys are stored in environment variables
   - Secret keys should NEVER be in frontend code
   - Backend must verify tokens using secret keys

2. **Token Reuse**:
   - Tokens are single-use
   - Reset CAPTCHA after each failed attempt
   - Get fresh token for each submission

3. **CSP Configuration**:
   - Only allow trusted CAPTCHA domains
   - Use HTTPS for all CAPTCHA resources

4. **Rate Limiting**:
   - CAPTCHA complements rate limiting, doesn't replace it
   - Use both for best protection

## Troubleshooting

### CAPTCHA Not Loading
1. Check CSP allows CAPTCHA domains
2. Verify site key is correct
3. Check browser console for errors
4. Ensure CAPTCHA is enabled in settings

### Verification Failures
1. Verify secret key on backend
2. Check token is not expired
3. Ensure correct provider is used
4. Verify hostname matches registered domain

### Performance Issues
1. Use reCAPTCHA v3 for invisible verification
2. Load scripts only when needed (already implemented)
3. Cache CAPTCHA settings
4. Use device recognition to reduce challenges

## Best Practices

1. **Start with reCAPTCHA v3**: Invisible, least friction
2. **Increase thresholds gradually**: Start with 3-5 failed attempts
3. **Enable device recognition**: Reduces challenges for regular users
4. **Monitor false positives**: Adjust thresholds based on user feedback
5. **Provide fallbacks**: Allow support contact for locked users
6. **Test on mobile**: Ensure CAPTCHA works on all devices
7. **Test RTL layout**: Verify Arabic interface works correctly

## Testing

### Manual Testing
1. Enable CAPTCHA in settings
2. Configure site keys
3. Attempt login with wrong credentials multiple times
4. Verify CAPTCHA appears after threshold
5. Complete CAPTCHA and submit
6. Verify successful login

### Automated Testing
Mock the CAPTCHA service in tests:
```typescript
jest.mock('@/services/captchaService', () => ({
  getCaptchaConfig: jest.fn().mockResolvedValue({
    enabled: false, // Disable for tests
    provider: 'recaptcha-v3',
    // ...
  }),
}))
```

## API Endpoints

The backend should implement:

1. `GET /api/v1/auth/captcha/settings`: Get CAPTCHA configuration
2. `PUT /api/v1/auth/captcha/settings`: Update settings (admin)
3. `POST /api/v1/auth/captcha/verify`: Verify CAPTCHA token
4. `POST /api/v1/auth/captcha/check-required`: Check if CAPTCHA required

## Future Enhancements

Potential improvements:
1. Support for more CAPTCHA providers (Cloudflare Turnstile, etc.)
2. A/B testing different thresholds
3. Machine learning-based risk scoring
4. Geographic risk analysis
5. Browser fingerprinting enhancements
6. CAPTCHA analytics dashboard

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify backend integration
4. Contact development team

## References

- [reCAPTCHA Documentation](https://developers.google.com/recaptcha)
- [hCaptcha Documentation](https://docs.hcaptcha.com)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
