import { QueryClient } from '@tanstack/react-query'

// Get the query client instance
let queryClient: QueryClient

export const setQueryClient = (client: QueryClient) => {
  queryClient = client
}

// Invalidation helpers
export const invalidateCache = {
  // Tasks
  tasks: {
    all: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['tasks', id] }),
    stats: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['tasks', 'stats', filters] }),
    upcoming: (days?: number) => queryClient.invalidateQueries({ queryKey: ['tasks', 'upcoming', days] }),
    overdue: () => queryClient.invalidateQueries({ queryKey: ['tasks', 'overdue'] }),
    dueToday: () => queryClient.invalidateQueries({ queryKey: ['tasks', 'due-today'] }),
    myTasks: () => queryClient.invalidateQueries({ queryKey: ['tasks', 'my-tasks'] }),
    templates: () => queryClient.invalidateQueries({ queryKey: ['tasks', 'templates'] }),
    timeTracking: (taskId: string) => queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'time-tracking'] }),
    recurrenceHistory: (taskId: string) => queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'recurrence-history'] }),
    documents: (taskId: string) => queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents'] }),
    document: (taskId: string, documentId: string) => queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'documents', documentId] }),
    // Invalidate everything related to tasks
    related: async () => {
      await Promise.all([
        invalidateCache.tasks.all(),
        invalidateCache.calendar.all(),
        invalidateCache.notifications.all(),
      ])
    },
  },

  // Cases
  cases: {
    all: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['cases', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['cases', 'stats'] }),
    pipeline: (pipelineId?: string) => queryClient.invalidateQueries({ queryKey: ['cases', 'pipeline', pipelineId] }),
    // When a case changes, also invalidate related data
    related: async (caseId?: string) => {
      await Promise.all([
        invalidateCache.cases.all(),
        invalidateCache.tasks.all(),
        invalidateCache.documents.all(),
        invalidateCache.timeEntries.all(),
        invalidateCache.calendar.all(),
      ])
    },
  },

  // Clients
  clients: {
    all: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['clients', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['clients', 'stats'] }),
    search: (query?: string) => queryClient.invalidateQueries({ queryKey: ['clients', 'search', query] }),
    topRevenue: (limit?: number) => queryClient.invalidateQueries({ queryKey: ['clients', 'top-revenue', limit] }),
    payments: (clientId: string) => queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'payments'] }),
    billingInfo: (clientId: string) => queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'billing-info'] }),
    wathq: (clientId: string, dataType?: string) => queryClient.invalidateQueries({ queryKey: ['clients', clientId, 'wathq', dataType] }),
    related: async () => {
      await Promise.all([
        invalidateCache.clients.all(),
        invalidateCache.cases.all(),
        invalidateCache.invoices.all(),
      ])
    },
  },

  // Invoices
  invoices: {
    all: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['invoices', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['invoices', 'stats'] }),
    recurring: () => queryClient.invalidateQueries({ queryKey: ['recurringInvoices'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.invoices.all(),
        invalidateCache.payments.all(),
        invalidateCache.finance.dashboard(),
        invalidateCache.clients.all(),
      ])
    },
  },

  // Payments
  payments: {
    all: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['payments', id] }),
    receipt: (paymentId: string) => queryClient.invalidateQueries({ queryKey: ['receipt', paymentId] }),
    methods: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
    modes: () => queryClient.invalidateQueries({ queryKey: ['payment-modes'] }),
    terms: () => queryClient.invalidateQueries({ queryKey: ['payment-terms'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.payments.all(),
        invalidateCache.invoices.all(),
        invalidateCache.finance.dashboard(),
      ])
    },
  },

  // Expenses
  expenses: {
    all: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['expenses', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['expense-stats'] }),
    policies: () => queryClient.invalidateQueries({ queryKey: ['expense-policies'] }),
    policy: (id: string) => queryClient.invalidateQueries({ queryKey: ['expense-policy', id] }),
    defaultPolicy: () => queryClient.invalidateQueries({ queryKey: ['expense-policy', 'default'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.expenses.all(),
        invalidateCache.finance.dashboard(),
      ])
    },
  },

  // Expense Claims
  expenseClaims: {
    all: () => queryClient.invalidateQueries({ queryKey: ['expense-claims'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'stats'] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'pending-approvals'] }),
    pendingPayments: () => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'pending-payments'] }),
    employeeClaims: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'employee', employeeId] }),
    mileageRates: () => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'mileage-rates'] }),
    corporateCard: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['expense-claims', 'corporate-card', employeeId] }),
    policies: () => queryClient.invalidateQueries({ queryKey: ['expense-policies'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.expenseClaims.all(),
        invalidateCache.expenses.all(),
        invalidateCache.finance.dashboard(),
      ])
    },
  },

  // Journal Entries (not found in hooks, but mentioned in requirements)
  journalEntries: {
    all: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['journal-entry', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['journal-entries-stats'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.journalEntries.all(),
        invalidateCache.finance.generalLedger(),
        invalidateCache.finance.dashboard(),
      ])
    },
  },

  // Finance (aggregated)
  finance: {
    dashboard: () => queryClient.invalidateQueries({ queryKey: ['finance', 'dashboard'] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'finance-stats'] }),
    financialSummary: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'financial-summary'] }),
    generalLedger: () => queryClient.invalidateQueries({ queryKey: ['general-ledger'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['finance-settings'] }),
    statements: () => queryClient.invalidateQueries({ queryKey: ['statements'] }),
    transactions: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
    all: async () => {
      await Promise.all([
        invalidateCache.invoices.all(),
        invalidateCache.payments.all(),
        invalidateCache.expenses.all(),
        invalidateCache.journalEntries.all(),
        invalidateCache.finance.dashboard(),
        invalidateCache.finance.generalLedger(),
      ])
    },
  },

  // Finance Advanced
  financeAdvanced: {
    bankFeeds: () => queryClient.invalidateQueries({ queryKey: ['bank-feeds'] }),
    bankFeed: (id: string) => queryClient.invalidateQueries({ queryKey: ['bank-feed', id] }),
    bankTransactions: (id?: string) => queryClient.invalidateQueries({ queryKey: ['bank-transactions', id] }),
    matchSuggestions: (accountId?: string) => queryClient.invalidateQueries({ queryKey: ['match-suggestions', accountId] }),
    matchingRules: () => queryClient.invalidateQueries({ queryKey: ['matching-rules'] }),
    reconciliationReport: (accountId?: string) => queryClient.invalidateQueries({ queryKey: ['reconciliation-report', accountId] }),
    exchangeRates: () => queryClient.invalidateQueries({ queryKey: ['exchange-rates'] }),
    exchangeRate: (from?: string, to?: string) => queryClient.invalidateQueries({ queryKey: ['exchange-rate', from, to] }),
    rateHistory: (from?: string, to?: string) => queryClient.invalidateQueries({ queryKey: ['rate-history', from, to] }),
    currencySettings: () => queryClient.invalidateQueries({ queryKey: ['currency-settings'] }),
    all: async () => {
      await Promise.all([
        invalidateCache.financeAdvanced.bankFeeds(),
        invalidateCache.financeAdvanced.bankTransactions(),
        invalidateCache.financeAdvanced.matchingRules(),
        invalidateCache.financeAdvanced.exchangeRates(),
        invalidateCache.financeAdvanced.currencySettings(),
      ])
    },
  },

  // Billing Rates
  billingRates: {
    all: () => queryClient.invalidateQueries({ queryKey: ['billing'] }),
    // Rates
    rates: () => queryClient.invalidateQueries({ queryKey: ['billing', 'rates'], refetchType: 'all' }),
    ratesLight: () => queryClient.invalidateQueries({ queryKey: ['billing', 'rates'] }),
    // Groups
    groups: () => queryClient.invalidateQueries({ queryKey: ['billing', 'groups'], refetchType: 'all' }),
    groupsLight: () => queryClient.invalidateQueries({ queryKey: ['billing', 'groups'] }),
    // Rate Cards
    rateCards: () => queryClient.invalidateQueries({ queryKey: ['billing', 'rate-cards'], refetchType: 'all' }),
    rateCardsLight: () => queryClient.invalidateQueries({ queryKey: ['billing', 'rate-cards'] }),
    // Time Entries
    timeEntries: () => queryClient.invalidateQueries({ queryKey: ['billing', 'time-entries'], refetchType: 'all' }),
    timeEntriesLight: () => queryClient.invalidateQueries({ queryKey: ['billing', 'time-entries'] }),
    // Statistics
    statistics: () => queryClient.invalidateQueries({ queryKey: ['billing', 'statistics'], refetchType: 'all' }),
    // Related invalidations
    related: async () => {
      await Promise.all([
        invalidateCache.billingRates.all(),
        invalidateCache.finance.dashboard(),
      ])
    },
  },

  // Inter-company
  interCompany: {
    balances: () => queryClient.invalidateQueries({ queryKey: ['inter-company-balances'] }),
    firms: () => queryClient.invalidateQueries({ queryKey: ['inter-company-firms'] }),
    reconciliations: () => queryClient.invalidateQueries({ queryKey: ['inter-company-reconciliations'] }),
    transactions: () => queryClient.invalidateQueries({ queryKey: ['inter-company-transactions'] }),
    all: async () => {
      await Promise.all([
        invalidateCache.interCompany.balances(),
        invalidateCache.interCompany.firms(),
        invalidateCache.interCompany.reconciliations(),
        invalidateCache.interCompany.transactions(),
      ])
    },
  },

  // Credit Notes
  creditNotes: {
    all: () => queryClient.invalidateQueries({ queryKey: ['creditNotes'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['creditNotes', id] }),
  },

  // Quotes
  quotes: {
    all: () => queryClient.invalidateQueries({ queryKey: ['quotes'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['quotes', id] }),
    summary: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['quotes', 'summary', filters] }),
    related: async () => {
      await Promise.all([
        invalidateCache.quotes.all(),
        invalidateCache.invoices.all(),
      ])
    },
  },

  // Accounting
  accounting: {
    all: () => queryClient.invalidateQueries({ queryKey: ['accounting'] }),
    // Accounts
    accounts: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts'] }),
    accountsList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts', 'list', filters] }),
    account: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts', id] }),
    accountTypes: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts', 'types'] }),
    // GL Entries
    glEntries: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'gl-entries'] }),
    glEntriesList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'gl-entries', 'list', filters] }),
    glEntry: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'gl-entries', id] }),
    // Journal Entries
    journalEntries: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] }),
    journalEntriesList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries', 'list', filters] }),
    journalEntry: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries', id] }),
    // Fiscal Periods
    fiscalPeriods: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'fiscal-periods'] }),
    fiscalPeriodsList: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'fiscal-periods', 'list'] }),
    fiscalPeriod: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'fiscal-periods', id] }),
    fiscalPeriodBalances: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'fiscal-periods', id, 'balances'] }),
    currentFiscalPeriod: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'fiscal-periods', 'current'] }),
    fiscalYearsSummary: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'fiscal-periods', 'years-summary'] }),
    canPost: (date?: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'fiscal-periods', 'can-post', date] }),
    // Recurring Transactions
    recurring: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'recurring'] }),
    recurringList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'recurring', 'list', filters] }),
    recurringItem: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'recurring', id] }),
    recurringUpcoming: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'recurring', 'upcoming'] }),
    // Price Levels
    priceLevels: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'price-levels'] }),
    priceLevelsList: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'price-levels', 'list'] }),
    priceLevel: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'price-levels', id] }),
    clientRate: (clientId?: string, baseRate?: number, serviceType?: string) =>
      queryClient.invalidateQueries({ queryKey: ['accounting', 'price-levels', 'client-rate', clientId, baseRate, serviceType] }),
    // Bills
    bills: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'bills'] }),
    billsList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'bills', 'list', filters] }),
    bill: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'bills', id] }),
    billDebitNotes: (billId: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'bills', billId, 'debit-notes'] }),
    // Debit Notes
    debitNotes: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'debit-notes'] }),
    debitNotesList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'debit-notes', 'list', filters] }),
    debitNote: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'debit-notes', id] }),
    // Vendors
    vendors: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'vendors'] }),
    vendorsList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'vendors', 'list', filters] }),
    vendor: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'vendors', id] }),
    // Retainers
    retainers: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'retainers'] }),
    retainersList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'retainers', 'list', filters] }),
    retainer: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'retainers', id] }),
    retainerTransactions: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'retainers', id, 'transactions'] }),
    // Leads
    leads: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'leads'] }),
    leadsList: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['accounting', 'leads', 'list', filters] }),
    lead: (id: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'leads', id] }),
    leadStats: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'leads', 'stats'] }),
    // Reports
    reports: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'reports'] }),
    profitLoss: (startDate?: string, endDate?: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'reports', 'profit-loss', startDate, endDate] }),
    balanceSheet: (asOfDate?: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'reports', 'balance-sheet', asOfDate] }),
    trialBalance: (asOfDate?: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'reports', 'trial-balance', asOfDate] }),
    arAging: () => queryClient.invalidateQueries({ queryKey: ['accounting', 'reports', 'ar-aging'] }),
    caseProfitability: (startDate?: string, endDate?: string) => queryClient.invalidateQueries({ queryKey: ['accounting', 'reports', 'case-profitability', startDate, endDate] }),
    // Common patterns for related invalidations
    related: async () => {
      await Promise.all([
        invalidateCache.accounting.all(),
        invalidateCache.invoices.all(),
        invalidateCache.payments.all(),
        invalidateCache.finance.generalLedger(),
      ])
    },
  },

  // Taxes
  taxes: {
    all: () => queryClient.invalidateQueries({ queryKey: ['taxes'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['taxes', id] }),
  },

  // Corporate Cards
  corporateCards: {
    all: () => queryClient.invalidateQueries({ queryKey: ['corporate-cards'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['corporate-cards', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['corporate-cards', 'detail', id] }),
    // Transactions
    transactions: () => queryClient.invalidateQueries({ queryKey: ['card-transactions'] }),
    transactionsList: () => queryClient.invalidateQueries({ queryKey: ['card-transactions', 'list'] }),
    transactionDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['card-transactions', 'detail', id] }),
    unreconciledTransactions: (cardId?: string) => queryClient.invalidateQueries({ queryKey: ['card-transactions', 'unreconciled', cardId] }),
    disputedTransactions: (cardId?: string) => queryClient.invalidateQueries({ queryKey: ['card-transactions', 'disputed', cardId] }),
    potentialMatches: (transactionId: string) => queryClient.invalidateQueries({ queryKey: ['card-transactions', transactionId, 'potential-matches'] }),
    // Statistics
    statistics: () => queryClient.invalidateQueries({ queryKey: ['card-statistics'] }),
    statisticsWithDates: (startDate?: string, endDate?: string) => queryClient.invalidateQueries({ queryKey: ['card-statistics', startDate, endDate] }),
    // Reports
    reconciliationReport: (cardId?: string, startDate?: string, endDate?: string) => queryClient.invalidateQueries({ queryKey: ['card-reconciliation-report', cardId, startDate, endDate] }),
    spendingByCategory: (cardId?: string, startDate?: string, endDate?: string) => queryClient.invalidateQueries({ queryKey: ['card-spending-by-category', cardId, startDate, endDate] }),
    spendingByCard: (startDate?: string, endDate?: string) => queryClient.invalidateQueries({ queryKey: ['card-spending-by-card', startDate, endDate] }),
    monthlySpendingTrend: (cardId?: string, months?: number) => queryClient.invalidateQueries({ queryKey: ['card-monthly-spending-trend', cardId, months] }),
    // Related invalidations for corporate card mutations
    related: async () => {
      await Promise.all([
        invalidateCache.corporateCards.all(),
        invalidateCache.corporateCards.transactions(),
        invalidateCache.corporateCards.statistics(),
      ])
    },
  },

  // Staff/Employees
  staff: {
    all: () => queryClient.invalidateQueries({ queryKey: ['staff'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['staff', id] }),
    employees: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
    employee: (id: string) => queryClient.invalidateQueries({ queryKey: ['employees', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['employees', 'stats'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.staff.all(),
        invalidateCache.attendance.all(),
        invalidateCache.payroll.all(),
        invalidateCache.leaves.all(),
      ])
    },
  },

  // Attendance
  attendance: {
    all: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
    violations: () => queryClient.invalidateQueries({ queryKey: ['attendance', 'all-violations'] }),
    monthlyReport: (month?: number, year?: number, department?: string) =>
      queryClient.invalidateQueries({ queryKey: ['attendance', 'monthly-report', month, year, department] }),
    departmentStats: (department?: string) => queryClient.invalidateQueries({ queryKey: ['attendance', 'department-stats', department] }),
    checkInStatus: (employeeId?: string) => queryClient.invalidateQueries({ queryKey: ['attendance', 'check-in-status', employeeId] }),
    employeeSummary: (employeeId?: string, startDate?: string, endDate?: string) =>
      queryClient.invalidateQueries({ queryKey: ['attendance', 'employee-summary-alt', employeeId, startDate, endDate] }),
    byEmployeeDate: (employeeId?: string, date?: string) =>
      queryClient.invalidateQueries({ queryKey: ['attendance', 'by-employee-date', employeeId, date] }),
    breaks: (recordId?: string) => queryClient.invalidateQueries({ queryKey: ['attendance', 'breaks', recordId] }),
  },

  // Payroll
  payroll: {
    all: () => queryClient.invalidateQueries({ queryKey: ['payroll'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['payroll', 'detail', id] }),
    stats: (month?: number, year?: number) => queryClient.invalidateQueries({ queryKey: ['payroll', 'stats', month, year] }),
    employee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['payroll', 'employee', employeeId] }),
    // Payroll Runs
    runs: () => queryClient.invalidateQueries({ queryKey: ['payroll-runs'] }),
    runsList: () => queryClient.invalidateQueries({ queryKey: ['payroll-runs', 'list'] }),
    runDetail: (runId: string) => queryClient.invalidateQueries({ queryKey: ['payroll-runs', 'detail', runId] }),
    runStats: () => queryClient.invalidateQueries({ queryKey: ['payroll-runs', 'stats'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.payroll.all(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Leaves
  leaves: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leaves', id] }),
    allocations: () => queryClient.invalidateQueries({ queryKey: ['leave-allocations'] }),
    policies: () => queryClient.invalidateQueries({ queryKey: ['leave-policies'] }),
  },

  // Leave Requests
  leaveRequests: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leave-requests'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['leave-requests', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leave-requests', 'detail', id] }),
    balance: (employeeId?: string) => queryClient.invalidateQueries({ queryKey: employeeId ? ['leave-requests', 'balance', employeeId] : ['leave-requests', 'balance'] }),
    stats: (filters?: { year?: number; department?: string }) => queryClient.invalidateQueries({ queryKey: ['leave-requests', 'stats', filters] }),
    calendar: (startDate?: string, endDate?: string, department?: string) => queryClient.invalidateQueries({ queryKey: startDate && endDate ? ['leave-requests', 'calendar', startDate, endDate, department] : ['leave-requests', 'calendar'] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['leave-requests', 'pending-approvals'] }),
    types: () => queryClient.invalidateQueries({ queryKey: ['leave-requests', 'types'] }),
  },

  // Leave Allocations
  leaveAllocation: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leave-allocations'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'detail', id] }),
    employeeBalance: (employeeId: string, leaveType?: string) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'employee-balance', employeeId, leaveType] }),
    employeeAll: (employeeId: string) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'employee-all', employeeId] }),
    summary: (periodId: string, filters?: Record<string, any>) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'summary', periodId, filters] }),
    carryForwardSummary: (fromPeriodId: string, toPeriodId: string, filters?: Record<string, any>) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'carry-forward-summary', fromPeriodId, toPeriodId, filters] }),
    lowBalance: (leaveType?: string, threshold?: number) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'low-balance', leaveType, threshold] }),
    expiringCarryForward: (daysBeforeExpiry?: number) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'expiring-carry-forward', daysBeforeExpiry] }),
    history: (employeeId: string, leaveType?: string) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'history', employeeId, leaveType] }),
    statistics: (filters?: Record<string, any>) =>
      queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'statistics', filters] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['leave-allocations', 'stats'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.leaveAllocation.all(),
        invalidateCache.leaves.all(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Leave Policies
  leavePolicy: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leave-policies'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'stats'] }),
    comparison: (ids: string[]) => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'comparison', ids] }),
    // Assignments
    assignments: () => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'assignments'] }),
    assignmentDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'assignments', 'detail', id] }),
    employeePolicy: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'assignments', 'employee', employeeId] }),
    employeePolicyHistory: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'assignments', 'employee', employeeId, 'history'] }),
    employeeAllocation: (employeeId: string, periodId?: string) => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'assignments', 'employee', employeeId, 'allocation', periodId] }),
    unassignedEmployees: () => queryClient.invalidateQueries({ queryKey: ['leave-policies', 'assignments', 'unassigned'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.leavePolicy.all(),
        invalidateCache.leaveAllocation.all(),
        invalidateCache.leaves.all(),
      ])
    },
  },

  // Employee Transfer
  employeeTransfer: {
    all: () => queryClient.invalidateQueries({ queryKey: ['employee-transfers'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['employee-transfers', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['employee-transfers', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['employee-transfers', 'stats'] }),
    history: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['employee-transfers', 'history', employeeId] }),
    pendingApprovals: (approverId?: string) => queryClient.invalidateQueries({ queryKey: ['employee-transfers', 'pending-approvals', approverId] }),
    pendingHandovers: () => queryClient.invalidateQueries({ queryKey: ['employee-transfers', 'pending-handovers'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.employeeTransfer.all(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Onboarding
  onboarding: {
    all: () => queryClient.invalidateQueries({ queryKey: ['onboarding'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['onboarding', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['onboarding', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['onboarding', 'stats'] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['onboarding', 'by-employee', employeeId] }),
    upcomingReviews: (days?: number) => queryClient.invalidateQueries({ queryKey: ['onboarding', 'upcoming-reviews', days] }),
    related: async () => {
      await Promise.all([
        invalidateCache.onboarding.all(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Performance Reviews
  performanceReviews: {
    all: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'detail', id] }),
    stats: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'stats', filters] }),
    templates: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'templates'] }),
    templatesByType: (type?: string) => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'templates', type] }),
    calibrationSessions: () => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'calibration-sessions'] }),
    employeeHistory: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'employee-history', employeeId] }),
    teamSummary: (managerId: string, periodYear?: number) => queryClient.invalidateQueries({ queryKey: ['performance-reviews', 'team-summary', managerId, periodYear] }),
    related: async () => {
      await Promise.all([
        invalidateCache.performanceReviews.all(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Case Notion
  caseNotion: {
    all: () => queryClient.invalidateQueries({ queryKey: ['case-notion'] }),
    pages: (caseId: string) => queryClient.invalidateQueries({ queryKey: ['case-notion', 'pages', caseId] }),
    page: (caseId: string, pageId: string) => queryClient.invalidateQueries({ queryKey: ['case-notion', 'pages', caseId, pageId] }),
    blocks: (caseId: string, pageId: string) => queryClient.invalidateQueries({ queryKey: ['case-notion', 'pages', caseId, pageId, 'blocks'] }),
    comments: (caseId: string, blockId: string) => queryClient.invalidateQueries({ queryKey: ['case-notion', 'comments', caseId, blockId] }),
    activity: (caseId: string, pageId: string) => queryClient.invalidateQueries({ queryKey: ['case-notion', 'pages', caseId, pageId, 'activity'] }),
    templates: (category?: string) => queryClient.invalidateQueries({ queryKey: ['case-notion', 'templates', category] }),
    related: async (caseId?: string) => {
      await Promise.all([
        caseId ? invalidateCache.caseNotion.pages(caseId) : invalidateCache.caseNotion.all(),
        caseId ? invalidateCache.cases.detail(caseId) : Promise.resolve(),
      ])
    },
  },

  // Loans
  loans: {
    all: () => queryClient.invalidateQueries({ queryKey: ['loans'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['loans', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['loans', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['loans', 'stats'] }),
    employee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['loans', 'employee', employeeId] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['loans', 'pending-approvals'] }),
    overdueInstallments: () => queryClient.invalidateQueries({ queryKey: ['loans', 'overdue-installments'] }),
    repaymentSchedule: (loanId: string) => queryClient.invalidateQueries({ queryKey: ['loans', loanId, 'repayment-schedule'] }),
    earlySettlement: (loanId: string) => queryClient.invalidateQueries({ queryKey: ['loans', 'early-settlement', loanId] }),
    eligibility: (employeeId?: string) => queryClient.invalidateQueries({ queryKey: ['loans', 'eligibility', employeeId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.loans.all(),
        invalidateCache.staff.employee,
        invalidateCache.payroll.all(),
      ])
    },
  },

  // Advances
  advances: {
    all: () => queryClient.invalidateQueries({ queryKey: ['advances'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['advances', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['advances', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['advances', 'stats'] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['advances', 'employee', employeeId] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['advances', 'pending-approvals'] }),
    overdueRecoveries: () => queryClient.invalidateQueries({ queryKey: ['advances', 'overdue-recoveries'] }),
    emergency: () => queryClient.invalidateQueries({ queryKey: ['advances', 'emergency'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.advances.all(),
        invalidateCache.staff.all(),
        invalidateCache.payroll.all(),
      ])
    },
  },

  // Compensatory Leave
  compensatoryLeave: {
    all: () => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'detail', id] }),
    stats: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'stats', filters] }),
    balance: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'balance', employeeId] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'pending-approvals'] }),
    expiring: (daysBeforeExpiry?: number) => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'expiring', daysBeforeExpiry] }),
    holidayWorkRecords: (employeeId: string, filters?: any) => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'holiday-work', employeeId, filters] }),
    policy: () => queryClient.invalidateQueries({ queryKey: ['compensatory-leave-requests', 'policy'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.compensatoryLeave.all(),
        invalidateCache.leaves.all(),
        invalidateCache.leaveAllocation.all(),
        invalidateCache.attendance.all(),
      ])
    },
  },

  // Grievances
  grievances: {
    all: () => queryClient.invalidateQueries({ queryKey: ['grievances'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['grievances', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['grievances', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['grievances', 'stats'] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['grievances', 'employee', employeeId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.grievances.all(),
        invalidateCache.grievances.stats(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Offboarding
  offboarding: {
    all: () => queryClient.invalidateQueries({ queryKey: ['offboarding'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['offboarding', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['offboarding', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['offboarding', 'stats'] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['offboarding', 'by-employee', employeeId] }),
    pendingClearances: () => queryClient.invalidateQueries({ queryKey: ['offboarding', 'pending-clearances'] }),
    pendingSettlements: () => queryClient.invalidateQueries({ queryKey: ['offboarding', 'pending-settlements'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.offboarding.all(),
        invalidateCache.offboarding.stats(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Succession Planning
  successionPlanning: {
    all: () => queryClient.invalidateQueries({ queryKey: ['succession-plans'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'detail', id] }),
    stats: (officeId?: string) => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'stats', officeId] }),
    byPosition: (positionId: string) => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'by-position', positionId] }),
    byIncumbent: (incumbentId: string) => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'by-incumbent', incumbentId] }),
    reviewDue: () => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'review-due'] }),
    highRisk: () => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'high-risk'] }),
    criticalWithoutSuccessors: () => queryClient.invalidateQueries({ queryKey: ['succession-plans', 'critical-without-successors'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.successionPlanning.all(),
        invalidateCache.staff.all(),
        invalidateCache.jobPositions.all(),
      ])
    },
  },

  // Benefits
  benefits: {
    all: () => queryClient.invalidateQueries({ queryKey: ['benefits'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['benefits', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['benefits', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['benefits', 'stats'] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['benefits', 'employee', employeeId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.benefits.all(),
        invalidateCache.benefits.stats(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Compensation
  compensation: {
    all: () => queryClient.invalidateQueries({ queryKey: ['compensation'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['compensation', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['compensation', 'detail', id] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['compensation', 'by-employee', employeeId] }),
    stats: (officeId?: string) => queryClient.invalidateQueries({ queryKey: ['compensation', 'stats', officeId] }),
    payGradeAnalysis: (payGrade: string) => queryClient.invalidateQueries({ queryKey: ['compensation', 'pay-grade-analysis', payGrade] }),
    related: async () => {
      await Promise.all([
        invalidateCache.compensation.all(),
        invalidateCache.compensation.stats(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Asset Assignments
  assetAssignments: {
    all: () => queryClient.invalidateQueries({ queryKey: ['asset-assignments'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['asset-assignments', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['asset-assignments', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['asset-assignments', 'stats'] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['asset-assignments', 'employee', employeeId] }),
    overdueReturns: () => queryClient.invalidateQueries({ queryKey: ['asset-assignments', 'overdue-returns'] }),
    maintenanceDue: () => queryClient.invalidateQueries({ queryKey: ['asset-assignments', 'maintenance-due'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.assetAssignments.all(),
        invalidateCache.assetAssignments.stats(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Leave Encashment
  leaveEncashment: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leave-encashments'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['leave-encashments', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leave-encashments', 'detail', id] }),
    stats: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['leave-encashments', 'stats', filters] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['leave-encashments', 'pending-approvals'] }),
    employeeHistory: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['leave-encashments', 'employee', employeeId] }),
    eligibility: (employeeId: string, leaveType: string) => queryClient.invalidateQueries({ queryKey: ['leave-encashments', 'eligibility', employeeId, leaveType] }),
    policy: () => queryClient.invalidateQueries({ queryKey: ['leave-encashments', 'policy'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.leaveEncashment.all(),
        invalidateCache.leaves.all(),
        invalidateCache.leaveAllocation.all(),
        invalidateCache.payroll.all(),
      ])
    },
  },

  // Organizational Structure
  organizationalStructure: {
    all: () => queryClient.invalidateQueries({ queryKey: ['organizational-structure'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['organizational-structure', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['organizational-structure', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['organizational-structure', 'stats'] }),
    tree: (rootUnitId?: string) => queryClient.invalidateQueries({ queryKey: ['organizational-structure', 'tree', rootUnitId] }),
    children: (parentId: string) => queryClient.invalidateQueries({ queryKey: ['organizational-structure', 'children', parentId] }),
    path: (unitId: string) => queryClient.invalidateQueries({ queryKey: ['organizational-structure', 'path', unitId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.organizationalStructure.all(),
        invalidateCache.staff.all(),
        invalidateCache.jobPositions.all(),
      ])
    },
  },

  // Odoo Activities
  odooActivities: {
    all: () => queryClient.invalidateQueries({ queryKey: ['odoo-activities'] }),
    types: () => queryClient.invalidateQueries({ queryKey: ['odoo-activities', 'types'] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['odoo-activities', 'stats'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['odoo-activities', 'list'] }),
    my: () => queryClient.invalidateQueries({ queryKey: ['odoo-activities', 'my'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['odoo-activities', 'detail', id] }),
    record: (resModel: string, resId: string) => queryClient.invalidateQueries({ queryKey: ['odoo-activities', 'record', resModel, resId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.odooActivities.all(),
        invalidateCache.activities.all(),
        invalidateCache.calendar.all(),
      ])
    },
  },

  // Shift Types
  shiftTypes: {
    all: () => queryClient.invalidateQueries({ queryKey: ['shift-types'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['shift-types', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['shift-types', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['shift-types', 'stats'] }),
    default: () => queryClient.invalidateQueries({ queryKey: ['shift-types', 'default'] }),
    byDay: (day: string) => queryClient.invalidateQueries({ queryKey: ['shift-types', 'by-day', day] }),
    active: () => queryClient.invalidateQueries({ queryKey: ['shift-types', 'active'] }),
    ramadan: () => queryClient.invalidateQueries({ queryKey: ['shift-types', 'ramadan'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.shiftTypes.all(),
        invalidateCache.shiftAssignments.all(),
        invalidateCache.attendance.all(),
      ])
    },
  },

  // Shift Assignments
  shiftAssignments: {
    all: () => queryClient.invalidateQueries({ queryKey: ['shift-assignments'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['shift-assignments', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['shift-assignments', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['shift-assignments', 'stats'] }),
    coverageReport: () => queryClient.invalidateQueries({ queryKey: ['shift-assignments', 'coverage-report'] }),
    employeeShift: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['shift-assignments', 'employee-shift', employeeId] }),
    activeAssignment: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['shift-assignments', 'active-assignment', employeeId] }),
    calendar: () => queryClient.invalidateQueries({ queryKey: ['shift-assignments', 'calendar'] }),
  },

  // Shift Requests
  shiftRequests: {
    all: () => queryClient.invalidateQueries({ queryKey: ['shift-requests'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['shift-requests', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['shift-requests', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['shift-requests', 'stats'] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['shift-requests', 'pending-approvals'] }),
    employee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['shift-requests', 'employee', employeeId] }),
    pending: () => queryClient.invalidateQueries({ queryKey: ['shift-requests', 'pending'] }),
  },

  // HR
  hr: {
    stats: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'hr-stats'] }),
    // HR Analytics
    absencePredictions: () => queryClient.invalidateQueries({ queryKey: ['hr-absence-predictions'] }),
    attritionRisk: () => queryClient.invalidateQueries({ queryKey: ['hr-attrition-risk'] }),
    departmentBreakdown: () => queryClient.invalidateQueries({ queryKey: ['hr-department-breakdown'] }),
    diversityAnalytics: () => queryClient.invalidateQueries({ queryKey: ['hr-diversity-analytics'] }),
    engagementPredictions: () => queryClient.invalidateQueries({ queryKey: ['hr-engagement-predictions'] }),
    flightRisk: () => queryClient.invalidateQueries({ queryKey: ['hr-flight-risk'] }),
    highPotential: () => queryClient.invalidateQueries({ queryKey: ['hr-high-potential'] }),
    hiringNeedsForecast: () => queryClient.invalidateQueries({ queryKey: ['hr-hiring-needs-forecast'] }),
    promotionReadiness: () => queryClient.invalidateQueries({ queryKey: ['hr-promotion-readiness'] }),
    saudization: () => queryClient.invalidateQueries({ queryKey: ['hr-saudization'] }),
    tenureDistribution: () => queryClient.invalidateQueries({ queryKey: ['hr-tenure-distribution'] }),
    trends: () => queryClient.invalidateQueries({ queryKey: ['hr-trends'] }),
    workforceForecast: () => queryClient.invalidateQueries({ queryKey: ['hr-workforce-forecast'] }),
    workforceOverview: () => queryClient.invalidateQueries({ queryKey: ['hr-workforce-overview'] }),
    // Employee promotions (legacy aliases - use employeePromotions instead)
    promotions: () => queryClient.invalidateQueries({ queryKey: ['employee-promotions'] }),
    promotion: (id: string) => queryClient.invalidateQueries({ queryKey: ['employee-promotions', id] }),
  },

  // Employee Promotions
  employeePromotions: {
    all: () => queryClient.invalidateQueries({ queryKey: ['employee-promotions'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['employee-promotions'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['employee-promotions', id] }),
    stats: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['employee-promotions', 'stats', filters] }),
    pending: () => queryClient.invalidateQueries({ queryKey: ['employee-promotions', 'pending'] }),
    awaitingApplication: () => queryClient.invalidateQueries({ queryKey: ['employee-promotions', 'awaiting-application'] }),
    history: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['employee-promotions', 'history', employeeId] }),
    employee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['employee-promotions', 'employee', employeeId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.employeePromotions.all(),
        invalidateCache.staff.all(),
        invalidateCache.hr.stats(),
      ])
    },
  },

  // Training
  training: {
    all: () => queryClient.invalidateQueries({ queryKey: ['trainings'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['trainings', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['trainings', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['trainings', 'stats'] }),
    byEmployee: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['trainings', 'employee', employeeId] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['trainings', 'pending-approvals'] }),
    upcoming: () => queryClient.invalidateQueries({ queryKey: ['trainings', 'upcoming'] }),
    overdueCompliance: () => queryClient.invalidateQueries({ queryKey: ['trainings', 'overdue-compliance'] }),
    cleSummary: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['trainings', 'cle-summary', employeeId] }),
    calendar: (month?: number, year?: number) => queryClient.invalidateQueries({ queryKey: ['trainings', 'calendar', month, year] }),
    providers: () => queryClient.invalidateQueries({ queryKey: ['trainings', 'providers'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.training.all(),
        invalidateCache.staff.all(),
        invalidateCache.hr.stats(),
      ])
    },
  },

  // Assets
  assets: {
    all: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['assets', 'list', id] }),
    categories: () => queryClient.invalidateQueries({ queryKey: ['assets', 'categories'] }),
    categoryDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['assets', 'categories', id] }),
    depreciation: (assetId: string) => queryClient.invalidateQueries({ queryKey: ['assets', 'depreciation', assetId] }),
    maintenance: () => queryClient.invalidateQueries({ queryKey: ['assets', 'maintenance'] }),
    movements: () => queryClient.invalidateQueries({ queryKey: ['assets', 'movements'] }),
    repairs: () => queryClient.invalidateQueries({ queryKey: ['assets', 'repairs'] }),
    repairDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['assets', 'repairs', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['assets', 'stats'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['assets', 'settings'] }),
  },

  // Inventory
  inventory: {
    all: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['inventory', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['inventory', 'stats'] }),
    stockLedger: () => queryClient.invalidateQueries({ queryKey: ['inventory', 'stock-ledger'] }),
    reconciliations: () => queryClient.invalidateQueries({ queryKey: ['inventory', 'reconciliations'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['inventory', 'settings'] }),
  },

  // Manufacturing
  manufacturing: {
    all: () => queryClient.invalidateQueries({ queryKey: ['manufacturing'] }),
    // BOMs
    boms: () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'boms'] }),
    bomDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'boms', id] }),
    // Workstations
    workstations: () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'workstations'] }),
    workstationDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'workstations', id] }),
    // Work Orders
    workOrders: () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'work-orders'] }),
    workOrderDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'work-orders', id] }),
    // Job Cards
    jobCards: () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'job-cards'] }),
    jobCardDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'job-cards', id] }),
    // Production Plans
    productionPlans: () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'production-plans'] }),
    productionPlanDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'production-plans', id] }),
    // Stats & Settings
    stats: () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'stats'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['manufacturing', 'settings'] }),
  },

  // Buying
  buying: {
    all: () => queryClient.invalidateQueries({ queryKey: ['buying'] }),
    // Suppliers
    suppliers: () => queryClient.invalidateQueries({ queryKey: ['buying', 'suppliers'] }),
    supplierDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['buying', 'suppliers', 'detail', id] }),
    supplierGroups: () => queryClient.invalidateQueries({ queryKey: ['buying', 'supplier-groups'] }),
    // Purchase Orders
    purchaseOrders: () => queryClient.invalidateQueries({ queryKey: ['buying', 'purchase-orders'] }),
    purchaseOrderDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['buying', 'purchase-orders', 'detail', id] }),
    // Purchase Receipts
    purchaseReceipts: () => queryClient.invalidateQueries({ queryKey: ['buying', 'purchase-receipts'] }),
    purchaseReceiptDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['buying', 'purchase-receipts', 'detail', id] }),
    // Purchase Invoices
    purchaseInvoices: () => queryClient.invalidateQueries({ queryKey: ['buying', 'purchase-invoices'] }),
    purchaseInvoiceDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['buying', 'purchase-invoices', 'detail', id] }),
    // Material Requests
    materialRequests: () => queryClient.invalidateQueries({ queryKey: ['buying', 'material-requests'] }),
    materialRequestDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['buying', 'material-requests', 'detail', id] }),
    // RFQs (Request for Quotations)
    rfqs: () => queryClient.invalidateQueries({ queryKey: ['buying', 'rfqs'] }),
    rfqDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['buying', 'rfqs', 'detail', id] }),
    // Stats & Settings
    stats: () => queryClient.invalidateQueries({ queryKey: ['buying', 'stats'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['buying', 'settings'] }),
  },

  // Quality
  quality: {
    all: () => queryClient.invalidateQueries({ queryKey: ['quality'] }),
    // Inspections
    inspections: () => queryClient.invalidateQueries({ queryKey: ['quality', 'inspections'] }),
    inspectionDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['quality', 'inspections', id] }),
    // Templates
    templates: () => queryClient.invalidateQueries({ queryKey: ['quality', 'templates'] }),
    templateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['quality', 'templates', id] }),
    // Parameters
    parameters: () => queryClient.invalidateQueries({ queryKey: ['quality', 'parameters'] }),
    // Actions
    actions: () => queryClient.invalidateQueries({ queryKey: ['quality', 'actions'] }),
    actionDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['quality', 'actions', id] }),
    // NCRs (Non-Conformance Reports)
    ncrs: () => queryClient.invalidateQueries({ queryKey: ['quality', 'ncrs'] }),
    ncrDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['quality', 'ncrs', id] }),
    // Stats & Settings
    stats: () => queryClient.invalidateQueries({ queryKey: ['quality', 'stats'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['quality', 'settings'] }),
  },

  // Subcontracting
  subcontracting: {
    all: () => queryClient.invalidateQueries({ queryKey: ['subcontracting'] }),
    // Orders
    orders: () => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'orders'] }),
    orderDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'orders', id] }),
    // Receipts
    receipts: () => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'receipts'] }),
    receiptDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'receipts', id] }),
    // BOMs
    boms: () => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'boms'] }),
    bomDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'boms', id] }),
    // Stats & Settings
    stats: () => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'stats'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'settings'] }),
  },

  // Support
  support: {
    all: () => queryClient.invalidateQueries({ queryKey: ['support'] }),
    tickets: () => queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] }),
    ticketDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['support', 'tickets', id] }),
    ticketCommunications: (id: string) => queryClient.invalidateQueries({ queryKey: ['support', 'tickets', id, 'communications'] }),
    slas: () => queryClient.invalidateQueries({ queryKey: ['support', 'slas'] }),
    slaDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['support', 'slas', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['support', 'stats'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['support', 'settings'] }),
  },

  // Calendar
  calendar: {
    all: () => queryClient.invalidateQueries({ queryKey: ['calendar'] }),
    date: (date?: string) => queryClient.invalidateQueries({ queryKey: ['calendar', 'date', date] }),
    month: (year?: number, month?: number) => queryClient.invalidateQueries({ queryKey: ['calendar', 'month', year, month] }),
    upcoming: (days?: number) => queryClient.invalidateQueries({ queryKey: ['calendar', 'upcoming', days] }),
    overdue: () => queryClient.invalidateQueries({ queryKey: ['calendar', 'overdue'] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['calendar', 'stats'] }),
    gridSummary: () => queryClient.invalidateQueries({ queryKey: ['calendar', 'grid-summary'] }),
    gridItems: () => queryClient.invalidateQueries({ queryKey: ['calendar', 'grid-items'] }),
    item: (type?: string, id?: string) => queryClient.invalidateQueries({ queryKey: ['calendar', 'item', type, id] }),
    list: () => queryClient.invalidateQueries({ queryKey: ['calendar', 'list'] }),
  },

  // Events
  events: {
    all: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['events', id] }),
    upcoming: (days?: number) => queryClient.invalidateQueries({ queryKey: ['events', 'upcoming', days] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['events', 'stats'] }),
    withStats: () => queryClient.invalidateQueries({ queryKey: ['events', 'with-stats'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.events.all(),
        invalidateCache.calendar.all(),
      ])
    },
  },

  // Reminders
  reminders: {
    all: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['reminders', id] }),
    upcoming: (days?: number) => queryClient.invalidateQueries({ queryKey: ['reminders', 'upcoming', days] }),
    overdue: () => queryClient.invalidateQueries({ queryKey: ['reminders', 'overdue'] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['reminders', 'stats'] }),
    withStats: () => queryClient.invalidateQueries({ queryKey: ['reminders', 'with-stats'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.reminders.all(),
        invalidateCache.calendar.all(),
      ])
    },
  },

  // Documents
  documents: {
    all: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['documents', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['documents', 'stats'] }),
    versions: (id: string) => queryClient.invalidateQueries({ queryKey: ['documents', 'versions', id] }),
    forCase: (caseId: string) => queryClient.invalidateQueries({ queryKey: ['documents', 'case', caseId] }),
    forClient: (clientId: string) => queryClient.invalidateQueries({ queryKey: ['documents', 'client', clientId] }),
    recent: (limit?: number) => queryClient.invalidateQueries({ queryKey: ['documents', 'recent', limit] }),
    search: (query?: string) => queryClient.invalidateQueries({ queryKey: ['documents', 'search', query] }),
    judgments: (caseId?: string) => queryClient.invalidateQueries({ queryKey: ['documents', 'judgments', caseId] }),
    pending: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'documents', 'pending'] }),
  },

  // Document Versions
  documentVersions: {
    all: (documentId: string) => queryClient.invalidateQueries({ queryKey: ['document-versions', documentId] }),
    list: (documentId: string) => queryClient.invalidateQueries({ queryKey: ['document-versions', documentId, 'list'] }),
    detail: (documentId: string, versionId: string) =>
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId, 'detail', versionId] }),
    statistics: (documentId: string) =>
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId, 'statistics'] }),
    comparison: (documentId: string, v1: string, v2: string) =>
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId, 'compare', v1, v2] }),
    diff: (documentId: string, v1: string, v2: string) =>
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId, 'diff', v1, v2] }),
    content: (documentId: string, versionId: string) =>
      queryClient.invalidateQueries({ queryKey: ['document-versions', documentId, 'content', versionId] }),
  },

  // Time Entries
  timeEntries: {
    all: () => queryClient.invalidateQueries({ queryKey: ['timeEntries'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['time-entry', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['time-stats'] }),
    pending: () => queryClient.invalidateQueries({ queryKey: ['pendingTimeEntries'] }),
    timer: () => queryClient.invalidateQueries({ queryKey: ['timer'] }),
    activeTimer: () => queryClient.invalidateQueries({ queryKey: ['active-timer'] }),
    summary: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'time-entries', 'summary'] }),
  },

  // Notifications
  notifications: {
    all: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    unread: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['notifications', 'settings'] }),
  },

  // User/Auth
  user: {
    profile: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
    permissions: () => queryClient.invalidateQueries({ queryKey: ['permissions'] }),
  },

  // Permissions (Enterprise)
  permissions: {
    all: () => queryClient.invalidateQueries({ queryKey: ['permissions'] }),
    config: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'config'] }),
    policies: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'policies'] }),
    policy: (policyId: string) => queryClient.invalidateQueries({ queryKey: ['permissions', 'policies', policyId] }),
    relations: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'relations'] }),
    resourceAccess: (resourceType: string, resourceId: string) =>
      queryClient.invalidateQueries({ queryKey: ['permissions', 'resources', resourceType, resourceId, 'access'] }),
    myPermissions: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'my-permissions'] }),
    ui: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'ui'] }),
    sidebar: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'ui', 'sidebar'] }),
    pages: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'ui', 'pages'] }),
  },

  // Settings
  settings: {
    all: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
    company: () => queryClient.invalidateQueries({ queryKey: ['company-settings'] }),
    finance: () => queryClient.invalidateQueries({ queryKey: ['finance-settings'] }),
    smtp: () => queryClient.invalidateQueries({ queryKey: ['smtp-config'] }),
    emailSignatures: () => queryClient.invalidateQueries({ queryKey: ['email-signatures'] }),
    emailTemplates: () => queryClient.invalidateQueries({ queryKey: ['email-templates'] }),
    currency: () => queryClient.invalidateQueries({ queryKey: ['currency-settings'] }),
  },

  // CRM
  crm: {
    stats: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'crm-stats'] }),
  },

  // Leads
  leads: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leads', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['leads', 'stats'] }),
    pipeline: (pipelineId?: string) => queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline', pipelineId] }),
    followUp: () => queryClient.invalidateQueries({ queryKey: ['leads', 'follow-up'] }),
    scoring: () => queryClient.invalidateQueries({ queryKey: ['lead-scores'] }),
    scoreDistribution: () => queryClient.invalidateQueries({ queryKey: ['lead-score-distribution'] }),
    scoringConfig: () => queryClient.invalidateQueries({ queryKey: ['lead-scoring-config'] }),
  },

  // Pipelines
  pipelines: {
    all: () => queryClient.invalidateQueries({ queryKey: ['pipelines'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['pipelines', id] }),
  },

  // Referrals
  referrals: {
    all: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['referrals', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['referrals', 'stats'] }),
  },

  // Contacts
  contacts: {
    all: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['contacts', 'detail', id] }),
    byCase: (caseId: string) => queryClient.invalidateQueries({ queryKey: ['contacts', 'case', caseId] }),
    byClient: (clientId: string) => queryClient.invalidateQueries({ queryKey: ['contacts', 'client', clientId] }),
    search: (query?: string) => queryClient.invalidateQueries({ queryKey: ['contacts', 'search', query] }),
  },

  // Activities
  activities: {
    all: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['activities', id] }),
    timeline: () => queryClient.invalidateQueries({ queryKey: ['activity-timeline'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['activities', 'list'] }),
    entity: (entityType: string, entityId: string) =>
      queryClient.invalidateQueries({ queryKey: ['activities', 'entity', entityType, entityId] }),
    recent: (limit?: number) => queryClient.invalidateQueries({ queryKey: ['activities', 'recent', limit] }),
  },

  // Jobs
  jobs: {
    all: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['jobs', id] }),
    myJobs: () => queryClient.invalidateQueries({ queryKey: ['jobs', 'my-jobs'] }),
    nearingDeadline: () => queryClient.invalidateQueries({ queryKey: ['jobs-nearing-deadline'] }),
    talentPool: () => queryClient.invalidateQueries({ queryKey: ['talent-pool'] }),
    pipeline: (jobId?: string) => queryClient.invalidateQueries({ queryKey: ['job-pipeline', jobId] }),
    postings: () => queryClient.invalidateQueries({ queryKey: ['job-postings'] }),
  },

  // Recruitment
  recruitment: {
    // Job Postings
    allJobs: () => queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] }),
    jobLists: () => queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs', 'list'] }),
    jobDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs', 'detail', id] }),
    jobStats: () => queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs', 'stats'] }),
    talentPool: () => queryClient.invalidateQueries({ queryKey: ['talent-pool'] }),
    jobsNearingDeadline: () => queryClient.invalidateQueries({ queryKey: ['jobs-nearing-deadline'] }),
    jobPipeline: (jobId: string) => queryClient.invalidateQueries({ queryKey: ['job-pipeline', jobId] }),

    // Applicants
    allApplicants: () => queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] }),
    applicantLists: () => queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants', 'list'] }),
    applicantDetail: (id: string) => queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants', 'detail', id] }),
    applicantStats: () => queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants', 'stats'] }),

    // Related invalidations for recruitment mutations
    related: async () => {
      await Promise.all([
        invalidateCache.recruitment.allJobs(),
        invalidateCache.recruitment.allApplicants(),
        invalidateCache.recruitment.jobStats(),
        invalidateCache.recruitment.applicantStats(),
      ])
    },
  },

  // Staffing Plan
  staffingPlan: {
    all: () => queryClient.invalidateQueries({ queryKey: ['staffing-plans'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'list'] }),
    detail: (planId: string) => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'detail', planId] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'stats'] }),
    active: () => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'active'] }),
    department: (departmentId: string) => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'department', departmentId] }),
    progress: (planId: string) => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'progress', planId] }),
    vacanciesSummary: () => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'vacancies-summary'] }),
    urgentVacancies: () => queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'urgent-vacancies'] }),
    headcount: (departmentId?: string, designation?: string) =>
      queryClient.invalidateQueries({ queryKey: ['staffing-plans', 'headcount', departmentId, designation] }),
    // Related invalidations for staffing plan mutations
    related: async (planId?: string) => {
      await Promise.all([
        invalidateCache.staffingPlan.all(),
        invalidateCache.staffingPlan.stats(),
        planId ? invalidateCache.staffingPlan.detail(planId) : Promise.resolve(),
        planId ? invalidateCache.staffingPlan.progress(planId) : Promise.resolve(),
        invalidateCache.jobs.postings(),
      ])
    },
  },

  // Job Positions
  jobPositions: {
    all: () => queryClient.invalidateQueries({ queryKey: ['job-positions'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['job-positions', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['job-positions', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['job-positions', 'stats'] }),
    vacant: () => queryClient.invalidateQueries({ queryKey: ['job-positions', 'vacant'] }),
    department: (departmentId: string) => queryClient.invalidateQueries({ queryKey: ['job-positions', 'department', departmentId] }),
    hierarchy: (positionId: string) => queryClient.invalidateQueries({ queryKey: ['job-positions', 'hierarchy', positionId] }),
    orgChart: () => queryClient.invalidateQueries({ queryKey: ['job-positions', 'org-chart'] }),
    postings: () => queryClient.invalidateQueries({ queryKey: ['job-postings'] }),
    // Related invalidations for job position mutations
    related: async () => {
      await Promise.all([
        invalidateCache.jobPositions.all(),
        invalidateCache.jobPositions.stats(),
        invalidateCache.staff.all(),
      ])
    },
  },

  // Companies/Firms
  companies: {
    all: () => queryClient.invalidateQueries({ queryKey: ['firms'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['firm', id] }),
    tree: (rootFirmId?: string) => queryClient.invalidateQueries({ queryKey: ['firms', 'tree', rootFirmId] }),
    children: (parentId?: string) => queryClient.invalidateQueries({ queryKey: ['firms', parentId, 'children'] }),
    accessible: () => queryClient.invalidateQueries({ queryKey: ['firms', 'accessible'] }),
    active: () => queryClient.invalidateQueries({ queryKey: ['firm', 'active'] }),
    access: (firmId?: string) => queryClient.invalidateQueries({ queryKey: ['firm', firmId, 'access'] }),
  },

  // Conversations & Messages
  conversations: {
    all: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
    single: (sellerId?: string, buyerId?: string) => queryClient.invalidateQueries({ queryKey: ['conversations', 'single', sellerId, buyerId] }),
    messages: (conversationId?: string) => queryClient.invalidateQueries({ queryKey: ['messages', conversationId] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['messages', 'stats'] }),
    recent: (limit?: number) => queryClient.invalidateQueries({ queryKey: ['dashboard', 'recent-messages', limit] }),
  },

  // Threaded Messages/Chatter (for records like cases, tasks, etc.)
  messages: {
    all: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['messages', 'list'] }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['messages', 'list', filters] }),
    thread: (resModel: string, resId: string) => queryClient.invalidateQueries({ queryKey: ['messages', 'thread', resModel, resId] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['messages', 'detail', id] }),
    mentions: () => queryClient.invalidateQueries({ queryKey: ['messages', 'mentions'] }),
    starred: () => queryClient.invalidateQueries({ queryKey: ['messages', 'starred'] }),
    search: (query?: string) => queryClient.invalidateQueries({ queryKey: ['messages', 'search', query] }),
    related: async () => {
      await Promise.all([
        invalidateCache.messages.all(),
        invalidateCache.notifications.all(),
      ])
    },
  },

  // Integrations
  integrations: {
    all: () => queryClient.invalidateQueries({ queryKey: ['integrations'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['integrations', id] }),
    category: (category?: string) => queryClient.invalidateQueries({ queryKey: ['integrations', 'category', category] }),
    status: (id: string) => queryClient.invalidateQueries({ queryKey: ['integrations', id, 'status'] }),
  },

  // OAuth
  oauth: {
    providers: () => queryClient.invalidateQueries({ queryKey: ['oauth', 'providers'] }),
    linked: () => queryClient.invalidateQueries({ queryKey: ['oauth', 'linked'] }),
  },

  // API Keys
  apiKeys: {
    all: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['api-keys', 'stats'] }),
  },

  // Webhooks
  webhooks: {
    all: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['webhooks', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['webhooks', 'stats'] }),
    events: () => queryClient.invalidateQueries({ queryKey: ['webhooks', 'events'] }),
    deliveries: (id: string) => queryClient.invalidateQueries({ queryKey: ['webhooks', 'deliveries', id] }),
    secret: (id: string) => queryClient.invalidateQueries({ queryKey: ['webhooks', 'secret', id] }),
  },

  // Biometric
  biometric: {
    devices: () => queryClient.invalidateQueries({ queryKey: ['biometric-devices'] }),
    device: (id: string) => queryClient.invalidateQueries({ queryKey: ['biometric-device', id] }),
    enrollments: () => queryClient.invalidateQueries({ queryKey: ['biometric-enrollments'] }),
    enrollment: (id: string) => queryClient.invalidateQueries({ queryKey: ['biometric-enrollment', id] }),
    verificationLogs: () => queryClient.invalidateQueries({ queryKey: ['verification-logs'] }),
    verificationLiveFeed: () => queryClient.invalidateQueries({ queryKey: ['verification-live-feed'] }),
    verificationStats: () => queryClient.invalidateQueries({ queryKey: ['verification-stats'] }),
    geofences: () => queryClient.invalidateQueries({ queryKey: ['geofences'] }),
    geofence: (id: string) => queryClient.invalidateQueries({ queryKey: ['geofence', id] }),
  },

  // Billing
  billing: {
    subscription: () => queryClient.invalidateQueries({ queryKey: ['subscription'] }),
    usageMetrics: () => queryClient.invalidateQueries({ queryKey: ['usage-metrics'] }),
    history: () => queryClient.invalidateQueries({ queryKey: ['billing-history'] }),
    invoice: (id: string) => queryClient.invalidateQueries({ queryKey: ['invoice', id] }),
    upcomingInvoice: (planId?: string) => queryClient.invalidateQueries({ queryKey: ['upcoming-invoice', planId] }),
    paymentMethods: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  },

  // Billing Settings (Company Settings, Taxes, Payment Modes, Finance Settings, Payment Terms)
  billingSettings: {
    // Company Settings
    companySettings: () => queryClient.invalidateQueries({ queryKey: ['company-settings'] }),
    // Taxes
    taxes: () => queryClient.invalidateQueries({ queryKey: ['taxes'], refetchType: 'all' }),
    taxesLight: () => queryClient.invalidateQueries({ queryKey: ['taxes'] }),
    // Payment Modes
    paymentModes: () => queryClient.invalidateQueries({ queryKey: ['payment-modes'], refetchType: 'all' }),
    paymentModesLight: () => queryClient.invalidateQueries({ queryKey: ['payment-modes'] }),
    // Finance Settings
    financeSettings: () => queryClient.invalidateQueries({ queryKey: ['finance-settings'] }),
    // Payment Terms
    paymentTerms: () => queryClient.invalidateQueries({ queryKey: ['payment-terms'], refetchType: 'all' }),
    paymentTermsLight: () => queryClient.invalidateQueries({ queryKey: ['payment-terms'] }),
    paymentTerm: (id: string) => queryClient.invalidateQueries({ queryKey: ['payment-terms', id] }),
    // Related invalidations
    all: async () => {
      await Promise.all([
        invalidateCache.billingSettings.companySettings(),
        invalidateCache.billingSettings.taxes(),
        invalidateCache.billingSettings.paymentModes(),
        invalidateCache.billingSettings.financeSettings(),
        invalidateCache.billingSettings.paymentTerms(),
      ])
    },
  },

  // Dashboard
  dashboard: {
    summary: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
    heroStats: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'hero-stats'] }),
    todayEvents: () => queryClient.invalidateQueries({ queryKey: ['dashboard', 'today-events'] }),
    upcomingHearings: (days?: number) => queryClient.invalidateQueries({ queryKey: ['dashboard', 'hearings', 'upcoming', days] }),
    upcomingDeadlines: (days?: number) => queryClient.invalidateQueries({ queryKey: ['dashboard', 'deadlines', 'upcoming', days] }),
  },

  // Reports (Data & Analytics - Report Builder)
  reports: {
    all: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['reports', 'list'] }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['reports', 'list', filters] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['reports', 'detail', id] }),
    byCategory: (category: string) => queryClient.invalidateQueries({ queryKey: ['reports', 'by-category', category] }),
    bySection: (section: string) => queryClient.invalidateQueries({ queryKey: ['reports', 'by-section', section] }),
    stats: (officeId?: string) => queryClient.invalidateQueries({ queryKey: ['reports', 'stats', officeId] }),
    favorites: () => queryClient.invalidateQueries({ queryKey: ['reports', 'favorites'] }),
    executionHistory: (id: string) => queryClient.invalidateQueries({ queryKey: ['reports', 'execution-history', id] }),
    dataSources: () => queryClient.invalidateQueries({ queryKey: ['reports', 'data-sources'] }),
    // Dashboard reports (legacy/charts)
    casesChart: (months?: number) => queryClient.invalidateQueries({ queryKey: ['reports', 'cases-chart', months] }),
    revenueChart: (months?: number) => queryClient.invalidateQueries({ queryKey: ['reports', 'revenue-chart', months] }),
    tasksChart: (months?: number) => queryClient.invalidateQueries({ queryKey: ['reports', 'tasks-chart', months] }),
    // Related invalidations
    related: async () => {
      await Promise.all([
        invalidateCache.reports.all(),
        invalidateCache.reports.stats(),
      ])
    },
  },

  // Gantt
  gantt: {
    all: () => queryClient.invalidateQueries({ queryKey: ['gantt'] }),
    data: () => queryClient.invalidateQueries({ queryKey: ['gantt-data'] }),
    dhtmlx: () => queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] }),
    productivity: () => queryClient.invalidateQueries({ queryKey: ['gantt', 'productivity'] }),
    criticalPath: () => queryClient.invalidateQueries({ queryKey: ['gantt-critical-path'] }),
    milestones: () => queryClient.invalidateQueries({ queryKey: ['gantt-milestones'] }),
    baselines: () => queryClient.invalidateQueries({ queryKey: ['gantt-baselines'] }),
    baselineCompare: () => queryClient.invalidateQueries({ queryKey: ['gantt-baseline-compare'] }),
    resourceLoading: () => queryClient.invalidateQueries({ queryKey: ['gantt-resource-loading'] }),
    resourceWorkload: () => queryClient.invalidateQueries({ queryKey: ['gantt-resource-workload'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.gantt.data(),
        invalidateCache.gantt.dhtmlx(),
        invalidateCache.gantt.productivity(),
      ])
    },
  },

  // Smart Buttons
  smartButtons: {
    all: (model?: string, recordId?: string) => queryClient.invalidateQueries({ queryKey: ['smart-buttons', model, recordId] }),
    count: (entityType?: string, entityId?: string, buttonId?: string) =>
      queryClient.invalidateQueries({ queryKey: ['smart-button-count', entityType, entityId, buttonId] }),
    batchCounts: (entityType?: string, entityId?: string) =>
      queryClient.invalidateQueries({ queryKey: ['smart-button-counts-batch', entityType, entityId] }),
  },

  // Service Health
  serviceHealth: {
    all: () => queryClient.invalidateQueries({ queryKey: ['service-health'] }),
  },

  // Cache stats
  cacheStats: {
    all: () => queryClient.invalidateQueries({ queryKey: ['cache-stats'] }),
  },

  // Sidebar data
  sidebar: {
    data: (date?: string) => queryClient.invalidateQueries({ queryKey: ['sidebar', 'data', date] }),
  },

  // CRM Advanced
  crmAdvanced: {
    // Email Templates
    emailTemplates: () => queryClient.invalidateQueries({ queryKey: ['email-templates'] }),
    emailTemplate: (id: string) => queryClient.invalidateQueries({ queryKey: ['email-template', id] }),
    // Email Campaigns
    emailCampaigns: () => queryClient.invalidateQueries({ queryKey: ['email-campaigns'] }),
    emailCampaign: (id: string) => queryClient.invalidateQueries({ queryKey: ['email-campaign', id] }),
    campaignAnalytics: (id: string) => queryClient.invalidateQueries({ queryKey: ['campaign-analytics', id] }),
    // Drip Campaigns
    dripCampaigns: () => queryClient.invalidateQueries({ queryKey: ['drip-campaigns'] }),
    dripCampaign: (id: string) => queryClient.invalidateQueries({ queryKey: ['drip-campaign', id] }),
    // Subscribers
    subscribers: () => queryClient.invalidateQueries({ queryKey: ['subscribers'] }),
    // Segments
    segments: () => queryClient.invalidateQueries({ queryKey: ['segments'] }),
    // Lead Scoring
    leadScores: () => queryClient.invalidateQueries({ queryKey: ['lead-scores'] }),
    leadInsights: (leadId: string) => queryClient.invalidateQueries({ queryKey: ['lead-insights', leadId] }),
    leadLeaderboard: (limit?: number) => queryClient.invalidateQueries({ queryKey: ['lead-leaderboard', limit] }),
    leadScoringConfig: () => queryClient.invalidateQueries({ queryKey: ['lead-scoring-config'] }),
    leadScoreDistribution: () => queryClient.invalidateQueries({ queryKey: ['lead-score-distribution'] }),
    // WhatsApp
    whatsAppConversations: () => queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] }),
    whatsAppConversation: (id: string) => queryClient.invalidateQueries({ queryKey: ['whatsapp-conversation', id] }),
    whatsAppTemplates: () => queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] }),
    whatsAppBroadcasts: () => queryClient.invalidateQueries({ queryKey: ['whatsapp-broadcasts'] }),
  },

  // Email campaigns (legacy alias for backward compatibility)
  emailCampaigns: {
    all: () => queryClient.invalidateQueries({ queryKey: ['email-campaigns'] }),
    dripCampaigns: () => queryClient.invalidateQueries({ queryKey: ['drip-campaigns'] }),
    subscribers: () => queryClient.invalidateQueries({ queryKey: ['subscribers'] }),
    segments: () => queryClient.invalidateQueries({ queryKey: ['segments'] }),
  },

  // LDAP
  ldap: {
    config: () => queryClient.invalidateQueries({ queryKey: ['ldap-config'] }),
    syncStatus: () => queryClient.invalidateQueries({ queryKey: ['ldap-sync-status'] }),
  },

  // Vehicles
  vehicles: {
    all: () => queryClient.invalidateQueries({ queryKey: ['vehicles'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['vehicles', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['vehicles', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['vehicles', 'stats'] }),
    fleetSummary: () => queryClient.invalidateQueries({ queryKey: ['vehicles', 'fleet-summary'] }),
    serviceDue: () => queryClient.invalidateQueries({ queryKey: ['vehicles', 'service-due'] }),
    utilization: (vehicleId: string) => queryClient.invalidateQueries({ queryKey: ['vehicles', 'utilization', vehicleId] }),
    expenses: (vehicleId: string) => queryClient.invalidateQueries({ queryKey: ['vehicles', 'expenses', vehicleId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.vehicles.all(),
        invalidateCache.vehicles.stats(),
        invalidateCache.vehicles.fleetSummary(),
      ])
    },
  },

  // Vehicle Logs
  vehicleLogs: {
    all: () => queryClient.invalidateQueries({ queryKey: ['vehicle-logs'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['vehicle-logs', 'list'] }),
  },

  // Lean
  lean: {
    all: () => queryClient.invalidateQueries({ queryKey: ['lean'] }),
  },

  // Apps
  apps: {
    all: () => queryClient.invalidateQueries({ queryKey: ['apps'] }),
  },

  // Trust Accounts
  trustAccounts: {
    all: () => queryClient.invalidateQueries({ queryKey: ['trust-accounts'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'list'], refetchType: 'all' }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'detail', id], refetchType: 'all' }),
    // Client Balances
    clientBalances: () => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'client-balances'], refetchType: 'all' }),
    clientBalance: (accountId: string, clientId: string) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'client-balances', accountId, clientId], refetchType: 'all' }),
    // Transactions
    transactions: () => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'transactions'], refetchType: 'all' }),
    transactionList: (filters?: Record<string, unknown>) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'transactions', filters], refetchType: 'all' }),
    transaction: (id: string) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'transactions', id], refetchType: 'all' }),
    // Reconciliations
    reconciliations: () => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'reconciliations'], refetchType: 'all' }),
    reconciliationList: (filters?: Record<string, unknown>) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'reconciliations', filters], refetchType: 'all' }),
    reconciliation: (id: string) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'reconciliations', id], refetchType: 'all' }),
    // Three-Way Reconciliation
    threeWay: (accountId: string) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'three-way', accountId], refetchType: 'all' }),
    // Client Ledger
    clientLedger: (accountId: string, clientId: string) => queryClient.invalidateQueries({ queryKey: ['trust-accounts', 'ledger', accountId, clientId], refetchType: 'all' }),
    // Related invalidations for trust account mutations
    related: async () => {
      await Promise.all([
        invalidateCache.trustAccounts.all(),
        invalidateCache.trustAccounts.transactions(),
        invalidateCache.trustAccounts.clientBalances(),
        invalidateCache.finance.dashboard(),
      ])
    },
  },

  // Leave Periods
  leavePeriods: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leave-periods'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['leave-periods', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leave-periods', 'detail', id] }),
    active: () => queryClient.invalidateQueries({ queryKey: ['leave-periods', 'active'] }),
    byYear: (year: number) => queryClient.invalidateQueries({ queryKey: ['leave-periods', 'year', year] }),
    statistics: (periodId: string) => queryClient.invalidateQueries({ queryKey: ['leave-periods', 'statistics', periodId] }),
    allocationSummary: (periodId: string) => queryClient.invalidateQueries({ queryKey: ['leave-periods', 'allocation-summary', periodId] }),
    related: async (periodId?: string) => {
      await Promise.all([
        invalidateCache.leavePeriods.all(),
        invalidateCache.leaveRequests.balance(),
      ])
    },
  },

  // Case Workflows
  caseWorkflows: {
    all: () => queryClient.invalidateQueries({ queryKey: ['case-workflows'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['case-workflows', 'list'], refetchType: 'all' }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['case-workflows', 'list', filters] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['case-workflows', 'detail', id] }),
    byCategory: (category: string) => queryClient.invalidateQueries({ queryKey: ['case-workflows', 'category', category] }),
    presets: () => queryClient.invalidateQueries({ queryKey: ['case-workflows', 'presets'] }),
    statistics: () => queryClient.invalidateQueries({ queryKey: ['case-workflows', 'statistics'], refetchType: 'all' }),
    caseProgress: (caseId: string) => queryClient.invalidateQueries({ queryKey: ['case-workflows', 'case-progress', caseId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.caseWorkflows.all(),
        invalidateCache.cases.all(),
      ])
    },
  },

  // Skill Maps
  skillMap: {
    all: () => queryClient.invalidateQueries({ queryKey: ['skill-maps'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['skill-maps', 'list'] }),
    detail: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['skill-maps', 'detail', employeeId] }),
    matrix: (departmentId?: string) => queryClient.invalidateQueries({ queryKey: ['skill-maps', 'matrix', departmentId] }),
    skillTrends: (employeeId: string, skillId: string) => queryClient.invalidateQueries({ queryKey: ['skill-maps', 'trends', employeeId, skillId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.skillMap.all(),
        invalidateCache.employees.all(),
      ])
    },
  },

  // Retention Bonuses
  retentionBonus: {
    all: () => queryClient.invalidateQueries({ queryKey: ['retention-bonuses'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'detail', id] }),
    employeeHistory: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'employee-history', employeeId] }),
    vestingStatus: (id: string) => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'vesting-status', id] }),
    dueForPayment: (date?: string) => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'due-for-payment', date] }),
    stats: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'stats', filters] }),
    pendingApprovals: () => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'pending-approvals'] }),
    departmentSummary: (departmentId?: string) => queryClient.invalidateQueries({ queryKey: ['retention-bonuses', 'department-summary', departmentId] }),
  },

  // Employee Incentives
  employeeIncentives: {
    all: () => queryClient.invalidateQueries({ queryKey: ['employee-incentives'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'list'] }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'list', filters] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'detail', id] }),
    stats: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'stats', filters] }),
    employeeHistory: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'employee-history', employeeId] }),
    payroll: (payrollDate: string) => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'payroll', payrollDate] }),
    pending: () => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'pending'] }),
    awaitingProcessing: () => queryClient.invalidateQueries({ queryKey: ['employee-incentives', 'awaiting-processing'] }),
  },

  // Chatter (Followers, Activities, Attachments)
  // ML Scoring
  mlScoring: {
    all: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring'] }),
    scores: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'scores'] }),
    scoresList: (params?: any) => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'scores', 'list', params] }),
    score: (leadId: string) => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'scores', 'detail', leadId] }),
    explanation: (leadId: string) => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'scores', 'explanation', leadId] }),
    hybrid: (leadId: string) => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'scores', 'hybrid', leadId] }),
    priorityQueue: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'priority-queue'] }),
    priorityQueueList: (params?: any) => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'priority-queue', 'list', params] }),
    teamWorkload: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'priority-queue', 'workload'] }),
    sla: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'sla'] }),
    slaMetrics: (period?: string) => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'sla', 'metrics', period] }),
    slaBreaches: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'sla', 'breaches'] }),
    analytics: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'analytics'] }),
    dashboard: (params?: any) => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'analytics', 'dashboard', params] }),
    featureImportance: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'analytics', 'feature-importance'] }),
    scoreDistribution: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'analytics', 'score-distribution'] }),
    modelMetrics: () => queryClient.invalidateQueries({ queryKey: ['ml-scoring', 'model-metrics'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.mlScoring.all(),
      ])
    },
  },

  chatter: {
    all: () => queryClient.invalidateQueries({ queryKey: ['chatter'] }),
    followers: (resModel: string, resId: string) => queryClient.invalidateQueries({ queryKey: ['chatter', 'followers', resModel, resId] }),
    isFollowing: (resModel: string, resId: string) => queryClient.invalidateQueries({ queryKey: ['chatter', 'isFollowing', resModel, resId] }),
    activities: (resModel: string, resId: string, state?: string) => queryClient.invalidateQueries({ queryKey: ['chatter', 'activities', resModel, resId, state] }),
    myActivities: (state?: string) => queryClient.invalidateQueries({ queryKey: ['chatter', 'myActivities', state] }),
    activityTypes: () => queryClient.invalidateQueries({ queryKey: ['chatter', 'activityTypes'] }),
    attachments: (resModel: string, resId: string) => queryClient.invalidateQueries({ queryKey: ['chatter', 'attachments', resModel, resId] }),
    related: async () => {
      await Promise.all([
        invalidateCache.chatter.all(),
      ])
    },
  },

  // Follow-ups
  followups: {
    all: (options?: { refetchType?: 'all' }) =>
      queryClient.invalidateQueries({ queryKey: ['followups'], refetchType: options?.refetchType }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['followups', 'list'] }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['followups', 'list', filters] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['followups', 'detail', id] }),
    entity: (entityType: string, entityId: string, options?: { refetchType?: 'all' }) =>
      queryClient.invalidateQueries({ queryKey: ['followups', 'entity', entityType, entityId], refetchType: options?.refetchType }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['followups', 'stats'] }),
    overdue: () => queryClient.invalidateQueries({ queryKey: ['followups', 'overdue'] }),
    upcoming: (days?: number) => queryClient.invalidateQueries({ queryKey: ['followups', 'upcoming', days] }),
    today: () => queryClient.invalidateQueries({ queryKey: ['followups', 'today'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.followups.all(),
        invalidateCache.calendar.all(),
      ])
    },
  },

  // Lock Dates
  lockDates: {
    all: () => queryClient.invalidateQueries({ queryKey: ['lock-dates'] }),
    config: () => queryClient.invalidateQueries({ queryKey: ['lock-dates', 'config'] }),
    periods: (year?: number) => queryClient.invalidateQueries({ queryKey: ['lock-dates', 'periods', year] }),
    history: (lockType?: string, page?: number, limit?: number) =>
      queryClient.invalidateQueries({ queryKey: ['lock-dates', 'history', lockType, page, limit] }),
    check: (date?: string, lockType?: string) =>
      queryClient.invalidateQueries({ queryKey: ['lock-dates', 'check', date, lockType] }),
    related: async () => {
      await Promise.all([
        invalidateCache.lockDates.all(),
      ])
    },
  },

  // Automated Actions
  automatedActions: {
    all: () => queryClient.invalidateQueries({ queryKey: ['automated-actions'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['automated-actions', 'list'] }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['automated-actions', 'list', filters] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['automated-actions', 'detail', id] }),
    logs: (actionId: string, filters?: any) => queryClient.invalidateQueries({ queryKey: ['automated-actions', 'logs', actionId, filters] }),
    allLogs: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['automated-actions', 'all-logs', filters] }),
    models: () => queryClient.invalidateQueries({ queryKey: ['automated-actions', 'models'] }),
    modelFields: (modelName: string) => queryClient.invalidateQueries({ queryKey: ['automated-actions', 'fields', modelName] }),
    related: async () => {
      await Promise.all([
        invalidateCache.automatedActions.all(),
      ])
    },
  },

  // UI Access Control
  uiAccess: {
    all: () => queryClient.invalidateQueries({ queryKey: ['ui-access'] }),
    sidebar: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'sidebar'] }),
    visibleSidebar: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'sidebar', 'visible'] }),
    allSidebarItems: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'sidebar', 'all'] }),
    pages: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'pages'] }),
    pageAccess: (path: string) => queryClient.invalidateQueries({ queryKey: ['ui-access', 'pages', 'check', path] }),
    allPageAccess: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'pages', 'all'] }),
    config: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'config'] }),
    matrix: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'matrix'] }),
    overrides: () => queryClient.invalidateQueries({ queryKey: ['ui-access', 'overrides'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.uiAccess.all(),
      ])
    },
  },

  // Skills
  skills: {
    all: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['skills', 'list'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['skills', 'detail', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['skills', 'stats'] }),
    byCategory: (category: string) => queryClient.invalidateQueries({ queryKey: ['skills', 'category', category] }),
    active: () => queryClient.invalidateQueries({ queryKey: ['skills', 'active'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.skills.all(),
      ])
    },
  },

  // Consolidated Reports
  consolidatedReport: {
    all: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports'] }),
    profitLoss: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports', 'profit-loss'] }),
    balanceSheet: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports', 'balance-sheet'] }),
    interCompanyTransactions: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports', 'inter-company-transactions'] }),
    comparisons: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports', 'comparisons'] }),
    summary: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports', 'summary'] }),
    eliminationRules: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports', 'elimination-rules'] }),
    exchangeRates: () => queryClient.invalidateQueries({ queryKey: ['consolidated-reports', 'exchange-rates'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.consolidatedReport.all(),
      ])
    },
  },

  // Email Settings
  emailSettings: {
    smtpConfig: () => queryClient.invalidateQueries({ queryKey: ['smtp-config'] }),
    signatures: (options?: { refetchType?: 'all' }) =>
      queryClient.invalidateQueries({ queryKey: ['email-signatures'], refetchType: options?.refetchType }),
    templates: (options?: { refetchType?: 'all' }) =>
      queryClient.invalidateQueries({ queryKey: ['email-templates'], refetchType: options?.refetchType }),
    template: (id: string) => queryClient.invalidateQueries({ queryKey: ['email-templates', id] }),
    related: async () => {
      await Promise.all([
        invalidateCache.emailSettings.smtpConfig(),
        invalidateCache.emailSettings.signatures(),
        invalidateCache.emailSettings.templates(),
      ])
    },
  },

  // Salary Components
  salaryComponents: {
    all: () => queryClient.invalidateQueries({ queryKey: ['salary-components'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['salary-components', 'list'] }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['salary-components', 'list', filters] }),
    details: () => queryClient.invalidateQueries({ queryKey: ['salary-components', 'detail'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['salary-components', 'detail', id] }),
    earnings: () => queryClient.invalidateQueries({ queryKey: ['salary-components', 'earnings'] }),
    deductions: () => queryClient.invalidateQueries({ queryKey: ['salary-components', 'deductions'] }),
    byType: (type: string) => queryClient.invalidateQueries({ queryKey: ['salary-components', 'by-type', type] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['salary-components', 'stats'] }),
    usage: (id: string) => queryClient.invalidateQueries({ queryKey: ['salary-components', 'usage', id] }),
    related: async () => {
      await Promise.all([
        invalidateCache.salaryComponents.all(),
      ])
    },
  },

  // HR Analytics
  hrAnalytics: {
    all: () => queryClient.invalidateQueries({ queryKey: ['hr'] }),
    // Dashboard & Overview
    dashboard: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-dashboard', params] }),
    workforceOverview: () => queryClient.invalidateQueries({ queryKey: ['hr-workforce-overview'] }),
    analyticsDashboard: () => queryClient.invalidateQueries({ queryKey: ['hr', 'analytics', 'dashboard'] }),
    // Demographics & Workforce
    demographics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-demographics', params] }),
    departmentBreakdown: () => queryClient.invalidateQueries({ queryKey: ['hr-department-breakdown'] }),
    tenureDistribution: () => queryClient.invalidateQueries({ queryKey: ['hr-tenure-distribution'] }),
    diversityAnalytics: () => queryClient.invalidateQueries({ queryKey: ['hr-diversity-analytics'] }),
    // Trends & History
    trends: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-trends', params] }),
    headcountTrends: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-headcount-trends', params] }),
    // Turnover & Attrition
    turnover: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-turnover', params] }),
    attritionRisk: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-attrition-risk', params] }),
    employeeAttritionRisk: (employeeId: string) => queryClient.invalidateQueries({ queryKey: ['hr-employee-attrition-risk', employeeId] }),
    flightRisk: () => queryClient.invalidateQueries({ queryKey: ['hr-flight-risk'] }),
    // Attendance & Absence
    absenteeism: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-absenteeism', params] }),
    attendanceAnalytics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-attendance-analytics', params] }),
    absencePredictions: () => queryClient.invalidateQueries({ queryKey: ['hr-absence-predictions'] }),
    // Performance & Development
    performanceAnalytics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-performance-analytics', params] }),
    trainingAnalytics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-training-analytics', params] }),
    highPotential: (limit?: number) => queryClient.invalidateQueries({ queryKey: ['hr-high-potential', limit] }),
    promotionReadiness: (threshold?: number) => queryClient.invalidateQueries({ queryKey: ['hr-promotion-readiness', threshold] }),
    // Compensation & Payroll
    compensationAnalytics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-compensation-analytics', params] }),
    payrollAnalytics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-payroll-analytics', params] }),
    // Recruitment & Hiring
    recruitmentAnalytics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-recruitment-analytics', params] }),
    hiringNeedsForecast: (months?: number) => queryClient.invalidateQueries({ queryKey: ['hr-hiring-needs-forecast', months] }),
    // Leave & Time Off
    leaveAnalytics: (params?: any) => queryClient.invalidateQueries({ queryKey: ['hr-leave-analytics', params] }),
    // Compliance
    saudization: () => queryClient.invalidateQueries({ queryKey: ['hr-saudization'] }),
    // Predictions & Forecasting
    workforceForecast: (months?: number) => queryClient.invalidateQueries({ queryKey: ['hr-workforce-forecast', months] }),
    engagementPredictions: () => queryClient.invalidateQueries({ queryKey: ['hr-engagement-predictions'] }),
    // Invalidate all predictions
    allPredictions: async () => {
      await Promise.all([
        invalidateCache.hrAnalytics.attritionRisk(),
        invalidateCache.hrAnalytics.workforceForecast(),
        invalidateCache.hrAnalytics.promotionReadiness(),
        invalidateCache.hrAnalytics.hiringNeedsForecast(),
        invalidateCache.hrAnalytics.highPotential(),
        invalidateCache.hrAnalytics.flightRisk(),
        invalidateCache.hrAnalytics.absencePredictions(),
        invalidateCache.hrAnalytics.engagementPredictions(),
      ])
    },
    // Invalidate everything HR related
    related: async () => {
      await Promise.all([
        invalidateCache.hrAnalytics.all(),
      ])
    },
  },

  // Tags
  tags: {
    all: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
    lists: () => queryClient.invalidateQueries({ queryKey: ['tags', 'list'] }),
    list: (filters?: any) => queryClient.invalidateQueries({ queryKey: ['tags', 'list', filters] }),
    details: () => queryClient.invalidateQueries({ queryKey: ['tags', 'detail'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['tags', 'detail', id] }),
    search: (query: string, entityType?: string) => queryClient.invalidateQueries({ queryKey: ['tags', 'search', query, entityType] }),
    popular: (entityType?: string) => queryClient.invalidateQueries({ queryKey: ['tags', 'popular', entityType] }),
    entity: (entityType: string, entityId: string) => queryClient.invalidateQueries({ queryKey: ['tags', 'entity', entityType, entityId] }),
    // Invalidate all tag-related queries
    related: async () => {
      await Promise.all([
        invalidateCache.tags.all(),
      ])
    },
  },

  // SSO
  sso: {
    all: () => queryClient.invalidateQueries({ queryKey: ['sso'] }),
    settings: () => queryClient.invalidateQueries({ queryKey: ['sso', 'settings'] }),
    availableProviders: () => queryClient.invalidateQueries({ queryKey: ['sso', 'available-providers'] }),
    provider: (id: string) => queryClient.invalidateQueries({ queryKey: ['sso', 'provider', id] }),
    enabledProviders: () => queryClient.invalidateQueries({ queryKey: ['sso', 'enabled-providers'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.sso.all(),
      ])
    },
  },

  // Users
  users: {
    all: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    list: (params?: any) => queryClient.invalidateQueries({ queryKey: ['users', 'list', params] }),
    lawyers: (params?: any) => queryClient.invalidateQueries({ queryKey: ['users', 'lawyers', params] }),
    team: () => queryClient.invalidateQueries({ queryKey: ['users', 'team'] }),
    profile: (userId: string) => queryClient.invalidateQueries({ queryKey: ['users', 'profile', userId] }),
    lawyerProfile: (username: string) => queryClient.invalidateQueries({ queryKey: ['users', 'lawyer', username] }),
    vapidKey: () => queryClient.invalidateQueries({ queryKey: ['users', 'vapid-key'] }),
    pushSubscription: () => queryClient.invalidateQueries({ queryKey: ['users', 'push-subscription'] }),
    notificationPreferences: () => queryClient.invalidateQueries({ queryKey: ['users', 'notification-preferences'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.users.all(),
      ])
    },
  },

  // MFA (Multi-Factor Authentication)
  mfa: {
    all: () => queryClient.invalidateQueries({ queryKey: ['mfa'] }),
    status: () => queryClient.invalidateQueries({ queryKey: ['mfa', 'status'] }),
    requirement: () => queryClient.invalidateQueries({ queryKey: ['mfa', 'requirement'] }),
    backupCodesCount: () => queryClient.invalidateQueries({ queryKey: ['mfa', 'backup-codes-count'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.mfa.status(),
        invalidateCache.mfa.requirement(),
        invalidateCache.mfa.backupCodesCount(),
      ])
    },
  },

  // Invoice Templates
  invoiceTemplates: {
    all: (options?: { refetchType?: 'all' }) =>
      queryClient.invalidateQueries({ queryKey: ['invoice-templates'], refetchType: options?.refetchType }),
    lists: (options?: { refetchType?: 'all' }) =>
      queryClient.invalidateQueries({ queryKey: ['invoice-templates', 'list'], refetchType: options?.refetchType }),
    list: (filters?: any, options?: { refetchType?: 'all' }) =>
      queryClient.invalidateQueries({ queryKey: ['invoice-templates', 'list', filters], refetchType: options?.refetchType }),
    details: () => queryClient.invalidateQueries({ queryKey: ['invoice-templates', 'detail'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['invoice-templates', 'detail', id] }),
    default: () => queryClient.invalidateQueries({ queryKey: ['invoice-templates', 'default'] }),
    preview: (id: string) => queryClient.invalidateQueries({ queryKey: ['invoice-templates', 'detail', id, 'preview'] }),
    related: async () => {
      await Promise.all([
        invalidateCache.invoiceTemplates.all(),
      ])
    },
  },


  // Global invalidation (use sparingly!)

  // Selective global (better than invalidating everything)
  allExcept: (exclude: string[]) => queryClient.invalidateQueries({
    predicate: (query) => !exclude.some(key =>
      query.queryKey[0] === key
    ),
  }),
}

// Export type for autocomplete
export type InvalidateCache = typeof invalidateCache
