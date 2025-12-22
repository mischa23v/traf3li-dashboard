/**
 * SECURE TOKEN IMPLEMENTATION
 * Complete reference implementation for JWT token security
 *
 * This file provides secure, production-ready code to fix token vulnerabilities
 * identified in the security audit.
 */

// ============================================================================
// 1. UPDATED USER MODEL - Add refresh token tracking
// File: /src/models/user.model.js
// ============================================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // ... existing fields (username, email, password, etc.) ...

    // ADD THESE FIELDS FOR TOKEN MANAGEMENT:
    refreshTokens: [{
        token: {
            type: String,
            required: true
        },
        family: {
            type: String,  // Token family ID for theft detection
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            required: true
        },
        device: String,  // User agent for device tracking
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }],

    tokenBlacklist: [{
        jti: {
            type: String,  // JWT ID for unique token identification
            required: true,
            index: true
        },
        expiresAt: {
            type: Date,
            required: true
        },
        reason: String  // Why token was blacklisted
    }],

    lastPasswordChange: Date,  // Invalidate tokens on password change

    // ... rest of existing schema ...
}, {
    versionKey: false,
    timestamps: true
});

// Index for efficient blacklist lookup
userSchema.index({ 'tokenBlacklist.jti': 1, 'tokenBlacklist.expiresAt': 1 });

// Index for cleanup of expired tokens
userSchema.index({ 'refreshTokens.expiresAt': 1 });
userSchema.index({ 'tokenBlacklist.expiresAt': 1 });

module.exports = mongoose.model('User', userSchema);

// ============================================================================
// 2. ENHANCED TOKEN GENERATION UTILITY
// File: /src/utils/generateToken.js (UPDATE EXISTING)
// ============================================================================

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate access token with enhanced security
 */
const generateAccessToken = (user) => {
    try {
        const { accessSecret } = getSecrets();

        const payload = {
            id: user._id.toString(),
            email: user.email,
            jti: uuidv4(), // Unique token ID for revocation
            type: 'access', // Token type identification
        };

        const options = {
            expiresIn: '15m',
            issuer: 'traf3li',
            audience: 'traf3li-users',
            algorithm: 'HS256', // Explicitly specify algorithm
            notBefore: 0, // Token valid immediately
        };

        return jwt.sign(payload, accessSecret, options);
    } catch (error) {
        console.error('❌ Access token generation failed:', error.message);
        throw new Error('Token generation failed');
    }
};

/**
 * Generate refresh token with minimal payload
 */
const generateRefreshToken = (user, family = null) => {
    try {
        const { refreshSecret } = getSecrets();

        const payload = {
            id: user._id.toString(),
            jti: uuidv4(),
            type: 'refresh',
            family: family || uuidv4(), // Token family for rotation tracking
        };

        const options = {
            expiresIn: '7d',
            issuer: 'traf3li',
            audience: 'traf3li-users',
            algorithm: 'HS256',
        };

        return jwt.sign(payload, refreshSecret, options);
    } catch (error) {
        console.error('❌ Refresh token generation failed:', error.message);
        throw new Error('Token generation failed');
    }
};

/**
 * Enhanced verify with comprehensive validation
 */
const verifyAccessToken = (token) => {
    try {
        const { accessSecret } = getSecrets();

        const options = {
            issuer: 'traf3li',
            audience: 'traf3li-users',
            algorithms: ['HS256'], // Prevent algorithm confusion attacks
        };

        const decoded = jwt.verify(token, accessSecret, options);

        // Validate token type
        if (decoded.type !== 'access') {
            throw new Error('INVALID_TOKEN_TYPE');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('TOKEN_EXPIRED');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('INVALID_TOKEN');
        }
        if (error.name === 'NotBeforeError') {
            throw new Error('TOKEN_NOT_YET_VALID');
        }
        throw new Error('TOKEN_VERIFICATION_FAILED');
    }
};

// Export all functions
module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    getTokenExpiration,
    isTokenExpired,
};

// ============================================================================
// 3. UPDATED AUTH CONTROLLER - Secure implementation
// File: /src/controllers/auth.controller.js (REPLACE LOGIN/LOGOUT)
// ============================================================================

const { User } = require('../models');
const { CustomException } = require('../utils');
const { generateTokenPair } = require('../utils/generateToken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

/**
 * Login with dual-token system
 */
const authLogin = async (request, response) => {
    const { username, password } = request.body;

    try {
        // Find user by username or email
        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            throw CustomException('Check username or password!', 404);
        }

        // Verify password
        const match = bcrypt.compareSync(password, user.password);

        if (!match) {
            throw CustomException('Check username or password!', 404);
        }

        // Generate token pair
        const { accessToken, refreshToken } = generateTokenPair(user);

        // Decode to get metadata
        const jwt = require('jsonwebtoken');
        const refreshDecoded = jwt.decode(refreshToken);

        // Hash refresh token before storing (NEVER store plaintext)
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        // Store refresh token in database
        await User.findByIdAndUpdate(user._id, {
            $push: {
                refreshTokens: {
                    token: refreshTokenHash,
                    family: refreshDecoded.family,
                    createdAt: new Date(),
                    expiresAt: new Date(refreshDecoded.exp * 1000),
                    device: request.headers['user-agent'] || 'unknown',
                    lastUsed: new Date()
                }
            }
        });

        // Cleanup old refresh tokens (keep max 5 per user)
        await User.findByIdAndUpdate(user._id, {
            $push: {
                refreshTokens: {
                    $each: [],
                    $slice: -5 // Keep only last 5 tokens
                }
            }
        });

        // Auto-detect localhost
        const origin = request.get('origin') || '';
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

        // Cookie configuration
        const cookieConfig = {
            httpOnly: true,
            sameSite: isLocalhost ? 'lax' : 'strict', // Use 'strict' for CSRF protection
            secure: !isLocalhost,
            path: '/'
        };

        // Set access token cookie (short-lived)
        response.cookie('accessToken', accessToken, {
            ...cookieConfig,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        // Set refresh token cookie (long-lived, path-restricted)
        response.cookie('refreshToken', refreshToken, {
            ...cookieConfig,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth' // Restrict to auth routes only
        });

        // Remove sensitive data before returning
        const { password: _, ...userData } = user._doc;

        return response.status(200).json({
            error: false,
            message: 'Success!',
            user: userData
        });

    } catch ({ message, status = 500 }) {
        return response.status(status).send({
            error: true,
            message
        });
    }
};

/**
 * Refresh token endpoint - NEW
 */
const authRefresh = async (request, response) => {
    try {
        const { refreshToken } = request.cookies;

        if (!refreshToken) {
            throw CustomException('No refresh token provided', 401);
        }

        // Verify refresh token
        const { verifyRefreshToken } = require('../utils/generateToken');
        const decoded = verifyRefreshToken(refreshToken);

        // Hash the provided token
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        // Find user and validate refresh token exists
        const user = await User.findOne({
            _id: decoded.id,
            'refreshTokens.token': refreshTokenHash
        });

        if (!user) {
            // CRITICAL: Possible token theft detected!
            // Revoke all tokens in this family
            await User.findByIdAndUpdate(decoded.id, {
                $pull: {
                    refreshTokens: { family: decoded.family }
                }
            });

            throw CustomException('Invalid refresh token - security breach detected', 401);
        }

        // Find the specific token document
        const tokenDoc = user.refreshTokens.find(t => t.token === refreshTokenHash);

        // Check if token expired
        if (new Date() > tokenDoc.expiresAt) {
            // Remove expired token
            await User.findByIdAndUpdate(user._id, {
                $pull: { refreshTokens: { token: refreshTokenHash } }
            });
            throw CustomException('Refresh token expired', 401);
        }

        // Generate NEW token pair
        const { accessToken, refreshToken: newRefreshToken } =
            generateTokenPair(user, tokenDoc.family); // Same family

        // Hash new refresh token
        const jwt = require('jsonwebtoken');
        const newRefreshDecoded = jwt.decode(newRefreshToken);
        const newRefreshTokenHash = crypto
            .createHash('sha256')
            .update(newRefreshToken)
            .digest('hex');

        // ROTATE: Remove old token, add new token
        await User.findByIdAndUpdate(user._id, {
            $pull: { refreshTokens: { token: refreshTokenHash } },
            $push: {
                refreshTokens: {
                    token: newRefreshTokenHash,
                    family: tokenDoc.family, // Same family
                    createdAt: new Date(),
                    expiresAt: new Date(newRefreshDecoded.exp * 1000),
                    device: request.headers['user-agent'] || 'unknown',
                    lastUsed: new Date()
                }
            }
        });

        // Auto-detect localhost
        const origin = request.get('origin') || '';
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

        const cookieConfig = {
            httpOnly: true,
            sameSite: isLocalhost ? 'lax' : 'strict',
            secure: !isLocalhost,
            path: '/'
        };

        // Set new cookies
        response.cookie('accessToken', accessToken, {
            ...cookieConfig,
            maxAge: 15 * 60 * 1000
        });

        response.cookie('refreshToken', newRefreshToken, {
            ...cookieConfig,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/api/auth'
        });

        return response.status(200).json({
            error: false,
            message: 'Token refreshed successfully'
        });

    } catch ({ message, status = 500 }) {
        return response.status(status).json({
            error: true,
            message
        });
    }
};

/**
 * Logout with token revocation
 */
const authLogout = async (request, response) => {
    try {
        const { refreshToken, accessToken } = request.cookies;

        // Revoke refresh token
        if (refreshToken) {
            const refreshTokenHash = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');

            await User.findByIdAndUpdate(request.userID, {
                $pull: { refreshTokens: { token: refreshTokenHash } }
            });
        }

        // Blacklist access token (if JTI available)
        if (accessToken) {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.decode(accessToken);

            if (decoded && decoded.jti) {
                await User.findByIdAndUpdate(request.userID, {
                    $push: {
                        tokenBlacklist: {
                            jti: decoded.jti,
                            expiresAt: new Date(decoded.exp * 1000),
                            reason: 'manual_logout'
                        }
                    }
                });
            }
        }

        // Auto-detect localhost
        const origin = request.get('origin') || '';
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

        // Clear cookies
        response.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: isLocalhost ? 'lax' : 'strict',
            secure: !isLocalhost,
            path: '/'
        });

        response.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: isLocalhost ? 'lax' : 'strict',
            secure: !isLocalhost,
            path: '/api/auth'
        });

        return response.status(200).json({
            error: false,
            message: 'Logged out successfully'
        });

    } catch ({ message, status = 500 }) {
        return response.status(status).json({
            error: true,
            message
        });
    }
};

/**
 * Logout all devices - NEW
 */
const authLogoutAll = async (request, response) => {
    try {
        // Remove all refresh tokens
        await User.findByIdAndUpdate(request.userID, {
            $set: { refreshTokens: [] }
        });

        // Note: Access tokens will expire naturally (15 min max)
        // Or blacklist all if needed

        // Clear cookies on this device
        const origin = request.get('origin') || '';
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

        response.clearCookie('accessToken', {
            httpOnly: true,
            sameSite: isLocalhost ? 'lax' : 'strict',
            secure: !isLocalhost,
            path: '/'
        });

        response.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: isLocalhost ? 'lax' : 'strict',
            secure: !isLocalhost,
            path: '/api/auth'
        });

        return response.status(200).json({
            error: false,
            message: 'Logged out from all devices'
        });

    } catch ({ message, status = 500 }) {
        return response.status(status).json({
            error: true,
            message
        });
    }
};

module.exports = {
    authLogin,
    authLogout,
    authRegister, // Keep existing
    authStatus,   // Keep existing
    authRefresh,  // NEW
    authLogoutAll // NEW
};

// ============================================================================
// 4. ENHANCED AUTHENTICATION MIDDLEWARE
// File: /src/middlewares/authenticate.js (REPLACE)
// ============================================================================

const jwt = require('jsonwebtoken');
const { CustomException } = require('../utils');
const { verifyAccessToken } = require('../utils/generateToken');
const { User } = require('../models');

const authenticate = async (request, response, next) => {
    try {
        const { accessToken } = request.cookies;

        if (!accessToken) {
            throw CustomException('Access denied - No token provided', 401);
        }

        // Verify token signature and claims
        const decoded = verifyAccessToken(accessToken);

        // Check if token is blacklisted
        const user = await User.findOne({
            _id: decoded.id,
            'tokenBlacklist.jti': decoded.jti
        });

        if (user) {
            throw CustomException('Token has been revoked', 401);
        }

        // Check if user still exists
        const activeUser = await User.findById(decoded.id);
        if (!activeUser) {
            throw CustomException('User no longer exists', 401);
        }

        // Check if password changed after token issued
        if (activeUser.lastPasswordChange) {
            const tokenIssuedAt = new Date(decoded.iat * 1000);
            if (activeUser.lastPasswordChange > tokenIssuedAt) {
                throw CustomException('Password changed - Please re-login', 401);
            }
        }

        // Attach user info to request
        request.userID = decoded.id;
        request.userEmail = decoded.email;
        request.tokenJti = decoded.jti; // For potential revocation

        // Fetch current role from database (don't trust token)
        request.userRole = activeUser.role;
        request.isSeller = activeUser.isSeller;

        next();

    } catch ({ message, status = 401 }) {
        return response.status(status).json({
            error: true,
            message
        });
    }
};

module.exports = authenticate;

// ============================================================================
// 5. UPDATED AUTH ROUTES
// File: /src/routes/auth.route.js (UPDATE)
// ============================================================================

const express = require('express');
const {
    authLogin,
    authLogout,
    authRegister,
    authStatus,
    authRefresh,
    authLogoutAll
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares');
const { authRateLimiter } = require('../middlewares/rateLimiter.middleware');

const app = express.Router();

// Public routes (with rate limiting)
app.post('/register', authRateLimiter, authRegister);
app.post('/login', authRateLimiter, authLogin);

// Protected routes
app.post('/refresh', authRefresh); // Special: uses refreshToken cookie
app.post('/logout', authenticate, authLogout);
app.post('/logout-all', authenticate, authLogoutAll);
app.get('/me', authenticate, authStatus);

module.exports = app;

// ============================================================================
// 6. STARTUP VALIDATION
// File: /src/server.js (ADD AT TOP)
// ============================================================================

// Add this BEFORE app initialization
if (process.env.NODE_ENV === 'production') {
    // Validate JWT secrets
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 64) {
        throw new Error('❌ JWT_SECRET must be set and >= 64 characters in production');
    }

    if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 64) {
        throw new Error('❌ JWT_REFRESH_SECRET must be set and >= 64 characters in production');
    }

    // Validate encryption key
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
        throw new Error('❌ ENCRYPTION_KEY must be set and exactly 64 hex characters in production');
    }

    console.log('✅ Security validation passed');
}

// ============================================================================
// 7. CLEANUP JOB - Remove expired tokens
// File: /src/utils/tokenCleanup.js (NEW)
// ============================================================================

const cron = require('node-cron');
const { User } = require('../models');

/**
 * Cleanup expired tokens from database
 */
const cleanupExpiredTokens = async () => {
    try {
        const now = new Date();

        const result = await User.updateMany(
            {},
            {
                $pull: {
                    refreshTokens: { expiresAt: { $lt: now } },
                    tokenBlacklist: { expiresAt: { $lt: now } }
                }
            }
        );

        console.log(`🧹 Token cleanup: Removed expired tokens from ${result.modifiedCount} users`);
    } catch (error) {
        console.error('❌ Token cleanup failed:', error.message);
    }
};

/**
 * Schedule cleanup to run daily at 3 AM
 */
const scheduleTokenCleanup = () => {
    cron.schedule('0 3 * * *', cleanupExpiredTokens);
    console.log('⏰ Token cleanup scheduled (daily at 3 AM)');
};

module.exports = {
    cleanupExpiredTokens,
    scheduleTokenCleanup
};

// Add to server.js startup:
// const { scheduleTokenCleanup } = require('./utils/tokenCleanup');
// scheduleTokenCleanup();

// ============================================================================
// 8. CSRF PROTECTION (OPTIONAL)
// File: /src/middlewares/csrf.middleware.js (NEW)
// ============================================================================

const csrf = require('csurf');

// CSRF protection middleware
const csrfProtection = csrf({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
});

// Custom CSRF error handler
const csrfErrorHandler = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            error: true,
            message: 'Invalid CSRF token'
        });
    }
    next(err);
};

module.exports = {
    csrfProtection,
    csrfErrorHandler
};

// Apply to specific routes in server.js:
// const { csrfProtection, csrfErrorHandler } = require('./middlewares/csrf.middleware');
// app.use('/api/payments', csrfProtection);
// app.use('/api/account', csrfProtection);
// app.use(csrfErrorHandler);

// ============================================================================
// 9. PACKAGE.JSON DEPENDENCIES
// Add these if not present:
// ============================================================================

/**
 * Required packages:
 *
 * npm install uuid node-cron csurf
 *
 * package.json additions:
 * {
 *   "dependencies": {
 *     "uuid": "^9.0.0",
 *     "node-cron": "^3.0.2",
 *     "csurf": "^1.11.0"
 *   }
 * }
 */

// ============================================================================
// 10. TESTING EXAMPLES
// File: /test/auth.test.js (NEW)
// ============================================================================

/**
 * Example tests for token security
 */

// Test token expiration
describe('Token Expiration', () => {
    it('should reject expired access token', async () => {
        // Implementation
    });

    it('should allow valid access token', async () => {
        // Implementation
    });
});

// Test token rotation
describe('Token Rotation', () => {
    it('should rotate refresh token on use', async () => {
        // Implementation
    });

    it('should detect refresh token theft', async () => {
        // Implementation
    });
});

// Test token revocation
describe('Token Revocation', () => {
    it('should reject blacklisted token', async () => {
        // Implementation
    });

    it('should invalidate tokens on logout', async () => {
        // Implementation
    });

    it('should invalidate all tokens on logout-all', async () => {
        // Implementation
    });
});

// Test CSRF protection
describe('CSRF Protection', () => {
    it('should reject requests without CSRF token', async () => {
        // Implementation
    });

    it('should accept requests with valid CSRF token', async () => {
        // Implementation
    });
});

// ============================================================================
// END OF SECURE IMPLEMENTATION
// ============================================================================

/**
 * IMPLEMENTATION CHECKLIST:
 *
 * [ ] Install required packages (uuid, node-cron, csurf)
 * [ ] Update User model with refreshTokens and tokenBlacklist fields
 * [ ] Update generateToken.js with jti and enhanced validation
 * [ ] Replace auth.controller.js login/logout with secure versions
 * [ ] Add authRefresh and authLogoutAll endpoints
 * [ ] Update authenticate middleware with blacklist check
 * [ ] Update auth routes with rate limiting
 * [ ] Add startup validation in server.js
 * [ ] Create and schedule token cleanup job
 * [ ] (Optional) Add CSRF protection middleware
 * [ ] Update frontend to handle token refresh
 * [ ] Test all auth flows
 * [ ] Deploy with proper environment variables
 *
 * ENVIRONMENT VARIABLES REQUIRED:
 * - JWT_SECRET (64+ characters)
 * - JWT_REFRESH_SECRET (64+ characters)
 * - ENCRYPTION_KEY (64 hex characters)
 * - NODE_ENV=production
 */
