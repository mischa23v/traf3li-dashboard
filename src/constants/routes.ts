/**
 * Comprehensive Route Constants
 *
 * This file contains all route paths used in the application.
 * Routes are organized by feature area and include type-safe helper functions
 * for dynamic route parameters.
 *
 * @module constants/routes
 */

export const ROUTES = {
  /**
   * API Endpoints (for backend API calls)
   */
  api: {
    /**
     * Dashboard API endpoints
     */
    dashboard: {
      heroStats: '/dashboard/hero-stats',
      stats: '/dashboard/stats',
      summary: '/dashboard/summary',
      todayEvents: '/dashboard/today-events',
      financialSummary: '/dashboard/financial-summary',
      recentMessages: '/dashboard/recent-messages',
      activity: '/dashboard/activity',
      crmStats: '/dashboard/crm-stats',
      hrStats: '/dashboard/hr-stats',
      financeStats: '/dashboard/finance-stats',
      hearingsUpcoming: '/dashboard/hearings/upcoming',
      deadlinesUpcoming: '/dashboard/deadlines/upcoming',
      timeEntriesSummary: '/dashboard/time-entries/summary',
      documentsPending: '/dashboard/documents/pending',
    },

    /**
     * Reports API endpoints
     */
    reports: {
      casesChart: '/reports/cases-chart',
      revenueChart: '/reports/revenue-chart',
      tasksChart: '/reports/tasks-chart',
    },

    /**
     * Messages API endpoints
     */
    messages: {
      stats: '/messages/stats',
    },
  },

  /**
   * Authentication and onboarding routes
   */
  auth: {
    signIn: '/sign-in',
    signIn2: '/sign-in-2',
    signUp: '/sign-up',
    signUpCompleteProfile: '/sign-up/complete-profile',
    forgotPassword: '/forgot-password',
    verifyEmail: '/verify-email',
    magicLink: '/magic-link',
    mfaChallenge: '/mfa-challenge',
    otp: '/otp',
    callback: (provider: string) => `/auth/callback/${provider}`,
    noFirm: '/no-firm',
    terms: '/terms',
    privacy: '/privacy',
    conflictPolicy: '/conflict-policy',
  },

  /**
   * Clerk authentication routes (alternative auth system)
   */
  clerk: {
    signIn: '/clerk/sign-in',
    signUp: '/clerk/sign-up',
    userManagement: '/clerk/user-management',
  },

  /**
   * Main dashboard and home
   */
  dashboard: {
    /**
     * Dashboard home/index
     */
    home: '/',

    /**
     * Dashboard overview
     */
    overview: '/dashboard/overview',

    /**
     * Help and support
     */
    help: '/dashboard/help',

    /**
     * Case management routes
     */
    cases: {
      list: '/dashboard/cases',
      new: '/dashboard/cases/new',
      kanban: '/dashboard/cases/kanban',
      pipeline: '/dashboard/cases/pipeline',
      pipelineBoard: '/dashboard/cases/pipeline/board',
      detail: (caseId: string) => `/dashboard/cases/${caseId}`,
      notion: (caseId: string) => `/dashboard/cases/${caseId}/notion`,
      notionPage: (caseId: string, pageId: string) => `/dashboard/cases/${caseId}/notion/${pageId}`,
      casePipeline: (caseId: string) => `/dashboard/cases/${caseId}/pipeline`,
    },

    /**
     * Case workflows
     */
    caseWorkflows: {
      list: '/dashboard/case-workflows',
    },

    /**
     * Client management routes
     */
    clients: {
      list: '/dashboard/clients',
      new: '/dashboard/clients/new',
      detail: (clientId: string) => `/dashboard/clients/${clientId}`,
    },

    /**
     * Contact management routes
     */
    contacts: {
      list: '/dashboard/contacts',
      new: '/dashboard/contacts/new',
      detail: (contactId: string) => `/dashboard/contacts/${contactId}`,
    },

    /**
     * Organization management routes
     */
    organizations: {
      list: '/dashboard/organizations',
      new: '/dashboard/organizations/new',
      detail: (organizationId: string) => `/dashboard/organizations/${organizationId}`,
    },

    /**
     * Staff management routes
     */
    staff: {
      list: '/dashboard/staff',
      new: '/dashboard/staff/new',
      detail: (staffId: string) => `/dashboard/staff/${staffId}`,
      edit: (staffId: string) => `/dashboard/staff/${staffId}/edit`,
    },

    /**
     * Activities
     */
    activities: '/dashboard/activities',

    /**
     * Calendar and scheduling
     */
    calendar: '/dashboard/calendar',

    /**
     * Appointments management
     */
    appointments: '/dashboard/appointments',

    /**
     * Notion integration
     */
    notion: '/dashboard/notion',

    /**
     * Follow-ups
     */
    followups: {
      list: '/dashboard/followups',
      new: '/dashboard/followups/new',
    },

    /**
     * Tasks management routes
     */
    tasks: {
      list: '/dashboard/tasks/list',
      new: '/dashboard/tasks/new',
      gantt: '/dashboard/tasks/gantt',
      detail: (taskId: string) => `/dashboard/tasks/${taskId}`,
      events: {
        list: '/dashboard/tasks/events',
        new: '/dashboard/tasks/events/new',
        detail: (eventId: string) => `/dashboard/tasks/events/${eventId}`,
      },
      reminders: {
        list: '/dashboard/tasks/reminders',
        new: '/dashboard/tasks/reminders/new',
        detail: (reminderId: string) => `/dashboard/tasks/reminders/${reminderId}`,
      },
      reports: {
        list: '/dashboard/tasks/reports',
        new: '/dashboard/tasks/reports/new',
        detail: (reportId: string) => `/dashboard/tasks/reports/${reportId}`,
      },
    },

    /**
     * Finance module routes
     */
    finance: {
      overview: '/dashboard/finance/overview',
      setupWizard: '/dashboard/finance/setup-wizard',

      // Invoices
      invoices: {
        list: '/dashboard/finance/invoices',
        new: '/dashboard/finance/invoices/new',
        approvals: '/dashboard/finance/invoices/approvals',
        detail: (invoiceId: string) => `/dashboard/finance/invoices/${invoiceId}`,
        edit: (invoiceId: string) => `/dashboard/finance/invoices/${invoiceId}/edit`,
      },

      // Recurring invoices
      recurringInvoices: {
        list: '/dashboard/finance/recurring-invoices',
        new: '/dashboard/finance/recurring-invoices/new',
        detail: (id: string) => `/dashboard/finance/recurring-invoices/${id}`,
        edit: (id: string) => `/dashboard/finance/recurring-invoices/${id}/edit`,
      },

      // Recurring (general)
      recurring: {
        list: '/dashboard/finance/recurring',
      },

      // Subscriptions
      subscriptions: {
        list: '/dashboard/finance/subscriptions',
        new: '/dashboard/finance/subscriptions/new',
        detail: (subscriptionId: string) => `/dashboard/finance/subscriptions/${subscriptionId}`,
        edit: (subscriptionId: string) => `/dashboard/finance/subscriptions/${subscriptionId}/edit`,
      },

      // Subscription Plans
      subscriptionPlans: {
        list: '/dashboard/finance/subscription-plans',
        new: '/dashboard/finance/subscription-plans/new',
        detail: (planId: string) => `/dashboard/finance/subscription-plans/${planId}`,
        edit: (planId: string) => `/dashboard/finance/subscription-plans/${planId}/edit`,
      },

      // Quotes
      quotes: {
        list: '/dashboard/finance/quotes',
        new: '/dashboard/finance/quotes/new',
        detail: (quoteId: string) => `/dashboard/finance/quotes/${quoteId}`,
      },

      // Credit notes
      creditNotes: {
        list: '/dashboard/finance/credit-notes',
        new: '/dashboard/finance/credit-notes/new',
        detail: (creditNoteId: string) => `/dashboard/finance/credit-notes/${creditNoteId}`,
        edit: (creditNoteId: string) => `/dashboard/finance/credit-notes/${creditNoteId}/edit`,
      },

      // Debit notes
      debitNotes: {
        list: '/dashboard/finance/debit-notes',
        new: '/dashboard/finance/debit-notes/new',
        detail: (debitNoteId: string) => `/dashboard/finance/debit-notes/${debitNoteId}`,
      },

      // Bills
      bills: {
        list: '/dashboard/finance/bills',
        new: '/dashboard/finance/bills/new',
        detail: (billId: string) => `/dashboard/finance/bills/${billId}`,
        edit: (billId: string) => `/dashboard/finance/bills/${billId}/edit`,
      },

      // Payments
      payments: {
        list: '/dashboard/finance/payments',
        new: '/dashboard/finance/payments/new',
        detail: (paymentId: string) => `/dashboard/finance/payments/${paymentId}`,
      },

      // Expenses
      expenses: {
        list: '/dashboard/finance/expenses',
        new: '/dashboard/finance/expenses/new',
        detail: (expenseId: string) => `/dashboard/finance/expenses/${expenseId}`,
        edit: (expenseId: string) => `/dashboard/finance/expenses/${expenseId}/edit`,
      },

      // Vendors
      vendors: {
        list: '/dashboard/finance/vendors',
        new: '/dashboard/finance/vendors/new',
        detail: (vendorId: string) => `/dashboard/finance/vendors/${vendorId}`,
        edit: (vendorId: string) => `/dashboard/finance/vendors/${vendorId}/edit`,
      },

      // Retainers
      retainers: {
        list: '/dashboard/finance/retainers',
        new: '/dashboard/finance/retainers/new',
        detail: (retainerId: string) => `/dashboard/finance/retainers/${retainerId}`,
      },

      // Statements
      statements: {
        list: '/dashboard/finance/statements',
        new: '/dashboard/finance/statements/new',
        detail: (statementId: string) => `/dashboard/finance/statements/${statementId}`,
        edit: (statementId: string) => `/dashboard/finance/statements/${statementId}/edit`,
      },

      // Financial activities
      activity: {
        list: '/dashboard/finance/activity',
        new: '/dashboard/finance/activity/new',
        detail: (activityId: string) => `/dashboard/finance/activity/${activityId}`,
        edit: (activityId: string) => `/dashboard/finance/activity/${activityId}/edit`,
      },

      // Time tracking
      timeTracking: {
        list: '/dashboard/finance/time-tracking',
        new: '/dashboard/finance/time-tracking/new',
        weekly: '/dashboard/finance/time-tracking/weekly',
        monthly: '/dashboard/finance/time-tracking/monthly',
        approvals: '/dashboard/finance/time-tracking/approvals',
        detail: (entryId: string) => `/dashboard/finance/time-tracking/${entryId}`,
        edit: (entryId: string) => `/dashboard/finance/time-tracking/${entryId}/edit`,
      },

      // Journal entries
      journalEntries: {
        list: '/dashboard/finance/journal-entries',
        new: '/dashboard/finance/journal-entries/new',
        detail: (id: string) => `/dashboard/finance/journal-entries/${id}`,
      },

      // Reconciliation
      reconciliation: {
        list: '/dashboard/finance/reconciliation',
        new: '/dashboard/finance/reconciliation/new',
        detail: (feedId: string) => `/dashboard/finance/reconciliation/${feedId}`,
      },

      // Currency
      currency: {
        list: '/dashboard/finance/currency',
        new: '/dashboard/finance/currency/new',
        detail: (rateId: string) => `/dashboard/finance/currency/${rateId}`,
      },

      // Reports
      reports: {
        list: '/dashboard/finance/reports',
        new: '/dashboard/finance/reports/new',
        detail: (reportId: string) => `/dashboard/finance/reports/${reportId}`,
        financial: '/dashboard/finance/reports/financial',
        accountsAging: '/dashboard/finance/reports/accounts-aging',
        outstandingInvoices: '/dashboard/finance/reports/outstanding-invoices',
        revenueByClient: '/dashboard/finance/reports/revenue-by-client',
        timeEntries: '/dashboard/finance/reports/time-entries',
      },

      // Full reports
      fullReports: {
        list: '/dashboard/finance/full-reports',
      },

      // Consolidated reports
      consolidatedReports: '/dashboard/finance/consolidated-reports',

      // Chart of accounts
      chartOfAccounts: '/dashboard/finance/chart-of-accounts',

      // General ledger
      generalLedger: '/dashboard/finance/general-ledger',

      // Opening balances
      openingBalances: '/dashboard/finance/opening-balances',

      // Fiscal periods
      fiscalPeriods: {
        list: '/dashboard/finance/fiscal-periods',
      },

      // Transactions
      transactions: {
        list: '/dashboard/finance/transactions',
        new: '/dashboard/finance/transactions/new',
        detail: (transactionId: string) => `/dashboard/finance/transactions/${transactionId}`,
      },

      // Transactions history
      transactionsHistory: {
        list: '/dashboard/finance/transactions-history',
      },

      // Corporate cards
      corporateCards: {
        list: '/dashboard/finance/corporate-cards',
        new: '/dashboard/finance/corporate-cards/new',
        detail: (cardId: string) => `/dashboard/finance/corporate-cards/${cardId}`,
        reconcile: (cardId: string) => `/dashboard/finance/corporate-cards/${cardId}/reconcile`,
        reconcileAll: '/dashboard/finance/corporate-cards/reconcile',
      },

      // Saudi banking
      saudiBanking: {
        index: '/dashboard/finance/saudi-banking',
        lean: '/dashboard/finance/saudi-banking/lean',
        mudad: '/dashboard/finance/saudi-banking/mudad',
        sadad: {
          index: '/dashboard/finance/saudi-banking/sadad',
          pay: '/dashboard/finance/saudi-banking/sadad/pay',
        },
        wps: {
          index: '/dashboard/finance/saudi-banking/wps',
          new: '/dashboard/finance/saudi-banking/wps/new',
        },
      },

      // Inter-company
      interCompany: {
        list: '/dashboard/finance/inter-company',
        new: '/dashboard/finance/inter-company/new',
        balances: '/dashboard/finance/inter-company/balances',
        reconciliation: '/dashboard/finance/inter-company/reconciliation',
        detail: (transactionId: string) => `/dashboard/finance/inter-company/${transactionId}`,
        reconciliationDetail: (reconciliationId: string) => `/dashboard/finance/inter-company/reconciliation/${reconciliationId}`,
      },

      // Budgets
      budgets: {
        list: '/dashboard/finance/budgets',
        new: '/dashboard/finance/budgets/new',
        detail: (budgetId: string) => `/dashboard/finance/budgets/${budgetId}`,
        edit: (budgetId: string) => `/dashboard/finance/budgets/${budgetId}/edit`,
      },
    },

    /**
     * HR (Human Resources) module routes
     */
    hr: {
      setupWizard: '/dashboard/hr/setup-wizard',

      // Employees
      employees: {
        list: '/dashboard/hr/employees',
        new: '/dashboard/hr/employees/new',
        detail: (employeeId: string) => `/dashboard/hr/employees/${employeeId}`,
      },

      // Attendance
      attendance: {
        list: '/dashboard/hr/attendance',
        new: '/dashboard/hr/attendance/new',
        detail: (recordId: string) => `/dashboard/hr/attendance/${recordId}`,
      },

      // Leave management
      leave: {
        list: '/dashboard/hr/leave',
        new: '/dashboard/hr/leave/new',
        detail: (requestId: string) => `/dashboard/hr/leave/${requestId}`,
        allocations: '/dashboard/hr/leave/allocations',
        compensatory: {
          list: '/dashboard/hr/leave/compensatory',
          new: '/dashboard/hr/leave/compensatory/new',
          detail: (requestId: string) => `/dashboard/hr/leave/compensatory/${requestId}`,
          edit: (requestId: string) => `/dashboard/hr/leave/compensatory/${requestId}/edit`,
        },
        encashments: {
          list: '/dashboard/hr/leave/encashments',
          new: '/dashboard/hr/leave/encashments/new',
          detail: (encashmentId: string) => `/dashboard/hr/leave/encashments/${encashmentId}`,
          edit: (encashmentId: string) => `/dashboard/hr/leave/encashments/${encashmentId}/edit`,
        },
        periods: '/dashboard/hr/leave/periods',
        policies: '/dashboard/hr/leave/policies',
      },

      // Payroll
      payroll: {
        list: '/dashboard/hr/payroll',
        new: '/dashboard/hr/payroll/new',
        detail: (slipId: string) => `/dashboard/hr/payroll/${slipId}`,
        salaryComponents: '/dashboard/hr/payroll/salary-components',
      },

      // Payroll runs
      payrollRuns: {
        list: '/dashboard/hr/payroll-runs',
        new: '/dashboard/hr/payroll-runs/new',
        detail: (runId: string) => `/dashboard/hr/payroll-runs/${runId}`,
      },

      // Compensation
      compensation: {
        list: '/dashboard/hr/compensation',
        new: '/dashboard/hr/compensation/new',
        detail: (compensationId: string) => `/dashboard/hr/compensation/${compensationId}`,
        incentives: '/dashboard/hr/compensation/incentives',
        retentionBonuses: '/dashboard/hr/compensation/retention-bonuses',
      },

      // Benefits
      benefits: {
        list: '/dashboard/hr/benefits',
        new: '/dashboard/hr/benefits/new',
        detail: (benefitId: string) => `/dashboard/hr/benefits/${benefitId}`,
      },

      // Loans
      loans: {
        list: '/dashboard/hr/loans',
        new: '/dashboard/hr/loans/new',
        detail: (loanId: string) => `/dashboard/hr/loans/${loanId}`,
      },

      // Advances
      advances: {
        list: '/dashboard/hr/advances',
        new: '/dashboard/hr/advances/new',
        detail: (advanceId: string) => `/dashboard/hr/advances/${advanceId}`,
      },

      // Expense claims
      expenseClaims: {
        list: '/dashboard/hr/expense-claims',
        new: '/dashboard/hr/expense-claims/new',
        detail: (claimId: string) => `/dashboard/hr/expense-claims/${claimId}`,
      },

      // Asset assignment
      assetAssignment: {
        list: '/dashboard/hr/asset-assignment',
        new: '/dashboard/hr/asset-assignment/new',
        detail: (assignmentId: string) => `/dashboard/hr/asset-assignment/${assignmentId}`,
      },

      // Recruitment
      recruitment: {
        jobs: {
          list: '/dashboard/hr/recruitment/jobs',
          new: '/dashboard/hr/recruitment/jobs/new',
          detail: (jobId: string) => `/dashboard/hr/recruitment/jobs/${jobId}`,
        },
        applicants: {
          list: '/dashboard/hr/recruitment/applicants',
          new: '/dashboard/hr/recruitment/applicants/new',
          detail: (applicantId: string) => `/dashboard/hr/recruitment/applicants/${applicantId}`,
        },
        staffingPlans: {
          list: '/dashboard/hr/recruitment/staffing-plans',
          detail: (planId: string) => `/dashboard/hr/recruitment/staffing-plans/${planId}`,
        },
      },

      // Onboarding
      onboarding: {
        list: '/dashboard/hr/onboarding',
        new: '/dashboard/hr/onboarding/new',
        detail: (onboardingId: string) => `/dashboard/hr/onboarding/${onboardingId}`,
      },

      // Offboarding
      offboarding: {
        list: '/dashboard/hr/offboarding',
        new: '/dashboard/hr/offboarding/new',
        detail: (offboardingId: string) => `/dashboard/hr/offboarding/${offboardingId}`,
      },

      // Performance
      performance: {
        list: '/dashboard/hr/performance',
        new: '/dashboard/hr/performance/new',
        detail: (reviewId: string) => `/dashboard/hr/performance/${reviewId}`,
      },

      // Training
      training: {
        list: '/dashboard/hr/training',
        new: '/dashboard/hr/training/new',
        detail: (trainingId: string) => `/dashboard/hr/training/${trainingId}`,
      },

      // Job positions
      jobPositions: {
        list: '/dashboard/hr/job-positions',
        new: '/dashboard/hr/job-positions/new',
        detail: (positionId: string) => `/dashboard/hr/job-positions/${positionId}`,
      },

      // Organizational structure
      organizationalStructure: {
        list: '/dashboard/hr/organizational-structure',
        new: '/dashboard/hr/organizational-structure/new',
        detail: (unitId: string) => `/dashboard/hr/organizational-structure/${unitId}`,
      },

      // Employee transfers
      employeeTransfers: {
        list: '/dashboard/hr/employee-transfers',
        new: '/dashboard/hr/employee-transfers/new',
        detail: (transferId: string) => `/dashboard/hr/employee-transfers/${transferId}`,
      },

      // Promotions
      promotions: {
        list: '/dashboard/hr/promotions',
        new: '/dashboard/hr/promotions/new',
        detail: (promotionId: string) => `/dashboard/hr/promotions/${promotionId}`,
        edit: (promotionId: string) => `/dashboard/hr/promotions/${promotionId}/edit`,
      },

      // Succession planning
      successionPlanning: {
        list: '/dashboard/hr/succession-planning',
        new: '/dashboard/hr/succession-planning/new',
        detail: (planId: string) => `/dashboard/hr/succession-planning/${planId}`,
      },

      // Shift assignments
      shiftAssignments: {
        list: '/dashboard/hr/shift-assignments',
        detail: (assignmentId: string) => `/dashboard/hr/shift-assignments/${assignmentId}`,
      },

      // Biometric
      biometric: {
        list: '/dashboard/hr/biometric',
        new: '/dashboard/hr/biometric/new',
        detail: (deviceId: string) => `/dashboard/hr/biometric/${deviceId}`,
      },

      // Geofencing
      geofencing: {
        list: '/dashboard/hr/geofencing',
        new: '/dashboard/hr/geofencing/new',
        detail: (zoneId: string) => `/dashboard/hr/geofencing/${zoneId}`,
      },

      // Vehicles
      vehicles: {
        list: '/dashboard/hr/vehicles',
        detail: (vehicleId: string) => `/dashboard/hr/vehicles/${vehicleId}`,
      },

      // Grievances
      grievances: {
        list: '/dashboard/hr/grievances',
        new: '/dashboard/hr/grievances/new',
        detail: (grievanceId: string) => `/dashboard/hr/grievances/${grievanceId}`,
      },

      // Salaries
      salaries: {
        list: '/dashboard/hr/salaries',
        new: '/dashboard/hr/salaries/new',
        detail: (salaryId: string) => `/dashboard/hr/salaries/${salaryId}`,
      },

      // Evaluations
      evaluations: {
        list: '/dashboard/hr/evaluations',
        new: '/dashboard/hr/evaluations/new',
        detail: (evaluationId: string) => `/dashboard/hr/evaluations/${evaluationId}`,
      },

      // Skills
      skills: {
        list: '/dashboard/hr/skills',
        matrix: '/dashboard/hr/skills/matrix',
      },

      // Analytics
      analytics: {
        list: '/dashboard/hr/analytics',
      },

      // Predictions
      predictions: {
        list: '/dashboard/hr/predictions',
      },

      // Reports
      reports: {
        list: '/dashboard/hr/reports',
        new: '/dashboard/hr/reports/new',
        detail: (reportId: string) => `/dashboard/hr/reports/${reportId}`,
      },

      // Settings
      settings: {
        shiftTypes: {
          list: '/dashboard/hr/settings/shift-types',
        },
      },
    },

    /**
     * CRM (Customer Relationship Management) module routes
     */
    crm: {
      index: '/dashboard/crm',
      setupWizard: '/dashboard/crm/setup-wizard',
      pipeline: '/dashboard/crm/pipeline',
      appointments: '/dashboard/crm/appointments',
      crmReports: '/dashboard/crm/crm-reports',
      salesPersons: '/dashboard/crm/sales-persons',
      territories: '/dashboard/crm/territories',
      transactions: '/dashboard/crm/transactions',

      // Contacts (CRM-specific contacts)
      contacts: {
        list: '/dashboard/crm/contacts',
        new: '/dashboard/crm/contacts/new',
        detail: (contactId: string) => `/dashboard/crm/contacts/${contactId}`,
      },

      // Campaigns
      campaigns: {
        list: '/dashboard/crm/campaigns',
        new: '/dashboard/crm/campaigns/new',
        detail: (campaignId: string) => `/dashboard/crm/campaigns/${campaignId}`,
      },

      // Leads
      leads: {
        list: '/dashboard/crm/leads',
        new: '/dashboard/crm/leads/new',
        detail: (leadId: string) => `/dashboard/crm/leads/${leadId}`,
      },

      // Lead scoring
      leadScoring: {
        list: '/dashboard/crm/lead-scoring',
      },

      // Activities
      activities: {
        list: '/dashboard/crm/activities',
        new: '/dashboard/crm/activities/new',
        calendar: '/dashboard/crm/activities/calendar',
        detail: (activityId: string) => `/dashboard/crm/activities/${activityId}`,
      },

      // Referrals
      referrals: {
        list: '/dashboard/crm/referrals',
        new: '/dashboard/crm/referrals/new',
        detail: (referralId: string) => `/dashboard/crm/referrals/${referralId}`,
      },

      // Email marketing
      emailMarketing: {
        list: '/dashboard/crm/email-marketing',
        new: '/dashboard/crm/email-marketing/new',
        detail: (campaignId: string) => `/dashboard/crm/email-marketing/${campaignId}`,
      },

      // WhatsApp
      whatsapp: {
        list: '/dashboard/crm/whatsapp',
        new: '/dashboard/crm/whatsapp/new',
        start: '/dashboard/crm/whatsapp/start',
        detail: (conversationId: string) => `/dashboard/crm/whatsapp/${conversationId}`,
      },

      // Reports
      reports: {
        list: '/dashboard/crm/reports',
        new: '/dashboard/crm/reports/new',
        detail: (reportId: string) => `/dashboard/crm/reports/${reportId}`,
      },

      // Products
      products: {
        list: '/dashboard/crm/products',
        new: '/dashboard/crm/products/new',
        detail: (productId: string) => `/dashboard/crm/products/${productId}`,
        edit: (productId: string) => `/dashboard/crm/products/${productId}/edit`,
      },

      // Quotes
      quotes: {
        list: '/dashboard/crm/quotes',
        new: '/dashboard/crm/quotes/new',
        detail: (quoteId: string) => `/dashboard/crm/quotes/${quoteId}`,
      },

      // CRM Settings
      settings: {
        general: '/dashboard/crm/settings/general',
        duplicateDetection: '/dashboard/crm/settings/duplicate-detection',
        activityPlans: '/dashboard/crm/settings/activity-plans',
        quotas: '/dashboard/crm/settings/quotas',
        lostReasons: '/dashboard/crm/settings/lost-reasons',
        salesTeams: '/dashboard/crm/settings/sales-teams',
        tags: '/dashboard/crm/settings/tags',
        territories: '/dashboard/crm/settings/territories',
        emailTemplates: '/dashboard/crm/settings/email-templates',
      },
    },

    /**
     * Inventory management routes
     */
    inventory: {
      list: '/dashboard/inventory',
      create: '/dashboard/inventory/create',
      settings: '/dashboard/inventory/settings',
      stockLedger: '/dashboard/inventory/stock-ledger',
      detail: (itemId: string) => `/dashboard/inventory/${itemId}`,

      // Stock entries
      stockEntries: {
        list: '/dashboard/inventory/stock-entries',
        create: '/dashboard/inventory/stock-entries/create',
        detail: (stockEntryId: string) => `/dashboard/inventory/stock-entries/${stockEntryId}`,
      },

      // Warehouses
      warehouses: {
        list: '/dashboard/inventory/warehouses',
        create: '/dashboard/inventory/warehouses/create',
        detail: (warehouseId: string) => `/dashboard/inventory/warehouses/${warehouseId}`,
        edit: (warehouseId: string) => `/dashboard/inventory/warehouses/${warehouseId}/edit`,
      },
    },

    /**
     * Asset management routes
     */
    assets: {
      list: '/dashboard/assets',
      create: '/dashboard/assets/create',
      settings: '/dashboard/assets/settings',
      detail: (assetId: string) => `/dashboard/assets/${assetId}`,
      edit: (assetId: string) => `/dashboard/assets/${assetId}/edit`,

      // Categories
      categories: {
        list: '/dashboard/assets/categories',
        create: '/dashboard/assets/categories/create',
        detail: (categoryId: string) => `/dashboard/assets/categories/${categoryId}`,
        edit: (categoryId: string) => `/dashboard/assets/categories/${categoryId}/edit`,
      },

      // Maintenance
      maintenance: {
        list: '/dashboard/assets/maintenance',
        create: '/dashboard/assets/maintenance/create',
        detail: (scheduleId: string) => `/dashboard/assets/maintenance/${scheduleId}`,
        start: (scheduleId: string) => `/dashboard/assets/maintenance/${scheduleId}/start`,
        edit: (scheduleId: string) => `/dashboard/assets/maintenance/${scheduleId}/edit`,
      },

      // Depreciation
      depreciation: {
        list: '/dashboard/assets/depreciation',
      },

      // Movements
      movements: {
        list: '/dashboard/assets/movements',
      },
    },

    /**
     * Manufacturing module routes
     */
    manufacturing: {
      list: '/dashboard/manufacturing',
      create: '/dashboard/manufacturing/create',
      settings: '/dashboard/manufacturing/settings',
      detail: (workOrderId: string) => `/dashboard/manufacturing/${workOrderId}`,

      // Bill of materials
      bom: {
        list: '/dashboard/manufacturing/bom',
        create: '/dashboard/manufacturing/bom/create',
        detail: (bomId: string) => `/dashboard/manufacturing/bom/${bomId}`,
      },

      // Work orders
      workOrders: {
        list: '/dashboard/manufacturing/work-orders',
        create: '/dashboard/manufacturing/work-orders/create',
        detail: (workOrderId: string) => `/dashboard/manufacturing/work-orders/${workOrderId}`,
        edit: (workOrderId: string) => `/dashboard/manufacturing/work-orders/${workOrderId}/edit`,
      },

      // Job cards
      jobCards: {
        list: '/dashboard/manufacturing/job-cards',
        create: '/dashboard/manufacturing/job-cards/create',
        detail: (jobCardId: string) => `/dashboard/manufacturing/job-cards/${jobCardId}`,
      },

      // Workstations
      workstations: {
        list: '/dashboard/manufacturing/workstations',
        create: '/dashboard/manufacturing/workstations/create',
      },

      // Production plans
      productionPlans: {
        list: '/dashboard/manufacturing/production-plans',
      },
    },

    /**
     * Buying/Purchasing module routes
     */
    buying: {
      list: '/dashboard/buying',
      create: '/dashboard/buying/create',
      settings: '/dashboard/buying/settings',
      overview: '/dashboard/buying/overview',
      detail: (supplierId: string) => `/dashboard/buying/${supplierId}`,

      // Suppliers
      suppliers: {
        list: '/dashboard/buying/suppliers',
        new: '/dashboard/buying/suppliers/new',
        detail: (supplierId: string) => `/dashboard/buying/suppliers/${supplierId}`,
        edit: (supplierId: string) => `/dashboard/buying/suppliers/${supplierId}/edit`,
      },

      // Material requests
      materialRequests: {
        list: '/dashboard/buying/material-requests',
        create: '/dashboard/buying/material-requests/create',
        detail: (materialRequestId: string) => `/dashboard/buying/material-requests/${materialRequestId}`,
      },

      // Purchase orders
      purchaseOrders: {
        list: '/dashboard/buying/purchase-orders',
        create: '/dashboard/buying/purchase-orders/create',
        detail: (purchaseOrderId: string) => `/dashboard/buying/purchase-orders/${purchaseOrderId}`,
      },

      // Purchase receipts
      purchaseReceipts: {
        list: '/dashboard/buying/purchase-receipts',
      },

      // RFQ (Request for Quotation)
      rfq: {
        list: '/dashboard/buying/rfq',
        create: '/dashboard/buying/rfq/create',
      },

      // Reports
      reports: {
        analytics: '/dashboard/buying/reports/analytics',
        supplierPerformance: '/dashboard/buying/reports/supplier-performance',
      },
    },

    /**
     * Sales module routes
     */
    sales: {
      index: '/dashboard/sales',
      leads: {
        list: '/dashboard/sales/leads',
        new: '/dashboard/sales/leads/new',
        detail: (leadId: string) => `/dashboard/sales/leads/${leadId}`,
      },
      reports: {
        list: '/dashboard/sales/reports',
        new: '/dashboard/sales/reports/new',
        detail: (reportId: string) => `/dashboard/sales/reports/${reportId}`,
      },
      transactions: '/dashboard/sales/transactions',
      settings: '/dashboard/sales/settings',
      pipeline: '/dashboard/sales/pipeline',
      quotes: {
        list: '/dashboard/sales/quotes',
        new: '/dashboard/sales/quotes/new',
        detail: (quoteId: string) => `/dashboard/sales/quotes/${quoteId}`,
      },
      orders: {
        list: '/dashboard/sales/orders',
        new: '/dashboard/sales/orders/new',
        detail: (orderId: string) => `/dashboard/sales/orders/${orderId}`,
      },
      customers: {
        list: '/dashboard/sales/customers',
        new: '/dashboard/sales/customers/new',
        detail: (customerId: string) => `/dashboard/sales/customers/${customerId}`,
      },
    },

    /**
     * Quality management routes
     */
    quality: {
      list: '/dashboard/quality',
      create: '/dashboard/quality/create',
      settings: '/dashboard/quality/settings',
      detail: (inspectionId: string) => `/dashboard/quality/${inspectionId}`,

      // Actions
      actions: {
        list: '/dashboard/quality/actions',
        create: '/dashboard/quality/actions/create',
      },

      // Templates
      templates: {
        list: '/dashboard/quality/templates',
        create: '/dashboard/quality/templates/create',
      },

      // NCRs (Non-Conformance Reports)
      ncrs: {
        list: '/dashboard/quality/ncrs',
      },
    },

    /**
     * Subcontracting routes
     */
    subcontracting: {
      list: '/dashboard/subcontracting',
      create: '/dashboard/subcontracting/create',
      settings: '/dashboard/subcontracting/settings',
      materials: '/dashboard/subcontracting/materials',
      detail: (orderId: string) => `/dashboard/subcontracting/${orderId}`,
      edit: (orderId: string) => `/dashboard/subcontracting/${orderId}/edit`,

      // Receipts
      receipts: {
        list: '/dashboard/subcontracting/receipts',
        create: '/dashboard/subcontracting/receipts/create',
        detail: (receiptId: string) => `/dashboard/subcontracting/receipts/${receiptId}`,
        edit: (receiptId: string) => `/dashboard/subcontracting/receipts/${receiptId}/edit`,
      },

      // BOMs (Bill of Materials)
      boms: {
        list: '/dashboard/subcontracting/boms',
      },
    },

    /**
     * Support/Help desk routes
     */
    support: {
      list: '/dashboard/support',
      create: '/dashboard/support/create',
      settings: '/dashboard/support/settings',
      requestAccess: '/dashboard/support/request-access',
      detail: (ticketId: string) => `/dashboard/support/${ticketId}`,

      // SLA (Service Level Agreement)
      sla: {
        list: '/dashboard/support/sla',
        create: '/dashboard/support/sla/create',
      },
    },

    /**
     * Machine learning routes
     */
    ml: {
      queue: '/dashboard/ml/queue',
      sla: '/dashboard/ml/sla',
      analytics: '/dashboard/ml/analytics',
    },

    /**
     * Messaging routes
     */
    messages: {
      chat: '/dashboard/messages/chat',
      email: '/dashboard/messages/email',
    },

    /**
     * Knowledge base routes
     */
    knowledge: {
      forms: {
        list: '/dashboard/knowledge/forms',
        new: '/dashboard/knowledge/forms/new',
        detail: (formId: string) => `/dashboard/knowledge/forms/${formId}`,
      },
      judgments: {
        list: '/dashboard/knowledge/judgments',
        new: '/dashboard/knowledge/judgments/new',
        detail: (judgmentId: string) => `/dashboard/knowledge/judgments/${judgmentId}`,
      },
      laws: {
        list: '/dashboard/knowledge/laws',
        new: '/dashboard/knowledge/laws/new',
        detail: (lawId: string) => `/dashboard/knowledge/laws/${lawId}`,
      },
    },

    /**
     * Jobs/Services routes
     */
    jobs: {
      list: '/dashboard/jobs',
      new: '/dashboard/jobs/new',
      browse: '/dashboard/jobs/browse',
      myServices: '/dashboard/jobs/my-services',
      detail: (jobId: string) => `/dashboard/jobs/${jobId}`,
    },

    /**
     * Reputation system routes
     */
    reputation: {
      overview: '/dashboard/reputation/overview',
      badges: '/dashboard/reputation/badges',
    },

    /**
     * Notifications routes
     */
    notifications: {
      list: '/dashboard/notifications',
      settings: '/dashboard/notifications/settings',
    },

    /**
     * Documents routes
     */
    documents: {
      list: '/dashboard/documents',
      new: '/dashboard/documents/new',
      detail: (documentId: string) => `/dashboard/documents/${documentId}`,
    },

    /**
     * Reports (general)
     */
    reports: {
      list: '/dashboard/reports',
    },

    /**
     * Tags management
     */
    tags: {
      list: '/dashboard/tags',
    },

    /**
     * Billing rates
     */
    billingRates: {
      list: '/dashboard/billing-rates',
    },

    /**
     * Invoice templates
     */
    invoiceTemplates: {
      list: '/dashboard/invoice-templates',
    },

    /**
     * Data export
     */
    dataExport: {
      list: '/dashboard/data-export',
    },

    /**
     * Apps/Integrations
     */
    apps: {
      list: '/dashboard/apps',
    },

    /**
     * Setup orchestrator (onboarding wizard)
     */
    setupOrchestrator: '/dashboard/setup-orchestrator',

    /**
     * Dashboard settings
     */
    settings: {
      index: '/dashboard/settings',
      profile: '/dashboard/settings/profile',
      company: '/dashboard/settings/company',
      security: '/dashboard/settings/security',
      preferences: '/dashboard/settings/preferences',
      finance: '/dashboard/settings/finance',
      crm: '/dashboard/settings/crm',
      sales: '/dashboard/settings/sales',
      taxes: '/dashboard/settings/taxes',
      paymentModes: '/dashboard/settings/payment-modes',
      paymentTerms: '/dashboard/settings/payment-terms',
      expensePolicies: '/dashboard/settings/expense-policies',
    },
  },

  /**
   * User settings routes (separate from dashboard settings)
   */
  settings: {
    index: '/settings',
    account: '/settings/account',
    appearance: '/settings/appearance',
    display: '/settings/display',
    notifications: '/settings/notifications',
    billing: '/settings/billing',
    integrations: '/settings/integrations',
    webhooks: '/settings/webhooks',
    apiKeys: '/settings/api-keys',
    email: '/settings/email',
    modules: '/settings/modules',
  },

  /**
   * Users management
   */
  users: {
    list: '/users',
  },

  /**
   * Apps (separate section)
   */
  apps: {
    list: '/apps',
  },

  /**
   * Chats
   */
  chats: {
    list: '/chats',
  },

  /**
   * Help center
   */
  helpCenter: {
    index: '/help-center',
  },

  /**
   * Error pages
   */
  errors: {
    unauthorized: '/401',
    forbidden: '/403',
    notFound: '/404',
    serverError: '/500',
    maintenance: '/503',
    custom: (error: string) => `/errors/${error}`,
  },

  /**
   * Legacy/standalone routes (may be deprecated or for testing)
   */
  legacy: {
    casesDashboard: '/cases-dashboard',
    caseDetails: '/case-details',
    improvedCase: '/improved-case',
    improvedCalendar: '/improved-calendar',
    improvedTasks: '/improved-tasks',
    tasks: '/tasks',
    legalTasks: '/legal-tasks',
    events: '/events',
    reminders: '/reminders',
    taskDetails: '/task-details',
    timeEntries: '/time-entries',
    expenses: '/expenses',
    invoices: '/invoices',
    accountActivity: '/account-activity',
    accountStatements: '/account-statements',
    statementsHistory: '/statements-history',
    generateStatement: '/generate-statement',
    gosiChat: '/gosi-chat',
  },
} as const;

/**
 * Type helper for route parameters
 * Use these types when working with dynamic route parameters
 */
export type RouteParams = {
  // Cases
  caseId: string;
  pageId: string;

  // Clients & Contacts
  clientId: string;
  contactId: string;
  organizationId: string;

  // Tasks
  taskId: string;
  eventId: string;
  reminderId: string;

  // Finance
  invoiceId: string;
  quoteId: string;
  creditNoteId: string;
  billId: string;
  paymentId: string;
  expenseId: string;
  vendorId: string;
  retainerId: string;
  statementId: string;
  activityId: string;
  entryId: string;
  rateId: string;
  feedId: string;
  cardId: string;
  reportId: string;
  subscriptionId: string;
  subscriptionPlanId: string;

  // HR
  employeeId: string;
  recordId: string;
  requestId: string;
  slipId: string;
  runId: string;
  compensationId: string;
  benefitId: string;
  loanId: string;
  advanceId: string;
  claimId: string;
  assignmentId: string;
  jobId: string;
  applicantId: string;
  onboardingId: string;
  offboardingId: string;
  reviewId: string;
  trainingId: string;
  positionId: string;
  unitId: string;
  transferId: string;
  promotionId: string;
  planId: string;
  deviceId: string;
  zoneId: string;
  grievanceId: string;

  // CRM
  leadId: string;
  referralId: string;
  campaignId: string;
  conversationId: string;

  // Inventory & Assets
  itemId: string;
  stockEntryId: string;
  warehouseId: string;
  assetId: string;

  // Manufacturing
  workOrderId: string;
  bomId: string;
  jobCardId: string;

  // Buying
  supplierId: string;
  materialRequestId: string;
  purchaseOrderId: string;

  // Quality
  inspectionId: string;

  // Subcontracting
  orderId: string;

  // Support
  ticketId: string;

  // Auth
  provider: string;

  // Generic
  id: string;
  error: string;
};

/**
 * Type guard to check if a route is a function (dynamic route)
 */
export type RouteFunction = (...args: string[]) => string;

/**
 * Extract all static routes (string values) from the ROUTES object
 */
export type StaticRoute = Extract<
  | typeof ROUTES[keyof typeof ROUTES]
  | typeof ROUTES.dashboard[keyof typeof ROUTES.dashboard]
  | typeof ROUTES.auth[keyof typeof ROUTES.auth]
  | typeof ROUTES.errors[keyof typeof ROUTES.errors],
  string
>;

/**
 * Helper function to check if a route exists
 */
export function isValidRoute(path: string): boolean {
  const allRoutes = new Set<string>();

  function collectRoutes(obj: any): void {
    for (const value of Object.values(obj)) {
      if (typeof value === 'string') {
        allRoutes.add(value);
      } else if (typeof value === 'object' && value !== null) {
        collectRoutes(value);
      }
    }
  }

  collectRoutes(ROUTES);
  return allRoutes.has(path);
}

/**
 * Helper function to build a route with parameters
 *
 * @example
 * buildRoute(ROUTES.dashboard.cases.detail, 'case-123')
 * // Returns: '/dashboard/cases/case-123'
 */
export function buildRoute(
  routeFn: RouteFunction,
  ...params: string[]
): string {
  return routeFn(...params);
}
