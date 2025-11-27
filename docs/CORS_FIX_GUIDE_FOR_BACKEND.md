# CORS Fix Guide for Backend Developers

## Overview

This guide provides step-by-step instructions to fix CORS (Cross-Origin Resource Sharing) issues that prevent the frontend from communicating with the backend API.

---

## Current Problem

The frontend at `https://traf3li.vercel.app` cannot communicate with the backend at `https://api.traf3li.com` due to missing CORS headers.

### Symptoms
- API requests return `403 Forbidden`
- Browser console shows CORS errors
- No `Access-Control-Allow-Origin` header in responses
- Envoy proxy is blocking requests before they reach Node.js

### Test Results
```bash
# Preflight Request
curl -X OPTIONS https://api.traf3li.com/api/calendar \
  -H "Origin: https://traf3li.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Response: 403 Forbidden (Missing CORS headers)
```

---

## Solution 1: Node.js/Express CORS Configuration

### Step 1: Install CORS Package

```bash
npm install cors
```

### Step 2: Configure CORS Middleware

Create or update `src/middleware/cors.js`:

```javascript
const cors = require('cors');

// Allowed origins - add all your frontend domains
const allowedOrigins = [
  'https://traf3li.vercel.app',
  'https://www.traf3li.vercel.app',
  'https://traf3li.com',
  'https://www.traf3li.com',
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Alternative dev port
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // CRITICAL: Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Range',
    'X-Total-Count',
  ],
  maxAge: 86400, // Cache preflight for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

module.exports = cors(corsOptions);
```

### Step 3: Apply CORS Middleware

In your main `app.js` or `server.js`:

```javascript
const express = require('express');
const corsMiddleware = require('./middleware/cors');

const app = express();

// IMPORTANT: Apply CORS before ANY other middleware
app.use(corsMiddleware);

// Handle preflight requests explicitly
app.options('*', corsMiddleware);

// Your other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes
app.use('/api/calendar', calendarRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/cases', casesRoutes);

// ... rest of your app
```

### Step 4: Alternative - Manual CORS Headers

If you can't use the cors package, set headers manually:

```javascript
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://traf3li.vercel.app',
    'https://traf3li.com',
    'http://localhost:5173',
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});
```

---

## Solution 2: Envoy Proxy Configuration

If you're using Envoy as a proxy (common in Kubernetes/Istio), configure CORS at the Envoy level:

### envoy.yaml

```yaml
static_resources:
  listeners:
    - name: listener_0
      address:
        socket_address:
          address: 0.0.0.0
          port_value: 8080
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                stat_prefix: ingress_http
                route_config:
                  name: local_route
                  virtual_hosts:
                    - name: backend
                      domains: ["*"]
                      cors:
                        allow_origin_string_match:
                          - exact: "https://traf3li.vercel.app"
                          - exact: "https://traf3li.com"
                          - exact: "http://localhost:5173"
                        allow_methods: "GET, POST, PUT, PATCH, DELETE, OPTIONS"
                        allow_headers: "Content-Type, Authorization, X-Requested-With, Accept, Origin"
                        allow_credentials: true
                        max_age: "86400"
                      routes:
                        - match:
                            prefix: "/"
                          route:
                            cluster: backend_service
                http_filters:
                  - name: envoy.filters.http.cors
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.cors.v3.Cors
                  - name: envoy.filters.http.router
                    typed_config:
                      "@type": type.googleapis.com/envoy.extensions.filters.http.router.v3.Router
```

---

## Solution 3: Render.com Configuration

If your backend is hosted on Render.com:

### Option A: Express CORS (Recommended)

Apply the Express CORS configuration from Solution 1.

### Option B: Render Headers Configuration

In your `render.yaml`:

```yaml
services:
  - type: web
    name: traf3li-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: CORS_ORIGIN
        value: https://traf3li.vercel.app
    headers:
      - path: /*
        name: Access-Control-Allow-Origin
        value: https://traf3li.vercel.app
      - path: /*
        name: Access-Control-Allow-Credentials
        value: "true"
      - path: /*
        name: Access-Control-Allow-Methods
        value: GET, POST, PUT, PATCH, DELETE, OPTIONS
      - path: /*
        name: Access-Control-Allow-Headers
        value: Content-Type, Authorization, X-Requested-With, Accept, Origin
```

---

## Solution 4: Nginx Configuration

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name api.traf3li.com;

    # CORS headers
    add_header 'Access-Control-Allow-Origin' 'https://traf3li.vercel.app' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin' always;
    add_header 'Access-Control-Max-Age' '86400' always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://traf3li.vercel.app';
        add_header 'Access-Control-Allow-Credentials' 'true';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With, Accept, Origin';
        add_header 'Access-Control-Max-Age' '86400';
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' '0';
        return 204;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Solution 5: AWS API Gateway / CloudFront

If using AWS:

### API Gateway CORS

1. Go to API Gateway Console
2. Select your API
3. Click on each method (GET, POST, etc.)
4. Enable CORS:
   - Access-Control-Allow-Origin: `https://traf3li.vercel.app`
   - Access-Control-Allow-Headers: `Content-Type,Authorization,X-Requested-With,Accept,Origin`
   - Access-Control-Allow-Methods: `GET,POST,PUT,PATCH,DELETE,OPTIONS`
   - Access-Control-Allow-Credentials: `true`

### CloudFront Distribution

Add response headers policy:
```json
{
  "CORSPreflightHeaders": {
    "AccessControlAllowOrigins": {
      "Items": ["https://traf3li.vercel.app", "https://traf3li.com"]
    },
    "AccessControlAllowMethods": {
      "Items": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    },
    "AccessControlAllowHeaders": {
      "Items": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
    },
    "AccessControlAllowCredentials": true,
    "AccessControlMaxAgeSec": 86400
  }
}
```

---

## Verification Steps

### Step 1: Test Preflight Request

```bash
curl -X OPTIONS https://api.traf3li.com/api/calendar \
  -H "Origin: https://traf3li.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v 2>&1 | grep -i "access-control"
```

**Expected Output:**
```
< Access-Control-Allow-Origin: https://traf3li.vercel.app
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
```

### Step 2: Test Actual Request

```bash
curl -X GET https://api.traf3li.com/api/calendar \
  -H "Origin: https://traf3li.vercel.app" \
  -H "Content-Type: application/json" \
  -v 2>&1 | grep -i "access-control"
```

### Step 3: Browser Test

1. Open https://traf3li.vercel.app
2. Open Developer Tools (F12) → Network tab
3. Look for API requests
4. Check Response Headers for CORS headers

---

## Troubleshooting

### Issue: Still Getting 403 Forbidden

**Possible Causes:**
1. CORS middleware not applied before routes
2. Environment variables not loaded
3. Caching (clear CDN/proxy cache)
4. Multiple proxies (Envoy, Nginx, etc.)

**Solution:**
```javascript
// Ensure CORS is the FIRST middleware
app.use(corsMiddleware); // Must be first!
app.use(express.json());
// ... other middleware
```

### Issue: Credentials Not Working

**Problem:** Cookies not being sent/received.

**Solution:**
1. Ensure `credentials: true` in CORS config
2. Ensure `withCredentials: true` in frontend Axios config
3. Use specific origin (not `*`) when credentials are enabled

### Issue: Preflight Request Failing

**Problem:** OPTIONS request returns error.

**Solution:**
```javascript
// Explicitly handle OPTIONS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.sendStatus(204);
});
```

### Issue: Envoy Blocking Requests

**Problem:** Envoy proxy returns 403 before request reaches backend.

**Solution:**
1. Configure CORS at Envoy level (see Solution 2)
2. OR disable Envoy CORS and let backend handle it
3. Check Envoy logs for specific error messages

---

## Quick Reference: Required Headers

| Header | Value | Required For |
|--------|-------|--------------|
| Access-Control-Allow-Origin | `https://traf3li.vercel.app` | All requests |
| Access-Control-Allow-Credentials | `true` | Cookie auth |
| Access-Control-Allow-Methods | `GET, POST, PUT, PATCH, DELETE, OPTIONS` | All requests |
| Access-Control-Allow-Headers | `Content-Type, Authorization, ...` | Preflight |
| Access-Control-Max-Age | `86400` | Caching preflight |

---

## Testing Script

Save as `test-cors.sh`:

```bash
#!/bin/bash

API_URL="https://api.traf3li.com/api"
ORIGIN="https://traf3li.vercel.app"

echo "=== CORS Test Script ==="
echo ""

echo "1. Testing OPTIONS preflight..."
PREFLIGHT=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "${API_URL}/calendar" \
  -H "Origin: ${ORIGIN}" \
  -H "Access-Control-Request-Method: GET")

if [ "$PREFLIGHT" = "204" ] || [ "$PREFLIGHT" = "200" ]; then
  echo "✅ Preflight: PASS (HTTP $PREFLIGHT)"
else
  echo "❌ Preflight: FAIL (HTTP $PREFLIGHT)"
fi

echo ""
echo "2. Testing GET with CORS headers..."
HEADERS=$(curl -s -I -X GET "${API_URL}/calendar" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json" 2>&1)

if echo "$HEADERS" | grep -q "access-control-allow-origin"; then
  echo "✅ CORS Headers: PRESENT"
else
  echo "❌ CORS Headers: MISSING"
fi

echo ""
echo "3. Checking credentials support..."
if echo "$HEADERS" | grep -qi "access-control-allow-credentials: true"; then
  echo "✅ Credentials: ENABLED"
else
  echo "❌ Credentials: DISABLED"
fi

echo ""
echo "=== Full Response Headers ==="
curl -s -I -X GET "${API_URL}/calendar" \
  -H "Origin: ${ORIGIN}" \
  -H "Content-Type: application/json"
```

Run with:
```bash
chmod +x test-cors.sh
./test-cors.sh
```

---

## Deployment Checklist

- [ ] Install cors package: `npm install cors`
- [ ] Create CORS middleware configuration
- [ ] Apply CORS middleware BEFORE other middleware
- [ ] Handle OPTIONS preflight explicitly
- [ ] Set `credentials: true` for cookie support
- [ ] Add all allowed origins to whitelist
- [ ] Deploy changes to production
- [ ] Clear any CDN/proxy cache
- [ ] Run test script to verify
- [ ] Test from frontend application

---

## Contact

For questions, contact the frontend team or check the project repository.

**Last Updated:** November 27, 2025
