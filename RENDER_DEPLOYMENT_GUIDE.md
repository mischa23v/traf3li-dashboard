# 🚀 Render.com Backend Deployment Guide

**Backend URL:** https://api.traf3li.com
**Platform:** Render.com
**Status:** CORS configuration needs to be deployed

---

## 📋 Overview

Your backend is hosted on Render.com. To fix the CORS issue, we need to:

1. ✅ Verify CORS code is in your backend repository (already done)
2. 🔄 Deploy the CORS configuration to Render
3. ✅ Verify it's working

---

## 🎯 Step-by-Step Deployment

### Step 1: Access Render Dashboard

1. Go to https://dashboard.render.com
2. Log in to your account
3. Find your backend service (should be named something like `traf3li-backend` or `traf3li-api`)
4. Click on it to open the service details

### Step 2: Check Current Deployment Status

In your service dashboard, you should see:
- **Latest Deploy** - When was the last deployment?
- **Status** - Is it "Live" or "Deploy failed"?
- **Branch** - Which git branch is deployed? (usually `main` or `master`)

### Step 3: Deploy CORS Configuration

Render.com typically auto-deploys when you push to your connected git repository.

#### Option A: Automatic Deployment (Recommended)

If your backend repository has auto-deploy enabled:

1. **Check if CORS code exists in your backend repo:**
   ```bash
   # Navigate to your backend repository
   cd /path/to/your/backend/repo

   # Check if CORS configuration is present
   grep -r "cors" src/server.js
   # or
   grep -r "Access-Control" src/
   ```

2. **If CORS code is already in the repo:**
   - Go to Render dashboard → Your service
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait 2-3 minutes for deployment to complete

3. **If CORS code is NOT in the repo:**
   - You need to add the CORS configuration first
   - See "Adding CORS Configuration" section below

#### Option B: Manual Deploy via Git Push

1. **Navigate to your backend repository:**
   ```bash
   cd /path/to/your/backend/repository
   ```

2. **Verify CORS code is present:**
   ```bash
   # Check for CORS middleware in server.js
   cat src/server.js | grep -A 10 "cors"
   ```

3. **If CORS code exists, push to trigger deploy:**
   ```bash
   git status
   git pull origin main  # or master
   git push origin main  # This triggers Render deployment
   ```

4. **Watch the deployment in Render dashboard:**
   - Go to Render dashboard → Your service → **Logs**
   - You should see build and deployment logs
   - Wait for "Deploy live" message

### Step 4: Verify Deployment

#### In Render Dashboard:

1. Go to your service page
2. Check that:
   - ✅ Status shows **"Live"**
   - ✅ Latest deploy timestamp is recent (just now)
   - ✅ Deploy log shows **"Build successful"**

#### Check Logs:

1. In Render dashboard, click **"Logs"** tab
2. Look for these startup messages:
   ```
   🚀 Server running on port 8080
   🌍 Environment: production
   🔐 CORS enabled for:
     - https://traf3li.com
     - https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app
     - *.vercel.app domains
   ```

3. If you DON'T see CORS messages:
   - CORS configuration may not be in the deployed code
   - See "Adding CORS Configuration" section

### Step 5: Test CORS

From your local machine, run:

```bash
cd /path/to/traf3li-dashboard
./test-cors.sh
```

**Expected output after successful deployment:**
```
✅ Status: 200 (OK)
✅ Access-Control-Allow-Origin header present
✅ Access-Control-Allow-Credentials: true
✅ CORS working!
```

**If still getting 403:**
- Check Render logs for errors
- Verify environment variables are set
- Try manual restart (see Step 6)

---

## 🔧 Adding CORS Configuration (If Not Present)

If your backend doesn't have CORS configuration yet:

### 1. Navigate to Backend Repository

```bash
cd /path/to/your/backend/repository
```

### 2. Install CORS Package

```bash
npm install cors
```

### 3. Add CORS to server.js

Edit `src/server.js` (or your main server file):

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://traf3li.com',
  'https://dashboard.traf3li.com',
  'https://traf3li-dashboard-9e4y2s2su-mischa-alrabehs-projects.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all Vercel deployments
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Check against whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware BEFORE routes
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Your other middleware
app.use(express.json());

// Your routes
// ...

// Log CORS configuration on startup
console.log('🔐 CORS enabled for:');
allowedOrigins.forEach(origin => console.log(`  - ${origin}`));
console.log('  - All *.vercel.app domains');

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
```

### 4. Update Cookie Configuration

If you're using cookies for authentication, update cookie settings:

```javascript
// When setting cookies
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

### 5. Commit and Push

```bash
git add .
git commit -m "Add CORS configuration for Vercel deployment"
git push origin main
```

Render will automatically detect the push and deploy!

---

## 🔄 Step 6: Manual Restart (If Needed)

If deployment succeeded but CORS still doesn't work:

1. Go to Render dashboard → Your service
2. Click **"Manual Deploy"** dropdown
3. Select **"Clear build cache & deploy"**
4. Wait for deployment to complete
5. Run `./test-cors.sh` again

---

## 🌍 Environment Variables

Verify these environment variables are set in Render:

### Required Variables:

1. In Render dashboard → Your service → **Environment**
2. Check that these are set:

```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://...your-connection-string
JWT_SECRET=your-secret-key
```

### Optional (for additional origins):

```bash
ALLOWED_ORIGINS=https://traf3li.com,https://dashboard.traf3li.com
```

### How to Add/Edit Environment Variables:

1. Go to your service → **Environment** tab
2. Click **"Add Environment Variable"**
3. Enter key and value
4. Click **"Save Changes"**
5. **Important:** After adding variables, click **"Manual Deploy"** to redeploy

---

## 🔍 Troubleshooting

### Issue 1: Deployment Succeeds but CORS Still Blocked

**Check:**
1. **Logs:** Go to Logs tab, look for CORS startup messages
2. **Build output:** Verify `npm install cors` ran successfully
3. **Environment:** Verify `NODE_ENV=production` is set

**Solution:**
- Try "Clear build cache & deploy"
- Check that CORS middleware is applied BEFORE routes
- Verify no other middleware is intercepting requests

### Issue 2: Build Fails

**Check:**
1. Logs tab for error messages
2. Make sure `cors` is in `package.json` dependencies
3. Check Node.js version compatibility

**Solution:**
```bash
# In your backend repo
npm install cors --save
git add package.json package-lock.json
git commit -m "Add cors to dependencies"
git push origin main
```

### Issue 3: 403 Forbidden Persists

**Possible causes:**
1. **Envoy proxy in front of Render**
   - Some custom domain setups add additional proxies
   - May need to configure at DNS/proxy level

2. **Custom domain configuration**
   - Check Render custom domain settings
   - Verify SSL certificate is active

3. **Web Application Firewall (WAF)**
   - Some plans include WAF
   - May need to whitelist Vercel IPs

**Solution:**
- Contact Render support
- Check Render custom domain configuration
- Verify no additional security layers

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Render dashboard shows "Live" status
- [ ] Recent deployment timestamp (within last few minutes)
- [ ] Logs show CORS startup messages
- [ ] `./test-cors.sh` returns all ✅
- [ ] Vercel app can connect to backend
- [ ] Login works on Vercel deployment
- [ ] Dashboard loads data

---

## 📊 Render.com Specific Notes

### Auto-Deploy

Render automatically deploys when you push to your connected branch:
- Default branch: `main` or `master`
- Deploy trigger: Any push to branch
- Build time: Usually 2-5 minutes
- Deploy time: Usually 30-60 seconds

### Viewing Logs

Real-time logs are available in:
1. Dashboard → Your service → **Logs** tab
2. Or via Render CLI:
   ```bash
   render logs <service-name>
   ```

### Health Checks

Render performs health checks:
- Default: HTTP GET to root path `/`
- Can be customized in service settings
- Service marked unhealthy if checks fail

### Zero-Downtime Deploys

Render performs zero-downtime deployments:
- New version starts before old version stops
- Health checks verify new version is ready
- Old version only stops when new is healthy

---

## 🆘 Getting Help

### Render Support

If you continue to have issues:

1. **Render Support:** https://render.com/docs/support
2. **Community:** https://community.render.com
3. **Status Page:** https://status.render.com

### Include This Info:

- Service name: `<your-service-name>`
- Service URL: `api.traf3li.com`
- Issue: "CORS returning 403 Forbidden for Vercel origin"
- Error: "Access-Control-Allow-Origin header missing"

---

## 🚀 Quick Deploy Commands

```bash
# Navigate to backend repo
cd /path/to/backend

# Ensure latest code
git pull origin main

# Check CORS configuration exists
grep -r "cors" src/server.js

# If needed, add and commit CORS code
git add .
git commit -m "Add CORS configuration"

# Push to trigger Render deployment
git push origin main

# Wait 2-3 minutes, then test
cd /path/to/traf3li-dashboard
./test-cors.sh
```

---

## 📖 Additional Resources

- **Render Docs:** https://render.com/docs
- **Node.js on Render:** https://render.com/docs/deploy-node-express-app
- **Environment Variables:** https://render.com/docs/environment-variables
- **Custom Domains:** https://render.com/docs/custom-domains
- **CORS Guide:** See `BACKEND_CORS_CONFIG.md` in this repo

---

**Ready to deploy! Follow the steps above and run `./test-cors.sh` after deployment to verify.** 🎉
