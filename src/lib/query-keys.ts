/**
 * Centralized Query Key Factory
 *
 * This file contains all TanStack Query cache keys used throughout the application.
 * Using a centralized factory ensures:
 * - Type safety for query keys
 * - Consistent invalidation patterns
 * - Easy refactoring and maintenance
 * - Better developer experience with autocomplete
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

// ==================== TYPES ====================

export type QueryKeyFactory = typeof QueryKeys

// ==================== MAIN FACTORY ====================

export const QueryKeys = {
  // ==================== TASKS ====================
  tasks: {
    all: () => ['tasks'] as const,
    lists: () => [...QueryKeys.tasks.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.tasks.lists(), filters] as const,
    details: () => [...QueryKeys.tasks.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.tasks.details(), id] as const,
    upcoming: (days: number) => [...QueryKeys.tasks.all(), 'upcoming', days] as const,
    overdue: () => [...QueryKeys.tasks.all(), 'overdue'] as const,
    dueToday: () => [...QueryKeys.tasks.all(), 'due-today'] as const,
    myTasks: (filters?: Record<string, any>) => [...QueryKeys.tasks.all(), 'my-tasks', filters] as const,
    stats: (filters?: Record<string, any>) => [...QueryKeys.tasks.all(), 'stats', filters] as const,
    templates: () => [...QueryKeys.tasks.all(), 'templates'] as const,
    timeTracking: (taskId: string) => [...QueryKeys.tasks.all(), taskId, 'time-tracking'] as const,
    recurrenceHistory: (taskId: string) => [...QueryKeys.tasks.all(), taskId, 'recurrence-history'] as const,
    attachmentVersions: (taskId: string, attachmentId: string) => ['task-attachment-versions', taskId, attachmentId] as const,
  },

  // ==================== CASES ====================
  cases: {
    all: () => ['cases'] as const,
    lists: () => [...QueryKeys.cases.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.cases.lists(), filters] as const,
    details: () => [...QueryKeys.cases.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.cases.details(), id] as const,
    stats: () => [...QueryKeys.cases.all(), 'stats'] as const,
    pipeline: () => [...QueryKeys.cases.all(), 'pipeline'] as const,
    pipelineByStage: (stageId?: string) => [...QueryKeys.cases.pipeline(), stageId] as const,
  },

  // ==================== CLIENTS ====================
  clients: {
    all: () => ['clients'] as const,
    lists: () => [...QueryKeys.clients.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.clients.lists(), filters] as const,
    details: () => [...QueryKeys.clients.all(), 'detail'] as const,
    detail: (clientId: string) => [...QueryKeys.clients.details(), clientId] as const,
    search: (query: string) => [...QueryKeys.clients.all(), 'search', query] as const,
    stats: () => [...QueryKeys.clients.all(), 'stats'] as const,
    topRevenue: (limit: number) => [...QueryKeys.clients.all(), 'top-revenue', limit] as const,
    payments: (clientId: string) => [...QueryKeys.clients.all(), clientId, 'payments'] as const,
    billingInfo: (clientId: string) => [...QueryKeys.clients.all(), clientId, 'billing-info'] as const,
    wathq: (clientId: string, dataType: string) => [...QueryKeys.clients.all(), clientId, 'wathq', dataType] as const,
  },

  // ==================== CONTACTS ====================
  contacts: {
    all: () => ['contacts'] as const,
    lists: () => [...QueryKeys.contacts.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.contacts.lists(), filters] as const,
    details: () => [...QueryKeys.contacts.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.contacts.details(), id] as const,
    stats: () => [...QueryKeys.contacts.all(), 'stats'] as const,
    search: (query: string) => [...QueryKeys.contacts.all(), 'search', query] as const,
    recent: () => [...QueryKeys.contacts.all(), 'recent'] as const,
    favorites: () => [...QueryKeys.contacts.all(), 'favorites'] as const,
  },

  // ==================== INVOICES ====================
  invoices: {
    all: () => ['invoices'] as const,
    lists: () => [...QueryKeys.invoices.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.invoices.lists(), filters] as const,
    details: () => [...QueryKeys.invoices.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.invoices.details(), id] as const,
    stats: () => [...QueryKeys.invoices.all(), 'stats'] as const,
    recurring: () => [...QueryKeys.invoices.all(), 'recurring'] as const,
    overdue: () => [...QueryKeys.invoices.all(), 'overdue'] as const,
    draft: () => [...QueryKeys.invoices.all(), 'draft'] as const,
  },

  // ==================== INVOICE TEMPLATES ====================
  invoiceTemplates: {
    all: () => ['invoice-templates'] as const,
    lists: () => [...QueryKeys.invoiceTemplates.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.invoiceTemplates.lists(), filters] as const,
    details: () => [...QueryKeys.invoiceTemplates.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.invoiceTemplates.details(), id] as const,
    default: () => [...QueryKeys.invoiceTemplates.all(), 'default'] as const,
    preview: (id: string) => [...QueryKeys.invoiceTemplates.detail(id), 'preview'] as const,
  },

  // ==================== PAYMENTS ====================
  payments: {
    all: () => ['payments'] as const,
    lists: () => [...QueryKeys.payments.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.payments.lists(), filters] as const,
    details: () => [...QueryKeys.payments.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.payments.details(), id] as const,
    stats: () => [...QueryKeys.payments.all(), 'stats'] as const,
    methods: () => ['payment-methods'] as const,
    modes: () => ['payment-modes'] as const,
    terms: () => ['payment-terms'] as const,
    term: (id: string) => [...QueryKeys.payments.terms(), id] as const,
  },

  // ==================== EXPENSES ====================
  expenses: {
    all: () => ['expenses'] as const,
    lists: () => [...QueryKeys.expenses.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.expenses.lists(), filters] as const,
    details: () => [...QueryKeys.expenses.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.expenses.details(), id] as const,
    stats: () => [...QueryKeys.expenses.all(), 'stats'] as const,
    categories: () => [...QueryKeys.expenses.all(), 'categories'] as const,
  },

  // ==================== EXPENSE CLAIMS ====================
  expenseClaims: {
    all: () => ['expense-claims'] as const,
    lists: () => [...QueryKeys.expenseClaims.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.expenseClaims.lists(), filters] as const,
    details: () => [...QueryKeys.expenseClaims.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.expenseClaims.details(), id] as const,
    stats: () => [...QueryKeys.expenseClaims.all(), 'stats'] as const,
    pendingApprovals: () => [...QueryKeys.expenseClaims.all(), 'pending-approvals'] as const,
    pendingPayments: () => [...QueryKeys.expenseClaims.all(), 'pending-payments'] as const,
    employeeClaims: (employeeId: string) => [...QueryKeys.expenseClaims.all(), 'employee', employeeId] as const,
    mileageRates: () => [...QueryKeys.expenseClaims.all(), 'mileage-rates'] as const,
    corporateCard: (employeeId: string) => [...QueryKeys.expenseClaims.all(), 'corporate-card', employeeId] as const,
  },

  // ==================== EXPENSE POLICIES ====================
  expensePolicies: {
    all: () => ['expense-policies'] as const,
    lists: () => [...QueryKeys.expensePolicies.all(), 'list'] as const,
    list: () => [...QueryKeys.expensePolicies.lists()] as const,
    details: () => [...QueryKeys.expensePolicies.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.expensePolicies.details(), id] as const,
    default: () => [...QueryKeys.expensePolicies.all(), 'default'] as const,
  },

  // ==================== QUOTES ====================
  quotes: {
    all: () => ['quotes'] as const,
    lists: () => [...QueryKeys.quotes.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.quotes.lists(), filters] as const,
    details: () => [...QueryKeys.quotes.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.quotes.details(), id] as const,
    stats: () => [...QueryKeys.quotes.all(), 'stats'] as const,
  },

  // ==================== CREDIT NOTES ====================
  creditNotes: {
    all: () => ['creditNotes'] as const,
    lists: () => [...QueryKeys.creditNotes.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.creditNotes.lists(), filters] as const,
    details: () => [...QueryKeys.creditNotes.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.creditNotes.details(), id] as const,
  },

  // ==================== ACCOUNTING ====================
  accounting: {
    all: () => ['accounting'] as const,
    // Accounts
    accounts: () => [...QueryKeys.accounting.all(), 'accounts'] as const,
    accountsList: (filters?: Record<string, any>) => [...QueryKeys.accounting.accounts(), 'list', filters] as const,
    account: (id: string) => [...QueryKeys.accounting.accounts(), id] as const,
    accountTypes: () => [...QueryKeys.accounting.accounts(), 'types'] as const,
    // GL Entries
    glEntries: () => [...QueryKeys.accounting.all(), 'gl-entries'] as const,
    glEntriesList: (filters?: Record<string, any>) => [...QueryKeys.accounting.glEntries(), 'list', filters] as const,
    glEntry: (id: string) => [...QueryKeys.accounting.glEntries(), id] as const,
    // Journal Entries
    journalEntries: () => [...QueryKeys.accounting.all(), 'journal-entries'] as const,
    journalEntriesList: (filters?: Record<string, any>) => [...QueryKeys.accounting.journalEntries(), 'list', filters] as const,
    journalEntry: (id: string) => [...QueryKeys.accounting.journalEntries(), id] as const,
    // Fiscal Periods
    fiscalPeriods: () => [...QueryKeys.accounting.all(), 'fiscal-periods'] as const,
    fiscalPeriodsList: () => [...QueryKeys.accounting.fiscalPeriods(), 'list'] as const,
    fiscalPeriod: (id: string) => [...QueryKeys.accounting.fiscalPeriods(), id] as const,
    fiscalPeriodBalances: (id: string) => [...QueryKeys.accounting.fiscalPeriods(), id, 'balances'] as const,
    currentFiscalPeriod: () => [...QueryKeys.accounting.fiscalPeriods(), 'current'] as const,
    fiscalYearsSummary: () => [...QueryKeys.accounting.fiscalPeriods(), 'years-summary'] as const,
    canPost: (date: string) => [...QueryKeys.accounting.fiscalPeriods(), 'can-post', date] as const,
    // Recurring Transactions
    recurring: () => [...QueryKeys.accounting.all(), 'recurring'] as const,
    recurringList: (filters?: Record<string, any>) => [...QueryKeys.accounting.recurring(), 'list', filters] as const,
    recurringItem: (id: string) => [...QueryKeys.accounting.recurring(), id] as const,
    recurringUpcoming: () => [...QueryKeys.accounting.recurring(), 'upcoming'] as const,
    // Price Levels
    priceLevels: () => [...QueryKeys.accounting.all(), 'price-levels'] as const,
    priceLevelsList: () => [...QueryKeys.accounting.priceLevels(), 'list'] as const,
    priceLevel: (id: string) => [...QueryKeys.accounting.priceLevels(), id] as const,
    clientRate: (clientId: string, baseRate: number, serviceType?: string) =>
      [...QueryKeys.accounting.priceLevels(), 'client-rate', clientId, baseRate, serviceType] as const,
    // Bills
    bills: () => [...QueryKeys.accounting.all(), 'bills'] as const,
    billsList: (filters?: Record<string, any>) => [...QueryKeys.accounting.bills(), 'list', filters] as const,
    bill: (id: string) => [...QueryKeys.accounting.bills(), id] as const,
    // Debit Notes
    debitNotes: () => [...QueryKeys.accounting.all(), 'debit-notes'] as const,
    debitNotesList: (filters?: Record<string, any>) => [...QueryKeys.accounting.debitNotes(), 'list', filters] as const,
    debitNote: (id: string) => [...QueryKeys.accounting.debitNotes(), id] as const,
    billDebitNotes: (billId: string) => [...QueryKeys.accounting.bills(), billId, 'debit-notes'] as const,
    // Vendors
    vendors: () => [...QueryKeys.accounting.all(), 'vendors'] as const,
    vendorsList: (filters?: Record<string, any>) => [...QueryKeys.accounting.vendors(), 'list', filters] as const,
    vendor: (id: string) => [...QueryKeys.accounting.vendors(), id] as const,
    // Retainers
    retainers: () => [...QueryKeys.accounting.all(), 'retainers'] as const,
    retainersList: (filters?: Record<string, any>) => [...QueryKeys.accounting.retainers(), 'list', filters] as const,
    retainer: (id: string) => [...QueryKeys.accounting.retainers(), id] as const,
    retainerTransactions: (id: string) => [...QueryKeys.accounting.retainers(), id, 'transactions'] as const,
    // Leads
    leads: () => [...QueryKeys.accounting.all(), 'leads'] as const,
    leadsList: (filters?: Record<string, any>) => [...QueryKeys.accounting.leads(), 'list', filters] as const,
    lead: (id: string) => [...QueryKeys.accounting.leads(), id] as const,
    leadStats: () => [...QueryKeys.accounting.leads(), 'stats'] as const,
    // Reports
    reports: () => [...QueryKeys.accounting.all(), 'reports'] as const,
    profitLoss: (startDate: string, endDate: string) => [...QueryKeys.accounting.reports(), 'profit-loss', startDate, endDate] as const,
    balanceSheet: (asOfDate?: string) => [...QueryKeys.accounting.reports(), 'balance-sheet', asOfDate] as const,
    trialBalance: (asOfDate?: string) => [...QueryKeys.accounting.reports(), 'trial-balance', asOfDate] as const,
    arAging: () => [...QueryKeys.accounting.reports(), 'ar-aging'] as const,
    caseProfitability: (startDate: string, endDate: string) => [...QueryKeys.accounting.reports(), 'case-profitability', startDate, endDate] as const,
  },

  // ==================== FINANCE ADVANCED ====================
  financeAdvanced: {
    all: () => ['finance-advanced'] as const,
    // Bank Feeds
    bankFeeds: () => ['bank-feeds'] as const,
    bankFeed: (id: string) => ['bank-feed', id] as const,
    bankFeedList: (filters?: Record<string, any>) => ['bank-feeds', filters] as const,
    // Bank Transactions
    bankTransactions: () => ['bank-transactions'] as const,
    bankTransactionsList: (id: string, filters?: Record<string, any>) => ['bank-transactions', id, filters] as const,
    matchSuggestions: (accountId: string) => ['match-suggestions', accountId] as const,
    // Matching Rules
    matchingRules: () => ['matching-rules'] as const,
    // Reconciliation
    reconciliationReport: (accountId: string, params?: Record<string, any>) => ['reconciliation-report', accountId, params] as const,
    // Exchange Rates
    exchangeRates: () => ['exchange-rates'] as const,
    exchangeRate: (fromCurrency: string, toCurrency: string) => ['exchange-rate', fromCurrency, toCurrency] as const,
    rateHistory: (fromCurrency: string, toCurrency: string, params?: Record<string, any>) => ['rate-history', fromCurrency, toCurrency, params] as const,
    currencySettings: () => ['currency-settings'] as const,
  },

  // ==================== BILLING ====================
  billing: {
    all: () => ['billing'] as const,
    // Rates
    rates: () => [...QueryKeys.billing.all(), 'rates'] as const,
    ratesList: (filters?: Record<string, any>) => [...QueryKeys.billing.rates(), 'list', filters] as const,
    rateDetail: (id: string) => [...QueryKeys.billing.rates(), 'detail', id] as const,
    // Groups
    groups: () => [...QueryKeys.billing.all(), 'groups'] as const,
    groupsList: (filters?: Record<string, any>) => [...QueryKeys.billing.groups(), 'list', filters] as const,
    groupDetail: (id: string) => [...QueryKeys.billing.groups(), 'detail', id] as const,
    // Rate Cards
    rateCards: () => [...QueryKeys.billing.all(), 'rate-cards'] as const,
    rateCardsList: (filters?: Record<string, any>) => [...QueryKeys.billing.rateCards(), 'list', filters] as const,
    rateCardForEntity: (entityType: string, entityId: string) =>
      [...QueryKeys.billing.rateCards(), 'entity', entityType, entityId] as const,
    // Time Entries
    timeEntries: () => [...QueryKeys.billing.all(), 'time-entries'] as const,
    timeEntriesList: (filters?: Record<string, any>) => [...QueryKeys.billing.timeEntries(), 'list', filters] as const,
    pendingTimeEntries: () => ['pendingTimeEntries'] as const,
    timer: () => ['timer'] as const,
    // Statistics
    statistics: () => [...QueryKeys.billing.all(), 'statistics'] as const,
    // Settings
    settings: () => ['company-settings'] as const,
    taxes: () => ['taxes'] as const,
    financeSettings: () => ['finance-settings'] as const,
  },

  // ==================== TRUST ACCOUNTS ====================
  trustAccounts: {
    all: () => ['trust-accounts'] as const,
    lists: () => [...QueryKeys.trustAccounts.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.trustAccounts.lists(), filters] as const,
    details: () => [...QueryKeys.trustAccounts.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.trustAccounts.details(), id] as const,
    clientBalances: (params?: Record<string, any>) => [...QueryKeys.trustAccounts.all(), 'client-balances', params] as const,
    clientLedger: (accountId: string, clientId: string, params?: Record<string, any>) =>
      [...QueryKeys.trustAccounts.all(), accountId, 'client', clientId, 'ledger', params] as const,
    reconciliation: (id: string) => [...QueryKeys.trustAccounts.all(), id, 'reconciliation'] as const,
    stats: () => [...QueryKeys.trustAccounts.all(), 'stats'] as const,
  },

  // ==================== INTER-COMPANY ====================
  interCompany: {
    all: () => ['inter-company'] as const,
    firms: () => ['inter-company-firms'] as const,
    transactions: (filters?: Record<string, any>) => ['inter-company-transactions', filters] as const,
    balances: () => ['inter-company-balances'] as const,
    reconciliations: (filters?: Record<string, any>) => ['inter-company-reconciliations', filters] as const,
  },

  // ==================== EMPLOYEES/HR ====================
  employees: {
    all: () => ['employees'] as const,
    lists: () => [...QueryKeys.employees.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.employees.lists(), filters] as const,
    details: () => [...QueryKeys.employees.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.employees.details(), id] as const,
    stats: () => [...QueryKeys.employees.all(), 'stats'] as const,
    search: (query: string) => [...QueryKeys.employees.all(), 'search', query] as const,
  },

  // ==================== STAFF (Lawyers/Team) ====================
  staff: {
    all: () => ['staff'] as const,
    lists: () => [...QueryKeys.staff.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.staff.lists(), filters] as const,
    details: () => [...QueryKeys.staff.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.staff.details(), id] as const,
    stats: () => [...QueryKeys.staff.all(), 'stats'] as const,
  },

  // ==================== ATTENDANCE ====================
  attendance: {
    all: () => ['attendance'] as const,
    lists: () => [...QueryKeys.attendance.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.attendance.lists(), filters] as const,
    details: () => [...QueryKeys.attendance.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.attendance.details(), id] as const,
    stats: () => [...QueryKeys.attendance.all(), 'stats'] as const,
    employeeSummary: (employeeId: string, startDate: string, endDate: string) =>
      [...QueryKeys.attendance.all(), 'employee-summary', employeeId, startDate, endDate] as const,
    employeeSummaryAlt: (employeeId: string, startDate: string, endDate: string) =>
      [...QueryKeys.attendance.all(), 'employee-summary-alt', employeeId, startDate, endDate] as const,
    allViolations: () => [...QueryKeys.attendance.all(), 'all-violations'] as const,
    monthlyReport: (month: number, year: number, department?: string) =>
      [...QueryKeys.attendance.all(), 'monthly-report', month, year, department] as const,
    departmentStats: (department: string) => [...QueryKeys.attendance.all(), 'department-stats', department] as const,
    checkInStatus: (employeeId: string) => [...QueryKeys.attendance.all(), 'check-in-status', employeeId] as const,
    byEmployeeDate: (employeeId: string, date: string) => [...QueryKeys.attendance.all(), 'by-employee-date', employeeId, date] as const,
    breaks: (recordId: string) => [...QueryKeys.attendance.all(), 'breaks', recordId] as const,
  },

  // ==================== LEAVE ====================
  leave: {
    all: () => ['leave-requests'] as const,
    lists: () => [...QueryKeys.leave.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.leave.lists(), filters] as const,
    details: () => [...QueryKeys.leave.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.leave.details(), id] as const,
    balance: (employeeId: string) => [...QueryKeys.leave.all(), 'balance', employeeId] as const,
    stats: (filters?: Record<string, any>) => [...QueryKeys.leave.all(), 'stats', filters] as const,
    calendar: (startDate: string, endDate: string, department?: string) =>
      [...QueryKeys.leave.all(), 'calendar', startDate, endDate, department] as const,
    pendingApprovals: () => [...QueryKeys.leave.all(), 'pending-approvals'] as const,
    types: () => [...QueryKeys.leave.all(), 'types'] as const,
  },

  // ==================== LEAVE ALLOCATION ====================
  leaveAllocation: {
    all: () => ['leave-allocations'] as const,
    lists: () => [...QueryKeys.leaveAllocation.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.leaveAllocation.lists(), filters] as const,
    details: () => [...QueryKeys.leaveAllocation.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.leaveAllocation.details(), id] as const,
    employeeBalance: (employeeId: string, leaveType?: string) =>
      [...QueryKeys.leaveAllocation.all(), 'employee-balance', employeeId, leaveType] as const,
    employeeAll: (employeeId: string) =>
      [...QueryKeys.leaveAllocation.all(), 'employee-all', employeeId] as const,
    summary: (periodId: string, filters?: Record<string, any>) =>
      [...QueryKeys.leaveAllocation.all(), 'summary', periodId, filters] as const,
    carryForwardSummary: (fromPeriodId: string, toPeriodId: string, filters?: Record<string, any>) =>
      [...QueryKeys.leaveAllocation.all(), 'carry-forward-summary', fromPeriodId, toPeriodId, filters] as const,
    lowBalance: (leaveType: string, threshold: number) =>
      [...QueryKeys.leaveAllocation.all(), 'low-balance', leaveType, threshold] as const,
    expiringCarryForward: (daysBeforeExpiry: number) =>
      [...QueryKeys.leaveAllocation.all(), 'expiring-carry-forward', daysBeforeExpiry] as const,
    history: (employeeId: string, leaveType?: string) =>
      [...QueryKeys.leaveAllocation.all(), 'history', employeeId, leaveType] as const,
    statistics: (filters?: Record<string, any>) =>
      [...QueryKeys.leaveAllocation.all(), 'statistics', filters] as const,
    // Legacy support for employee key
    employee: (employeeId: string, leavePeriodId?: string) =>
      [...QueryKeys.leaveAllocation.all(), 'employee', employeeId, leavePeriodId] as const,
    stats: () => [...QueryKeys.leaveAllocation.all(), 'stats'] as const,
  },

  // ==================== LEAVE POLICY ====================
  leavePolicy: {
    all: () => ['leave-policies'] as const,
    lists: () => [...QueryKeys.leavePolicy.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.leavePolicy.lists(), filters] as const,
    details: () => [...QueryKeys.leavePolicy.all(), 'detail'] as const,
    detail: (policyId: string) => [...QueryKeys.leavePolicy.details(), policyId] as const,
    stats: () => [...QueryKeys.leavePolicy.all(), 'stats'] as const,
    comparison: (policyIds: string[]) => [...QueryKeys.leavePolicy.all(), 'comparison', policyIds] as const,
    // Assignments
    assignments: () => [...QueryKeys.leavePolicy.all(), 'assignments'] as const,
    assignmentsList: (filters?: Record<string, any>) => [...QueryKeys.leavePolicy.assignments(), 'list', filters] as const,
    assignmentDetail: (assignmentId: string) => [...QueryKeys.leavePolicy.assignments(), assignmentId] as const,
    employeePolicy: (employeeId: string) => [...QueryKeys.leavePolicy.all(), 'employee-policy', employeeId] as const,
    employeePolicyHistory: (employeeId: string) => [...QueryKeys.leavePolicy.all(), 'employee-policy-history', employeeId] as const,
    unassignedEmployees: () => [...QueryKeys.leavePolicy.all(), 'unassigned-employees'] as const,
    employeeAllocation: (employeeId: string, leavePeriodId?: string) =>
      [...QueryKeys.leavePolicy.all(), 'employee-allocation', employeeId, leavePeriodId] as const,
    preview: (policyId: string, employeeId: string, leavePeriodId?: string) =>
      [...QueryKeys.leavePolicy.all(), 'preview', policyId, employeeId, leavePeriodId] as const,
  },

  // ==================== LEAVE PERIOD ====================
  leavePeriod: {
    all: () => ['leave-periods'] as const,
    lists: () => [...QueryKeys.leavePeriod.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.leavePeriod.lists(), filters] as const,
    details: () => [...QueryKeys.leavePeriod.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.leavePeriod.details(), id] as const,
    current: () => [...QueryKeys.leavePeriod.all(), 'current'] as const,
    active: () => [...QueryKeys.leavePeriod.all(), 'active'] as const,
  },

  // ==================== LEAVE ENCASHMENT ====================
  leaveEncashment: {
    all: () => ['leave-encashment'] as const,
    lists: () => [...QueryKeys.leaveEncashment.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.leaveEncashment.lists(), filters] as const,
    details: () => [...QueryKeys.leaveEncashment.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.leaveEncashment.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.leaveEncashment.all(), 'employee', employeeId] as const,
    eligibility: (employeeId: string) => [...QueryKeys.leaveEncashment.all(), 'eligibility', employeeId] as const,
    stats: () => [...QueryKeys.leaveEncashment.all(), 'stats'] as const,
    pendingApprovals: () => [...QueryKeys.leaveEncashment.all(), 'pending-approvals'] as const,
  },

  // ==================== COMPENSATORY LEAVE ====================
  compensatoryLeave: {
    all: () => ['compensatory-leave'] as const,
    lists: () => [...QueryKeys.compensatoryLeave.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.compensatoryLeave.lists(), filters] as const,
    details: () => [...QueryKeys.compensatoryLeave.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.compensatoryLeave.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.compensatoryLeave.all(), 'employee', employeeId] as const,
    balance: (employeeId: string) => [...QueryKeys.compensatoryLeave.all(), 'balance', employeeId] as const,
    stats: () => [...QueryKeys.compensatoryLeave.all(), 'stats'] as const,
    pendingApprovals: () => [...QueryKeys.compensatoryLeave.all(), 'pending-approvals'] as const,
  },

  // ==================== PAYROLL ====================
  payroll: {
    all: () => ['payroll'] as const,
    lists: () => [...QueryKeys.payroll.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.payroll.lists(), filters] as const,
    details: () => [...QueryKeys.payroll.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.payroll.details(), id] as const,
    stats: () => [...QueryKeys.payroll.all(), 'stats'] as const,
    settings: () => [...QueryKeys.payroll.all(), 'settings'] as const,
  },

  // ==================== PAYROLL RUN ====================
  payrollRun: {
    all: () => ['payroll-runs'] as const,
    lists: () => [...QueryKeys.payrollRun.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.payrollRun.lists(), filters] as const,
    details: () => [...QueryKeys.payrollRun.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.payrollRun.details(), id] as const,
    current: () => [...QueryKeys.payrollRun.all(), 'current'] as const,
    draft: () => [...QueryKeys.payrollRun.all(), 'draft'] as const,
    stats: (runId: string) => [...QueryKeys.payrollRun.all(), runId, 'stats'] as const,
    entries: (runId: string) => [...QueryKeys.payrollRun.all(), runId, 'entries'] as const,
  },

  // ==================== SALARY COMPONENTS ====================
  salaryComponents: {
    all: () => ['salary-components'] as const,
    lists: () => [...QueryKeys.salaryComponents.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.salaryComponents.lists(), filters] as const,
    details: () => [...QueryKeys.salaryComponents.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.salaryComponents.details(), id] as const,
    byType: (type: string) => [...QueryKeys.salaryComponents.all(), 'by-type', type] as const,
  },

  // ==================== ADVANCES ====================
  advances: {
    all: () => ['advances'] as const,
    lists: () => [...QueryKeys.advances.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.advances.lists(), filters] as const,
    details: () => [...QueryKeys.advances.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.advances.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.advances.all(), 'employee', employeeId] as const,
    stats: () => [...QueryKeys.advances.all(), 'stats'] as const,
    pendingApprovals: () => [...QueryKeys.advances.all(), 'pending-approvals'] as const,
  },

  // ==================== LOANS ====================
  loans: {
    all: () => ['loans'] as const,
    lists: () => [...QueryKeys.loans.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.loans.lists(), filters] as const,
    details: () => [...QueryKeys.loans.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.loans.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.loans.all(), 'employee', employeeId] as const,
    repaymentSchedule: (loanId: string) => [...QueryKeys.loans.all(), loanId, 'repayment-schedule'] as const,
    stats: () => [...QueryKeys.loans.all(), 'stats'] as const,
    pendingApprovals: () => [...QueryKeys.loans.all(), 'pending-approvals'] as const,
  },

  // ==================== BENEFITS ====================
  benefits: {
    all: () => ['benefits'] as const,
    lists: () => [...QueryKeys.benefits.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.benefits.lists(), filters] as const,
    details: () => [...QueryKeys.benefits.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.benefits.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.benefits.all(), 'employee', employeeId] as const,
    enrollments: (filters?: Record<string, any>) => [...QueryKeys.benefits.all(), 'enrollments', filters] as const,
    stats: () => [...QueryKeys.benefits.all(), 'stats'] as const,
  },

  // ==================== COMPENSATION ====================
  compensation: {
    all: () => ['compensation'] as const,
    lists: () => [...QueryKeys.compensation.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.compensation.lists(), filters] as const,
    details: () => [...QueryKeys.compensation.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.compensation.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.compensation.all(), 'employee', employeeId] as const,
    history: (employeeId: string) => [...QueryKeys.compensation.all(), 'history', employeeId] as const,
    benchmarks: () => [...QueryKeys.compensation.all(), 'benchmarks'] as const,
  },

  // ==================== EMPLOYEE INCENTIVES ====================
  employeeIncentives: {
    all: () => ['employee-incentives'] as const,
    lists: () => [...QueryKeys.employeeIncentives.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.employeeIncentives.lists(), filters] as const,
    details: () => [...QueryKeys.employeeIncentives.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.employeeIncentives.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.employeeIncentives.all(), 'employee', employeeId] as const,
    stats: () => [...QueryKeys.employeeIncentives.all(), 'stats'] as const,
  },

  // ==================== RETENTION BONUS ====================
  retentionBonus: {
    all: () => ['retention-bonus'] as const,
    lists: () => [...QueryKeys.retentionBonus.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.retentionBonus.lists(), filters] as const,
    details: () => [...QueryKeys.retentionBonus.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.retentionBonus.details(), id] as const,
    employeeHistory: (employeeId: string) => [...QueryKeys.retentionBonus.all(), 'employee-history', employeeId] as const,
    vestingStatus: (id: string) => [...QueryKeys.retentionBonus.all(), 'vesting-status', id] as const,
    dueForPayment: (date?: string) => [...QueryKeys.retentionBonus.all(), 'due-for-payment', date] as const,
    stats: (filters?: Record<string, any>) => [...QueryKeys.retentionBonus.all(), 'stats', filters] as const,
    pendingApprovals: () => [...QueryKeys.retentionBonus.all(), 'pending-approvals'] as const,
    departmentSummary: (departmentId?: string) => [...QueryKeys.retentionBonus.all(), 'department-summary', departmentId] as const,
  },

  // ==================== RECRUITMENT ====================
  recruitment: {
    all: () => ['recruitment'] as const,
    // Job Openings
    jobs: () => [...QueryKeys.recruitment.all(), 'jobs'] as const,
    jobLists: () => [...QueryKeys.recruitment.jobs(), 'list'] as const,
    jobList: (filters?: Record<string, any>) => [...QueryKeys.recruitment.jobLists(), filters] as const,
    jobDetails: () => [...QueryKeys.recruitment.jobs(), 'detail'] as const,
    jobDetail: (id: string) => [...QueryKeys.recruitment.jobDetails(), id] as const,
    jobStats: () => [...QueryKeys.recruitment.jobs(), 'stats'] as const,
    talentPool: () => ['talent-pool'] as const,
    jobsNearingDeadline: () => ['jobs-nearing-deadline'] as const,
    jobPipeline: (jobId: string) => ['job-pipeline', jobId] as const,
    // Applicants
    applicants: () => [...QueryKeys.recruitment.all(), 'applicants'] as const,
    applicantLists: () => [...QueryKeys.recruitment.applicants(), 'list'] as const,
    applicantList: (filters?: Record<string, any>) => [...QueryKeys.recruitment.applicantLists(), filters] as const,
    applicantDetails: () => [...QueryKeys.recruitment.applicants(), 'detail'] as const,
    applicantDetail: (id: string) => [...QueryKeys.recruitment.applicantDetails(), id] as const,
    applicantStats: () => [...QueryKeys.recruitment.applicants(), 'stats'] as const,
  },

  // ==================== JOB POSITIONS ====================
  jobPositions: {
    all: () => ['job-positions'] as const,
    lists: () => [...QueryKeys.jobPositions.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.jobPositions.lists(), filters] as const,
    details: () => [...QueryKeys.jobPositions.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.jobPositions.details(), id] as const,
    active: () => [...QueryKeys.jobPositions.all(), 'active'] as const,
    stats: () => [...QueryKeys.jobPositions.all(), 'stats'] as const,
    vacant: () => [...QueryKeys.jobPositions.all(), 'vacant'] as const,
    department: (departmentId: string) => [...QueryKeys.jobPositions.all(), 'department', departmentId] as const,
    hierarchy: (positionId: string) => [...QueryKeys.jobPositions.all(), 'hierarchy', positionId] as const,
    orgChart: () => [...QueryKeys.jobPositions.all(), 'org-chart'] as const,
    postings: () => ['job-postings'] as const,
  },

  // ==================== STAFFING PLAN ====================
  staffingPlan: {
    all: () => ['staffing-plans'] as const,
    lists: () => [...QueryKeys.staffingPlan.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.staffingPlan.lists(), filters] as const,
    details: () => [...QueryKeys.staffingPlan.all(), 'detail'] as const,
    detail: (planId: string) => [...QueryKeys.staffingPlan.details(), planId] as const,
    stats: () => [...QueryKeys.staffingPlan.all(), 'stats'] as const,
    active: () => [...QueryKeys.staffingPlan.all(), 'active'] as const,
    department: (departmentId: string) => [...QueryKeys.staffingPlan.all(), 'department', departmentId] as const,
    progress: (planId: string) => [...QueryKeys.staffingPlan.all(), 'progress', planId] as const,
    vacanciesSummary: () => [...QueryKeys.staffingPlan.all(), 'vacancies-summary'] as const,
    urgentVacancies: () => [...QueryKeys.staffingPlan.all(), 'urgent-vacancies'] as const,
    headcount: (departmentId?: string, designation?: string) =>
      [...QueryKeys.staffingPlan.all(), 'headcount', departmentId, designation] as const,
  },

  // ==================== ONBOARDING ====================
  onboarding: {
    all: () => ['onboarding'] as const,
    lists: () => [...QueryKeys.onboarding.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.onboarding.lists(), filters] as const,
    details: () => [...QueryKeys.onboarding.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.onboarding.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.onboarding.all(), 'employee', employeeId] as const,
    stats: () => [...QueryKeys.onboarding.all(), 'stats'] as const,
    pending: () => [...QueryKeys.onboarding.all(), 'pending'] as const,
  },

  // ==================== ONBOARDING WIZARD ====================
  onboardingWizard: {
    all: () => ['onboarding-wizard'] as const,
    progress: () => [...QueryKeys.onboardingWizard.all(), 'progress'] as const,
    step: (stepId: string) => [...QueryKeys.onboardingWizard.all(), 'step', stepId] as const,
  },

  // ==================== OFFBOARDING ====================
  offboarding: {
    all: () => ['offboarding'] as const,
    lists: () => [...QueryKeys.offboarding.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.offboarding.lists(), filters] as const,
    details: () => [...QueryKeys.offboarding.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.offboarding.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.offboarding.all(), 'employee', employeeId] as const,
    stats: () => [...QueryKeys.offboarding.all(), 'stats'] as const,
    pending: () => [...QueryKeys.offboarding.all(), 'pending'] as const,
  },

  // ==================== EMPLOYEE TRANSFER ====================
  employeeTransfer: {
    all: () => ['employee-transfer'] as const,
    lists: () => [...QueryKeys.employeeTransfer.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.employeeTransfer.lists(), filters] as const,
    details: () => [...QueryKeys.employeeTransfer.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.employeeTransfer.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.employeeTransfer.all(), 'employee', employeeId] as const,
    stats: () => [...QueryKeys.employeeTransfer.all(), 'stats'] as const,
    pendingApprovals: () => [...QueryKeys.employeeTransfer.all(), 'pending-approvals'] as const,
  },

  // ==================== EMPLOYEE PROMOTION ====================
  employeePromotion: {
    all: () => ['employee-promotions'] as const,
    lists: () => [...QueryKeys.employeePromotion.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.employeePromotion.lists(), filters] as const,
    details: () => [...QueryKeys.employeePromotion.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.employeePromotion.details(), id] as const,
  },

  // ==================== TRAINING ====================
  training: {
    all: () => ['trainings'] as const, // Note: Using 'trainings' to match existing usage
    lists: () => [...QueryKeys.training.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.training.lists(), filters] as const,
    details: () => [...QueryKeys.training.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.training.details(), id] as const,
    stats: () => [...QueryKeys.training.all(), 'stats'] as const,
    byEmployee: (employeeId: string) => [...QueryKeys.training.all(), 'employee', employeeId] as const,
    pendingApprovals: () => [...QueryKeys.training.all(), 'pending-approvals'] as const,
    upcoming: () => [...QueryKeys.training.all(), 'upcoming'] as const,
    overdueCompliance: () => [...QueryKeys.training.all(), 'overdue-compliance'] as const,
    cleSummary: (employeeId: string) => [...QueryKeys.training.all(), 'cle-summary', employeeId] as const,
    calendar: (month: number, year: number) => [...QueryKeys.training.all(), 'calendar', month, year] as const,
    providers: () => [...QueryKeys.training.all(), 'providers'] as const,
  },

  // ==================== SKILLS ====================
  skills: {
    all: () => ['skills'] as const,
    lists: () => [...QueryKeys.skills.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.skills.lists(), filters] as const,
    details: () => [...QueryKeys.skills.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.skills.details(), id] as const,
    categories: () => [...QueryKeys.skills.all(), 'categories'] as const,
  },

  // ==================== SKILL MAP ====================
  skillMap: {
    all: () => ['skill-map'] as const,
    employee: (employeeId: string) => [...QueryKeys.skillMap.all(), 'employee', employeeId] as const,
    department: (departmentId: string) => [...QueryKeys.skillMap.all(), 'department', departmentId] as const,
    skill: (skillId: string) => [...QueryKeys.skillMap.all(), 'skill', skillId] as const,
    gaps: (employeeId: string) => [...QueryKeys.skillMap.all(), 'gaps', employeeId] as const,
    matrix: () => [...QueryKeys.skillMap.all(), 'matrix'] as const,
  },

  // ==================== PERFORMANCE REVIEWS ====================
  performanceReviews: {
    all: () => ['performance-reviews'] as const,
    lists: () => [...QueryKeys.performanceReviews.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.performanceReviews.lists(), filters] as const,
    details: () => [...QueryKeys.performanceReviews.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.performanceReviews.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.performanceReviews.all(), 'employee', employeeId] as const,
    pending: () => [...QueryKeys.performanceReviews.all(), 'pending'] as const,
    stats: () => [...QueryKeys.performanceReviews.all(), 'stats'] as const,
  },

  // ==================== SUCCESSION PLANNING ====================
  successionPlanning: {
    all: () => ['succession-planning'] as const,
    lists: () => [...QueryKeys.successionPlanning.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.successionPlanning.lists(), filters] as const,
    details: () => [...QueryKeys.successionPlanning.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.successionPlanning.details(), id] as const,
    position: (positionId: string) => [...QueryKeys.successionPlanning.all(), 'position', positionId] as const,
    readiness: () => [...QueryKeys.successionPlanning.all(), 'readiness'] as const,
    riskAssessment: () => [...QueryKeys.successionPlanning.all(), 'risk-assessment'] as const,
  },

  // ==================== GRIEVANCES ====================
  grievances: {
    all: () => ['grievances'] as const,
    lists: () => [...QueryKeys.grievances.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.grievances.lists(), filters] as const,
    details: () => [...QueryKeys.grievances.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.grievances.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.grievances.all(), 'employee', employeeId] as const,
    stats: () => [...QueryKeys.grievances.all(), 'stats'] as const,
    pending: () => [...QueryKeys.grievances.all(), 'pending'] as const,
  },

  // ==================== SHIFT TYPES ====================
  shiftTypes: {
    all: () => ['shift-types'] as const,
    lists: () => [...QueryKeys.shiftTypes.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.shiftTypes.lists(), filters] as const,
    details: () => [...QueryKeys.shiftTypes.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.shiftTypes.details(), id] as const,
    active: () => [...QueryKeys.shiftTypes.all(), 'active'] as const,
  },

  // ==================== SHIFT ASSIGNMENTS ====================
  shiftAssignments: {
    all: () => ['shift-assignments'] as const,
    lists: () => [...QueryKeys.shiftAssignments.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.shiftAssignments.lists(), filters] as const,
    details: () => [...QueryKeys.shiftAssignments.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.shiftAssignments.details(), id] as const,
    employeeShift: (employeeId: string, date?: string) =>
      [...QueryKeys.shiftAssignments.all(), 'employee-shift', employeeId, date] as const,
    activeAssignment: (employeeId: string) =>
      [...QueryKeys.shiftAssignments.all(), 'active-assignment', employeeId] as const,
    stats: (filters?: { departmentId?: string; startDate?: string; endDate?: string }) =>
      [...QueryKeys.shiftAssignments.all(), 'stats', filters] as const,
    coverageReport: (filters?: { departmentId?: string; startDate?: string; endDate?: string }) =>
      [...QueryKeys.shiftAssignments.all(), 'coverage-report', filters] as const,
    calendar: (startDate: string, endDate: string, filters?: Record<string, any>) =>
      [...QueryKeys.shiftAssignments.all(), 'calendar', startDate, endDate, filters] as const,
  },

  // ==================== SHIFT REQUESTS ====================
  shiftRequests: {
    all: () => ['shift-requests'] as const,
    lists: () => [...QueryKeys.shiftRequests.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.shiftRequests.lists(), filters] as const,
    details: () => [...QueryKeys.shiftRequests.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.shiftRequests.details(), id] as const,
    pendingApprovals: () => [...QueryKeys.shiftRequests.all(), 'pending-approvals'] as const,
    stats: (filters?: { departmentId?: string; year?: number }) =>
      [...QueryKeys.shiftRequests.all(), 'stats', filters] as const,
    employee: (employeeId: string) => [...QueryKeys.shiftRequests.all(), 'employee', employeeId] as const,
    pending: () => [...QueryKeys.shiftRequests.all(), 'pending'] as const,
  },

  // ==================== ORGANIZATIONAL STRUCTURE ====================
  organizationalStructure: {
    all: () => ['organizational-structure'] as const,
    tree: () => [...QueryKeys.organizationalStructure.all(), 'tree'] as const,
    node: (nodeId: string) => [...QueryKeys.organizationalStructure.all(), 'node', nodeId] as const,
    children: (parentId: string) => [...QueryKeys.organizationalStructure.all(), 'children', parentId] as const,
    path: (nodeId: string) => [...QueryKeys.organizationalStructure.all(), 'path', nodeId] as const,
    stats: () => [...QueryKeys.organizationalStructure.all(), 'stats'] as const,
  },

  // ==================== ORGANIZATIONS ====================
  organizations: {
    all: () => ['organizations'] as const,
    lists: () => [...QueryKeys.organizations.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.organizations.lists(), filters] as const,
    details: () => [...QueryKeys.organizations.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.organizations.details(), id] as const,
    current: () => [...QueryKeys.organizations.all(), 'current'] as const,
  },

  // ==================== FIRMS ====================
  firms: {
    all: () => ['firms'] as const,
    lists: () => [...QueryKeys.firms.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.firms.lists(), filters] as const,
    details: () => [...QueryKeys.firms.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.firms.details(), id] as const,
    current: () => [...QueryKeys.firms.all(), 'current'] as const,
  },

  // ==================== ASSETS ====================
  assets: {
    all: () => ['assets'] as const,
    lists: () => [...QueryKeys.assets.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.assets.lists(), filters] as const,
    details: () => [...QueryKeys.assets.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.assets.details(), id] as const,
    stats: () => [...QueryKeys.assets.all(), 'stats'] as const,
    categories: () => [...QueryKeys.assets.all(), 'categories'] as const,
  },

  // ==================== ASSET ASSIGNMENTS ====================
  assetAssignments: {
    all: () => ['asset-assignments'] as const,
    lists: () => [...QueryKeys.assetAssignments.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.assetAssignments.lists(), filters] as const,
    details: () => [...QueryKeys.assetAssignments.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.assetAssignments.details(), id] as const,
    employee: (employeeId: string) => [...QueryKeys.assetAssignments.all(), 'employee', employeeId] as const,
    asset: (assetId: string) => [...QueryKeys.assetAssignments.all(), 'asset', assetId] as const,
    stats: () => [...QueryKeys.assetAssignments.all(), 'stats'] as const,
  },

  // ==================== VEHICLES ====================
  vehicles: {
    all: () => ['vehicles'] as const,
    lists: () => [...QueryKeys.vehicles.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.vehicles.lists(), filters] as const,
    details: () => [...QueryKeys.vehicles.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.vehicles.details(), id] as const,
    available: () => [...QueryKeys.vehicles.all(), 'available'] as const,
    stats: () => [...QueryKeys.vehicles.all(), 'stats'] as const,
  },

  // ==================== VEHICLE LOGS ====================
  vehicleLogs: {
    all: () => ['vehicle-logs'] as const,
    lists: () => [...QueryKeys.vehicleLogs.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.vehicleLogs.lists(), filters] as const,
    details: () => [...QueryKeys.vehicleLogs.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.vehicleLogs.details(), id] as const,
    vehicle: (vehicleId: string) => [...QueryKeys.vehicleLogs.all(), 'vehicle', vehicleId] as const,
  },

  // ==================== INVENTORY ====================
  inventory: {
    all: () => ['inventory'] as const,
    lists: () => [...QueryKeys.inventory.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.inventory.lists(), filters] as const,
    details: () => [...QueryKeys.inventory.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.inventory.details(), id] as const,
    stats: () => [...QueryKeys.inventory.all(), 'stats'] as const,
    lowStock: () => [...QueryKeys.inventory.all(), 'low-stock'] as const,
    movements: (itemId: string) => [...QueryKeys.inventory.all(), itemId, 'movements'] as const,
  },

  // ==================== MANUFACTURING ====================
  manufacturing: {
    all: () => ['manufacturing'] as const,
    lists: () => [...QueryKeys.manufacturing.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.manufacturing.lists(), filters] as const,
    details: () => [...QueryKeys.manufacturing.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.manufacturing.details(), id] as const,
    stats: () => [...QueryKeys.manufacturing.all(), 'stats'] as const,
  },

  // ==================== BUYING ====================
  buying: {
    all: () => ['buying'] as const,
    lists: () => [...QueryKeys.buying.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.buying.lists(), filters] as const,
    details: () => [...QueryKeys.buying.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.buying.details(), id] as const,
    stats: () => [...QueryKeys.buying.all(), 'stats'] as const,
  },

  // ==================== QUALITY ====================
  quality: {
    all: () => ['quality'] as const,
    lists: () => [...QueryKeys.quality.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.quality.lists(), filters] as const,
    details: () => [...QueryKeys.quality.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.quality.details(), id] as const,
    stats: () => [...QueryKeys.quality.all(), 'stats'] as const,
  },

  // ==================== SUBCONTRACTING ====================
  subcontracting: {
    all: () => ['subcontracting'] as const,
    lists: () => [...QueryKeys.subcontracting.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.subcontracting.lists(), filters] as const,
    details: () => [...QueryKeys.subcontracting.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.subcontracting.details(), id] as const,
  },

  // ==================== CRM - LEADS ====================
  leads: {
    all: () => ['leads'] as const,
    lists: () => [...QueryKeys.leads.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.leads.lists(), filters] as const,
    details: () => [...QueryKeys.leads.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.leads.details(), id] as const,
    stats: (params?: Record<string, any>) => [...QueryKeys.leads.all(), 'stats', params] as const,
    pipeline: (pipelineId?: string) => [...QueryKeys.leads.all(), 'pipeline', pipelineId] as const,
  },

  // ==================== CRM - PIPELINES ====================
  pipelines: {
    all: () => ['pipelines'] as const,
    lists: () => [...QueryKeys.pipelines.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.pipelines.lists(), filters] as const,
    details: () => [...QueryKeys.pipelines.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.pipelines.details(), id] as const,
  },

  // ==================== CRM - REFERRALS ====================
  referrals: {
    all: () => ['referrals'] as const,
    lists: () => [...QueryKeys.referrals.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.referrals.lists(), filters] as const,
    details: () => [...QueryKeys.referrals.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.referrals.details(), id] as const,
    stats: () => [...QueryKeys.referrals.all(), 'stats'] as const,
  },

  // ==================== CRM ADVANCED ====================
  crmAdvanced: {
    all: () => ['crm-advanced'] as const,
    // Email Templates
    emailTemplates: () => ['email-templates'] as const,
    emailTemplatesList: (category?: string) => ['email-templates', category] as const,
    emailTemplate: (id: string) => ['email-template', id] as const,
    // Email Campaigns
    emailCampaigns: () => ['email-campaigns'] as const,
    emailCampaignsList: (filters?: Record<string, any>) => ['email-campaigns', filters] as const,
    emailCampaign: (id: string) => ['email-campaign', id] as const,
    campaignAnalytics: (id: string) => ['campaign-analytics', id] as const,
    // Drip Campaigns
    dripCampaigns: () => ['drip-campaigns'] as const,
    dripCampaign: (id: string) => ['drip-campaign', id] as const,
    // Subscribers
    subscribers: () => ['subscribers'] as const,
    subscribersList: (params?: Record<string, any>) => ['subscribers', params] as const,
    // Segments
    segments: () => ['segments'] as const,
    // Lead Scoring
    leadScores: () => ['lead-scores'] as const,
    leadScoresList: (params?: Record<string, any>) => ['lead-scores', params] as const,
    leadInsights: (leadId: string) => ['lead-insights', leadId] as const,
    leadLeaderboard: (limit: number) => ['lead-leaderboard', limit] as const,
    leadScoringConfig: () => ['lead-scoring-config'] as const,
    leadScoreDistribution: () => ['lead-score-distribution'] as const,
    // WhatsApp
    whatsAppConversations: () => ['whatsapp-conversations'] as const,
    whatsAppConversationsList: (filters?: Record<string, any>) => ['whatsapp-conversations', filters] as const,
    whatsAppConversation: (id: string) => ['whatsapp-conversation', id] as const,
    whatsAppTemplates: () => ['whatsapp-templates'] as const,
    whatsAppBroadcasts: () => ['whatsapp-broadcasts'] as const,
  },

  // ==================== CALENDAR ====================
  calendar: {
    all: () => ['calendar'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.calendar.all(), filters] as const,
    date: (date: string) => [...QueryKeys.calendar.all(), 'date', date] as const,
    month: (year: number, month: number) => [...QueryKeys.calendar.all(), 'month', year, month] as const,
    upcoming: (days: number) => [...QueryKeys.calendar.all(), 'upcoming', days] as const,
    overdue: () => [...QueryKeys.calendar.all(), 'overdue'] as const,
  },

  // ==================== EVENTS ====================
  events: {
    all: () => ['events'] as const,
    lists: () => [...QueryKeys.events.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.events.lists(), filters] as const,
    details: () => [...QueryKeys.events.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.events.details(), id] as const,
    upcoming: () => [...QueryKeys.events.all(), 'upcoming'] as const,
    today: () => [...QueryKeys.events.all(), 'today'] as const,
  },

  // ==================== REMINDERS ====================
  reminders: {
    all: () => ['reminders'] as const,
    lists: () => [...QueryKeys.reminders.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.reminders.lists(), filters] as const,
    details: () => [...QueryKeys.reminders.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.reminders.details(), id] as const,
    upcoming: () => [...QueryKeys.reminders.all(), 'upcoming'] as const,
  },

  // ==================== ACTIVITIES ====================
  activities: {
    all: () => ['activities'] as const,
    lists: () => [...QueryKeys.activities.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.activities.lists(), filters] as const,
    entity: (entityType: string, entityId: string) => [...QueryKeys.activities.all(), 'entity', entityType, entityId] as const,
    recent: (limit?: number) => [...QueryKeys.activities.all(), 'recent', limit] as const,
    timeline: () => ['activity-timeline'] as const,
  },

  // ==================== ODOO ACTIVITIES ====================
  odooActivities: {
    all: () => ['odoo-activities'] as const,
    lists: () => [...QueryKeys.odooActivities.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.odooActivities.lists(), filters] as const,
    details: () => [...QueryKeys.odooActivities.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.odooActivities.details(), id] as const,
    upcoming: () => [...QueryKeys.odooActivities.all(), 'upcoming'] as const,
  },

  // ==================== FOLLOWUPS ====================
  followups: {
    all: () => ['followups'] as const,
    lists: () => [...QueryKeys.followups.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.followups.lists(), filters] as const,
    details: () => [...QueryKeys.followups.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.followups.details(), id] as const,
    overdue: () => [...QueryKeys.followups.all(), 'overdue'] as const,
  },

  // ==================== DOCUMENTS ====================
  documents: {
    all: () => ['documents'] as const,
    lists: () => [...QueryKeys.documents.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.documents.lists(), filters] as const,
    details: () => [...QueryKeys.documents.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.documents.details(), id] as const,
    folder: (folderId: string) => [...QueryKeys.documents.all(), 'folder', folderId] as const,
    search: (query: string) => [...QueryKeys.documents.all(), 'search', query] as const,
    recent: () => [...QueryKeys.documents.all(), 'recent'] as const,
  },

  // ==================== DOCUMENT VERSIONS ====================
  documentVersions: {
    all: (documentId: string) => ['document-versions', documentId] as const,
    lists: (documentId: string) => [...QueryKeys.documentVersions.all(documentId), 'list'] as const,
    list: (documentId: string) => [...QueryKeys.documentVersions.lists(documentId)] as const,
    details: (documentId: string) => [...QueryKeys.documentVersions.all(documentId), 'detail'] as const,
    detail: (documentId: string, versionId: string) => [...QueryKeys.documentVersions.details(documentId), versionId] as const,
    statistics: (documentId: string) => [...QueryKeys.documentVersions.all(documentId), 'statistics'] as const,
    comparison: (documentId: string, versionId1: string, versionId2: string) =>
      [...QueryKeys.documentVersions.all(documentId), 'comparison', versionId1, versionId2] as const,
    diff: (documentId: string, versionId1: string, versionId2: string) =>
      [...QueryKeys.documentVersions.all(documentId), 'diff', versionId1, versionId2] as const,
    content: (documentId: string, versionId: string) => [...QueryKeys.documentVersions.all(documentId), 'content', versionId] as const,
  },

  // ==================== NOTIFICATIONS ====================
  notifications: {
    all: () => ['notifications'] as const,
    lists: () => [...QueryKeys.notifications.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.notifications.lists(), filters] as const,
    details: () => [...QueryKeys.notifications.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.notifications.details(), id] as const,
    unreadCount: () => [...QueryKeys.notifications.all(), 'unread-count'] as const,
    settings: () => [...QueryKeys.notifications.all(), 'settings'] as const,
    byType: (type: string) => [...QueryKeys.notifications.all(), 'by-type', type] as const,
  },

  // ==================== MESSAGES ====================
  messages: {
    all: () => ['messages'] as const,
    lists: () => [...QueryKeys.messages.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.messages.lists(), filters] as const,
    thread: (threadId: string) => [...QueryKeys.messages.all(), 'thread', threadId] as const,
    unread: () => [...QueryKeys.messages.all(), 'unread'] as const,
  },

  // ==================== CONVERSATIONS ====================
  conversations: {
    all: () => ['conversations'] as const,
    lists: () => [...QueryKeys.conversations.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.conversations.lists(), filters] as const,
    details: () => [...QueryKeys.conversations.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.conversations.details(), id] as const,
  },

  // ==================== CHATTER ====================
  chatter: {
    all: () => ['chatter'] as const,
    messages: (entityType: string, entityId: string) => [...QueryKeys.chatter.all(), 'messages', entityType, entityId] as const,
    followers: (entityType: string, entityId: string) => [...QueryKeys.chatter.all(), 'followers', entityType, entityId] as const,
    activities: (entityType: string, entityId: string) => [...QueryKeys.chatter.all(), 'activities', entityType, entityId] as const,
  },

  // ==================== CASE NOTION ====================
  caseNotion: {
    all: () => ['case-notion'] as const,
    lists: () => [...QueryKeys.caseNotion.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.caseNotion.lists(), filters] as const,
    details: () => [...QueryKeys.caseNotion.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.caseNotion.details(), id] as const,
    case: (caseId: string) => [...QueryKeys.caseNotion.all(), 'case', caseId] as const,
  },

  // ==================== CASE WORKFLOWS ====================
  caseWorkflows: {
    all: () => ['case-workflows'] as const,
    lists: () => [...QueryKeys.caseWorkflows.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.caseWorkflows.lists(), filters] as const,
    details: () => [...QueryKeys.caseWorkflows.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.caseWorkflows.details(), id] as const,
    byCategory: (category: string) => [...QueryKeys.caseWorkflows.all(), 'by-category', category] as const,
    presets: () => [...QueryKeys.caseWorkflows.all(), 'presets'] as const,
    statistics: () => [...QueryKeys.caseWorkflows.all(), 'statistics'] as const,
    caseProgress: (caseId: string) => [...QueryKeys.caseWorkflows.all(), 'case-progress', caseId] as const,
  },

  // ==================== GANTT ====================
  gantt: {
    all: () => ['gantt'] as const,
    data: (caseId: string) => ['gantt-data', caseId] as const,
    dhtmlx: (caseId: string) => ['gantt-dhtmlx', caseId] as const,
    productivity: (filters?: Record<string, any>) => [...QueryKeys.gantt.all(), 'productivity', filters] as const,
    criticalPath: (caseId: string) => ['gantt-critical-path', caseId] as const,
    milestones: (caseId: string) => ['gantt-milestones', caseId] as const,
    baselines: (caseId: string) => ['gantt-baselines', caseId] as const,
    baselineCompare: (caseId: string, baselineId: string) => ['gantt-baseline-compare', caseId, baselineId] as const,
    resourceLoading: (caseId: string) => ['gantt-resource-loading', caseId] as const,
    resourceWorkload: (resourceId: string, params?: Record<string, any>) => ['gantt-resource-workload', resourceId, params] as const,
  },

  // ==================== BIOMETRIC ====================
  biometric: {
    all: () => ['biometric'] as const,
    // Devices
    devices: () => ['biometric-devices'] as const,
    device: (id: string) => ['biometric-device', id] as const,
    deviceHealth: (id: string) => ['device-health', id] as const,
    // Enrollments
    enrollments: () => ['biometric-enrollments'] as const,
    enrollment: (id: string) => ['biometric-enrollment', id] as const,
    enrollmentEmployee: (employeeId: string) => ['biometric-enrollment-employee', employeeId] as const,
    // Verification
    verificationLogs: () => ['verification-logs'] as const,
    verificationLiveFeed: () => ['verification-live-feed'] as const,
    verificationStats: (startDate?: string, endDate?: string) => ['verification-stats', startDate, endDate] as const,
    // Geofences
    geofences: () => ['geofences'] as const,
    geofence: (id: string) => ['geofence', id] as const,
  },

  // ==================== CORPORATE CARDS ====================
  corporateCards: {
    all: () => ['corporate-cards'] as const,
    lists: () => [...QueryKeys.corporateCards.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.corporateCards.lists(), filters] as const,
    details: () => [...QueryKeys.corporateCards.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.corporateCards.details(), id] as const,
    // Transactions
    transactions: () => ['card-transactions'] as const,
    transactionsList: () => [...QueryKeys.corporateCards.transactions(), 'list'] as const,
    transactionList: (filters?: Record<string, any>) => [...QueryKeys.corporateCards.transactionsList(), filters] as const,
    transactionDetails: () => [...QueryKeys.corporateCards.transactions(), 'detail'] as const,
    transactionDetail: (id: string) => [...QueryKeys.corporateCards.transactionDetails(), id] as const,
    unreconciledTransactions: (cardId?: string) => [...QueryKeys.corporateCards.transactions(), 'unreconciled', cardId] as const,
    disputedTransactions: (cardId?: string) => [...QueryKeys.corporateCards.transactions(), 'disputed', cardId] as const,
    potentialMatches: (transactionId: string) => [...QueryKeys.corporateCards.transactions(), transactionId, 'potential-matches'] as const,
    // Statistics
    statistics: () => ['card-statistics'] as const,
    statisticsWithDates: (startDate?: string, endDate?: string) => [...QueryKeys.corporateCards.statistics(), startDate, endDate] as const,
    // Reports
    reconciliationReport: (cardId?: string, startDate?: string, endDate?: string) => ['card-reconciliation-report', cardId, startDate, endDate] as const,
    spendingByCategory: (cardId?: string, startDate?: string, endDate?: string) => ['card-spending-by-category', cardId, startDate, endDate] as const,
    spendingByCard: (startDate?: string, endDate?: string) => ['card-spending-by-card', startDate, endDate] as const,
    monthlySpendingTrend: (cardId?: string, months?: number) => ['card-monthly-spending-trend', cardId, months] as const,
  },

  // ==================== REPORTS ====================
  reports: {
    all: () => ['reports'] as const,
    lists: () => [...QueryKeys.reports.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.reports.lists(), filters] as const,
    details: () => [...QueryKeys.reports.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.reports.details(), id] as const,
    execute: (id: string, params?: Record<string, any>) => [...QueryKeys.reports.all(), 'execute', id, params] as const,
  },

  // ==================== CONSOLIDATED REPORTS ====================
  consolidatedReports: {
    all: () => ['consolidated-reports'] as const,
    financial: (params?: Record<string, any>) => [...QueryKeys.consolidatedReports.all(), 'financial', params] as const,
    operational: (params?: Record<string, any>) => [...QueryKeys.consolidatedReports.all(), 'operational', params] as const,
  },

  // ==================== HR ANALYTICS ====================
  hrAnalytics: {
    all: () => ['hr-analytics'] as const,
    workforceOverview: () => ['hr-workforce-overview'] as const,
    attritionRisk: () => ['hr-attrition-risk'] as const,
    flightRisk: () => ['hr-flight-risk'] as const,
    highPotential: () => ['hr-high-potential'] as const,
    engagementPredictions: () => ['hr-engagement-predictions'] as const,
    absencePredictions: () => ['hr-absence-predictions'] as const,
    promotionReadiness: () => ['hr-promotion-readiness'] as const,
    saudization: () => ['hr-saudization'] as const,
    diversityAnalytics: () => ['hr-diversity-analytics'] as const,
    tenureDistribution: () => ['hr-tenure-distribution'] as const,
    departmentBreakdown: () => ['hr-department-breakdown'] as const,
    trends: () => ['hr-trends'] as const,
    workforceForecast: () => ['hr-workforce-forecast'] as const,
    hiringNeedsForecast: () => ['hr-hiring-needs-forecast'] as const,
  },

  // ==================== ML SCORING ====================
  mlScoring: {
    all: () => ['ml-scoring'] as const,
    leads: () => [...QueryKeys.mlScoring.all(), 'leads'] as const,
    cases: () => [...QueryKeys.mlScoring.all(), 'cases'] as const,
    employees: () => [...QueryKeys.mlScoring.all(), 'employees'] as const,
    config: () => [...QueryKeys.mlScoring.all(), 'config'] as const,
  },

  // ==================== USERS ====================
  users: {
    all: () => ['user'] as const,
    lists: () => [...QueryKeys.users.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.users.lists(), filters] as const,
    details: () => [...QueryKeys.users.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.users.details(), id] as const,
    profile: () => [...QueryKeys.users.all(), 'profile'] as const,
    settings: () => [...QueryKeys.users.all(), 'settings'] as const,
  },

  // ==================== AUTH ====================
  auth: {
    all: () => ['auth'] as const,
    session: () => [...QueryKeys.auth.all(), 'session'] as const,
    permissions: () => [...QueryKeys.auth.all(), 'permissions'] as const,
    oauth: () => ['oauth'] as const,
    oauthProviders: () => [...QueryKeys.auth.oauth(), 'providers'] as const,
    oauthLinked: () => [...QueryKeys.auth.oauth(), 'linked'] as const,
  },

  // ==================== SESSIONS ====================
  sessions: {
    all: () => ['sessions'] as const,
    lists: () => [...QueryKeys.sessions.all(), 'list'] as const,
    list: () => [...QueryKeys.sessions.lists()] as const,
    active: () => [...QueryKeys.sessions.all(), 'active'] as const,
    current: () => [...QueryKeys.sessions.all(), 'current'] as const,
  },

  // ==================== MFA ====================
  mfa: {
    all: () => ['mfa'] as const,
    status: () => [...QueryKeys.mfa.all(), 'status'] as const,
    methods: () => [...QueryKeys.mfa.all(), 'methods'] as const,
    backupCodes: () => [...QueryKeys.mfa.all(), 'backup-codes'] as const,
    qrCode: () => [...QueryKeys.mfa.all(), 'qr-code'] as const,
  },

  // ==================== STEP-UP AUTH ====================
  stepUpAuth: {
    all: () => ['step-up-auth'] as const,
    status: () => [...QueryKeys.stepUpAuth.all(), 'status'] as const,
    requirements: (action: string) => [...QueryKeys.stepUpAuth.all(), 'requirements', action] as const,
  },

  // ==================== SSO ====================
  sso: {
    all: () => ['sso'] as const,
    providers: () => [...QueryKeys.sso.all(), 'providers'] as const,
    provider: (id: string) => [...QueryKeys.sso.all(), 'provider', id] as const,
    config: () => [...QueryKeys.sso.all(), 'config'] as const,
  },

  // ==================== LDAP ====================
  ldap: {
    all: () => ['ldap'] as const,
    config: () => ['ldap-config'] as const,
    syncStatus: () => ['ldap-sync-status'] as const,
  },

  // ==================== PERMISSIONS ====================
  permissions: {
    all: () => ['permissions'] as const,
    user: (userId: string) => [...QueryKeys.permissions.all(), 'user', userId] as const,
    role: (roleId: string) => [...QueryKeys.permissions.all(), 'role', roleId] as const,
    check: (resource: string, action: string) => [...QueryKeys.permissions.all(), 'check', resource, action] as const,
  },

  // ==================== UI ACCESS ====================
  uiAccess: {
    all: () => ['ui-access'] as const,
    user: (userId: string) => [...QueryKeys.uiAccess.all(), 'user', userId] as const,
    role: (roleId: string) => [...QueryKeys.uiAccess.all(), 'role', roleId] as const,
  },

  // ==================== AUDIT LOG ====================
  auditLog: {
    all: () => ['audit-log'] as const,
    lists: () => [...QueryKeys.auditLog.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.auditLog.lists(), filters] as const,
    entity: (entityType: string, entityId: string) => [...QueryKeys.auditLog.all(), 'entity', entityType, entityId] as const,
    user: (userId: string) => [...QueryKeys.auditLog.all(), 'user', userId] as const,
  },

  // ==================== LOCK DATES ====================
  lockDates: {
    all: () => ['lock-dates'] as const,
    lists: () => [...QueryKeys.lockDates.all(), 'list'] as const,
    list: () => [...QueryKeys.lockDates.lists()] as const,
    active: () => [...QueryKeys.lockDates.all(), 'active'] as const,
    check: (date: string, module?: string) => [...QueryKeys.lockDates.all(), 'check', date, module] as const,
  },

  // ==================== AUTOMATED ACTIONS ====================
  automatedActions: {
    all: () => ['automated-actions'] as const,
    lists: () => [...QueryKeys.automatedActions.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.automatedActions.lists(), filters] as const,
    details: () => [...QueryKeys.automatedActions.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.automatedActions.details(), id] as const,
    byTrigger: (trigger: string) => [...QueryKeys.automatedActions.all(), 'by-trigger', trigger] as const,
    logs: (actionId: string) => [...QueryKeys.automatedActions.all(), actionId, 'logs'] as const,
  },

  // ==================== TAGS ====================
  tags: {
    all: () => ['tags'] as const,
    lists: () => [...QueryKeys.tags.all(), 'list'] as const,
    list: (filters?: Record<string, any>) => [...QueryKeys.tags.lists(), filters] as const,
    byEntity: (entityType: string) => [...QueryKeys.tags.all(), 'by-entity', entityType] as const,
  },

  // ==================== PASSWORD ====================
  password: {
    all: () => ['password'] as const,
    policy: () => [...QueryKeys.password.all(), 'policy'] as const,
    strength: (password: string) => [...QueryKeys.password.all(), 'strength', password] as const,
  },

  // ==================== API KEYS ====================
  apiKeys: {
    all: () => ['api-keys'] as const,
    lists: () => [...QueryKeys.apiKeys.all(), 'list'] as const,
    list: () => [...QueryKeys.apiKeys.lists()] as const,
    stats: () => [...QueryKeys.apiKeys.all(), 'stats'] as const,
  },

  // ==================== INTEGRATIONS ====================
  integrations: {
    all: () => ['integrations'] as const,
    lists: () => [...QueryKeys.integrations.all(), 'list'] as const,
    list: () => [...QueryKeys.integrations.lists()] as const,
    detail: (id: string) => [...QueryKeys.integrations.all(), id] as const,
    webhooks: () => ['webhooks'] as const,
  },

  // ==================== APPS ====================
  apps: {
    all: () => ['apps'] as const,
    installed: () => [...QueryKeys.apps.all(), 'installed'] as const,
    available: () => [...QueryKeys.apps.all(), 'available'] as const,
  },

  // ==================== SETTINGS ====================
  settings: {
    all: () => ['settings'] as const,
    general: () => [...QueryKeys.settings.all(), 'general'] as const,
    company: () => [...QueryKeys.settings.all(), 'company'] as const,
    email: () => ['email-settings'] as const,
    emailSignatures: () => ['email-signatures'] as const,
    smtp: () => ['smtp-config'] as const,
    billing: () => [...QueryKeys.settings.all(), 'billing'] as const,
    subscription: () => ['subscription'] as const,
    usageMetrics: () => ['usage-metrics'] as const,
  },

  // ==================== SETUP ORCHESTRATION ====================
  setupOrchestration: {
    all: () => ['setup-orchestration'] as const,
    progress: () => [...QueryKeys.setupOrchestration.all(), 'progress'] as const,
    step: (stepId: string) => [...QueryKeys.setupOrchestration.all(), 'step', stepId] as const,
  },

  // ==================== DATA EXPORT ====================
  dataExport: {
    all: () => ['data-export'] as const,
    lists: () => [...QueryKeys.dataExport.all(), 'list'] as const,
    list: () => [...QueryKeys.dataExport.lists()] as const,
    details: () => [...QueryKeys.dataExport.all(), 'detail'] as const,
    detail: (id: string) => [...QueryKeys.dataExport.details(), id] as const,
    status: (id: string) => [...QueryKeys.dataExport.all(), 'status', id] as const,
  },

  // ==================== PDFME ====================
  pdfme: {
    all: () => ['pdfme'] as const,
    templates: () => [...QueryKeys.pdfme.all(), 'templates'] as const,
    template: (id: string) => [...QueryKeys.pdfme.all(), 'template', id] as const,
  },

  // ==================== SUPPORT ====================
  support: {
    all: () => ['support'] as const,
    tickets: () => [...QueryKeys.support.all(), 'tickets'] as const,
    ticket: (id: string) => [...QueryKeys.support.all(), 'ticket', id] as const,
  },

  // ==================== SERVICE HEALTH ====================
  serviceHealth: {
    all: () => ['service-health'] as const,
    status: () => [...QueryKeys.serviceHealth.all(), 'status'] as const,
    metrics: () => [...QueryKeys.serviceHealth.all(), 'metrics'] as const,
    cache: () => ['cache-stats'] as const,
  },

  // ==================== DASHBOARD ====================
  dashboard: {
    all: () => ['dashboard'] as const,
    stats: () => [...QueryKeys.dashboard.all(), 'stats'] as const,
    widgets: () => [...QueryKeys.dashboard.all(), 'widgets'] as const,
    widget: (widgetId: string) => [...QueryKeys.dashboard.all(), 'widget', widgetId] as const,
  },

  // ==================== SMART BUTTONS ====================
  smartButtons: {
    all: () => ['smart-buttons'] as const,
    count: (entityType: string, entityId: string, buttonId: string) =>
      ['smart-button-count', entityType, entityId, buttonId] as const,
    countsBatch: (entityType: string, entityId: string, buttonIds: string[]) =>
      ['smart-button-counts-batch', entityType, entityId, buttonIds] as const,
  },

  // ==================== MISC ====================
  receipts: {
    all: () => ['receipts'] as const,
    detail: (paymentId: string) => ['receipt', paymentId] as const,
  },

  statements: {
    all: () => ['statements'] as const,
  },

  transactions: {
    all: () => ['transactions'] as const,
  },

  billingHistory: {
    all: () => ['billing-history'] as const,
  },

  lean: {
    all: () => ['lean'] as const,
  },
} as const

// ==================== HELPER TYPES ====================

/**
 * Extract the return type of a query key factory function
 * @example
 * type TaskListKey = QueryKey<typeof QueryKeys.tasks.list>
 */
export type QueryKey<T extends (...args: any[]) => readonly any[]> = ReturnType<T>

/**
 * Type-safe query key invalidation helper
 * @example
 * invalidateQueries(QueryKeys.tasks.all())
 */
export type InvalidateQueryKey = readonly any[]
