const express = require('express');
const { authLogin, authLogout, authRegister, authStatus } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares');
const { authRateLimiter, sensitiveRateLimiter } = require('../middlewares/rateLimiter.middleware');

const app = express.Router();

// Register - Rate limited to prevent mass account creation
// 5 attempts per 15 minutes per IP
app.post('/register', authRateLimiter, authRegister);

// Login - Rate limited to prevent brute force attacks
// 5 attempts per 15 minutes per IP
app.post('/login', authRateLimiter, authLogin);

// Logout - No rate limiting needed (requires valid session)
app.post('/logout', authLogout)

// Check Auth status - Protected route
app.get('/me', authenticate, authStatus);

module.exports = app;