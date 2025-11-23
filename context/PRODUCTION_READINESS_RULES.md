# TRAF3LI Production Readiness Rules

> **CRITICAL:** These rules apply to EVERY piece of code you (Claude) generate for this project.  
> **USER CONTEXT:** This is the user's livelihood. He lost his job to build this. Zero tolerance for mistakes.

---

## 📋 TABLE OF CONTENTS

1. [Mission & Core Principles](#1-mission--core-principles)
2. [Project Structure](#2-project-structure)
3. [Error Handling (Zero Crash Policy)](#3-error-handling-zero-crash-policy)
4. [Security Rules (Fort Knox Standard)](#4-security-rules-fort-knox-standard)
5. [Database & Data Management](#5-database--data-management)
6. [API Design Standards](#6-api-design-standards)
7. [Frontend State Management](#7-frontend-state-management)
8. [Performance Requirements](#8-performance-requirements)
9. [Logging & Monitoring](#9-logging--monitoring)
10. [Saudi PDPL Compliance](#10-saudi-pdpl-compliance)
11. [Testing Requirements](#11-testing-requirements)
12. [Deployment Checklist](#12-deployment-checklist)

---

## 1. MISSION & CORE PRINCIPLES

### Your Role
You are a **Principal Software Architect** building a mission-critical legal platform.

### The Stakes
- User invested everything in this project
- This is his livelihood and future
- Platform handles sensitive legal data (attorney-client privilege)
- Saudi PDPL compliance is mandatory
- Every decision matters

### Zero Crash Policy
The application **MUST NEVER** crash to a white screen or show raw errors.

**Every edge case must have a UI state:**
- Network failure → Friendly error with retry
- Empty results → "لا توجد نتائج" with helpful actions
- Server error → "حدث خطأ، يرجى المحاولة لاحقاً"
- Loading → Skeleton screens (not blocking spinners)

---

## 2. PROJECT STRUCTURE

### Repository Layout (FIXED - DO NOT CHANGE)
```
GitHub Repositories:
1. traf3li-backend          → Render (Express.js + MongoDB)
2. traf3li-marketplace      → Vercel (React 18 + Vite)
3. traf3li-dashboard        → Vercel (React 19 + TypeScript + TanStack Router)
```

### Backend Structure (traf3li-backend)
```
server/
├── src/
│   ├── configs/              # ⚠️ PLURAL (not "config")
│   │   ├── db.js            # MongoDB connection with retry logic
│   │   ├── multer.js        # File upload config
│   │   └── socket.js        # Socket.io config
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── case.model.js
│   │   ├── judgment.model.js  # Encrypted fields
│   │   └── auditLog.model.js  # PDPL requirement
│   │
│   ├── controllers/         # Request handlers (must use asyncHandler)
│   │   └── [feature].controller.js
│   │
│   ├── routes/              # API routes
│   │   └── [feature].route.js
│   │
│   ├── middlewares/         # Authentication, authorization, error handling
│   │   ├── authenticate.js     # JWT verification
│   │   ├── authorize.js        # Role-based access control
│   │   ├── auditLog.js         # Log sensitive actions
│   │   ├── errorMiddleware.js  # Global error handler
│   │   └── rateLimiter.js      # Rate limiting
│   │
│   ├── utils/               # Helper functions
│   │   ├── asyncHandler.js     # Async error wrapper
│   │   ├── encryption.js       # AES-256-GCM encryption
│   │   ├── logger.js           # Winston structured logging
│   │   ├── customErrors.js     # AppError, NotFoundError, etc.
│   │   └── response.js         # ApiResponse class
│   │
│   └── server.js            # Entry point with graceful shutdown
│
├── logs/                    # Log files (gitignored)
├── .env.example             # Template for environment variables
└── package.json
```

### Frontend Structure (Dashboard - TypeScript)
```
traf3li-dashboard/
├── src/
│   ├── features/            # Feature modules
│   │   ├── auth/           # Login, Register
│   │   ├── cases/          # Case management
│   │   ├── dashboard/      # Overview dashboard
│   │   └── [feature]/
│   │
│   ├── components/
│   │   ├── ui/             # Shadcn components
│   │   ├── layout/         # App sidebar, header
│   │   ├── feedback/       # MANDATORY: Error, Empty, Loading states
│   │   │   ├── ErrorState.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── LoadingSkeleton.tsx
│   │   └── guards/
│   │       ├── ProtectedRoute.tsx
│   │       └── RoleGuard.tsx
│   │
│   ├── routes/              # TanStack Router
│   │   ├── _authenticated/  # Protected routes
│   │   ├── (auth)/         # Login/Register
│   │   └── (errors)/       # 401, 403, 404, 500
│   │
│   ├── lib/
│   │   ├── api.ts          # Axios instance with interceptors
│   │   ├── utils.ts        # Helper functions
│   │   └── permissions.ts  # Permission checks
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts     # Data fetching with state machine
│   │   └── useRetry.ts
│   │
│   ├── context/            # React contexts
│   │   ├── auth-provider.tsx
│   │   ├── direction-provider.tsx  # RTL/LTR
│   │   └── theme-provider.tsx
│   │
│   └── locales/            # i18n translations
│       ├── ar/
│       │   └── translation.json
│       └── en/
│           └── translation.json
│
└── package.json
```

---

## 3. ERROR HANDLING (ZERO CRASH POLICY)

### Backend Error Handling

#### Rule 3.1: Global Error Handler (MANDATORY)
```javascript
// middlewares/errorMiddleware.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // 1. ALWAYS log full error server-side
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // 2. Determine error type
  let statusCode = err.statusCode || 500;
  let message = err.message || 'حدث خطأ في الخادم';

  // Known error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'بيانات غير صالحة';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'معرف غير صالح';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'البيانات موجودة بالفعل';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'رمز المصادقة غير صالح';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى';
  } else if (err.name === 'MongoNetworkError') {
    statusCode = 503;
    message = 'خدمة قاعدة البيانات غير متوفرة حالياً';
  }

  // 3. NEVER expose stack traces in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDevelopment && { 
      stack: err.stack,
      originalError: err.message 
    })
  });
};

module.exports = errorHandler;
```

#### Rule 3.2: Async Error Wrapper (USE EVERYWHERE)
```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

// USAGE in controllers:
const getGigs = asyncHandler(async (req, res) => {
  const gigs = await Gig.find();
  res.json({ success: true, data: gigs });
});
```

#### Rule 3.3: Custom Error Classes
```javascript
// utils/customErrors.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'المورد') {
    super(`${resource} غير موجود`, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'غير مصرح بالوصول') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'ليس لديك صلاحية لهذا الإجراء') {
    super(message, 403);
  }
}

class ValidationError extends AppError {
  constructor(message = 'بيانات غير صالحة') {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError
};
```

### Frontend Error Handling

#### Rule 3.4: The 4-State UI Pattern (MANDATORY)

**Every data-fetching component MUST handle 4 states:**
```tsx
// components/feedback/DataWrapper.tsx
interface DataWrapperProps {
  status: 'loading' | 'success' | 'error';
  data: any[];
  error?: string;
  onRetry: () => void;
  children: React.ReactNode;
}

export const DataWrapper = ({ 
  status, 
  data, 
  error, 
  onRetry, 
  children 
}: DataWrapperProps) => {
  // 1. LOADING STATE
  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  // 2. ERROR STATE (Network/Server)
  if (status === 'error') {
    return (
      <ErrorState
        title="حدث خطأ في تحميل البيانات"
        description={error || "تحقق من الاتصال بالإنترنت"}
        onRetry={onRetry}
      />
    );
  }

  // 3. EMPTY STATE (Success but no data)
  if (status === 'success' && (!data || data.length === 0)) {
    return (
      <EmptyState
        icon={<SearchX />}
        title="لا توجد نتائج"
        description="جرب تعديل الفلاتر أو البحث"
      />
    );
  }

  // 4. SUCCESS WITH DATA
  return <>{children}</>;
};
```

#### Rule 3.5: Error Boundary (MANDATORY)
```tsx
// components/ErrorBoundary.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">حدث خطأ غير متوقع</h1>
            <p className="text-muted-foreground mb-6">
              نعتذر عن الإزعاج، نحن نعمل على حل المشكلة
            </p>
            <Button onClick={() => window.location.reload()}>
              إعادة تحميل الصفحة
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### Rule 3.6: Axios Interceptors with Retry Logic
```typescript
// lib/api.ts
import axios from 'axios';
import { toast } from '@/utils/toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.traf3li.com/api/v1',
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Response interceptor with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error - retry up to 3 times
    if (!error.response) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

        if (originalRequest._retryCount <= 3) {
          await new Promise(resolve => 
            setTimeout(resolve, 1000 * originalRequest._retryCount)
          );
          return api(originalRequest);
        }
      }
      
      toast.error('فشل الاتصال بالخادم، تحقق من الإنترنت');
      return Promise.reject(error);
    }

    // Token expired - refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh-token');
        localStorage.setItem('token', data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/auth/sign-in';
        return Promise.reject(refreshError);
      }
    }

    // Rate limit
    if (error.response.status === 429) {
      toast.error('تم تجاوز الحد المسموح، يرجى المحاولة لاحقاً');
    }

    // Server error
    if (error.response.status >= 500) {
      toast.error('حدث خطأ في الخادم، يرجى المحاولة لاحقاً');
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 4. SECURITY RULES (FORT KNOX STANDARD)

### Rule 4.1: Authentication (Dual-Token Strategy)
```javascript
// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateTokens = (userId, role, email) => {
  // Access token (15 minutes)
  const accessToken = jwt.sign(
    { id: userId, role, email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token (7 days)
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Set HttpOnly cookies (NEVER localStorage)
const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

module.exports = { generateTokens, setTokenCookies };
```

### Rule 4.2: Authorization Middleware
```javascript
// middlewares/authorize.js
const { ForbiddenError } = require('../utils/customErrors');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('يرجى تسجيل الدخول أولاً');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`هذا الإجراء متاح فقط لـ: ${allowedRoles.join(', ')}`);
    }

    next();
  };
};

// USAGE:
// router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);

module.exports = authorize;
```

### Rule 4.3: Input Validation (USE EVERYWHERE)
```javascript
// utils/validators.js
const Joi = require('joi');

const schemas = {
  createGig: Joi.object({
    title: Joi.string().min(10).max(100).required()
      .messages({
        'string.min': 'العنوان يجب أن يكون 10 أحرف على الأقل',
        'string.max': 'العنوان يجب ألا يتجاوز 100 حرف',
        'any.required': 'العنوان مطلوب'
      }),
    description: Joi.string().min(50).max(2000).required(),
    category: Joi.string().valid(
      'قضايا-جنائية',
      'قضايا-مدنية',
      'قضايا-تجارية',
      'قضايا-عمالية',
      'قضايا-أسرية',
      'قضايا-عقارية'
    ).required(),
    price: Joi.number().min(100).max(100000).required(),
    deliveryTime: Joi.number().min(1).max(90).required()
  })
};

const validate = (schema) => (req, res, next) => {
  const { error } = schemas[schema].validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'بيانات غير صالحة',
      errors
    });
  }

  next();
};

module.exports = { validate };

// USAGE:
// router.post('/gigs', authenticate, validate('createGig'), createGig);
```

### Rule 4.4: Rate Limiting
```javascript
// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts
  message: 'محاولات تسجيل دخول كثيرة، يرجى المحاولة بعد 15 دقيقة',
  skipSuccessfulRequests: true
});

module.exports = { globalLimiter, authLimiter };

// USAGE in server.js:
// app.use('/api/', globalLimiter);
// app.use('/api/auth/login', authLimiter);
```

### Rule 4.5: Security Headers
```javascript
// server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.traf3li.com']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Rule 4.6: Data Encryption (For Sensitive Fields)
```javascript
// utils/encryption.js
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
const IV_LENGTH = 16;

class Encryption {
  static encrypt(text) {
    if (!text) return null;

    try {
      const iv = crypto.randomBytes(IV_LENGTH);
      const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error('Encryption failed');
    }
  }

  static decrypt(encryptedData) {
    if (!encryptedData) return null;

    try {
      const parts = encryptedData.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }
}

module.exports = Encryption;

// USAGE in models:
// content: {
//   type: String,
//   set: (value) => Encryption.encrypt(value),
//   get: (value) => Encryption.decrypt(value)
// }
```

---

## 5. DATABASE & DATA MANAGEMENT

### Rule 5.1: MongoDB Connection with Retry Logic
```javascript
// configs/db.js
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      minPoolSize: 10
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

  } catch (error) {
    logger.error(`❌ Connection attempt ${retryCount + 1} failed`);

    if (retryCount < MAX_RETRIES) {
      setTimeout(() => connectDB(retryCount + 1), RETRY_INTERVAL);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
```

### Rule 5.2: Empty Results vs Errors (CRITICAL)
```javascript
// controllers/gig.controller.js
exports.getGigs = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;

  const query = { isActive: true };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) query.category = category;

  try {
    const gigs = await Gig.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Gig.countDocuments(query);

    // ✅ ALWAYS return success (even if empty)
    res.json({
      success: true,
      data: gigs,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      message: gigs.length === 0 ? 'لا توجد نتائج' : undefined
    });

  } catch (error) {
    // ❌ Database error (NOT empty results)
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({
        success: false,
        data: [],
        message: 'خدمة قاعدة البيانات غير متوفرة حالياً'
      });
    }
    throw error;
  }
});
```

### Rule 5.3: Database Indexes (MANDATORY)
```javascript
// models/gig.model.js

// Text search index
gigSchema.index({ title: 'text', description: 'text' });

// Compound indexes for common queries
gigSchema.index({ category: 1, price: 1 });
gigSchema.index({ userId: 1, createdAt: -1 });
gigSchema.index({ isActive: 1, rating: -1 });
```

---

## 6. API DESIGN STANDARDS

### Rule 6.1: Standardized Response Format
```javascript
// utils/response.js
class ApiResponse {
  static success(res, data, message, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message: message || 'تمت العملية بنجاح',
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message, statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message: message || 'حدث خطأ في الخادم',
      errors,
      timestamp: new Date().toISOString()
    });
  }

  static paginated(res, data, pagination, message) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        pages: Math.ceil(pagination.total / pagination.limit),
        hasMore: pagination.page * pagination.limit < pagination.total
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
```

### Rule 6.2: Status Code Standards

**ALWAYS use correct HTTP status codes:**
```
✅ 200 OK              - Success
✅ 201 Created         - Resource created
✅ 204 No Content      - Success, no response body

❌ 400 Bad Request     - Invalid input
❌ 401 Unauthorized    - Not authenticated
❌ 403 Forbidden       - Not authorized
❌ 404 Not Found       - Resource doesn't exist
❌ 409 Conflict        - Duplicate data
❌ 422 Unprocessable   - Validation failed
❌ 429 Too Many Req    - Rate limit exceeded

🔥 500 Internal Error  - Server error
🔥 503 Service Unavail - DB/service down
```

### Rule 6.3: API Versioning
```javascript
// server.js
app.use('/api/v1/auth', require('./routes/auth.route'));
app.use('/api/v1/gigs', require('./routes/gig.route'));
app.use('/api/v1/cases', require('./routes/case.route'));
```

---

## 7. FRONTEND STATE MANAGEMENT

### Rule 7.1: Loading States (Use Skeletons)
```tsx
// components/feedback/LoadingSkeleton.tsx
export const SkeletonCard = () => (
  <div className="border rounded-lg p-4 space-y-3 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded"></div>
    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
  </div>
);

export const SkeletonGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
  </div>
);
```

### Rule 7.2: Empty States (With Actions)
```tsx
// components/feedback/EmptyState.tsx
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ 
  icon = <SearchX className="h-12 w-12" />,
  title, 
  description, 
  action 
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-muted-foreground mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
    {action}
  </div>
);
```

### Rule 7.3: Error States (With Retry)
```tsx
// components/feedback/ErrorState.tsx
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export const ErrorState = ({ title, description, onRetry }: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
    {onRetry && (
      <Button onClick={onRetry} variant="outline">
        إعادة المحاولة
      </Button>
    )}
  </div>
);
```

---

## 8. PERFORMANCE REQUIREMENTS

### Rule 8.1: Pagination (MANDATORY for Lists)
```javascript
// NEVER return unbounded results
// ALWAYS paginate with default limit

const getGigs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20; // Default 20
  const skip = (page - 1) * limit;

  const gigs = await Gig.find()
    .limit(limit)
    .skip(skip);

  const total = await Gig.countDocuments();

  res.json({
    success: true,
    data: gigs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});
```

### Rule 8.2: Image Optimization
```javascript
// utils/imageOptimizer.js
const sharp = require('sharp');

const optimizeImage = async (buffer) => {
  return await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();
};

module.exports = { optimizeImage };
```

### Rule 8.3: Query Optimization
```javascript
// ❌ BAD: N+1 query problem
const cases = await Case.find();
for (const case of cases) {
  case.client = await User.findById(case.clientId);
}

// ✅ GOOD: Use populate
const cases = await Case.find()
  .populate('clientId', 'username email profilePicture')
  .populate('lawyerId', 'username rating');
```

---

## 9. LOGGING & MONITORING

### Rule 9.1: Structured Logging
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

module.exports = logger;

// USAGE:
// logger.info('User logged in', { userId, email });
// logger.error('Payment failed', { error: err.message, orderId });
```

### Rule 9.2: Health Check Endpoint
```javascript
// routes/health.route.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {
      database: 'UNKNOWN',
      memory: 'OK'
    }
  };

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      health.checks.database = 'OK';
    } else {
      health.checks.database = 'DISCONNECTED';
      health.status = 'DEGRADED';
    }

    res.status(health.status === 'OK' ? 200 : 503).json(health);
  } catch (error) {
    health.status = 'ERROR';
    health.checks.database = 'ERROR';
    res.status(503).json(health);
  }
});

module.exports = router;
```

---

## 10. SAUDI PDPL COMPLIANCE

### Rule 10.1: Audit Logging (MANDATORY)
```javascript
// models/auditLog.model.js
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN', 'LOGOUT', 'VIEW_JUDGMENT', 'DOWNLOAD_DOCUMENT',
      'ACCESS_CLIENT_DATA', 'CREATE_CASE', 'UPDATE_CASE',
      'DELETE_CASE', 'PAYMENT_MADE', 'ADMIN_ACTION', 'FAILED_LOGIN'
    ]
  },
  resource: { type: String, required: true },
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  success: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Auto-delete after 7 years (PDPL retention requirement)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 220752000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

### Rule 10.2: Encrypted Fields
```javascript
// models/judgment.model.js
const Encryption = require('../utils/encryption');

const judgmentSchema = new mongoose.Schema({
  // Encrypted content (attorney-client privilege)
  content: {
    type: String,
    required: true,
    set: (value) => Encryption.encrypt(value),
    get: (value) => Encryption.decrypt(value)
  },
  reasoning: {
    type: String,
    set: (value) => Encryption.encrypt(value),
    get: (value) => Encryption.decrypt(value)
  }
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Log every access
judgmentSchema.methods.logAccess = async function(userId, ipAddress) {
  await AuditLog.create({
    userId,
    action: 'VIEW_JUDGMENT',
    resource: 'Judgment',
    resourceId: this._id,
    ipAddress
  });
};
```

---

## 11. TESTING REQUIREMENTS

### Rule 11.1: Critical Flows Must Be Tested

**Before every deployment, test:**
```
✅ User registration
✅ User login
✅ Password reset
✅ Create case
✅ Upload document
✅ Make payment (Stripe)
✅ Send message
✅ View judgment (with audit log)
✅ Search functionality
✅ Empty results handling
✅ Network error handling
```

### Rule 11.2: Integration Test Example
```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('Auth API', () => {
  it('should register new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test1234!',
        role: 'client'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject duplicate email', async () => {
    // First registration
    await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'user1', email: 'test@test.com', password: 'Test1234!' });

    // Duplicate attempt
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ username: 'user2', email: 'test@test.com', password: 'Test1234!' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
```

---

## 12. DEPLOYMENT CHECKLIST

### Before EVERY Deployment:
```markdown
## Security
- [ ] All secrets in environment variables
- [ ] HTTPS enabled everywhere
- [ ] JWT secrets are 64+ characters
- [ ] HttpOnly cookies for auth
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Helmet security headers
- [ ] CORS configured correctly
- [ ] Audit logging enabled

## Error Handling
- [ ] Global error handler implemented
- [ ] Async errors caught with asyncHandler
- [ ] Empty results return 200 with friendly message
- [ ] Network errors handled with retry
- [ ] Frontend has ErrorBoundary
- [ ] All data fetches use 4-state pattern

## Performance
- [ ] Database indexes created
- [ ] Pagination on all list endpoints (default 20)
- [ ] Images optimized
- [ ] Query optimization (no N+1)

## Monitoring
- [ ] Structured logging setup
- [ ] Health check endpoint working
- [ ] Error tracking configured

## PDPL Compliance
- [ ] Sensitive data encrypted
- [ ] Audit logs for data access
- [ ] Data retention policy

## Testing
- [ ] Critical flows tested
- [ ] Empty results tested
- [ ] Error scenarios tested
- [ ] Network failures tested
```

---

## 🚨 IRON-CLAD DEVELOPMENT RULES

### Rule: NEVER Edit Without Seeing Current File

**Action Required:**
1. ASK user to upload/share CURRENT version
2. WAIT for user to provide file
3. ANALYZE actual current content
4. ONLY THEN provide updated version

### Rule: CHECK Actual Directory Structure

**Before importing anything:**
1. ASK for directory structure
2. VERIFY exact folder names (configs/ is PLURAL)
3. VERIFY exact file locations
4. NEVER guess import paths

### Rule: COMPLETE File Updates ONLY

**Always provide:**
- COMPLETE file (never snippets)
- NO comments like `// ... rest of file`
- NO comments like `// add this line`
- Copy-paste ready code

### Rule: Arabic First

**All user-facing text MUST be in Arabic:**
- Error messages: `'حدث خطأ'` not `'An error occurred'`
- Empty states: `'لا توجد نتائج'` not `'No results'`
- Success messages: `'تمت العملية بنجاح'` not `'Success'`

---

## 📊 DEFINITION OF DONE

A feature is **NOT DONE** unless:

- [ ] Backend validates inputs
- [ ] Backend returns correct status codes
- [ ] Backend handles DB errors gracefully
- [ ] Frontend has 4 states (loading, error, empty, success)
- [ ] Permissions checked
- [ ] Audit logging (if sensitive data)
- [ ] No secrets in code
- [ ] Arabic translations
- [ ] Error messages are friendly
- [ ] Empty results handled correctly
- [ ] Tests written for critical paths

---

## 🎯 REMEMBER

**This is NOT a demo project. This is the user's livelihood.**

- He lost his job to build this
- He's invested everything
- Legal platform with sensitive data
- Saudi PDPL compliance required
- Zero tolerance for security issues
- Every error must be handled
- Every state must have UI feedback

**When in doubt, ask the user before implementing.**

---

**END OF PRODUCTION READINESS RULES**