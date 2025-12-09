import { api } from '@/lib/api'

// Budget Types
export type BudgetType = 'fixed' | 'time_based' | 'phased' | 'contingency' | 'hybrid'

export type BudgetStatus = 'draft' | 'approved' | 'active' | 'over_budget' | 'completed' | 'cancelled'

export type BudgetAlertLevel = 'info' | 'warning' | 'critical'

// Matter Budget
export interface MatterBudget {
  _id: string
  matterId: string
  matterNumber: string
  clientId: string
  clientName: string
  name: string
  description?: string
  type: BudgetType
  currency: string
  totalBudget: number
  usedAmount: number
  remainingAmount: number
  percentUsed: number
  status: BudgetStatus
  phases?: BudgetPhase[]
  categories?: BudgetCategory[]
  alerts: BudgetAlert[]
  alertThresholds: {
    warning: number
    critical: number
  }
  startDate: string
  endDate?: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
  attachments?: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface BudgetPhase {
  _id: string
  name: string
  description?: string
  budgetAmount: number
  usedAmount: number
  remainingAmount: number
  percentUsed: number
  startDate?: string
  endDate?: string
  status: 'pending' | 'active' | 'completed'
  tasks?: BudgetTask[]
}

export interface BudgetCategory {
  _id: string
  name: string
  code?: string
  budgetAmount: number
  usedAmount: number
  remainingAmount: number
  percentUsed: number
  subcategories?: {
    name: string
    budgetAmount: number
    usedAmount: number
  }[]
}

export interface BudgetTask {
  _id: string
  name: string
  description?: string
  estimatedHours: number
  actualHours: number
  estimatedAmount: number
  actualAmount: number
  assignedTo?: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface BudgetAlert {
  _id: string
  level: BudgetAlertLevel
  message: string
  threshold: number
  currentValue: number
  triggeredAt: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

// Budget Entry (Time/Expense linked to budget)
export interface BudgetEntry {
  _id: string
  budgetId: string
  phaseId?: string
  categoryId?: string
  entryType: 'time' | 'expense'
  sourceId: string
  sourceType: 'time_entry' | 'expense' | 'invoice_line'
  description: string
  amount: number
  date: string
  staffId?: string
  staffName?: string
  createdAt: string
}

// Budget Summary
export interface BudgetSummary {
  totalBudgets: number
  totalBudgetAmount: number
  totalUsedAmount: number
  totalRemainingAmount: number
  averageUtilization: number
  budgetsByStatus: {
    status: BudgetStatus
    count: number
    totalAmount: number
  }[]
  overBudgetMatters: {
    matterId: string
    matterNumber: string
    clientName: string
    budgetAmount: number
    usedAmount: number
    overageAmount: number
  }[]
  upcomingAlerts: {
    matterId: string
    matterNumber: string
    level: BudgetAlertLevel
    percentUsed: number
    remainingAmount: number
  }[]
}

// Budget Comparison
export interface BudgetComparison {
  period: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercent: number
}

// API Response Types
export interface MatterBudgetListResponse {
  data: MatterBudget[]
  total: number
  page: number
  pageSize: number
}

export interface BudgetEntryListResponse {
  data: BudgetEntry[]
  total: number
  page: number
  pageSize: number
}

// API Functions
export const matterBudgetService = {
  // Budgets
  getBudgets: async (params?: {
    matterId?: string
    clientId?: string
    status?: BudgetStatus
    type?: BudgetType
    page?: number
    pageSize?: number
  }): Promise<MatterBudgetListResponse> => {
    const response = await api.get('/matter-budgets', { params })
    return response.data
  },

  getBudget: async (id: string): Promise<MatterBudget> => {
    const response = await api.get(`/matter-budgets/${id}`)
    return response.data
  },

  getBudgetByCase: async (caseId: string): Promise<MatterBudget | null> => {
    try {
      const response = await api.get(`/matter-budgets/case/${caseId}`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) return null
      throw error
    }
  },

  createBudget: async (
    data: Omit<
      MatterBudget,
      '_id' | 'usedAmount' | 'remainingAmount' | 'percentUsed' | 'alerts' | 'createdAt' | 'updatedAt'
    >
  ): Promise<MatterBudget> => {
    const response = await api.post('/matter-budgets', data)
    return response.data
  },

  updateBudget: async (id: string, data: Partial<MatterBudget>): Promise<MatterBudget> => {
    const response = await api.patch(`/matter-budgets/${id}`, data)
    return response.data
  },

  deleteBudget: async (id: string): Promise<void> => {
    await api.delete(`/matter-budgets/${id}`)
  },

  // Budget Analysis
  getBudgetAnalysis: async (id: string): Promise<any> => {
    const response = await api.get(`/matter-budgets/${id}/analysis`)
    return response.data
  },

  // Budget Alerts
  getBudgetAlerts: async (params?: {
    level?: BudgetAlertLevel
    acknowledged?: boolean
  }): Promise<BudgetAlert[]> => {
    const response = await api.get('/matter-budgets/alerts', { params })
    return response.data
  },


  // Budget Phases
  addPhase: async (
    budgetId: string,
    phase: Omit<BudgetPhase, '_id' | 'usedAmount' | 'remainingAmount' | 'percentUsed'>
  ): Promise<MatterBudget> => {
    const response = await api.post(`/matter-budgets/${budgetId}/phases`, phase)
    return response.data
  },

  updatePhase: async (
    budgetId: string,
    phaseId: string,
    data: Partial<BudgetPhase>
  ): Promise<MatterBudget> => {
    const response = await api.patch(`/matter-budgets/${budgetId}/phases/${phaseId}`, data)
    return response.data
  },

  deletePhase: async (budgetId: string, phaseId: string): Promise<MatterBudget> => {
    const response = await api.delete(`/matter-budgets/${budgetId}/phases/${phaseId}`)
    return response.data
  },

  // Budget Entries
  getEntries: async (
    budgetId: string,
    params?: {
      phaseId?: string
      categoryId?: string
      entryType?: 'time' | 'expense'
      startDate?: string
      endDate?: string
      page?: number
      pageSize?: number
    }
  ): Promise<BudgetEntryListResponse> => {
    const response = await api.get(`/matter-budgets/${budgetId}/entries`, { params })
    return response.data
  },

  addEntry: async (
    budgetId: string,
    entry: Omit<BudgetEntry, '_id' | 'createdAt'>
  ): Promise<MatterBudget> => {
    const response = await api.post(`/matter-budgets/${budgetId}/entries`, entry)
    return response.data
  },

  updateEntry: async (
    budgetId: string,
    entryId: string,
    data: Partial<BudgetEntry>
  ): Promise<MatterBudget> => {
    const response = await api.patch(`/matter-budgets/${budgetId}/entries/${entryId}`, data)
    return response.data
  },

  deleteEntry: async (budgetId: string, entryId: string): Promise<MatterBudget> => {
    const response = await api.delete(`/matter-budgets/${budgetId}/entries/${entryId}`)
    return response.data
  },

  // Templates
  getTemplates: async (): Promise<
    {
      _id: string
      name: string
      type: BudgetType
      phases?: Partial<BudgetPhase>[]
      categories?: Partial<BudgetCategory>[]
    }[]
  > => {
    const response = await api.get('/matter-budgets/templates')
    return response.data
  },

  createTemplate: async (data: {
    name: string
    type: BudgetType
    phases?: Partial<BudgetPhase>[]
    categories?: Partial<BudgetCategory>[]
  }): Promise<any> => {
    const response = await api.post('/matter-budgets/templates', data)
    return response.data
  },

  updateTemplate: async (id: string, data: Partial<{
    name: string
    type: BudgetType
    phases?: Partial<BudgetPhase>[]
    categories?: Partial<BudgetCategory>[]
  }>): Promise<any> => {
    const response = await api.patch(`/matter-budgets/templates/${id}`, data)
    return response.data
  },

  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete(`/matter-budgets/templates/${id}`)
  },
}
