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

  // Journal Entries (not found in hooks, but mentioned in requirements)
  journalEntries: {
    all: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['journal-entry', id] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['journal-entries', 'stats'] }),
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
  },

  // Taxes
  taxes: {
    all: () => queryClient.invalidateQueries({ queryKey: ['taxes'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['taxes', id] }),
  },

  // Corporate Cards
  corporateCards: {
    all: () => queryClient.invalidateQueries({ queryKey: ['corporate-cards'] }),
    statistics: () => queryClient.invalidateQueries({ queryKey: ['card-statistics'] }),
    transactions: () => queryClient.invalidateQueries({ queryKey: ['card-transactions'] }),
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
  },

  // Leaves
  leaves: {
    all: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['leaves', id] }),
    allocations: () => queryClient.invalidateQueries({ queryKey: ['leave-allocations'] }),
    policies: () => queryClient.invalidateQueries({ queryKey: ['leave-policies'] }),
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
    // Employee promotions
    promotions: () => queryClient.invalidateQueries({ queryKey: ['employee-promotions'] }),
    promotion: (id: string) => queryClient.invalidateQueries({ queryKey: ['employee-promotions', id] }),
  },

  // Assets
  assets: {
    all: () => queryClient.invalidateQueries({ queryKey: ['assets'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['assets', 'detail', id] }),
    maintenance: () => queryClient.invalidateQueries({ queryKey: ['assets', 'maintenance'] }),
    movements: () => queryClient.invalidateQueries({ queryKey: ['assets', 'movements'] }),
    repairs: () => queryClient.invalidateQueries({ queryKey: ['assets', 'repairs'] }),
  },

  // Inventory
  inventory: {
    all: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['inventory', id] }),
  },

  // Manufacturing
  manufacturing: {
    all: () => queryClient.invalidateQueries({ queryKey: ['manufacturing'] }),
  },

  // Buying
  buying: {
    all: () => queryClient.invalidateQueries({ queryKey: ['buying'] }),
  },

  // Quality
  quality: {
    actions: () => queryClient.invalidateQueries({ queryKey: ['quality', 'actions'] }),
    ncrs: () => queryClient.invalidateQueries({ queryKey: ['quality', 'ncrs'] }),
  },

  // Subcontracting
  subcontracting: {
    receipts: () => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'receipts'] }),
    boms: () => queryClient.invalidateQueries({ queryKey: ['subcontracting', 'boms'] }),
  },

  // Support
  support: {
    all: () => queryClient.invalidateQueries({ queryKey: ['support'] }),
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
    relations: () => queryClient.invalidateQueries({ queryKey: ['permissions', 'relations'] }),
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
  },

  // Contacts
  contacts: {
    all: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['contacts', id] }),
  },

  // Activities
  activities: {
    all: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: ['activities', id] }),
    timeline: () => queryClient.invalidateQueries({ queryKey: ['activity-timeline'] }),
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
    upcomingInvoice: (planId?: string) => queryClient.invalidateQueries({ queryKey: ['upcoming-invoice', planId] }),
    paymentMethods: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
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

  // Reports
  reports: {
    casesChart: (months?: number) => queryClient.invalidateQueries({ queryKey: ['reports', 'cases-chart', months] }),
    revenueChart: (months?: number) => queryClient.invalidateQueries({ queryKey: ['reports', 'revenue-chart', months] }),
    tasksChart: (months?: number) => queryClient.invalidateQueries({ queryKey: ['reports', 'tasks-chart', months] }),
  },

  // Gantt
  gantt: {
    data: () => queryClient.invalidateQueries({ queryKey: ['gantt-data'] }),
    dhtmlx: () => queryClient.invalidateQueries({ queryKey: ['gantt-dhtmlx'] }),
    baselines: () => queryClient.invalidateQueries({ queryKey: ['gantt-baselines'] }),
    milestones: () => queryClient.invalidateQueries({ queryKey: ['gantt-milestones'] }),
    resourceLoading: () => queryClient.invalidateQueries({ queryKey: ['gantt-resource-loading'] }),
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

  // Email campaigns
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

  // Lean
  lean: {
    all: () => queryClient.invalidateQueries({ queryKey: ['lean'] }),
  },

  // Apps
  apps: {
    all: () => queryClient.invalidateQueries({ queryKey: ['apps'] }),
  },

  // Global invalidation (use sparingly!)
  all: () => queryClient.invalidateQueries(),

  // Selective global (better than invalidating everything)
  allExcept: (exclude: string[]) => queryClient.invalidateQueries({
    predicate: (query) => !exclude.some(key =>
      query.queryKey[0] === key
    ),
  }),
}

// Export type for autocomplete
export type InvalidateCache = typeof invalidateCache
