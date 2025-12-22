/**
 * PRODUCTION-READY ERROR HANDLING CODE
 * Copy these files to fix information disclosure vulnerabilities
 *
 * Installation:
 * npm install winston uuid
 */

// ============================================================================
// 1. src/utils/logger.js - Winston Logger Configuration
// ============================================================================

const winston = require('winston');
const path = require('path');

// Ensure logs directory exists
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'traf3li-backend' },
    transports: [
        // Error logs
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        // Combined logs
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        })
    ],
    // Don't exit on error
    exitOnError: false
});

// Console logging in development only
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
                let msg = `${timestamp} [${level}]: ${message}`;
                if (Object.keys(meta).length > 0) {
                    msg += ` ${JSON.stringify(meta, null, 2)}`;
                }
                return msg;
            })
        )
    }));
}

module.exports = logger;


// ============================================================================
// 2. src/utils/errorHandler.js - Centralized Error Handling
// ============================================================================

const { randomUUID } = require('crypto');
const logger = require('./logger');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Generate unique error ID for tracking
 */
const generateErrorId = () => {
    return randomUUID();
};

/**
 * Sanitize database errors
 */
const handleDatabaseError = (error) => {
    // MongoDB duplicate key error
    if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        const friendlyNames = {
            email: 'email address',
            username: 'username',
            phone: 'phone number',
            nationalId: 'national ID',
            commercialRegistration: 'commercial registration'
        };

        return new AppError(
            `This ${friendlyNames[field] || 'value'} is already registered`,
            400
        );
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const fields = Object.keys(error.errors);
        return new AppError(
            `Validation failed for: ${fields.join(', ')}`,
            400
        );
    }

    // Mongoose cast error (invalid ID format)
    if (error.name === 'CastError') {
        return new AppError('Invalid ID format provided', 400);
    }

    // MongoDB connection error
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
        return new AppError('Database connection failed. Please try again.', 503);
    }

    // Default database error
    return new AppError('Database operation failed', 500);
};

/**
 * Sanitize JWT errors
 */
const handleJWTError = (error) => {
    if (error.name === 'TokenExpiredError') {
        return new AppError('Your session has expired. Please login again.', 401);
    }

    if (error.name === 'JsonWebTokenError') {
        return new AppError('Authentication failed. Please login again.', 401);
    }

    if (error.message === 'No token provided') {
        return new AppError('Access denied. Authentication required.', 401);
    }

    return new AppError('Authentication error', 401);
};

/**
 * Sanitize all errors before sending to client
 */
const sanitizeError = (error, req) => {
    const errorId = generateErrorId();
    let sanitizedError = error;

    // Convert known error types
    if (error.code || error.name === 'ValidationError' || error.name === 'CastError') {
        sanitizedError = handleDatabaseError(error);
    } else if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        sanitizedError = handleJWTError(error);
    } else if (!(error instanceof AppError)) {
        sanitizedError = new AppError('An error occurred', 500);
    }

    // Log error details server-side
    const errorLog = {
        errorId,
        timestamp: new Date().toISOString(),
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.userID || 'anonymous',
        statusCode: sanitizedError.statusCode
    };

    if (process.env.NODE_ENV !== 'production') {
        errorLog.message = error.message;
        errorLog.stack = error.stack;
        errorLog.originalError = error.name;
        logger.error('Error occurred', errorLog);
    } else {
        errorLog.message = sanitizedError.message;
        logger.error('Production error', errorLog);
    }

    // Return sanitized response
    const statusCode = sanitizedError.statusCode || 500;
    const response = {
        error: true,
        message: sanitizedError.message,
        errorId,
        timestamp: sanitizedError.timestamp
    };

    // Include debug info in development only
    if (process.env.NODE_ENV !== 'production') {
        response.debug = {
            originalMessage: error.message,
            stack: error.stack,
            type: error.name
        };
    }

    return { statusCode, response };
};

/**
 * Express error middleware
 */
const errorMiddleware = (error, req, res, next) => {
    const { statusCode, response } = sanitizeError(error, req);
    return res.status(statusCode).json(response);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
    const errorId = generateErrorId();

    logger.warn('404 Not Found', {
        errorId,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip
    });

    res.status(404).json({
        error: true,
        message: 'The requested resource was not found',
        errorId
    });
};

/**
 * Async route handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    AppError,
    errorMiddleware,
    notFoundHandler,
    asyncHandler,
    generateErrorId,
    sanitizeError,
    handleDatabaseError,
    handleJWTError
};


// ============================================================================
// 3. src/utils/controllerHelpers.js - Controller Error Handling
// ============================================================================

const { AppError } = require('./errorHandler');
const logger = require('./logger');

/**
 * Handle controller errors consistently
 * Use this in catch blocks
 */
const handleControllerError = (error, res, context = '') => {
    logger.error(`Controller error: ${context}`, {
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });

    const statusCode = error.statusCode || error.status || 500;
    const message = statusCode === 500
        ? 'An error occurred processing your request'
        : error.message || 'Operation failed';

    return res.status(statusCode).json({
        success: false,
        error: true,
        message
    });
};

/**
 * Success response helper
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        error: false,
        message,
        data
    });
};

/**
 * Pagination helper
 */
const getPaginationParams = (req) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

/**
 * Pagination response helper
 */
const sendPaginatedResponse = (res, data, total, page, limit) => {
    return res.json({
        success: true,
        error: false,
        data,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasMore: page * limit < total
        }
    });
};

module.exports = {
    handleControllerError,
    sendSuccess,
    sendPaginatedResponse,
    getPaginationParams
};


// ============================================================================
// 4. UPDATED src/middlewares/errorMiddleware.js
// ============================================================================

/**
 * REPLACE EXISTING errorMiddleware.js WITH THIS
 */

const { errorMiddleware } = require('../utils/errorHandler');

// Export the centralized error handler
module.exports = errorMiddleware;


// ============================================================================
// 5. UPDATED src/utils/asyncHandler.js
// ============================================================================

/**
 * REPLACE EXISTING asyncHandler.js WITH THIS
 */

const { asyncHandler } = require('./errorHandler');

// Export the centralized async handler
module.exports = asyncHandler;


// ============================================================================
// 6. UPDATED src/middlewares/authenticate.js
// ============================================================================

/**
 * REPLACE EXISTING authenticate.js WITH THIS
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');

const authenticate = (request, response, next) => {
    try {
        const { accessToken } = request.cookies;

        if (!accessToken) {
            throw new AppError('Access denied. Please login.', 401);
        }

        const verification = jwt.verify(accessToken, process.env.JWT_SECRET);

        if (!verification) {
            throw new AppError('Invalid authentication token', 401);
        }

        request.userID = verification._id;
        return next();

    } catch (error) {
        // Let error middleware handle it
        return next(error);
    }
};

module.exports = authenticate;


// ============================================================================
// 7. EXAMPLE CONTROLLER USAGE
// ============================================================================

/**
 * Example: Updated Controller with Proper Error Handling
 */

const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../utils/errorHandler');
const { sendSuccess, handleControllerError } = require('../utils/controllerHelpers');
const User = require('../models/user.model');

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    sendSuccess(res, user, 'User retrieved successfully');
});

// Create new user
const createUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
        throw new AppError('Email, username, and password are required', 400);
    }

    // Business logic validation
    if (password.length < 8) {
        throw new AppError('Password must be at least 8 characters', 400);
    }

    const user = await User.create({ email, username, password });

    sendSuccess(res, {
        id: user._id,
        email: user.email,
        username: user.username
    }, 'User created successfully', 201);
});

// Update user
const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    sendSuccess(res, user, 'User updated successfully');
});

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    sendSuccess(res, null, 'User deleted successfully');
});

module.exports = {
    getUserById,
    createUser,
    updateUser,
    deleteUser
};


// ============================================================================
// 8. UPDATED src/server.js
// ============================================================================

/**
 * UPDATE server.js with these changes
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const connectDB = require('./configs/db');
const { scheduleTaskReminders } = require('./utils/taskReminders');
const { initSocket } = require('./configs/socket');
const { errorMiddleware, notFoundHandler } = require('./utils/errorHandler');
const logger = require('./utils/logger');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions)); // Use your existing CORS config
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', routes); // Use centralized routes

// Health check endpoint (minimal)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Detailed health check (authenticated)
app.get('/health/detailed', authenticate, requireAdmin(), (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 8080;

server.listen(PORT, async () => {
    await connectDB();
    scheduleTaskReminders();

    if (process.env.NODE_ENV !== 'production') {
        logger.info(`🚀 Server running on http://localhost:${PORT}`);
        logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`📝 Logs: ./logs/`);
    } else {
        logger.info('Application started successfully', {
            port: PORT,
            environment: 'production'
        });
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});


// ============================================================================
// 9. UPDATED src/configs/db.js
// ============================================================================

/**
 * REPLACE EXISTING db.js WITH THIS
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });

        logger.info('✅ Database connected successfully');

        // Monitor connection events
        mongoose.connection.on('error', (err) => {
            logger.error('Database connection error occurred');
            if (process.env.NODE_ENV !== 'production') {
                logger.debug('DB Error details', { error: err.message });
            }
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('Database disconnected. Attempting reconnection...');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('Database reconnected successfully');
        });

    } catch (error) {
        logger.error('Failed to connect to database');

        if (process.env.NODE_ENV !== 'production') {
            logger.debug('Connection error details', { error: error.message });
        }

        // Fail fast in production
        process.exit(1);
    }
};

module.exports = connect;


// ============================================================================
// 10. DEPLOYMENT CHECKLIST
// ============================================================================

/*
BEFORE DEPLOYING TO PRODUCTION:

1. Environment Variables (REQUIRED):
   ✓ JWT_SECRET (64+ characters)
   ✓ JWT_REFRESH_SECRET (64+ characters)
   ✓ MONGODB_URI (full connection string)
   ✓ NODE_ENV=production
   ✓ LOG_LEVEL=error (or info)

2. Dependencies:
   npm install winston uuid

3. Files to Replace:
   ✓ src/middlewares/errorMiddleware.js
   ✓ src/utils/asyncHandler.js
   ✓ src/middlewares/authenticate.js
   ✓ src/configs/db.js
   ✓ src/server.js (update sections)

4. Files to Create:
   ✓ src/utils/logger.js
   ✓ src/utils/errorHandler.js
   ✓ src/utils/controllerHelpers.js

5. Update All Controllers:
   - Import: const asyncHandler = require('../utils/asyncHandler');
   - Import: const { AppError } = require('../utils/errorHandler');
   - Wrap routes: asyncHandler(async (req, res) => { ... })
   - Throw errors: throw new AppError('Message', statusCode);
   - Remove: console.log, error.message in responses

6. Create Logs Directory:
   mkdir -p logs
   echo "logs/" >> .gitignore

7. Test:
   ✓ Error responses are generic
   ✓ No stack traces in logs or responses
   ✓ Health endpoint returns minimal data
   ✓ All routes return sanitized errors

8. Monitor:
   ✓ Check logs/error.log for issues
   ✓ Verify no sensitive data in logs
   ✓ Monitor error rates

9. Security:
   ✓ No console.log in production code
   ✓ All errors sanitized
   ✓ Environment variables set
   ✓ Logging configured
   ✓ Health endpoint secured
*/
