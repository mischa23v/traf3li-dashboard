# Backend Batch Endpoints Specification

This document specifies API endpoints that should be created to batch multiple frontend requests into single API calls, reducing network overhead and improving performance.

## Priority Legend
- **HIGH**: Used on dashboard/overview pages, high impact on UX
- **MEDIUM**: Used on list pages or detail views
- **LOW**: Nice to have, less frequently accessed

---

## 1. Dashboard Analytics Batch Endpoint

**Priority:** HIGH

### Current Endpoints (9 separate calls)
- `GET /api/dashboard/stats`
- `GET /api/dashboard/hero-stats`
- `GET /api/dashboard/today-events`
- `GET /api/dashboard/financial-summary`
- `GET /api/dashboard/recent-messages`
- `GET /api/messages/stats`
- `GET /api/dashboard/crm-stats` (when Analytics tab active)
- `GET /api/dashboard/hr-stats` (when Analytics tab active)
- `GET /api/dashboard/finance-stats` (when Analytics tab active)

### Proposed Batch Endpoint

```
GET /api/dashboard/analytics
```

#### Query Parameters
```typescript
{
  includeCRM?: boolean    // Default: false (only fetch when analytics tab active)
  includeHR?: boolean     // Default: false
  includeFinance?: boolean // Default: false
}
```

#### Response Format
```typescript
{
  stats: {
    totalCases: number
    activeCases: number
    totalClients: number
    totalRevenue: number
    pendingTasks: number
  },
  heroStats: {
    todayTasks: number
    upcomingHearings: number
    overdueInvoices: number
    activeLeads: number
  },
  todayEvents: Array<{
    _id: string
    title: string
    type: 'hearing' | 'meeting' | 'deadline' | 'task'
    startDate: string
    caseId?: string
    priority: 'low' | 'medium' | 'high'
  }>,
  financialSummary: {
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    outstandingInvoices: number
    outstandingAmount: number
  },
  recentMessages: Array<{
    _id: string
    from: string
    subject: string
    preview: string
    createdAt: string
    isRead: boolean
  }>,
  messageStats: {
    total: number
    unread: number
    urgent: number
  },
  crmStats?: {
    totalLeads: number
    newLeadsThisMonth: number
    convertedLeadsThisMonth: number
    conversionRate: number
    pipelineValue: number
  },
  hrStats?: {
    totalEmployees: number
    activeEmployees: number
    newHiresThisMonth: number
    pendingLeaveRequests: number
    upcomingReviews: number
  },
  financeStats?: {
    monthlyRevenue: number
    monthlyExpenses: number
    profitMargin: number
    averageInvoiceValue: number
    daysToPayment: number
  }
}
```

#### Usage in Frontend
```typescript
// Replace 9 separate hooks with:
const { data } = useDashboardAnalytics({
  includeCRM: activeTab === 'analytics',
  includeHR: activeTab === 'analytics',
  includeFinance: activeTab === 'analytics'
})
```

---

## 2. Dashboard Reports Batch Endpoint

**Priority:** HIGH

### Current Endpoints (3 separate calls)
- `GET /api/reports/cases-chart?months=12`
- `GET /api/reports/revenue-chart?months=12`
- `GET /api/reports/tasks-chart?months=12`

### Proposed Batch Endpoint

```
GET /api/dashboard/reports
```

#### Query Parameters
```typescript
{
  months?: number  // Default: 12
}
```

#### Response Format
```typescript
{
  casesChart: {
    labels: string[]  // ['Jan', 'Feb', 'Mar', ...]
    datasets: {
      total: number[]
      active: number[]
      closed: number[]
    }
  },
  revenueChart: {
    labels: string[]
    datasets: {
      revenue: number[]
      expenses: number[]
      profit: number[]
    }
  },
  tasksChart: {
    labels: string[]
    datasets: {
      total: number[]
      completed: number[]
      overdue: number[]
    }
  }
}
```

#### Usage in Frontend
```typescript
// Replace 3 separate hooks with:
const { data } = useDashboardReports({ months: 12 })
```

---

## 3. Dashboard Lawyer Overview Batch Endpoint

**Priority:** HIGH

### Current Endpoints (4 separate calls)
- `GET /api/dashboard/hearings/upcoming?days=7`
- `GET /api/dashboard/deadlines/upcoming?days=14`
- `GET /api/dashboard/time-entries/summary`
- `GET /api/dashboard/documents/pending`

### Proposed Batch Endpoint

```
GET /api/dashboard/lawyer-overview
```

#### Query Parameters
```typescript
{
  upcomingDays?: number    // Default: 7 (for hearings)
  deadlineDays?: number    // Default: 14 (for deadlines)
  includePendingDocs?: boolean  // Default: false
}
```

#### Response Format
```typescript
{
  upcomingHearings: Array<{
    _id: string
    caseId: string
    caseTitle: string
    date: string
    location: string
    type: string
  }>,
  upcomingDeadlines: Array<{
    _id: string
    caseId: string
    caseTitle: string
    deadline: string
    description: string
    priority: 'low' | 'medium' | 'high'
  }>,
  timeEntrySummary: {
    totalHours: number
    billableHours: number
    nonBillableHours: number
    thisWeek: number
    thisMonth: number
    unbilledHours: number
  },
  pendingDocuments?: Array<{
    _id: string
    caseId: string
    title: string
    type: string
    uploadedAt: string
    status: 'pending_review' | 'pending_signature'
  }>
}
```

#### Usage in Frontend
```typescript
// Replace 4 separate hooks with:
const { data } = useLawyerOverview({
  upcomingDays: 7,
  deadlineDays: 14,
  includePendingDocs: activeTab === 'documents'
})
```

---

## 4. Finance Overview Batch Endpoint

**Priority:** HIGH

**Note:** Already implemented as `useFinancialOverview` - documented here for completeness

### Current Implementation
```
GET /api/finance/overview
```

#### Response Format
```typescript
{
  accountBalance: {
    total: number
    available: number
    pending: number
  },
  transactionSummary: {
    income: number
    expenses: number
    net: number
  },
  recentTransactions: Array<Transaction>,
  pendingInvoices: Array<Invoice>
}
```

**Status:** ✅ Already implemented

---

## 5. Invoices with Stats Batch Endpoint

**Priority:** HIGH

**Note:** Already implemented as `useInvoicesWithStats` - documented here for completeness

### Current Implementation
```
GET /api/invoices?includeStats=true
```

#### Response Format
```typescript
{
  invoices: Invoice[],
  stats: {
    total: number
    paid: number
    pending: number
    overdue: number
    overdueAmount: number
  },
  pagination: {
    page: number
    limit: number
    total: number
  }
}
```

**Status:** ✅ Already implemented

---

## 6. Payments with Summary Batch Endpoint

**Priority:** HIGH

**Note:** Already implemented as `usePaymentsWithSummary` - documented here for completeness

### Current Implementation
```
GET /api/payments?includeSummary=true
```

#### Response Format
```typescript
{
  payments: Payment[],
  summary: {
    totalReceived: number
    totalPending: number
    totalOverdue: number
    countByStatus: {
      completed: number
      pending: number
      failed: number
    }
  },
  pagination: {
    page: number
    limit: number
    total: number
  }
}
```

**Status:** ✅ Already implemented

---

## 7. Finance Time Tracking Overview

**Priority:** MEDIUM

### Current Endpoints (3 separate calls)
- `GET /api/time-entries?filters`
- `GET /api/time-entries/stats?filters`
- `GET /api/timer/status`

### Proposed Batch Endpoint

```
GET /api/finance/time-tracking-overview
```

#### Query Parameters
```typescript
{
  startDate?: string
  endDate?: string
  caseId?: string
  page?: number
  limit?: number
  includeEntries?: boolean  // Default: true
}
```

#### Response Format
```typescript
{
  timerStatus: {
    isRunning: boolean
    currentEntry?: {
      startTime: string
      caseId: string
      description: string
      elapsedMinutes: number
    }
  },
  stats: {
    totalHours: number
    billableHours: number
    nonBillableHours: number
    totalAmount: number
    entriesCount: number
  },
  entries?: Array<{
    _id: string
    date: string
    hours: number
    description: string
    caseId: string
    isBillable: boolean
    rate?: number
    amount?: number
  }>,
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
```

#### Usage in Frontend
```typescript
// Replace 3 separate hooks with:
const { data } = useTimeTrackingOverview({
  startDate,
  endDate,
  includeEntries: showEntries
})
```

---

## 8. Expenses Overview Batch Endpoint

**Priority:** MEDIUM

### Current Endpoints (2 separate calls)
- `GET /api/expenses?filters`
- `GET /api/expenses/stats?filters`

### Proposed Batch Endpoint

```
GET /api/finance/expenses-overview
```

#### Query Parameters
```typescript
{
  startDate?: string
  endDate?: string
  caseId?: string
  status?: 'pending' | 'approved' | 'rejected'
  page?: number
  limit?: number
  includeList?: boolean  // Default: true
}
```

#### Response Format
```typescript
{
  stats: {
    totalAmount: number
    approvedAmount: number
    pendingAmount: number
    rejectedAmount: number
    totalCount: number
    byCategory: Record<string, number>
  },
  expenses?: Array<{
    _id: string
    date: string
    amount: number
    category: string
    description: string
    status: 'pending' | 'approved' | 'rejected'
    caseId?: string
    receiptUrl?: string
  }>,
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
```

#### Usage in Frontend
```typescript
// Replace 2 separate hooks with:
const { data } = useExpensesOverview({
  status: 'pending',
  includeList: true
})
```

---

## 9. CRM Overview Batch Endpoint

**Priority:** MEDIUM

### Current Endpoints (4 separate calls)
- `GET /api/leads/stats`
- `GET /api/pipelines/:id/stats`
- `GET /api/referrals/stats`
- `GET /api/activities/stats`

### Proposed Batch Endpoint

```
GET /api/crm/overview
```

#### Query Parameters
```typescript
{
  pipelineId?: string
  startDate?: string
  endDate?: string
}
```

#### Response Format
```typescript
{
  leadStats: {
    total: number
    new: number
    contacted: number
    qualified: number
    converted: number
    lost: number
    conversionRate: number
    averageTimeToConvert: number
  },
  pipelineStats?: {
    totalValue: number
    stageDistribution: Record<string, {
      count: number
      value: number
    }>
    conversionRates: Record<string, number>
  },
  referralStats: {
    total: number
    active: number
    converted: number
    totalRevenue: number
    topReferrers: Array<{
      name: string
      count: number
      revenue: number
    }>
  },
  activityStats: {
    totalActivities: number
    byType: Record<string, number>
    completionRate: number
    thisWeek: number
    thisMonth: number
  }
}
```

#### Usage in Frontend
```typescript
// Replace 4 separate hooks with:
const { data } = useCRMOverview({
  pipelineId: selectedPipeline,
  startDate,
  endDate
})
```

---

## 10. Tasks Overview Batch Endpoint

**Priority:** MEDIUM

### Current Endpoints (4 separate calls)
- `GET /api/tasks/upcoming?days=7`
- `GET /api/tasks/overdue`
- `GET /api/tasks/due-today`
- `GET /api/tasks/stats`

### Proposed Batch Endpoint

```
GET /api/tasks/overview
```

#### Query Parameters
```typescript
{
  upcomingDays?: number  // Default: 7
  assignedTo?: string
  caseId?: string
}
```

#### Response Format
```typescript
{
  stats: {
    total: number
    pending: number
    inProgress: number
    completed: number
    overdue: number
    completionRate: number
  },
  upcomingTasks: Array<{
    _id: string
    title: string
    dueDate: string
    priority: 'low' | 'medium' | 'high'
    status: string
    assignedTo: string
    caseId?: string
  }>,
  overdueTasks: Array<{
    _id: string
    title: string
    dueDate: string
    priority: 'low' | 'medium' | 'high'
    assignedTo: string
    daysOverdue: number
  }>,
  dueTodayTasks: Array<{
    _id: string
    title: string
    dueDate: string
    priority: 'low' | 'medium' | 'high'
    assignedTo: string
    status: string
  }>
}
```

#### Usage in Frontend
```typescript
// Replace 4 separate hooks with:
const { data } = useTasksOverview({
  upcomingDays: 7,
  assignedTo: userId
})
```

---

## 11. Task Detail with Related Data

**Priority:** MEDIUM

**Note:** Already implemented as `useTaskWithRelated` - documented here for completeness

### Current Implementation
```
GET /api/tasks/:id/full
```

#### Response Format
```typescript
{
  task: Task,
  timeTracking: {
    totalHours: number
    entries: TimeEntry[]
  },
  documents: Document[]
}
```

**Status:** ✅ Already implemented

---

## 12. Cases Overview Batch Endpoint

**Priority:** HIGH

### Current Endpoints (4 separate calls)
- `GET /api/cases?filters`
- `GET /api/cases/statistics`
- `GET /api/cases/pipeline/statistics`
- `GET /api/clients/stats`

### Proposed Batch Endpoint

```
GET /api/cases/overview
```

#### Query Parameters
```typescript
{
  category?: string
  status?: string
  includeCases?: boolean  // Default: false (only stats)
  page?: number
  limit?: number
}
```

#### Response Format
```typescript
{
  caseStats: {
    total: number
    active: number
    closed: number
    won: number
    lost: number
    settled: number
    onHold: number
    highPriority: number
    totalClaimAmount: number
    avgProgress: number
  },
  pipelineStats: {
    byStage: Record<string, number>
    byCategory: Record<string, number>
    totalValue: number
  },
  clientStats: {
    total: number
    active: number
    individual: number
    corporate: number
    newThisMonth: number
  },
  cases?: Array<{
    _id: string
    caseNumber: string
    title: string
    status: string
    category: string
    priority: 'low' | 'medium' | 'high'
    progress: number
    clientId: string
    assignedLawyer: string
    nextHearing?: string
  }>,
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
```

#### Usage in Frontend
```typescript
// Replace 4 separate hooks with:
const { data } = useCasesOverview({
  category: 'civil',
  includeCases: showCasesList
})
```

---

## 13. Case Detail with Related Data

**Priority:** MEDIUM

### Current Endpoints (When viewing case detail - 3+ separate calls)
- `GET /api/cases/:id`
- `GET /api/cases/:id/audit`
- `GET /api/tasks?caseId=:id`

### Proposed Batch Endpoint

```
GET /api/cases/:id/full
```

#### Query Parameters
```typescript
{
  includeAudit?: boolean     // Default: false
  includeTasks?: boolean     // Default: false
  includeDocuments?: boolean // Default: true
}
```

#### Response Format
```typescript
{
  case: Case,
  audit?: Array<{
    _id: string
    action: string
    changedBy: string
    timestamp: string
    changes: Record<string, any>
  }>,
  tasks?: Array<{
    _id: string
    title: string
    status: string
    dueDate: string
    assignedTo: string
    priority: 'low' | 'medium' | 'high'
  }>,
  documents: Array<{
    _id: string
    filename: string
    category: string
    uploadedAt: string
    uploadedBy: string
    size: number
  }>
}
```

#### Usage in Frontend
```typescript
// Replace 3+ separate hooks with:
const { data } = useCaseDetail(caseId, {
  includeAudit: showAudit,
  includeTasks: showTasks
})
```

---

## 14. HR Employee Overview

**Priority:** MEDIUM

### Current Endpoints (2 separate calls)
- `GET /api/employees?filters`
- `GET /api/employees/stats`

### Proposed Batch Endpoint

```
GET /api/hr/employees-overview
```

#### Query Parameters
```typescript
{
  role?: string
  status?: 'active' | 'inactive' | 'departed'
  department?: string
  includeList?: boolean  // Default: false (stats only)
  page?: number
  limit?: number
}
```

#### Response Format
```typescript
{
  stats: {
    total: number
    active: number
    inactive: number
    departed: number
    byRole: Record<string, number>
    byDepartment: Record<string, number>
    newHiresThisMonth: number
  },
  employees?: Array<{
    _id: string
    firstName: string
    lastName: string
    email: string
    role: string
    status: 'active' | 'inactive' | 'departed'
    department?: string
    hireDate: string
  }>,
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
```

#### Usage in Frontend
```typescript
// Replace 2 separate hooks with:
const { data } = useEmployeesOverview({
  status: 'active',
  includeList: true
})
```

---

## 15. Client Detail with Cases and Invoices

**Priority:** MEDIUM

### Current Endpoints (When viewing client detail - 3+ separate calls)
- `GET /api/clients/:id`
- `GET /api/cases?clientId=:id`
- `GET /api/invoices?clientId=:id`

### Proposed Batch Endpoint

```
GET /api/clients/:id/full
```

#### Query Parameters
```typescript
{
  includeCases?: boolean    // Default: true
  includeInvoices?: boolean // Default: true
  casesLimit?: number       // Default: 10
  invoicesLimit?: number    // Default: 10
}
```

#### Response Format
```typescript
{
  client: Client,
  cases: Array<{
    _id: string
    caseNumber: string
    title: string
    status: string
    category: string
    openedDate: string
    assignedLawyer: string
  }>,
  invoices: Array<{
    _id: string
    invoiceNumber: string
    amount: number
    status: 'draft' | 'sent' | 'paid' | 'overdue'
    dueDate: string
    issuedDate: string
  }>,
  summary: {
    totalCases: number
    activeCases: number
    totalInvoiced: number
    totalPaid: number
    outstandingAmount: number
  }
}
```

#### Usage in Frontend
```typescript
// Replace 3+ separate hooks with:
const { data } = useClientDetail(clientId, {
  includeCases: true,
  includeInvoices: true,
  casesLimit: 10
})
```

---

## Implementation Priority Order

### Phase 1 - High Impact Dashboard (Week 1-2)
1. ✅ `GET /api/finance/overview` - Already implemented
2. ✅ `GET /api/invoices?includeStats=true` - Already implemented
3. ✅ `GET /api/payments?includeSummary=true` - Already implemented
4. **`GET /api/dashboard/analytics`** - Replace 9 separate dashboard calls
5. **`GET /api/dashboard/reports`** - Replace 3 chart calls
6. **`GET /api/dashboard/lawyer-overview`** - Replace 4 lawyer-specific calls

### Phase 2 - Module Overviews (Week 3-4)
7. **`GET /api/cases/overview`** - Replace 4 cases overview calls
8. **`GET /api/tasks/overview`** - Replace 4 tasks overview calls
9. **`GET /api/crm/overview`** - Replace 4 CRM stats calls

### Phase 3 - Detail Pages & Additional Features (Week 5-6)
10. ✅ `GET /api/tasks/:id/full` - Already implemented
11. **`GET /api/cases/:id/full`** - Case detail with related data
12. **`GET /api/clients/:id/full`** - Client detail with cases/invoices
13. **`GET /api/finance/time-tracking-overview`** - Time tracking with stats
14. **`GET /api/finance/expenses-overview`** - Expenses with stats
15. **`GET /api/hr/employees-overview`** - Employee list with stats

---

## Implementation Guidelines

### 1. Query Parameter Pattern
All batch endpoints should follow this pattern:
```typescript
{
  // Filtering
  filter1?: string
  filter2?: string

  // Conditional includes (to keep response size manageable)
  includeRelatedData?: boolean  // Default: varies by endpoint

  // Pagination (when returning lists)
  page?: number      // Default: 1
  limit?: number     // Default: 20
}
```

### 2. Response Structure Pattern
```typescript
{
  // Primary data (always included)
  primaryData: T,

  // Stats/summaries (always included, lightweight)
  stats: {
    // Aggregated statistics
  },

  // Related data (conditionally included via query params)
  relatedData?: T[],

  // Pagination (when applicable)
  pagination?: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}
```

### 3. Performance Considerations
- Use database aggregations where possible
- Implement proper indexing for common query patterns
- Consider caching for expensive computations
- Return only necessary fields (projection)
- Implement field selection via query params if needed: `?fields=field1,field2`

### 4. Backward Compatibility
- Keep existing individual endpoints for backward compatibility
- Mark old endpoints as deprecated in API docs
- Plan migration timeline for frontend to adopt batch endpoints
- Monitor usage metrics to identify when old endpoints can be removed

### 5. Error Handling
- Return partial data on partial failures where appropriate
- Include `errors` array in response for non-critical failures
- Use HTTP status codes correctly:
  - 200: Full success
  - 207: Partial success (multi-status)
  - 400: Bad request
  - 500: Server error

Example partial failure response:
```typescript
{
  stats: { /* ... */ },      // Succeeded
  relatedData: null,         // Failed
  errors: [{
    field: 'relatedData',
    message: 'Failed to fetch related data',
    code: 'RELATED_DATA_ERROR'
  }]
}
```

---

## Metrics to Track

After implementing batch endpoints, track these metrics:

1. **Network Performance**
   - Average page load time reduction
   - Number of HTTP requests per page (before/after)
   - Total data transfer size (before/after)
   - Time to First Meaningful Paint (FMP)

2. **Backend Performance**
   - Average response time for batch endpoints
   - Database query count per request
   - Cache hit rates

3. **User Experience**
   - Perceived load time
   - User interaction delay
   - Error rates

4. **Adoption**
   - % of frontend using batch vs individual endpoints
   - Deprecated endpoint usage over time

---

## Frontend Migration Guide

### Before (Multiple Hooks)
```typescript
const Dashboard = () => {
  const { data: stats } = useDashboardStats()
  const { data: heroStats } = useDashboardHeroStats()
  const { data: events } = useTodayEvents()
  const { data: financial } = useFinancialSummary()
  const { data: messages } = useRecentMessages()
  const { data: msgStats } = useMessageStats()

  // 6 separate network requests on mount!
  // Each hook manages its own loading/error state

  return (/* ... */)
}
```

### After (Single Batch Hook)
```typescript
const Dashboard = () => {
  const { data, isLoading, error } = useDashboardAnalytics()

  // 1 network request on mount!
  // Single loading/error state to manage

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage />

  return (
    <div>
      <HeroStats data={data.heroStats} />
      <TodayEvents events={data.todayEvents} />
      <FinancialSummary summary={data.financialSummary} />
      <RecentMessages messages={data.recentMessages} />
    </div>
  )
}
```

---

## Testing Checklist

For each batch endpoint:

- [ ] Unit tests for endpoint logic
- [ ] Integration tests with database
- [ ] Performance tests (response time < 500ms for typical loads)
- [ ] Load tests (handle 100+ concurrent requests)
- [ ] Error handling tests (partial failures, timeouts)
- [ ] Pagination tests (when applicable)
- [ ] Authorization tests (proper access control)
- [ ] Cache invalidation tests
- [ ] Frontend integration tests
- [ ] End-to-end tests

---

## Additional Notes

### Existing Batch Endpoints
The codebase already has some batch endpoints implemented:
- `useDashboardSummary` - Mentioned as "gold standard" that replaces 7 calls
- `useFinancialOverview` - Batches 4 finance-related calls
- `useInvoicesWithStats` - Batches invoices with statistics
- `usePaymentsWithSummary` - Batches payments with summary
- `useTaskWithRelated` - Batches task with time tracking and documents

These should be documented and used as reference implementations.

### Frontend Hook Locations
When implementing, update these frontend hook files:
- `/src/hooks/useDashboard.ts` - Dashboard analytics and reports
- `/src/hooks/useFinance.ts` - Finance time tracking and expenses
- `/src/hooks/useCrm.ts` - CRM overview
- `/src/hooks/useTasks.ts` - Tasks overview
- `/src/hooks/useCasesAndClients.ts` - Cases and client details
- `/src/hooks/useHR.ts` - Employee overview

### Database Optimization
Consider creating database views or materialized views for frequently accessed aggregations:
- Dashboard statistics
- Pipeline statistics
- Client summaries
- Financial summaries

This can significantly improve response times for batch endpoints.

---

**Document Version:** 1.0
**Last Updated:** 2025-12-18
**Status:** Draft - Ready for Backend Team Review
