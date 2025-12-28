/**
 * Budget Service
 * Handles budget management API calls
 *
 * ⚠️ IMPORTANT: This service uses MOCK DATA to document expected API structure
 * Backend endpoints will be: /api/budgets/*
 *
 * Features:
 * - CRUD operations for budgets
 * - Budget line management
 * - Budget vs actual reporting
 * - Budget checking for expense validation
 * - Approval workflow
 * - Monthly distribution
 */

import apiClient, { handleApiError } from '@/lib/api'
import type {
  Budget,
  BudgetFilters,
  CreateBudgetData,
  UpdateBudgetData,
  UpdateBudgetLineData,
  BudgetCheckRequest,
  BudgetCheckResult,
  BudgetStats,
  BudgetVsActualReport,
  DistributionMethod,
  BudgetListResponse,
  BudgetResponse,
  BudgetStatsResponse,
  BudgetVsActualResponse,
} from '@/types/budget'

// ==================== MOCK DATA ====================

/**
 * Mock budget data
 * This demonstrates the expected API response structure
 */
const MOCK_BUDGETS: Budget[] = [
  {
    _id: 'BUD-001',
    budgetNumber: 'BUD-2025-001',
    name: 'Operations Budget FY 2025',
    nameAr: 'ميزانية العمليات للسنة المالية 2025',
    description: 'Annual operating budget for all departments',
    descriptionAr: 'الميزانية التشغيلية السنوية لجميع الأقسام',
    fiscalYear: '2025',
    period: 'yearly',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'active',
    controlAction: 'warn',
    totalBudgeted: 5000000,
    totalActual: 1250000,
    totalCommitted: 250000,
    totalAvailable: 3500000,
    variance: -1250000,
    variancePercent: 25,
    currency: 'SAR',
    lines: [
      {
        _id: 'LINE-001',
        budgetId: 'BUD-001',
        accountId: 'ACC-5100',
        accountCode: '5100',
        accountName: 'Salaries & Wages',
        accountNameAr: 'الرواتب والأجور',
        costCenterId: 'CC-001',
        costCenterName: 'Legal Department',
        costCenterNameAr: 'القسم القانوني',
        departmentId: 'DEPT-001',
        departmentName: 'Legal',
        budgetedAmount: 2000000,
        actualAmount: 500000,
        committedAmount: 0,
        availableAmount: 1500000,
        variance: -500000,
        variancePercent: 25,
        utilizationPercent: 25,
        isOverBudget: false,
        warningThreshold: 80,
        isNearLimit: false,
      },
      {
        _id: 'LINE-002',
        budgetId: 'BUD-001',
        accountId: 'ACC-5200',
        accountCode: '5200',
        accountName: 'Office Rent',
        accountNameAr: 'إيجار المكتب',
        costCenterId: 'CC-002',
        costCenterName: 'Administration',
        costCenterNameAr: 'الإدارة',
        budgetedAmount: 600000,
        actualAmount: 150000,
        committedAmount: 150000,
        availableAmount: 300000,
        variance: -150000,
        variancePercent: 25,
        utilizationPercent: 50,
        isOverBudget: false,
        warningThreshold: 80,
        isNearLimit: false,
      },
      {
        _id: 'LINE-003',
        budgetId: 'BUD-001',
        accountId: 'ACC-5300',
        accountCode: '5300',
        accountName: 'Marketing & Advertising',
        accountNameAr: 'التسويق والإعلان',
        costCenterId: 'CC-003',
        costCenterName: 'Marketing',
        costCenterNameAr: 'التسويق',
        budgetedAmount: 800000,
        actualAmount: 350000,
        committedAmount: 100000,
        availableAmount: 350000,
        variance: -350000,
        variancePercent: 43.75,
        utilizationPercent: 56.25,
        isOverBudget: false,
        warningThreshold: 80,
        isNearLimit: false,
      },
      {
        _id: 'LINE-004',
        budgetId: 'BUD-001',
        accountId: 'ACC-5400',
        accountCode: '5400',
        accountName: 'Travel & Entertainment',
        accountNameAr: 'السفر والترفيه',
        budgetedAmount: 400000,
        actualAmount: 150000,
        committedAmount: 0,
        availableAmount: 250000,
        variance: -150000,
        variancePercent: 37.5,
        utilizationPercent: 37.5,
        isOverBudget: false,
        warningThreshold: 80,
        isNearLimit: false,
      },
      {
        _id: 'LINE-005',
        budgetId: 'BUD-001',
        accountId: 'ACC-5500',
        accountCode: '5500',
        accountName: 'Technology & Software',
        accountNameAr: 'التقنية والبرمجيات',
        budgetedAmount: 1200000,
        actualAmount: 100000,
        committedAmount: 0,
        availableAmount: 1100000,
        variance: -100000,
        variancePercent: 8.33,
        utilizationPercent: 8.33,
        isOverBudget: false,
        warningThreshold: 80,
        isNearLimit: false,
      },
    ],
    monthlyDistribution: [
      { month: 1, monthName: 'January', monthNameAr: 'يناير', budgetedAmount: 416667, actualAmount: 1250000, variance: 833333 },
      { month: 2, monthName: 'February', monthNameAr: 'فبراير', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 3, monthName: 'March', monthNameAr: 'مارس', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 4, monthName: 'April', monthNameAr: 'أبريل', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 5, monthName: 'May', monthNameAr: 'مايو', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 6, monthName: 'June', monthNameAr: 'يونيو', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 7, monthName: 'July', monthNameAr: 'يوليو', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 8, monthName: 'August', monthNameAr: 'أغسطس', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 9, monthName: 'September', monthNameAr: 'سبتمبر', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 10, monthName: 'October', monthNameAr: 'أكتوبر', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 11, monthName: 'November', monthNameAr: 'نوفمبر', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
      { month: 12, monthName: 'December', monthNameAr: 'ديسمبر', budgetedAmount: 416667, actualAmount: 0, variance: -416667 },
    ],
    createdBy: 'USER-001',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z',
    submittedBy: 'USER-001',
    submittedAt: '2025-01-02T00:00:00.000Z',
    approvedBy: 'USER-002',
    approvedAt: '2025-01-03T00:00:00.000Z',
  },
  {
    _id: 'BUD-002',
    budgetNumber: 'BUD-2025-Q1-001',
    name: 'Q1 Marketing Campaign',
    nameAr: 'حملة تسويقية للربع الأول',
    description: 'First quarter marketing initiatives',
    descriptionAr: 'مبادرات التسويق للربع الأول',
    fiscalYear: '2025',
    period: 'quarterly',
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'active',
    controlAction: 'stop',
    totalBudgeted: 500000,
    totalActual: 450000,
    totalCommitted: 30000,
    totalAvailable: 20000,
    variance: -450000,
    variancePercent: 90,
    currency: 'SAR',
    lines: [
      {
        _id: 'LINE-006',
        budgetId: 'BUD-002',
        accountId: 'ACC-5300',
        accountCode: '5300',
        accountName: 'Marketing & Advertising',
        accountNameAr: 'التسويق والإعلان',
        costCenterId: 'CC-003',
        costCenterName: 'Marketing',
        costCenterNameAr: 'التسويق',
        projectId: 'PRJ-001',
        projectName: 'Brand Awareness Campaign',
        budgetedAmount: 500000,
        actualAmount: 450000,
        committedAmount: 30000,
        availableAmount: 20000,
        variance: -450000,
        variancePercent: 90,
        utilizationPercent: 96,
        isOverBudget: false,
        warningThreshold: 80,
        isNearLimit: true,
      },
    ],
    createdBy: 'USER-003',
    createdAt: '2024-12-15T00:00:00.000Z',
    updatedAt: '2025-01-20T14:20:00.000Z',
    submittedBy: 'USER-003',
    submittedAt: '2024-12-16T00:00:00.000Z',
    approvedBy: 'USER-002',
    approvedAt: '2024-12-18T00:00:00.000Z',
  },
  {
    _id: 'BUD-003',
    budgetNumber: 'BUD-2025-003',
    name: 'IT Infrastructure Upgrade',
    nameAr: 'ترقية البنية التحتية لتقنية المعلومات',
    fiscalYear: '2025',
    period: 'yearly',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'draft',
    controlAction: 'warn',
    totalBudgeted: 800000,
    totalActual: 0,
    totalCommitted: 0,
    totalAvailable: 800000,
    variance: 0,
    variancePercent: 0,
    currency: 'SAR',
    lines: [
      {
        _id: 'LINE-007',
        budgetId: 'BUD-003',
        accountId: 'ACC-5500',
        accountCode: '5500',
        accountName: 'Technology & Software',
        accountNameAr: 'التقنية والبرمجيات',
        budgetedAmount: 800000,
        actualAmount: 0,
        committedAmount: 0,
        availableAmount: 800000,
        variance: 0,
        variancePercent: 0,
        utilizationPercent: 0,
        isOverBudget: false,
        warningThreshold: 80,
        isNearLimit: false,
      },
    ],
    createdBy: 'USER-004',
    createdAt: '2025-01-10T00:00:00.000Z',
    updatedAt: '2025-01-10T00:00:00.000Z',
  },
]

// ==================== HELPER FUNCTIONS ====================

/**
 * Simulate API delay
 */
const delay = (ms: number = 300) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Calculate budget line totals
 */
const calculateLineTotals = (lines: any[]): any => {
  return lines.reduce(
    (acc, line) => ({
      budgeted: acc.budgeted + line.budgetedAmount,
      actual: acc.actual + line.actualAmount,
      committed: acc.committed + line.committedAmount,
      available: acc.available + line.availableAmount,
    }),
    { budgeted: 0, actual: 0, committed: 0, available: 0 }
  )
}

// ==================== SERVICE FUNCTIONS ====================

/**
 * Get all budgets with filtering
 * API Endpoint: GET /api/budgets
 */
const getAllBudgets = async (filters?: BudgetFilters): Promise<BudgetListResponse> => {
  await delay()

  try {
    // In production, this would be:
    // const response = await apiClient.get('/budgets', { params: filters })
    // return response.data

    // MOCK: Filter budgets based on criteria
    let filtered = [...MOCK_BUDGETS]

    if (filters?.fiscalYear) {
      filtered = filtered.filter((b) => b.fiscalYear === filters.fiscalYear)
    }

    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      filtered = filtered.filter((b) => statuses.includes(b.status))
    }

    if (filters?.costCenterId) {
      filtered = filtered.filter((b) =>
        b.lines.some((line) => line.costCenterId === filters.costCenterId)
      )
    }

    if (filters?.departmentId) {
      filtered = filtered.filter((b) =>
        b.lines.some((line) => line.departmentId === filters.departmentId)
      )
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(search) ||
          b.nameAr.toLowerCase().includes(search) ||
          b.budgetNumber.toLowerCase().includes(search)
      )
    }

    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    return {
      budgets: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
      hasMore: end < filtered.length,
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get single budget by ID
 * API Endpoint: GET /api/budgets/:id
 */
const getBudgetById = async (id: string): Promise<BudgetResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.get(`/budgets/${id}`)
    // return response.data

    const budget = MOCK_BUDGETS.find((b) => b._id === id)
    if (!budget) {
      throw new Error('Budget not found')
    }

    return { budget }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Create new budget
 * API Endpoint: POST /api/budgets
 */
const createBudget = async (data: CreateBudgetData): Promise<BudgetResponse> => {
  await delay(500)

  try {
    // In production: const response = await apiClient.post('/budgets', data)
    // return response.data

    const newBudget: Budget = {
      _id: `BUD-${Date.now()}`,
      budgetNumber: `BUD-${data.fiscalYear}-${String(MOCK_BUDGETS.length + 1).padStart(3, '0')}`,
      ...data,
      status: 'draft',
      totalBudgeted: data.lines.reduce((sum, line) => sum + line.budgetedAmount, 0),
      totalActual: 0,
      totalCommitted: 0,
      totalAvailable: data.lines.reduce((sum, line) => sum + line.budgetedAmount, 0),
      variance: 0,
      variancePercent: 0,
      lines: data.lines.map((line, index) => ({
        _id: `LINE-${Date.now()}-${index}`,
        budgetId: `BUD-${Date.now()}`,
        ...line,
        actualAmount: 0,
        committedAmount: 0,
        availableAmount: line.budgetedAmount,
        variance: 0,
        variancePercent: 0,
        utilizationPercent: 0,
        isOverBudget: false,
        warningThreshold: line.warningThreshold || 80,
        isNearLimit: false,
      })),
      createdBy: 'CURRENT-USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    MOCK_BUDGETS.push(newBudget)
    return { budget: newBudget }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update budget
 * API Endpoint: PATCH /api/budgets/:id
 */
const updateBudget = async (id: string, data: UpdateBudgetData): Promise<BudgetResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.patch(`/budgets/${id}`, data)
    // return response.data

    const index = MOCK_BUDGETS.findIndex((b) => b._id === id)
    if (index === -1) {
      throw new Error('Budget not found')
    }

    MOCK_BUDGETS[index] = {
      ...MOCK_BUDGETS[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return { budget: MOCK_BUDGETS[index] }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Delete budget
 * API Endpoint: DELETE /api/budgets/:id
 */
const deleteBudget = async (id: string): Promise<{ success: boolean }> => {
  await delay()

  try {
    // In production: const response = await apiClient.delete(`/budgets/${id}`)
    // return response.data

    const index = MOCK_BUDGETS.findIndex((b) => b._id === id)
    if (index === -1) {
      throw new Error('Budget not found')
    }

    // Only allow deletion of draft budgets
    if (MOCK_BUDGETS[index].status !== 'draft') {
      throw new Error('Only draft budgets can be deleted')
    }

    MOCK_BUDGETS.splice(index, 1)
    return { success: true }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Submit budget for approval
 * API Endpoint: POST /api/budgets/:id/submit
 */
const submitForApproval = async (id: string): Promise<BudgetResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.post(`/budgets/${id}/submit`)
    // return response.data

    const index = MOCK_BUDGETS.findIndex((b) => b._id === id)
    if (index === -1) {
      throw new Error('Budget not found')
    }

    if (MOCK_BUDGETS[index].status !== 'draft') {
      throw new Error('Only draft budgets can be submitted')
    }

    MOCK_BUDGETS[index] = {
      ...MOCK_BUDGETS[index],
      status: 'submitted',
      submittedBy: 'CURRENT-USER',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return { budget: MOCK_BUDGETS[index] }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Approve budget
 * API Endpoint: POST /api/budgets/:id/approve
 */
const approveBudget = async (id: string): Promise<BudgetResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.post(`/budgets/${id}/approve`)
    // return response.data

    const index = MOCK_BUDGETS.findIndex((b) => b._id === id)
    if (index === -1) {
      throw new Error('Budget not found')
    }

    if (MOCK_BUDGETS[index].status !== 'submitted') {
      throw new Error('Only submitted budgets can be approved')
    }

    MOCK_BUDGETS[index] = {
      ...MOCK_BUDGETS[index],
      status: 'approved',
      approvedBy: 'CURRENT-USER',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return { budget: MOCK_BUDGETS[index] }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Reject budget
 * API Endpoint: POST /api/budgets/:id/reject
 */
const rejectBudget = async (id: string, reason: string): Promise<BudgetResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.post(`/budgets/${id}/reject`, { reason })
    // return response.data

    const index = MOCK_BUDGETS.findIndex((b) => b._id === id)
    if (index === -1) {
      throw new Error('Budget not found')
    }

    if (MOCK_BUDGETS[index].status !== 'submitted') {
      throw new Error('Only submitted budgets can be rejected')
    }

    MOCK_BUDGETS[index] = {
      ...MOCK_BUDGETS[index],
      status: 'draft',
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    }

    return { budget: MOCK_BUDGETS[index] }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Close budget
 * API Endpoint: POST /api/budgets/:id/close
 */
const closeBudget = async (id: string): Promise<BudgetResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.post(`/budgets/${id}/close`)
    // return response.data

    const index = MOCK_BUDGETS.findIndex((b) => b._id === id)
    if (index === -1) {
      throw new Error('Budget not found')
    }

    MOCK_BUDGETS[index] = {
      ...MOCK_BUDGETS[index],
      status: 'closed',
      updatedAt: new Date().toISOString(),
    }

    return { budget: MOCK_BUDGETS[index] }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get budget lines
 * API Endpoint: GET /api/budgets/:id/lines
 */
const getBudgetLines = async (budgetId: string) => {
  await delay()

  try {
    // In production: const response = await apiClient.get(`/budgets/${budgetId}/lines`)
    // return response.data

    const budget = MOCK_BUDGETS.find((b) => b._id === budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    return { lines: budget.lines }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Update budget line
 * API Endpoint: PATCH /api/budgets/:budgetId/lines/:lineId
 */
const updateBudgetLine = async (
  budgetId: string,
  lineId: string,
  data: UpdateBudgetLineData
) => {
  await delay()

  try {
    // In production: const response = await apiClient.patch(`/budgets/${budgetId}/lines/${lineId}`, data)
    // return response.data

    const budget = MOCK_BUDGETS.find((b) => b._id === budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    const lineIndex = budget.lines.findIndex((l) => l._id === lineId)
    if (lineIndex === -1) {
      throw new Error('Budget line not found')
    }

    budget.lines[lineIndex] = {
      ...budget.lines[lineIndex],
      ...data,
    }

    // Recalculate totals
    const totals = calculateLineTotals(budget.lines)
    budget.totalBudgeted = totals.budgeted
    budget.totalActual = totals.actual
    budget.totalCommitted = totals.committed
    budget.totalAvailable = totals.available
    budget.variance = totals.actual
    budget.variancePercent = totals.budgeted > 0 ? (totals.actual / totals.budgeted) * 100 : 0

    return { line: budget.lines[lineIndex] }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get budget statistics
 * API Endpoint: GET /api/budgets/stats
 */
const getBudgetStats = async (fiscalYear?: string): Promise<BudgetStatsResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.get('/budgets/stats', { params: { fiscalYear } })
    // return response.data

    let budgets = MOCK_BUDGETS
    if (fiscalYear) {
      budgets = budgets.filter((b) => b.fiscalYear === fiscalYear)
    }

    const stats: BudgetStats = {
      totalBudgets: budgets.length,
      totalBudgeted: budgets.reduce((sum, b) => sum + b.totalBudgeted, 0),
      totalActual: budgets.reduce((sum, b) => sum + b.totalActual, 0),
      totalCommitted: budgets.reduce((sum, b) => sum + b.totalCommitted, 0),
      totalAvailable: budgets.reduce((sum, b) => sum + b.totalAvailable, 0),
      overallVariance: budgets.reduce((sum, b) => sum + b.variance, 0),
      overallVariancePercent: 0,
      byStatus: [
        {
          status: 'draft',
          count: budgets.filter((b) => b.status === 'draft').length,
          totalBudgeted: budgets
            .filter((b) => b.status === 'draft')
            .reduce((sum, b) => sum + b.totalBudgeted, 0),
        },
        {
          status: 'submitted',
          count: budgets.filter((b) => b.status === 'submitted').length,
          totalBudgeted: budgets
            .filter((b) => b.status === 'submitted')
            .reduce((sum, b) => sum + b.totalBudgeted, 0),
        },
        {
          status: 'approved',
          count: budgets.filter((b) => b.status === 'approved').length,
          totalBudgeted: budgets
            .filter((b) => b.status === 'approved')
            .reduce((sum, b) => sum + b.totalBudgeted, 0),
        },
        {
          status: 'active',
          count: budgets.filter((b) => b.status === 'active').length,
          totalBudgeted: budgets
            .filter((b) => b.status === 'active')
            .reduce((sum, b) => sum + b.totalBudgeted, 0),
        },
        {
          status: 'closed',
          count: budgets.filter((b) => b.status === 'closed').length,
          totalBudgeted: budgets
            .filter((b) => b.status === 'closed')
            .reduce((sum, b) => sum + b.totalBudgeted, 0),
        },
        {
          status: 'cancelled',
          count: budgets.filter((b) => b.status === 'cancelled').length,
          totalBudgeted: budgets
            .filter((b) => b.status === 'cancelled')
            .reduce((sum, b) => sum + b.totalBudgeted, 0),
        },
      ],
      topOverBudget: budgets
        .filter((b) => b.variance > 0)
        .sort((a, b) => b.variance - a.variance)
        .slice(0, 5)
        .map((b) => ({
          budgetId: b._id,
          budgetName: b.name,
          variance: b.variance,
          variancePercent: b.variancePercent,
        })),
      topUnderBudget: budgets
        .filter((b) => b.variance < 0)
        .sort((a, b) => a.variance - b.variance)
        .slice(0, 5)
        .map((b) => ({
          budgetId: b._id,
          budgetName: b.name,
          variance: b.variance,
          variancePercent: b.variancePercent,
        })),
    }

    stats.overallVariancePercent =
      stats.totalBudgeted > 0 ? (stats.totalActual / stats.totalBudgeted) * 100 : 0

    return { stats }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Get budget vs actual report
 * API Endpoint: GET /api/budgets/:id/vs-actual
 */
const getBudgetVsActual = async (budgetId: string): Promise<BudgetVsActualResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.get(`/budgets/${budgetId}/vs-actual`)
    // return response.data

    const budget = MOCK_BUDGETS.find((b) => b._id === budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    const report: BudgetVsActualReport = {
      budgetId: budget._id,
      budgetName: budget.name,
      budgetNameAr: budget.nameAr,
      fiscalYear: budget.fiscalYear,
      period: budget.period,
      currency: budget.currency,
      summary: {
        totalBudgeted: budget.totalBudgeted,
        totalActual: budget.totalActual,
        totalCommitted: budget.totalCommitted,
        totalAvailable: budget.totalAvailable,
        variance: budget.variance,
        variancePercent: budget.variancePercent,
        utilizationPercent:
          budget.totalBudgeted > 0 ? (budget.totalActual / budget.totalBudgeted) * 100 : 0,
      },
      lineItems: budget.lines.map((line) => ({
        accountCode: line.accountCode,
        accountName: line.accountName,
        accountNameAr: line.accountNameAr,
        costCenterName: line.costCenterName,
        budgeted: line.budgetedAmount,
        actual: line.actualAmount,
        committed: line.committedAmount,
        available: line.availableAmount,
        variance: line.variance,
        variancePercent: line.variancePercent,
        utilizationPercent: line.utilizationPercent,
      })),
      monthlyTrend: budget.monthlyDistribution?.map((m) => ({
        month: m.month,
        monthName: m.monthName,
        budgeted: m.budgetedAmount,
        actual: m.actualAmount,
        variance: m.variance,
      })),
    }

    return { report }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Check if expense is within budget
 * API Endpoint: POST /api/budgets/check
 */
const checkBudget = async (request: BudgetCheckRequest): Promise<BudgetCheckResult> => {
  await delay()

  try {
    // In production: const response = await apiClient.post('/budgets/check', request)
    // return response.data

    // Find active budget for the fiscal year
    const currentYear = new Date(request.date || new Date()).getFullYear().toString()
    const activeBudgets = MOCK_BUDGETS.filter(
      (b) => b.fiscalYear === currentYear && b.status === 'active'
    )

    for (const budget of activeBudgets) {
      // Find matching line
      const line = budget.lines.find((l) => {
        let matches = l.accountId === request.accountId

        if (request.costCenterId && l.costCenterId) {
          matches = matches && l.costCenterId === request.costCenterId
        }

        if (request.projectId && l.projectId) {
          matches = matches && l.projectId === request.projectId
        }

        if (request.departmentId && l.departmentId) {
          matches = matches && l.departmentId === request.departmentId
        }

        return matches
      })

      if (line) {
        const wouldExceedBy = request.amount - line.availableAmount

        if (wouldExceedBy > 0) {
          // Would exceed budget
          return {
            allowed: budget.controlAction !== 'stop',
            action: budget.controlAction,
            budgetId: budget._id,
            budgetName: budget.name,
            budgetNameAr: budget.nameAr,
            budgetedAmount: line.budgetedAmount,
            usedAmount: line.actualAmount + line.committedAmount,
            availableAmount: line.availableAmount,
            requestedAmount: request.amount,
            wouldExceedBy,
            message:
              budget.controlAction === 'stop'
                ? `Expense blocked: Would exceed budget by ${wouldExceedBy.toFixed(2)} ${budget.currency}`
                : `Warning: Expense would exceed budget by ${wouldExceedBy.toFixed(2)} ${budget.currency}`,
            messageAr:
              budget.controlAction === 'stop'
                ? `تم حظر المصروف: سيتجاوز الميزانية بمبلغ ${wouldExceedBy.toFixed(2)} ${budget.currency}`
                : `تحذير: سيتجاوز المصروف الميزانية بمبلغ ${wouldExceedBy.toFixed(2)} ${budget.currency}`,
            warnings:
              budget.controlAction === 'warn'
                ? [`Budget will be exceeded by ${wouldExceedBy.toFixed(2)} ${budget.currency}`]
                : undefined,
            warningsAr:
              budget.controlAction === 'warn'
                ? [`سيتم تجاوز الميزانية بمبلغ ${wouldExceedBy.toFixed(2)} ${budget.currency}`]
                : undefined,
          }
        }

        // Check if near warning threshold
        const newUsed = line.actualAmount + line.committedAmount + request.amount
        const utilizationPercent = (newUsed / line.budgetedAmount) * 100

        if (utilizationPercent >= line.warningThreshold) {
          return {
            allowed: true,
            action: budget.controlAction,
            budgetId: budget._id,
            budgetName: budget.name,
            budgetNameAr: budget.nameAr,
            budgetedAmount: line.budgetedAmount,
            usedAmount: line.actualAmount + line.committedAmount,
            availableAmount: line.availableAmount,
            requestedAmount: request.amount,
            message: `Warning: Budget utilization will reach ${utilizationPercent.toFixed(1)}%`,
            messageAr: `تحذير: ستصل نسبة استخدام الميزانية إلى ${utilizationPercent.toFixed(1)}%`,
            warnings: [
              `Budget utilization will be ${utilizationPercent.toFixed(1)}% (threshold: ${line.warningThreshold}%)`,
            ],
            warningsAr: [
              `ستكون نسبة استخدام الميزانية ${utilizationPercent.toFixed(1)}% (الحد: ${line.warningThreshold}%)`,
            ],
          }
        }

        // Within budget
        return {
          allowed: true,
          action: budget.controlAction,
          budgetId: budget._id,
          budgetName: budget.name,
          budgetNameAr: budget.nameAr,
          budgetedAmount: line.budgetedAmount,
          usedAmount: line.actualAmount + line.committedAmount,
          availableAmount: line.availableAmount - request.amount,
          requestedAmount: request.amount,
          message: 'Expense is within budget',
          messageAr: 'المصروف ضمن الميزانية',
        }
      }
    }

    // No budget found for this expense
    return {
      allowed: true,
      action: 'ignore',
      budgetedAmount: 0,
      usedAmount: 0,
      availableAmount: 0,
      requestedAmount: request.amount,
      message: 'No budget configured for this expense',
      messageAr: 'لا توجد ميزانية محددة لهذا المصروف',
    }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Generate monthly distribution
 * API Endpoint: POST /api/budgets/:id/distribution
 */
const generateMonthlyDistribution = async (
  budgetId: string,
  method: DistributionMethod
): Promise<BudgetResponse> => {
  await delay()

  try {
    // In production: const response = await apiClient.post(`/budgets/${budgetId}/distribution`, { method })
    // return response.data

    const budget = MOCK_BUDGETS.find((b) => b._id === budgetId)
    if (!budget) {
      throw new Error('Budget not found')
    }

    const monthlyAmount =
      method === 'equal' ? budget.totalBudgeted / 12 : budget.totalBudgeted / 12 // Simplified

    budget.monthlyDistribution = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(2025, i).toLocaleString('en', { month: 'long' }),
      monthNameAr: new Date(2025, i).toLocaleString('ar', { month: 'long' }),
      budgetedAmount: monthlyAmount,
      actualAmount: i === 0 ? budget.totalActual : 0, // Current month actuals
      variance: i === 0 ? budget.totalActual - monthlyAmount : -monthlyAmount,
    }))

    return { budget }
  } catch (error) {
    throw handleApiError(error)
  }
}

/**
 * Duplicate budget for new fiscal year
 * API Endpoint: POST /api/budgets/:id/duplicate
 */
const duplicateBudget = async (id: string, newFiscalYear: string): Promise<BudgetResponse> => {
  await delay(500)

  try {
    // In production: const response = await apiClient.post(`/budgets/${id}/duplicate`, { fiscalYear: newFiscalYear })
    // return response.data

    const original = MOCK_BUDGETS.find((b) => b._id === id)
    if (!original) {
      throw new Error('Budget not found')
    }

    const newBudget: Budget = {
      ...original,
      _id: `BUD-${Date.now()}`,
      budgetNumber: `BUD-${newFiscalYear}-${String(MOCK_BUDGETS.length + 1).padStart(3, '0')}`,
      fiscalYear: newFiscalYear,
      startDate: `${newFiscalYear}-01-01`,
      endDate: `${newFiscalYear}-12-31`,
      status: 'draft',
      totalActual: 0,
      totalCommitted: 0,
      totalAvailable: original.totalBudgeted,
      variance: 0,
      variancePercent: 0,
      lines: original.lines.map((line, index) => ({
        ...line,
        _id: `LINE-${Date.now()}-${index}`,
        budgetId: `BUD-${Date.now()}`,
        actualAmount: 0,
        committedAmount: 0,
        availableAmount: line.budgetedAmount,
        variance: 0,
        variancePercent: 0,
        utilizationPercent: 0,
        isOverBudget: false,
        isNearLimit: false,
      })),
      submittedBy: undefined,
      submittedAt: undefined,
      approvedBy: undefined,
      approvedAt: undefined,
      rejectionReason: undefined,
      createdBy: 'CURRENT-USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    MOCK_BUDGETS.push(newBudget)
    return { budget: newBudget }
  } catch (error) {
    throw handleApiError(error)
  }
}

// ==================== EXPORT ====================

const budgetService = {
  getAllBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  submitForApproval,
  approveBudget,
  rejectBudget,
  closeBudget,
  getBudgetLines,
  updateBudgetLine,
  getBudgetStats,
  getBudgetVsActual,
  checkBudget,
  generateMonthlyDistribution,
  duplicateBudget,
}

export default budgetService
