/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 *
 * Usage:
 * const asyncHandler = require('../utils/asyncHandler');
 *
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ success: true, data: users });
 * }));
 */

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.log('========== ASYNC HANDLER DEBUG ==========');
        console.log('[AsyncHandler] Error caught in route handler!');
        console.log('[AsyncHandler] Timestamp:', new Date().toISOString());
        console.log('[AsyncHandler] Request URL:', req.originalUrl);
        console.log('[AsyncHandler] Request method:', req.method);
        console.log('[AsyncHandler] Error type:', error.constructor.name);
        console.log('[AsyncHandler] Error message:', error.message);
        console.log('[AsyncHandler] Error stack:', error.stack);
        console.log('[AsyncHandler] Passing to next middleware...');
        next(error);
    });
};

module.exports = asyncHandler;
