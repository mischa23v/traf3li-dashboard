/**
 * EXAMPLE: Secure Transaction Controller
 *
 * This is an example showing how to apply security fixes to transaction.controller.js
 * Compare this with the original file to see the changes
 *
 * Key Security Improvements:
 * 1. ✅ Sort field whitelisting
 * 2. ✅ Regex escaping and validation
 * 3. ✅ Input validation for pagination
 * 4. ✅ Safe query construction
 */

const { Transaction, Invoice, Expense, Case } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const CustomException = require('../utils/CustomException');

// ✅ SECURITY: Import security utilities
const {
    createSafeRegexQuery,
    createSafeSortOptions,
    validatePagination,
    validateSearchInput,
    escapeRegex
} = require('../utils/security');

/**
 * Get transactions with filters
 * GET /api/transactions
 *
 * SECURITY FIXES APPLIED:
 * - Sort field validation
 * - Regex escaping
 * - Pagination validation
 */
const getTransactions = asyncHandler(async (req, res) => {
    const {
        type,
        category,
        status,
        paymentMethod,
        startDate,
        endDate,
        caseId,
        invoiceId,
        expenseId,
        minAmount,
        maxAmount,
        search,
        page = 1,
        limit = 20,
        sortBy = 'date',
        sortOrder = 'desc'
    } = req.query;

    const userId = req.userID;
    const query = { userId };

    // Basic filters (no changes needed)
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (caseId) query.caseId = caseId;
    if (invoiceId) query.invoiceId = invoiceId;
    if (expenseId) query.expenseId = expenseId;

    // Date range (no changes needed)
    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    // Amount range (no changes needed)
    if (minAmount || maxAmount) {
        query.amount = {};
        if (minAmount) query.amount.$gte = parseFloat(minAmount);
        if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    // ✅ SECURITY FIX 1: Safe regex search
    // OLD (VULNERABLE):
    // if (search) {
    //     query.$or = [
    //         { description: { $regex: search, $options: 'i' } },
    //         { transactionId: { $regex: search, $options: 'i' } },
    //         { referenceNumber: { $regex: search, $options: 'i' } },
    //         { notes: { $regex: search, $options: 'i' } }
    //     ];
    // }

    // NEW (SECURE):
    if (search) {
        try {
            const searchQuery = createSafeRegexQuery(
                search,
                ['description', 'transactionId', 'referenceNumber', 'notes'],
                { minLength: 2, maxLength: 100 }
            );

            if (searchQuery) {
                query.$or = searchQuery.$or;
            }
        } catch (error) {
            throw new CustomException(error.message, 400);
        }
    }

    // ✅ SECURITY FIX 2: Validate sort fields
    // OLD (VULNERABLE):
    // const sortOptions = {};
    // sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // NEW (SECURE):
    const ALLOWED_SORT_FIELDS = {
        'date': 'date',
        'amount': 'amount',
        'status': 'status',
        'type': 'type',
        'category': 'category',
        'created': 'createdAt'
    };

    const sortOptions = createSafeSortOptions(
        sortBy,
        sortOrder,
        ALLOWED_SORT_FIELDS,
        'date'
    );

    // ✅ SECURITY FIX 3: Validate pagination
    // OLD (VULNERABLE to large numbers):
    // .limit(parseInt(limit))
    // .skip((parseInt(page) - 1) * parseInt(limit));

    // NEW (SECURE):
    const { page: validPage, limit: validLimit } = validatePagination(page, limit, {
        maxLimit: 100,
        defaultLimit: 20
    });

    const transactions = await Transaction.find(query)
        .populate('invoiceId', 'invoiceNumber totalAmount')
        .populate('expenseId', 'description amount')
        .populate('caseId', 'caseNumber title')
        .sort(sortOptions)
        .limit(validLimit)
        .skip((validPage - 1) * validLimit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
            page: validPage,
            limit: validLimit,
            total,
            pages: Math.ceil(total / validLimit)
        }
    });
});

/**
 * ALTERNATIVE IMPLEMENTATION: Manual validation
 *
 * If you prefer not to use utility functions, here's a manual approach:
 */
const getTransactionsAlternative = asyncHandler(async (req, res) => {
    const { search, sortBy, sortOrder, page, limit } = req.query;
    const userId = req.userID;

    const query = { userId };

    // Manual regex escaping
    if (search) {
        // Validate length
        if (search.length < 2 || search.length > 100) {
            throw new CustomException('Search must be 2-100 characters', 400);
        }

        // Escape special regex characters
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        query.$or = [
            { description: { $regex: escapedSearch, $options: 'i' } },
            { transactionId: { $regex: escapedSearch, $options: 'i' } },
            { referenceNumber: { $regex: escapedSearch, $options: 'i' } },
            { notes: { $regex: escapedSearch, $options: 'i' } }
        ];
    }

    // Manual sort validation
    const ALLOWED_SORT_FIELDS = ['date', 'amount', 'status', 'type', 'category', 'createdAt'];
    const validSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'date';
    const validSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';

    const sortOptions = {};
    sortOptions[validSortBy] = validSortOrder === 'asc' ? 1 : -1;

    // Manual pagination validation
    const validPage = Math.max(1, parseInt(page) || 1);
    const requestedLimit = parseInt(limit) || 20;
    const validLimit = Math.min(Math.max(1, requestedLimit), 100);

    const transactions = await Transaction.find(query)
        .sort(sortOptions)
        .limit(validLimit)
        .skip((validPage - 1) * validLimit);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
        success: true,
        data: transactions,
        pagination: {
            page: validPage,
            limit: validLimit,
            total,
            pages: Math.ceil(total / validLimit)
        }
    });
});

/**
 * SECURITY TESTING EXAMPLES
 *
 * Test these payloads to verify your fixes:
 */

/*
// 1. Test Sort Field Injection (Should use default 'date')
GET /api/transactions?sortBy[$ne]=null&sortOrder=desc
GET /api/transactions?sortBy=__v&sortOrder=1
GET /api/transactions?sortBy[]=injected

Expected: All should sort by 'date' (default)

// 2. Test ReDoS Attack (Should complete quickly)
GET /api/transactions?search=(a+)+b
GET /api/transactions?search=^(a|a)*$

Expected: Either escaped or validation error, completes < 1 second

// 3. Test Regex Injection
GET /api/transactions?search=.*
GET /api/transactions?search=^admin

Expected: Escaped properly, only literal matches

// 4. Test Pagination Limits
GET /api/transactions?limit=999999
GET /api/transactions?limit=-1
GET /api/transactions?page=-1

Expected: Capped at maxLimit (100), minimum 1

// 5. Test Search Length Validation
GET /api/transactions?search=a
GET /api/transactions?search=[very long string > 100 chars]

Expected: Validation error for both
*/

/**
 * BEFORE & AFTER COMPARISON
 */

// ❌ BEFORE (VULNERABLE):
/*
const {
    sortBy = 'date',
    sortOrder = 'desc',
    search
} = req.query;

if (search) {
    query.$or = [
        { description: { $regex: search, $options: 'i' } }  // VULNERABLE
    ];
}

const sortOptions = {};
sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;  // VULNERABLE

.limit(parseInt(limit))  // Can accept huge numbers
*/

// ✅ AFTER (SECURE):
/*
const {
    sortBy = 'date',
    sortOrder = 'desc',
    search
} = req.query;

if (search) {
    const searchQuery = createSafeRegexQuery(
        search,
        ['description'],
        { minLength: 2, maxLength: 100 }
    );
    if (searchQuery) query.$or = searchQuery.$or;  // SAFE
}

const ALLOWED_SORT_FIELDS = { 'date': 'date', ... };
const sortOptions = createSafeSortOptions(
    sortBy,
    sortOrder,
    ALLOWED_SORT_FIELDS,
    'date'
);  // SAFE

const { limit: validLimit } = validatePagination(page, limit, {
    maxLimit: 100
});  // SAFE
*/

module.exports = {
    getTransactions,
    getTransactionsAlternative
};
