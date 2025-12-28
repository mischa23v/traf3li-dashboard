/**
 * Budget Management Types
 * Comprehensive type definitions for finance budget management system
 *
 * Features:
 * - Multi-dimensional budgeting (account, cost center, project, department)
 * - Budget control actions (stop, warn, ignore)
 * - Monthly distribution tracking
 * - Variance analysis
 * - Approval workflow
 */

// ═══════════════════════════════════════════════════════════════
// BUDGET STATUS & ENUMS
// ═══════════════════════════════════════════════════════════════

export type BudgetStatus = 'draft' | 'submitted' | 'approved' | 'active' | 'closed' | 'cancelled'
export type BudgetPeriod = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'
export type BudgetControlAction = 'stop' | 'warn' | 'ignore'

// ═══════════════════════════════════════════════════════════════
// MAIN BUDGET INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface Budget {
  _id: string
  budgetNumber: string
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string

  // Period
  fiscalYear: string
  period: BudgetPeriod
  startDate: string
  endDate: string

  // Control
  status: BudgetStatus
  controlAction: BudgetControlAction

  // Totals (calculated from lines)
  totalBudgeted: number
  totalActual: number
  totalCommitted: number // From approved POs not yet invoiced
  totalAvailable: number
  variance: number
  variancePercent: number

  currency: string

  // Lines
  lines: BudgetLine[]

  // Monthly distribution (optional)
  monthlyDistribution?: MonthlyDistribution[]

  // Approval workflow
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string

  notes?: string
  notesAr?: string

  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
}

// ═══════════════════════════════════════════════════════════════
// BUDGET LINE INTERFACE
// ═══════════════════════════════════════════════════════════════

export interface BudgetLine {
  _id: string
  budgetId: string

  // Dimension - Account (Required)
  accountId: string
  accountCode: string
  accountName: string
  accountNameAr?: string

  // Dimension - Cost Center (Optional)
  costCenterId?: string
  costCenterName?: string
  costCenterNameAr?: string

  // Dimension - Project (Optional)
  projectId?: string
  projectName?: string

  // Dimension - Department (Optional)
  departmentId?: string
  departmentName?: string

  // Amounts
  budgetedAmount: number
  actualAmount: number
  committedAmount: number
  availableAmount: number

  // Calculated fields
  variance: number
  variancePercent: number
  utilizationPercent: number

  // Status indicators
  isOverBudget: boolean
  warningThreshold: number // e.g., 80%
  isNearLimit: boolean

  notes?: string
}

// ═══════════════════════════════════════════════════════════════
// MONTHLY DISTRIBUTION
// ═══════════════════════════════════════════════════════════════

export interface MonthlyDistribution {
  month: number // 1-12
  monthName: string
  monthNameAr: string
  budgetedAmount: number
  actualAmount: number
  variance: number
}

// ═══════════════════════════════════════════════════════════════
// FILTERS & QUERIES
// ═══════════════════════════════════════════════════════════════

export interface BudgetFilters {
  fiscalYear?: string
  status?: BudgetStatus | BudgetStatus[]
  costCenterId?: string
  departmentId?: string
  search?: string
  page?: number
  limit?: number
}

// ═══════════════════════════════════════════════════════════════
// CREATE & UPDATE DATA
// ═══════════════════════════════════════════════════════════════

export interface CreateBudgetData {
  name: string
  nameAr: string
  description?: string
  descriptionAr?: string
  fiscalYear: string
  period: BudgetPeriod
  startDate: string
  endDate: string
  controlAction: BudgetControlAction
  currency: string
  lines: CreateBudgetLineData[]
  notes?: string
  notesAr?: string
}

export interface CreateBudgetLineData {
  accountId: string
  accountCode: string
  accountName: string
  accountNameAr?: string
  costCenterId?: string
  costCenterName?: string
  costCenterNameAr?: string
  projectId?: string
  projectName?: string
  departmentId?: string
  departmentName?: string
  budgetedAmount: number
  warningThreshold?: number
  notes?: string
}

export interface UpdateBudgetData {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  controlAction?: BudgetControlAction
  notes?: string
  notesAr?: string
}

export interface UpdateBudgetLineData {
  budgetedAmount?: number
  warningThreshold?: number
  notes?: string
}

// ═══════════════════════════════════════════════════════════════
// BUDGET CHECK (For Expense Validation)
// ═══════════════════════════════════════════════════════════════

export interface BudgetCheckRequest {
  accountId: string
  costCenterId?: string
  projectId?: string
  departmentId?: string
  amount: number
  date?: string
}

export interface BudgetCheckResult {
  allowed: boolean
  action: BudgetControlAction
  budgetId?: string
  budgetName?: string
  budgetNameAr?: string
  budgetedAmount: number
  usedAmount: number
  availableAmount: number
  requestedAmount: number
  wouldExceedBy?: number
  message: string
  messageAr: string
  warnings?: string[]
  warningsAr?: string[]
}

// ═══════════════════════════════════════════════════════════════
// BUDGET STATISTICS
// ═══════════════════════════════════════════════════════════════

export interface BudgetStats {
  totalBudgets: number
  totalBudgeted: number
  totalActual: number
  totalCommitted: number
  totalAvailable: number
  overallVariance: number
  overallVariancePercent: number

  byStatus: Array<{
    status: BudgetStatus
    count: number
    totalBudgeted: number
  }>

  byDepartment?: Array<{
    departmentId: string
    departmentName: string
    totalBudgeted: number
    totalActual: number
    variance: number
  }>

  byAccount?: Array<{
    accountId: string
    accountCode: string
    accountName: string
    totalBudgeted: number
    totalActual: number
    variance: number
  }>

  topOverBudget: Array<{
    budgetId: string
    budgetName: string
    variance: number
    variancePercent: number
  }>

  topUnderBudget: Array<{
    budgetId: string
    budgetName: string
    variance: number
    variancePercent: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// BUDGET VS ACTUAL REPORT
// ═══════════════════════════════════════════════════════════════

export interface BudgetVsActualReport {
  budgetId: string
  budgetName: string
  budgetNameAr: string
  fiscalYear: string
  period: BudgetPeriod
  currency: string

  summary: {
    totalBudgeted: number
    totalActual: number
    totalCommitted: number
    totalAvailable: number
    variance: number
    variancePercent: number
    utilizationPercent: number
  }

  lineItems: Array<{
    accountCode: string
    accountName: string
    accountNameAr?: string
    costCenterName?: string
    budgeted: number
    actual: number
    committed: number
    available: number
    variance: number
    variancePercent: number
    utilizationPercent: number
  }>

  monthlyTrend?: Array<{
    month: number
    monthName: string
    budgeted: number
    actual: number
    variance: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// DISTRIBUTION METHODS
// ═══════════════════════════════════════════════════════════════

export type DistributionMethod = 'equal' | 'seasonal' | 'custom'

export interface GenerateDistributionRequest {
  budgetId: string
  method: DistributionMethod
  customDistribution?: Array<{
    month: number
    percentage: number
  }>
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE WRAPPERS
// ═══════════════════════════════════════════════════════════════

export interface BudgetListResponse {
  budgets: Budget[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface BudgetResponse {
  budget: Budget
}

export interface BudgetStatsResponse {
  stats: BudgetStats
}

export interface BudgetVsActualResponse {
  report: BudgetVsActualReport
}
