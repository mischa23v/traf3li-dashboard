# 🔐 Traf3li Dashboard - Authentication Setup Guide

> Comprehensive guide for setting up authentication with Google OAuth, Email OTP, and language switching

## 📋 Table of Contents

- [Current Status](#current-status)
- [Test Credentials (Development)](#test-credentials-development)
- [Google OAuth Setup](#google-oauth-setup)
- [Email OTP Setup](#email-otp-setup)
- [Language Switching](#language-switching)
- [Production Deployment](#production-deployment)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## ✅ Current Status

### Completed Features

- ✅ Login page with Arabic/English translations
- ✅ Language switcher (top-right corner)
- ✅ Username/Email + Password authentication
- ✅ Test credentials for development
- ✅ Google OAuth button (UI only - needs backend)
- ✅ GitHub login removed
- ✅ Responsive design with RTL/LTR support
- ✅ Form validation with Arabic error messages

### Pending Features

- ⏳ Google OAuth integration (backend required)
- ⏳ Email OTP implementation (backend required)
- ⏳ Password reset flow
- ⏳ Two-factor authentication (2FA)

---

## 🧪 Test Credentials (Development)

### Quick Login for Testing

**Important:** These credentials are for **development only**. Remove before production!

```
Username: test
OR
Email: test@example.com

Password: test123
```

### How It Works

The `authService.ts` file contains a check for test credentials:

```typescript
// File: src/services/authService.ts

const TEST_CREDENTIALS = {
  username: 'test',
  email: 'test@example.com',
  password: 'test123',
}
```

When you login with these credentials:
1. No API call is made to the backend
2. A fake user object is created and stored in localStorage
3. You're redirected to the dashboard with **admin** role

### Test User Details

```json
{
  "_id": "test-user-id",
  "username": "test",
  "email": "test@example.com",
  "role": "admin",
  "country": "SA",
  "phone": "+966500000000",
  "description": "Test user account",
  "isSeller": false
}
```

### Removing Test Credentials (Production)

Before deploying to production, remove the test credentials from `src/services/authService.ts`:

1. Remove the `TEST_CREDENTIALS` constant
2. Remove the `TEST_USER` constant
3. Remove the test credentials check in the `login` function

---

## 🔵 Google OAuth Setup

### Overview

Google OAuth allows users to sign in using their Google account. This is implemented as a button on the login page.

### Prerequisites

1. Google Cloud Console account
2. Backend API that supports OAuth 2.0
3. HTTPS domain (required for production)

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name: "Traf3li Dashboard"
   - Click "Create"

3. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "Traf3li Web Client"

5. **Configure Authorized URLs**

   **Authorized JavaScript origins:**
   ```
   http://localhost:5173          (Development)
   https://yourdomain.com         (Production)
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:5173/auth/google/callback
   https://yourdomain.com/auth/google/callback
   ```

6. **Save Your Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Save them securely (we'll use them in Step 2)

### Step 2: Backend API Setup

Your backend needs to handle Google OAuth. Here's the recommended flow:

#### Backend Routes Required

```javascript
// routes/auth.route.js

router.get('/auth/google', (req, res) => {
  // Redirect to Google OAuth consent screen
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'email profile',
  })}`

  res.redirect(googleAuthUrl)
})

router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BACKEND_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    })

    const { access_token } = tokenResponse.data

    // 2. Get user info from Google
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    })

    // 3. Find or create user in your database
    let user = await User.findOne({ email: userInfo.data.email })

    if (!user) {
      user = await User.create({
        email: userInfo.data.email,
        username: userInfo.data.name,
        role: 'client',
        // ... other fields
      })
    }

    // 4. Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    // 5. Set cookie and redirect to frontend
    res.cookie('accessToken', token, { httpOnly: true, secure: true })
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`)

  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/sign-in?error=google_auth_failed`)
  }
})
```

#### Backend Environment Variables

Add to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
```

### Step 3: Frontend Integration

Update the Google button in `src/features/auth/sign-in/components/user-auth-form.tsx`:

```typescript
// Current (UI only):
<Button
  variant='outline'
  className='w-full'
  type='button'
  disabled={isLoading}
>
  <IconBrandGoogle className='mr-2 h-4 w-4' />
  {t('auth.signIn.google')}
</Button>

// Updated (with OAuth):
<Button
  variant='outline'
  className='w-full'
  type='button'
  disabled={isLoading}
  onClick={() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    window.location.href = `${apiUrl}/api/auth/google`
  }}
>
  <IconBrandGoogle className='mr-2 h-4 w-4' />
  {t('auth.signIn.google')}
</Button>
```

### Step 4: Testing Google OAuth

1. Start your backend server
2. Start your frontend dev server
3. Click "Google" button on login page
4. You should be redirected to Google consent screen
5. After authorization, you'll be redirected back to your dashboard

---

## 📧 Email OTP Setup

### Overview

One-Time Password (OTP) sent via email for secure authentication or password reset.

### Prerequisites

1. Email service provider (SendGrid, Mailgun, AWS SES, or Nodemailer)
2. Backend API to generate and verify OTP codes
3. OTP UI component (already exists at `src/features/auth/otp/`)

### Recommended: SendGrid Setup

SendGrid offers a free tier with 100 emails/day.

#### Step 1: Create SendGrid Account

1. Visit https://sendgrid.com
2. Sign up for a free account
3. Verify your email address

#### Step 2: Generate API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "Traf3li Dashboard"
4. Permissions: **Full Access**
5. Copy the API key (you won't see it again!)

#### Step 3: Verify Sender Email

1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your details:
   - From Name: "Traf3li Dashboard"
   - From Email: noreply@yourdomain.com
   - Reply To: support@yourdomain.com
4. Check your email and click verification link

#### Step 4: Backend Implementation

Install SendGrid package:

```bash
npm install @sendgrid/mail
```

Create email service:

```javascript
// services/email.service.js

const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendOTP = async (email, otp) => {
  const msg = {
    to: email,
    from: 'noreply@yourdomain.com', // Must match verified sender
    subject: 'Your Traf3li OTP Code',
    text: `Your OTP code is: ${otp}. Valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">Traf3li Dashboard</h2>
        <p>Your OTP code is:</p>
        <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `,
  }

  try {
    await sgMail.send(msg)
    console.log('OTP email sent successfully')
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw error
  }
}

module.exports = { sendOTP }
```

Create OTP controller:

```javascript
// controllers/otp.controller.js

const crypto = require('crypto')
const { sendOTP } = require('../services/email.service')

// In-memory storage (use Redis in production)
const otpStore = new Map()

exports.sendOTPEmail = async (req, res) => {
  const { email } = req.body

  try {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()

    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
      code: otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    })

    // Send OTP via email
    await sendOTP(email, otp)

    res.json({
      error: false,
      message: 'OTP sent to your email',
    })
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Failed to send OTP',
    })
  }
}

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body

  try {
    const storedOTP = otpStore.get(email)

    // Check if OTP exists
    if (!storedOTP) {
      return res.status(400).json({
        error: true,
        message: 'No OTP found for this email',
      })
    }

    // Check if expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(email)
      return res.status(400).json({
        error: true,
        message: 'OTP expired. Please request a new one.',
      })
    }

    // Check attempts
    if (storedOTP.attempts >= 3) {
      otpStore.delete(email)
      return res.status(400).json({
        error: true,
        message: 'Too many failed attempts. Please request a new OTP.',
      })
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      storedOTP.attempts++
      return res.status(400).json({
        error: true,
        message: 'Invalid OTP',
      })
    }

    // OTP is valid - remove it
    otpStore.delete(email)

    // Find or create user
    let user = await User.findOne({ email })
    if (!user) {
      user = await User.create({
        email,
        username: email.split('@')[0],
        role: 'client',
      })
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    // Set cookie
    res.cookie('accessToken', token, { httpOnly: true, secure: true })

    res.json({
      error: false,
      message: 'Login successful',
      user,
    })
  } catch (error) {
    res.status(500).json({
      error: true,
      message: 'Failed to verify OTP',
    })
  }
}
```

Add routes:

```javascript
// routes/auth.route.js

router.post('/auth/otp/send', otpController.sendOTPEmail)
router.post('/auth/otp/verify', otpController.verifyOTP)
```

#### Step 5: Frontend Integration

Create OTP login flow in `src/features/auth/sign-in/components/user-auth-form.tsx`:

```typescript
const [showOTP, setShowOTP] = useState(false)
const [userEmail, setUserEmail] = useState('')

const handleOTPLogin = async () => {
  // Send OTP to email
  await fetch(`${apiUrl}/api/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail }),
  })

  // Show OTP input screen
  setShowOTP(true)
}
```

Use the existing OTP component at `src/features/auth/otp/` for the OTP input UI.

#### Step 6: Environment Variables

Add to backend `.env`:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Alternative: Nodemailer (Self-hosted)

If you prefer to use your own SMTP server:

```javascript
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // or your SMTP server
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // App password if using Gmail
  },
})

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: '"Traf3li Dashboard" <noreply@yourdomain.com>',
    to: email,
    subject: 'Your OTP Code',
    html: `<h1>${otp}</h1>`,
  })
}
```

---

## 🌐 Language Switching

### Current Implementation

✅ **Already implemented!** The language switcher is located in the top-right corner of the login page.

### Features

- **Languages:** Arabic (العربية) and English
- **RTL/LTR:** Automatic text direction based on language
- **Persistence:** Language preference saved in localStorage
- **Dynamic:** Updates all text instantly when switching

### Translation Files

All translations are stored in:

- **Arabic:** `src/locales/ar/translation.json`
- **English:** `src/locales/en/translation.json`

### Adding New Translations

To add new translated text:

1. Open both translation files
2. Add the same key to both files with appropriate translations
3. Use `t('your.key.here')` in your component

Example:

```json
// ar/translation.json
{
  "auth": {
    "signIn": {
      "title": "تسجيل الدخول"
    }
  }
}

// en/translation.json
{
  "auth": {
    "signIn": {
      "title": "Sign in"
    }
  }
}
```

```typescript
// In your component
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()

return <h1>{t('auth.signIn.title')}</h1>
```

---

## 🚀 Production Deployment

### Security Checklist

Before deploying to production:

- [ ] **Remove test credentials** from `src/services/authService.ts`
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Enable HTTPS on both frontend and backend
- [ ] Set `httpOnly`, `secure`, and `sameSite` flags on cookies
- [ ] Add rate limiting to prevent brute force attacks
- [ ] Implement CORS properly (only allow your frontend domain)
- [ ] Use environment variables for all secrets
- [ ] Enable Google reCAPTCHA on login form
- [ ] Set up logging and monitoring
- [ ] Test all authentication flows end-to-end

### Environment Variables

#### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
```

#### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_super_secure_random_string_here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=another_super_secure_random_string
REFRESH_TOKEN_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Security
COOKIE_SECRET=random_cookie_secret
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
```

### Build and Deploy

```bash
# Build frontend
npm run build

# Test production build locally
npm run preview

# Deploy to hosting (example: Vercel)
vercel --prod

# Or use your preferred hosting platform
```

---

## 🔒 Security Best Practices

### Password Security

1. **Minimum Length:** 6 characters (current), recommend 8+
2. **Hashing:** Use bcrypt with salt rounds ≥ 10
3. **Password Reset:** Use time-limited tokens (1 hour max)

### Session Management

1. **HttpOnly Cookies:** Prevent XSS attacks
2. **Secure Flag:** Only send over HTTPS
3. **SameSite:** Prevent CSRF attacks
4. **Short Expiry:** Access tokens expire in 15 minutes
5. **Refresh Tokens:** Long-lived (7-30 days) for seamless UX

### Rate Limiting

Implement rate limiting to prevent:
- Brute force login attempts
- OTP spam
- API abuse

Example with Express:

```javascript
const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again later.',
})

app.post('/api/auth/login', loginLimiter, authController.login)
```

### Input Validation

Always validate and sanitize user input:

```javascript
const Joi = require('joi')

const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
})
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "Network Error" when logging in

**Solution:**
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check CORS configuration on backend
- Check browser console for errors

#### 2. Language switcher not working

**Solution:**
- Clear localStorage: `localStorage.clear()`
- Check browser console for i18n errors
- Verify translation files exist

#### 3. Test credentials not working

**Solution:**
- Make sure you're using exact credentials:
  - Username: `test`
  - Password: `test123`
- Check browser console for errors
- Clear localStorage and try again

#### 4. Google OAuth redirect fails

**Solution:**
- Verify redirect URI matches exactly in Google Console
- Check if backend route `/auth/google/callback` exists
- Ensure HTTPS is used in production

#### 5. OTP email not received

**Solution:**
- Check spam folder
- Verify SendGrid API key is correct
- Check SendGrid dashboard for failed sends
- Ensure sender email is verified

---

## 📞 Support

For questions or issues:

1. Check this documentation
2. Review backend logs
3. Check browser console
4. Contact development team

---

## 📝 Summary

### Quick Start (Development)

1. **Test Login:**
   - Username: `test`
   - Password: `test123`

2. **Switch Language:**
   - Click the language icon (🌐) in top-right corner
   - Choose Arabic or English

3. **Next Steps:**
   - Set up Google OAuth (follow guide above)
   - Implement Email OTP (follow guide above)
   - Remove test credentials before production

### File Structure

```
src/
├── features/auth/
│   ├── sign-in/
│   │   ├── index.tsx              # Main sign-in page
│   │   └── components/
│   │       └── user-auth-form.tsx # Login form component
│   ├── auth-layout.tsx            # Auth pages layout (with language switcher)
│   └── otp/                       # OTP input component (ready to use)
├── services/
│   └── authService.ts             # Auth API service (includes test credentials)
├── locales/
│   ├── ar/translation.json        # Arabic translations
│   └── en/translation.json        # English translations
└── components/
    └── language-switcher.tsx      # Language switcher component
```

---

**Last Updated:** 2025-11-23
**Version:** 1.0.0
