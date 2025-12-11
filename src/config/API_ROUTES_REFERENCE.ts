/**
 * Complete V1 API Endpoint Reference
 * Last Updated: 2025-12-11
 *
 * This file documents all backend API routes for reference.
 * DO NOT IMPORT THIS FILE - it's for documentation only.
 */

// =============================================================================
// ROUTE VERSIONING RULES
// =============================================================================
// | Route Pattern                           | Version | API Client          |
// |----------------------------------------|---------|---------------------|
// | /api/auth/*                            | None    | apiClientNoVersion  |
// | /api/currency/*                        | None    | apiClientNoVersion  |
// | /api/v1/bank-reconciliation/currency/* | v1      | apiClient           |
// | Everything else                        | v1      | apiClient           |
// =============================================================================

export const API_ROUTES = {
  // ===========================================================================
  // NON-VERSIONED ROUTES (/api/*)
  // ===========================================================================

  AUTH: {
    // Uses apiClientNoVersion
    LOGIN: 'POST /api/auth/login',
    REGISTER: 'POST /api/auth/register',
    LOGOUT: 'POST /api/auth/logout',
    ME: 'GET /api/auth/me',
    CHECK_AVAILABILITY: 'POST /api/auth/check-availability',
    SEND_OTP: 'POST /api/auth/send-otp',
    VERIFY_OTP: 'POST /api/auth/verify-otp',
    RESEND_OTP: 'POST /api/auth/resend-otp',
    OTP_STATUS: 'GET /api/auth/otp-status',
  },

  CURRENCY: {
    // Uses apiClientNoVersion
    SETTINGS: 'GET /api/currency/settings',
    RATES: 'GET /api/currency/rates',
    CONVERT: 'POST /api/currency/convert',
    SET_RATE: 'POST /api/currency/rates',
    SUPPORTED: 'GET /api/currency/supported',
    UPDATE: 'POST /api/currency/update',
  },

  // ===========================================================================
  // VERSIONED ROUTES (/api/v1/*)
  // All routes below use apiClient (versioned)
  // ===========================================================================

  DASHBOARD: {
    HERO_STATS: 'GET /dashboard/hero-stats',
    STATS: 'GET /dashboard/stats',
    FINANCIAL_SUMMARY: 'GET /dashboard/financial-summary',
    TODAY_EVENTS: 'GET /dashboard/today-events',
    RECENT_MESSAGES: 'GET /dashboard/recent-messages',
    ACTIVITY: 'GET /dashboard/activity',
  },

  CLIENTS: {
    LIST: 'GET /clients',
    CREATE: 'POST /clients',
    GET: 'GET /clients/:id',
    UPDATE: 'PUT /clients/:id',
    DELETE: 'DELETE /clients/:id',
    SEARCH: 'GET /clients/search',
    STATS: 'GET /clients/stats',
    TOP_REVENUE: 'GET /clients/top-revenue',
    BILLING_INFO: 'GET /clients/:id/billing-info',
    CASES: 'GET /clients/:id/cases',
    INVOICES: 'GET /clients/:id/invoices',
    PAYMENTS: 'GET /clients/:id/payments',
    VERIFY_WATHQ: 'POST /clients/:id/verify/wathq',
    WATHQ_DATA: 'GET /clients/:id/wathq/:dataType',
    ATTACHMENTS: 'POST /clients/:id/attachments',
    DELETE_ATTACHMENT: 'DELETE /clients/:id/attachments/:attachmentId',
    CONFLICT_CHECK: 'POST /clients/:id/conflict-check',
    UPDATE_STATUS: 'PATCH /clients/:id/status',
    UPDATE_FLAGS: 'PATCH /clients/:id/flags',
    BULK_DELETE: 'DELETE /clients/bulk',
  },

  CASES: {
    // NOTE: PATCH for updates, not PUT
    LIST: 'GET /cases',
    CREATE: 'POST /cases',
    GET: 'GET /cases/:id',
    UPDATE: 'PATCH /cases/:id', // IMPORTANT: PATCH not PUT
    DELETE: 'DELETE /cases/:id',
    STATISTICS: 'GET /cases/statistics',
    UPDATE_PROGRESS: 'PATCH /cases/:id/progress',
    UPDATE_STATUS: 'PATCH /cases/:id/status',
    UPDATE_OUTCOME: 'PATCH /cases/:id/outcome',
    AUDIT: 'GET /cases/:id/audit',
    // Notes
    ADD_NOTE: 'POST /cases/:id/note',
    UPDATE_NOTE: 'PATCH /cases/:id/notes/:noteId',
    DELETE_NOTE: 'DELETE /cases/:id/notes/:noteId',
    // Hearings
    ADD_HEARING: 'POST /cases/:id/hearing',
    UPDATE_HEARING: 'PATCH /cases/:id/hearings/:hearingId',
    DELETE_HEARING: 'DELETE /cases/:id/hearings/:hearingId',
    // Timeline
    ADD_TIMELINE: 'POST /cases/:id/timeline',
    UPDATE_TIMELINE: 'PATCH /cases/:id/timeline/:eventId',
    DELETE_TIMELINE: 'DELETE /cases/:id/timeline/:eventId',
    // Claims
    ADD_CLAIM: 'POST /cases/:id/claim',
    UPDATE_CLAIM: 'PATCH /cases/:id/claims/:claimId',
    DELETE_CLAIM: 'DELETE /cases/:id/claims/:claimId',
  },

  INVOICES: {
    LIST: 'GET /invoices',
    CREATE: 'POST /invoices',
    GET: 'GET /invoices/:id',
    UPDATE_PATCH: 'PATCH /invoices/:id',
    UPDATE_PUT: 'PUT /invoices/:id',
    DELETE: 'DELETE /invoices/:id',
    STATS: 'GET /invoices/stats',
    OVERDUE: 'GET /invoices/overdue',
    BILLABLE_ITEMS: 'GET /invoices/billable-items',
    OPEN_BY_CLIENT: 'GET /invoices/open/:clientId',
    CONFIRM_PAYMENT: 'PATCH /invoices/confirm-payment',
    SEND: 'POST /invoices/:id/send',
    RECORD_PAYMENT: 'POST /invoices/:id/record-payment',
    VOID: 'POST /invoices/:id/void',
    DUPLICATE: 'POST /invoices/:id/duplicate',
    SEND_REMINDER: 'POST /invoices/:id/send-reminder',
    CONVERT_TO_CREDIT_NOTE: 'POST /invoices/:id/convert-to-credit-note',
    APPLY_RETAINER: 'POST /invoices/:id/apply-retainer',
    SUBMIT_FOR_APPROVAL: 'POST /invoices/:id/submit-for-approval',
    APPROVE: 'POST /invoices/:id/approve',
    REJECT: 'POST /invoices/:id/reject',
    ZATCA_SUBMIT: 'POST /invoices/:id/zatca/submit',
    ZATCA_STATUS: 'GET /invoices/:id/zatca/status',
    PDF: 'GET /invoices/:id/pdf',
    XML: 'GET /invoices/:id/xml',
  },

  PAYMENTS: {
    LIST: 'GET /payments',
    CREATE: 'POST /payments',
    GET: 'GET /payments/:id',
    UPDATE: 'PUT /payments/:id',
    DELETE: 'DELETE /payments/:id',
    NEW_DEFAULTS: 'GET /payments/new',
    STATS: 'GET /payments/stats',
    SUMMARY: 'GET /payments/summary',
    UNRECONCILED: 'GET /payments/unreconciled',
    PENDING_CHECKS: 'GET /payments/pending-checks',
    BULK_DELETE: 'DELETE /payments/bulk',
    COMPLETE: 'POST /payments/:id/complete',
    FAIL: 'POST /payments/:id/fail',
    REFUND: 'POST /payments/:id/refund',
    RECONCILE: 'POST /payments/:id/reconcile',
    APPLY: 'PUT /payments/:id/apply',
    UNAPPLY: 'DELETE /payments/:id/unapply/:invoiceId',
    CHECK_STATUS: 'PUT /payments/:id/check-status',
    SEND_RECEIPT: 'POST /payments/:id/send-receipt',
    RECEIPT: 'POST /payments/:id/receipt',
  },

  EXPENSES: {
    LIST: 'GET /expenses',
    CREATE: 'POST /expenses',
    GET: 'GET /expenses/:id',
    UPDATE: 'PUT /expenses/:id',
    DELETE: 'DELETE /expenses/:id',
    NEW_DEFAULTS: 'GET /expenses/new',
    SUGGEST_CATEGORY: 'POST /expenses/suggest-category',
    CATEGORIES: 'GET /expenses/categories',
    STATS: 'GET /expenses/stats',
    BY_CATEGORY: 'GET /expenses/by-category',
    BULK_APPROVE: 'POST /expenses/bulk-approve',
    SUBMIT: 'POST /expenses/:id/submit',
    APPROVE: 'POST /expenses/:id/approve',
    REJECT: 'POST /expenses/:id/reject',
    REIMBURSE: 'POST /expenses/:id/reimburse',
    RECEIPT: 'POST /expenses/:id/receipt',
  },

  ACCOUNTS: {
    // NOTE: PATCH for updates, not PUT
    LIST: 'GET /accounts',
    CREATE: 'POST /accounts',
    GET: 'GET /accounts/:id',
    UPDATE: 'PATCH /accounts/:id', // IMPORTANT: PATCH not PUT
    DELETE: 'DELETE /accounts/:id',
    TYPES: 'GET /accounts/types',
    BALANCE: 'GET /accounts/:id/balance',
  },

  RETAINERS: {
    // NOTE: Uses "replenish" not "deposit", "history" not "transactions"
    LIST: 'GET /retainers',
    CREATE: 'POST /retainers',
    GET: 'GET /retainers/:id',
    UPDATE: 'PUT /retainers/:id',
    STATS: 'GET /retainers/stats',
    LOW_BALANCE: 'GET /retainers/low-balance',
    CONSUME: 'POST /retainers/:id/consume',
    REPLENISH: 'POST /retainers/:id/replenish', // NOT "deposit"
    REFUND: 'POST /retainers/:id/refund',
    HISTORY: 'GET /retainers/:id/history', // NOT "transactions"
  },

  TRUST_ACCOUNTS: {
    // NOTE: PATCH for updates, not PUT
    LIST: 'GET /trust-accounts',
    CREATE: 'POST /trust-accounts',
    GET: 'GET /trust-accounts/:id',
    UPDATE: 'PATCH /trust-accounts/:id', // IMPORTANT: PATCH not PUT
    DELETE: 'DELETE /trust-accounts/:id',
    SUMMARY: 'GET /trust-accounts/:id/summary',
    TRANSACTIONS: 'GET /trust-accounts/:id/transactions',
    CREATE_TRANSACTION: 'POST /trust-accounts/:id/transactions',
    GET_TRANSACTION: 'GET /trust-accounts/:id/transactions/:transactionId',
    VOID_TRANSACTION: 'POST /trust-accounts/:id/transactions/:transactionId/void',
    BALANCES: 'GET /trust-accounts/:id/balances',
    CLIENT_BALANCE: 'GET /trust-accounts/:id/balances/:clientId',
    TRANSFER: 'POST /trust-accounts/:id/transfer',
    RECONCILIATIONS: 'GET /trust-accounts/:id/reconciliations',
    CREATE_RECONCILIATION: 'POST /trust-accounts/:id/reconciliations',
    THREE_WAY_RECONCILIATIONS: 'GET /trust-accounts/:id/three-way-reconciliations',
    CREATE_THREE_WAY: 'POST /trust-accounts/:id/three-way-reconciliations',
  },

  JOURNAL_ENTRIES: {
    // NOTE: PATCH for updates, not PUT
    LIST: 'GET /journal-entries',
    CREATE: 'POST /journal-entries',
    GET: 'GET /journal-entries/:id',
    UPDATE: 'PATCH /journal-entries/:id', // IMPORTANT: PATCH not PUT
    DELETE: 'DELETE /journal-entries/:id',
    SIMPLE: 'POST /journal-entries/simple',
    POST: 'POST /journal-entries/:id/post',
    VOID: 'POST /journal-entries/:id/void',
  },

  BANK_RECONCILIATION: {
    // All versioned at /api/v1/bank-reconciliation/*
    LIST: 'GET /bank-reconciliation',
    CREATE: 'POST /bank-reconciliation',
    GET: 'GET /bank-reconciliation/:id',
    CLEAR: 'POST /bank-reconciliation/:id/clear',
    UNCLEAR: 'POST /bank-reconciliation/:id/unclear',
    COMPLETE: 'POST /bank-reconciliation/:id/complete',
    CANCEL: 'POST /bank-reconciliation/:id/cancel',
    // Feeds
    LIST_FEEDS: 'GET /bank-reconciliation/feeds',
    CREATE_FEED: 'POST /bank-reconciliation/feeds',
    UPDATE_FEED: 'PUT /bank-reconciliation/feeds/:id',
    DELETE_FEED: 'DELETE /bank-reconciliation/feeds/:id',
    // Import
    IMPORT_CSV: 'POST /bank-reconciliation/import/csv',
    IMPORT_OFX: 'POST /bank-reconciliation/import/ofx',
    IMPORT_TEMPLATE: 'GET /bank-reconciliation/import/template',
    // Matching
    SUGGESTIONS: 'GET /bank-reconciliation/suggestions/:accountId',
    AUTO_MATCH: 'POST /bank-reconciliation/auto-match/:accountId',
    CONFIRM_MATCH: 'POST /bank-reconciliation/match/confirm/:id',
    REJECT_MATCH: 'POST /bank-reconciliation/match/reject/:id',
    SPLIT_MATCH: 'POST /bank-reconciliation/match/split',
    UNMATCH: 'DELETE /bank-reconciliation/match/:id',
    // Rules
    LIST_RULES: 'GET /bank-reconciliation/rules',
    CREATE_RULE: 'POST /bank-reconciliation/rules',
    UPDATE_RULE: 'PUT /bank-reconciliation/rules/:id',
    DELETE_RULE: 'DELETE /bank-reconciliation/rules/:id',
    // Status
    STATUS: 'GET /bank-reconciliation/status/:accountId',
    UNMATCHED: 'GET /bank-reconciliation/unmatched/:accountId',
    MATCH_STATS: 'GET /bank-reconciliation/statistics/matches',
    RULE_STATS: 'GET /bank-reconciliation/statistics/rules',
    // Currency (also at /api/currency/*)
    CURRENCY_RATES: 'GET /bank-reconciliation/currency/rates',
    CURRENCY_CONVERT: 'POST /bank-reconciliation/currency/convert',
    CURRENCY_SET_RATE: 'POST /bank-reconciliation/currency/rates',
    CURRENCY_SUPPORTED: 'GET /bank-reconciliation/currency/supported',
    CURRENCY_UPDATE: 'POST /bank-reconciliation/currency/update',
  },

  LEAVE_REQUESTS: {
    // IMPORTANT: Path is /leave-requests/* NOT /leave/*
    // NOTE: PATCH for updates, not PUT
    LIST: 'GET /leave-requests',
    CREATE: 'POST /leave-requests',
    GET: 'GET /leave-requests/:id',
    UPDATE: 'PATCH /leave-requests/:id', // IMPORTANT: PATCH not PUT
    DELETE: 'DELETE /leave-requests/:id',
    TYPES: 'GET /leave-requests/types',
    STATS: 'GET /leave-requests/stats',
    CALENDAR: 'GET /leave-requests/calendar',
    PENDING_APPROVALS: 'GET /leave-requests/pending-approvals',
    CHECK_CONFLICTS: 'POST /leave-requests/check-conflicts',
    BALANCE: 'GET /leave-requests/balance/:employeeId',
    SUBMIT: 'POST /leave-requests/:id/submit',
    APPROVE: 'POST /leave-requests/:id/approve',
    REJECT: 'POST /leave-requests/:id/reject',
    CANCEL: 'POST /leave-requests/:id/cancel',
    CONFIRM_RETURN: 'POST /leave-requests/:id/confirm-return',
    REQUEST_EXTENSION: 'POST /leave-requests/:id/request-extension',
    COMPLETE_HANDOVER: 'POST /leave-requests/:id/complete-handover',
    DOCUMENTS: 'POST /leave-requests/:id/documents',
  },

  PAYROLL: {
    // IMPORTANT: Routes are /payroll/* NOT /hr/payroll/*
    LIST: 'GET /payroll',
    CREATE: 'POST /payroll',
    GET: 'GET /payroll/:id',
    UPDATE: 'PUT /payroll/:id',
    DELETE: 'DELETE /payroll/:id',
    STATS: 'GET /payroll/stats',
    GENERATE: 'POST /payroll/generate',
    APPROVE: 'POST /payroll/approve',
    PAY: 'POST /payroll/pay',
    WPS_SUBMIT: 'POST /payroll/wps/submit',
    APPROVE_SINGLE: 'POST /payroll/:id/approve',
    PAY_SINGLE: 'POST /payroll/:id/pay',
  },

  PAYROLL_RUNS: {
    // IMPORTANT: Routes are /payroll-runs/* NOT /hr/payroll-runs/*
    // NOTE: PATCH for updates, not PUT
    LIST: 'GET /payroll-runs',
    CREATE: 'POST /payroll-runs',
    GET: 'GET /payroll-runs/:id',
    UPDATE: 'PATCH /payroll-runs/:id', // IMPORTANT: PATCH not PUT
    DELETE: 'DELETE /payroll-runs/:id',
    STATS: 'GET /payroll-runs/stats',
    CALCULATE: 'POST /payroll-runs/:id/calculate',
    VALIDATE: 'POST /payroll-runs/:id/validate',
    APPROVE: 'POST /payroll-runs/:id/approve',
    PROCESS_PAYMENTS: 'POST /payroll-runs/:id/process-payments',
    CANCEL: 'POST /payroll-runs/:id/cancel',
    GENERATE_WPS: 'POST /payroll-runs/:id/generate-wps',
    SEND_NOTIFICATIONS: 'POST /payroll-runs/:id/send-notifications',
    HOLD_EMPLOYEE: 'POST /payroll-runs/:id/employees/:empId/hold',
    UNHOLD_EMPLOYEE: 'POST /payroll-runs/:id/employees/:empId/unhold',
  },

  HR_ADVANCES: {
    // NOTE: Uses :advanceId parameter, not :id
    LIST: 'GET /hr/advances',
    CREATE: 'POST /hr/advances',
    GET: 'GET /hr/advances/:advanceId',
    UPDATE: 'PATCH /hr/advances/:advanceId',
    DELETE: 'DELETE /hr/advances/:advanceId',
    STATS: 'GET /hr/advances/stats',
    PENDING_APPROVALS: 'GET /hr/advances/pending-approvals',
    OVERDUE_RECOVERIES: 'GET /hr/advances/overdue-recoveries',
    EMERGENCY: 'GET /hr/advances/emergency',
    CHECK_ELIGIBILITY: 'POST /hr/advances/check-eligibility',
    BULK_DELETE: 'POST /hr/advances/bulk-delete',
    BY_EMPLOYEE: 'GET /hr/advances/by-employee/:employeeId',
    APPROVE: 'POST /hr/advances/:advanceId/approve',
    REJECT: 'POST /hr/advances/:advanceId/reject',
    CANCEL: 'POST /hr/advances/:advanceId/cancel',
    DISBURSE: 'POST /hr/advances/:advanceId/disburse',
    RECOVER: 'POST /hr/advances/:advanceId/recover',
    PAYROLL_DEDUCTION: 'POST /hr/advances/:advanceId/payroll-deduction',
    EARLY_RECOVERY: 'POST /hr/advances/:advanceId/early-recovery',
    WRITE_OFF: 'POST /hr/advances/:advanceId/write-off',
    ISSUE_CLEARANCE: 'POST /hr/advances/:advanceId/issue-clearance',
    DOCUMENTS: 'POST /hr/advances/:advanceId/documents',
    COMMUNICATIONS: 'POST /hr/advances/:advanceId/communications',
  },

  SAUDI_BANKING: {
    // SADAD
    SADAD_BILLERS: 'GET /saudi-banking/sadad/billers',
    SADAD_BILLERS_SEARCH: 'GET /saudi-banking/sadad/billers/search',
    SADAD_BILLS_INQUIRY: 'POST /saudi-banking/sadad/bills/inquiry',
    SADAD_BILLS_PAY: 'POST /saudi-banking/sadad/bills/pay',
    SADAD_PAYMENT_STATUS: 'GET /saudi-banking/sadad/payments/:transactionId/status',
    SADAD_PAYMENTS_HISTORY: 'GET /saudi-banking/sadad/payments/history',
    // WPS
    WPS_GENERATE: 'POST /saudi-banking/wps/generate',
    WPS_DOWNLOAD: 'POST /saudi-banking/wps/download',
    WPS_VALIDATE: 'POST /saudi-banking/wps/validate',
    WPS_FILES: 'GET /saudi-banking/wps/files',
    WPS_SARIE_BANKS: 'GET /saudi-banking/wps/sarie-banks',
    // MUDAD - NOTE: Compliance routes use POST not GET
    MUDAD_PAYROLL_CALCULATE: 'POST /saudi-banking/mudad/payroll/calculate',
    MUDAD_PAYROLL_SUBMIT: 'POST /saudi-banking/mudad/payroll/submit',
    MUDAD_GOSI_CALCULATE: 'POST /saudi-banking/mudad/gosi/calculate',
    MUDAD_GOSI_REPORT: 'POST /saudi-banking/mudad/gosi/report', // POST not GET
    MUDAD_WPS_GENERATE: 'POST /saudi-banking/mudad/wps/generate',
    MUDAD_SUBMISSION_STATUS: 'GET /saudi-banking/mudad/submissions/:submissionId/status',
    MUDAD_COMPLIANCE_NITAQAT: 'POST /saudi-banking/mudad/compliance/nitaqat', // POST not GET
    MUDAD_COMPLIANCE_MINIMUM_WAGE: 'POST /saudi-banking/mudad/compliance/minimum-wage', // POST not GET
  },

  SETTINGS: {
    GET_ALL: 'GET /settings',
    UPDATE_ACCOUNT: 'PATCH /settings/account',
    UPDATE_APPEARANCE: 'PATCH /settings/appearance',
    UPDATE_DISPLAY: 'PATCH /settings/display',
    UPDATE_NOTIFICATIONS: 'PATCH /settings/notifications',
    // Company
    GET_COMPANY: 'GET /settings/company',
    UPDATE_COMPANY: 'PUT /settings/company',
    UPLOAD_LOGO: 'POST /settings/company/logo',
    // Taxes
    LIST_TAXES: 'GET /settings/taxes',
    CREATE_TAX: 'POST /settings/taxes',
    UPDATE_TAX: 'PUT /settings/taxes/:id',
    DELETE_TAX: 'DELETE /settings/taxes/:id',
    SET_DEFAULT_TAX: 'PATCH /settings/taxes/:id/default',
    // Payment Modes
    LIST_PAYMENT_MODES: 'GET /settings/payment-modes',
    CREATE_PAYMENT_MODE: 'POST /settings/payment-modes',
    UPDATE_PAYMENT_MODE: 'PUT /settings/payment-modes/:id',
    DELETE_PAYMENT_MODE: 'DELETE /settings/payment-modes/:id',
    SET_DEFAULT_PAYMENT_MODE: 'PATCH /settings/payment-modes/:id/default',
    // Finance
    GET_FINANCE: 'GET /settings/finance',
    UPDATE_FINANCE: 'PUT /settings/finance',
  },
} as const

// =============================================================================
// IMPORTANT NOTES
// =============================================================================
// 1. Leave requests use /leave-requests/* NOT /leave/*
// 2. Many CRUD operations use PATCH not PUT for updates
// 3. Bank reconciliation path is /bank-reconciliation/* (with hyphen)
// 4. Currency routes exist at both /api/currency/* and /api/v1/bank-reconciliation/currency/*
// 5. HR Advances use :advanceId parameter, not :id
// 6. Retainers use "replenish" not "deposit", "history" not "transactions"
// 7. MUDAD compliance routes use POST not GET
// 8. Payroll routes are /payroll/* NOT /hr/payroll/*
// 9. Payroll runs routes are /payroll-runs/* NOT /hr/payroll-runs/*
// =============================================================================
