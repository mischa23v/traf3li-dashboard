/**
 * Security Utilities for Database Injection Prevention
 *
 * This module provides functions to prevent:
 * - RegEx Injection (ReDoS attacks)
 * - MongoDB Operator Injection
 * - Mass Assignment vulnerabilities
 *
 * @module utils/security
 */

/**
 * Escape special regex characters to prevent ReDoS attacks
 *
 * Escapes: . * + ? ^ $ { } ( ) | [ ] \
 *
 * @param {string} string - The input string to escape
 * @returns {string} - Escaped string safe for regex
 *
 * @example
 * escapeRegex('user@example.com') // 'user@example\\.com'
 * escapeRegex('(a+)+b') // '\\(a\\+\\)\\+b'
 */
exports.escapeRegex = (string) => {
    if (typeof string !== 'string') return '';
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validate and sanitize search input
 *
 * - Trims whitespace
 * - Validates length (2-100 characters)
 * - Returns null for invalid input
 * - Throws error for invalid length
 *
 * @param {string} search - The search query
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 2)
 * @param {number} options.maxLength - Maximum length (default: 100)
 * @returns {string|null} - Sanitized search string or null
 * @throws {Error} - If search length is invalid
 *
 * @example
 * validateSearchInput('  test  ') // 'test'
 * validateSearchInput('a') // throws Error
 * validateSearchInput('') // returns null
 */
exports.validateSearchInput = (search, options = {}) => {
    const { minLength = 2, maxLength = 100 } = options;

    if (!search) return null;

    const trimmed = search.trim();

    if (trimmed.length === 0) return null;

    if (trimmed.length < minLength) {
        throw new Error(`Search must be at least ${minLength} characters`);
    }

    if (trimmed.length > maxLength) {
        throw new Error(`Search must not exceed ${maxLength} characters`);
    }

    return trimmed;
};

/**
 * Sanitize MongoDB query object by removing operator keys
 *
 * Removes keys starting with '$' to prevent operator injection
 * Works recursively on nested objects
 *
 * @param {Object} obj - Query object to sanitize
 * @returns {Object} - Sanitized object
 *
 * @example
 * sanitizeMongoQuery({ name: 'John', $ne: 'admin' }) // { name: 'John' }
 * sanitizeMongoQuery({ user: { $gt: '' } }) // { user: {} }
 */
exports.sanitizeMongoQuery = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    Object.keys(obj).forEach(key => {
        // Remove keys starting with $
        if (!key.startsWith('$')) {
            const value = obj[key];

            if (typeof value === 'object' && value !== null) {
                sanitized[key] = exports.sanitizeMongoQuery(value);
            } else {
                sanitized[key] = value;
            }
        }
    });

    return sanitized;
};

/**
 * Validate sort field against whitelist
 *
 * @param {string} sortBy - User-provided sort field
 * @param {Object} allowedFields - Map of allowed field names
 * @param {string} defaultField - Default field if validation fails
 * @returns {string} - Valid field name
 *
 * @example
 * const allowed = { 'date': 'createdAt', 'amount': 'amount' };
 * validateSortField('date', allowed, 'createdAt') // 'createdAt'
 * validateSortField('$ne', allowed, 'createdAt') // 'createdAt' (blocked)
 */
exports.validateSortField = (sortBy, allowedFields, defaultField) => {
    if (!sortBy || typeof sortBy !== 'string') {
        return defaultField;
    }

    // Check if field is in whitelist
    if (allowedFields.hasOwnProperty(sortBy)) {
        return allowedFields[sortBy];
    }

    // Return default if not whitelisted
    return defaultField;
};

/**
 * Validate sort order
 *
 * @param {string} sortOrder - User-provided sort order
 * @param {string} defaultOrder - Default order (default: 'desc')
 * @returns {string} - Valid sort order ('asc' or 'desc')
 *
 * @example
 * validateSortOrder('asc') // 'asc'
 * validateSortOrder('invalid') // 'desc'
 * validateSortOrder('DESC') // 'desc' (normalized)
 */
exports.validateSortOrder = (sortOrder, defaultOrder = 'desc') => {
    if (!sortOrder || typeof sortOrder !== 'string') {
        return defaultOrder;
    }

    const normalized = sortOrder.toLowerCase();
    return ['asc', 'desc'].includes(normalized) ? normalized : defaultOrder;
};

/**
 * Filter object to only include whitelisted fields
 *
 * Useful for preventing mass assignment vulnerabilities
 *
 * @param {Object} data - Input data object
 * @param {Array<string>} allowedFields - Array of allowed field names
 * @returns {Object} - Filtered object with only allowed fields
 *
 * @example
 * const data = { name: 'John', email: 'john@example.com', userId: 'malicious' };
 * const allowed = ['name', 'email'];
 * filterAllowedFields(data, allowed) // { name: 'John', email: 'john@example.com' }
 */
exports.filterAllowedFields = (data, allowedFields) => {
    const filtered = {};

    allowedFields.forEach(field => {
        if (data.hasOwnProperty(field) && data[field] !== undefined) {
            filtered[field] = data[field];
        }
    });

    return filtered;
};

/**
 * Validate pagination parameters
 *
 * @param {number|string} page - Page number
 * @param {number|string} limit - Items per page
 * @param {Object} options - Validation options
 * @param {number} options.maxLimit - Maximum limit (default: 100)
 * @param {number} options.defaultLimit - Default limit (default: 20)
 * @returns {Object} - Validated { page, limit }
 *
 * @example
 * validatePagination(2, 50) // { page: 2, limit: 50 }
 * validatePagination('invalid', 200) // { page: 1, limit: 100 }
 */
exports.validatePagination = (page, limit, options = {}) => {
    const { maxLimit = 100, defaultLimit = 20 } = options;

    const validPage = Math.max(1, parseInt(page) || 1);
    const requestedLimit = parseInt(limit) || defaultLimit;
    const validLimit = Math.min(Math.max(1, requestedLimit), maxLimit);

    return { page: validPage, limit: validLimit };
};

/**
 * Create safe regex search query
 *
 * Combines validation and escaping for safe regex search
 *
 * @param {string} search - Search query
 * @param {Array<string>} fields - Fields to search in
 * @param {Object} options - Validation options
 * @returns {Object|null} - MongoDB $or query or null
 *
 * @example
 * createSafeRegexQuery('john', ['name', 'email'])
 * // Returns: { $or: [
 * //   { name: { $regex: 'john', $options: 'i' } },
 * //   { email: { $regex: 'john', $options: 'i' } }
 * // ]}
 */
exports.createSafeRegexQuery = (search, fields, options = {}) => {
    if (!search || !Array.isArray(fields) || fields.length === 0) {
        return null;
    }

    try {
        const sanitized = exports.validateSearchInput(search, options);
        if (!sanitized) return null;

        const escaped = exports.escapeRegex(sanitized);

        return {
            $or: fields.map(field => ({
                [field]: { $regex: escaped, $options: 'i' }
            }))
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Create safe sort options
 *
 * Combines field and order validation
 *
 * @param {string} sortBy - Sort field name
 * @param {string} sortOrder - Sort order
 * @param {Object} allowedFields - Map of allowed fields
 * @param {string} defaultField - Default field
 * @returns {Object} - MongoDB sort object
 *
 * @example
 * const allowed = { 'date': 'createdAt', 'amount': 'amount' };
 * createSafeSortOptions('date', 'asc', allowed, 'createdAt')
 * // Returns: { createdAt: 1 }
 */
exports.createSafeSortOptions = (sortBy, sortOrder, allowedFields, defaultField) => {
    const field = exports.validateSortField(sortBy, allowedFields, defaultField);
    const order = exports.validateSortOrder(sortOrder);

    return { [field]: order === 'asc' ? 1 : -1 };
};

/**
 * Sanitize filename to prevent path traversal
 *
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Safe filename
 *
 * @example
 * sanitizeFilename('../../../etc/passwd') // 'passwd'
 * sanitizeFilename('file<>name.pdf') // 'filename.pdf'
 */
exports.sanitizeFilename = (filename) => {
    if (typeof filename !== 'string') return '';

    return filename
        .replace(/\.\./g, '') // Remove directory traversal
        .replace(/[<>:"|?*]/g, '') // Remove invalid characters
        .replace(/^\.+/, '') // Remove leading dots
        .trim();
};

/**
 * Validate ObjectId format
 *
 * @param {string} id - MongoDB ObjectId string
 * @returns {boolean} - True if valid ObjectId format
 *
 * @example
 * isValidObjectId('507f1f77bcf86cd799439011') // true
 * isValidObjectId('invalid') // false
 */
exports.isValidObjectId = (id) => {
    if (typeof id !== 'string') return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Rate limit key generator
 *
 * Generate unique key for rate limiting based on IP and user
 *
 * @param {Object} req - Express request object
 * @returns {string} - Rate limit key
 */
exports.getRateLimitKey = (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userId = req.userID || 'anonymous';
    return `${ip}:${userId}`;
};

// Export all functions as a module
module.exports = exports;
