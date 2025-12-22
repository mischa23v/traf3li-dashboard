/**
 * Consolidated Report Service
 * Handles multi-company consolidated reporting with currency conversion and inter-company eliminations
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface ConsolidationFilters {
  companyIds: string[]
  startDate: string
  endDate: string
  reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'all'
  includeEliminationEntries?: boolean
  baseCurrency?: string
  consolidationMethod?: 'full' | 'proportional'
}

export interface CurrencyConversion {
  fromCurrency: string
  toCurrency: string
  rate: number
  date: string
  source: 'manual' | 'auto' | 'ecb' | 'central_bank'
}

export interface ConsolidatedLineItem {
  account: string
  accountAr?: string
  accountCode?: string
  byCompany: Array<{
    companyId: string
    companyName: string
    companyNameAr?: string
    amount: number
    currency: string
    convertedAmount: number
    conversionRate?: number
  }>
  totalBeforeElimination: number
  eliminationAmount: number
  totalAfterElimination: number
  percentage?: number
}

export interface InterCompanyTransaction {
  id: string
  fromCompanyId: string
  fromCompanyName: string
  fromCompanyNameAr?: string
  toCompanyId: string
  toCompanyName: string
  toCompanyNameAr?: string
  transactionType: 'sale' | 'purchase' | 'loan' | 'service' | 'other'
  amount: number
  currency: string
  convertedAmount: number
  date: string
  description?: string
  descriptionAr?: string
  reference?: string
  eliminationEntry?: {
    debitAccount: string
    creditAccount: string
    amount: number
    description?: string
  }
}

export interface ConsolidatedProfitLoss {
  period: {
    start: string
    end: string
  }
  baseCurrency: string
  companies: Array<{
    companyId: string
    companyName: string
    companyNameAr?: string
  }>
  income: {
    items: ConsolidatedLineItem[]
    subtotal: number
  }
  expenses: {
    items: ConsolidatedLineItem[]
    subtotal: number
  }
  netIncome: number
  netIncomeBeforeElimination: number
  totalEliminations: number
  interCompanyTransactions: InterCompanyTransaction[]
  conversionRates: CurrencyConversion[]
}

export interface ConsolidatedBalanceSheet {
  asOfDate: string
  baseCurrency: string
  companies: Array<{
    companyId: string
    companyName: string
    companyNameAr?: string
  }>
  assets: {
    currentAssets: ConsolidatedLineItem[]
    nonCurrentAssets: ConsolidatedLineItem[]
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: ConsolidatedLineItem[]
    nonCurrentLiabilities: ConsolidatedLineItem[]
    totalLiabilities: number
  }
  equity: {
    items: ConsolidatedLineItem[]
    totalEquity: number
  }
  totalLiabilitiesAndEquity: number
  interCompanyBalances: InterCompanyTransaction[]
  conversionRates: CurrencyConversion[]
}

export interface CompanyMetricComparison {
  metric: string
  metricAr?: string
  metricType: 'revenue' | 'expenses' | 'profit' | 'margin' | 'growth' | 'efficiency'
  unit: 'currency' | 'percentage' | 'number'
  byCompany: Array<{
    companyId: string
    companyName: string
    companyNameAr?: string
    value: number
    rank: number
    percentageOfTotal?: number
  }>
  total?: number
  average?: number
  median?: number
}

export interface EliminationRule {
  id: string
  name: string
  nameAr?: string
  type: 'inter_company_sales' | 'inter_company_loans' | 'dividends' | 'management_fees' | 'custom'
  fromCompanyIds?: string[]
  toCompanyIds?: string[]
  accountPatterns?: string[]
  enabled: boolean
  automatic: boolean
  description?: string
  descriptionAr?: string
}

export interface ConsolidationSummary {
  totalCompanies: number
  totalRevenue: number
  totalExpenses: number
  netIncome: number
  profitMargin: number
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  interCompanyEliminationsCount: number
  interCompanyEliminationsAmount: number
  currenciesInvolved: string[]
  conversionRatesUsed: CurrencyConversion[]
}

// ==================== API RESPONSE TYPES ====================

interface ConsolidatedReportResponse<T> {
  success: boolean
  data: T
}

// ==================== SERVICE ====================

const consolidatedReportService = {
  /**
   * Generate consolidated profit & loss report
   * POST /api/reports/consolidated/profit-loss
   */
  getConsolidatedProfitLoss: async (
    filters: ConsolidationFilters
  ): Promise<ConsolidatedProfitLoss> => {
    try {
      const response = await apiClient.post<ConsolidatedReportResponse<ConsolidatedProfitLoss>>(
        '/reports/consolidated/profit-loss',
        filters
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Generate consolidated balance sheet
   * POST /api/reports/consolidated/balance-sheet
   */
  getConsolidatedBalanceSheet: async (
    filters: ConsolidationFilters
  ): Promise<ConsolidatedBalanceSheet> => {
    try {
      const response = await apiClient.post<ConsolidatedReportResponse<ConsolidatedBalanceSheet>>(
        '/reports/consolidated/balance-sheet',
        filters
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get inter-company transactions
   * GET /api/reports/consolidated/inter-company-transactions
   */
  getInterCompanyTransactions: async (
    companyIds: string[],
    startDate: string,
    endDate: string
  ): Promise<InterCompanyTransaction[]> => {
    try {
      const response = await apiClient.get<ConsolidatedReportResponse<InterCompanyTransaction[]>>(
        '/reports/consolidated/inter-company-transactions',
        {
          params: {
            companyIds: companyIds.join(','),
            startDate,
            endDate,
          },
        }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get company metric comparisons
   * POST /api/reports/consolidated/comparisons
   */
  getCompanyComparisons: async (
    companyIds: string[],
    startDate: string,
    endDate: string,
    metrics: string[]
  ): Promise<CompanyMetricComparison[]> => {
    try {
      const response = await apiClient.post<
        ConsolidatedReportResponse<CompanyMetricComparison[]>
      >('/reports/consolidated/comparisons', {
        companyIds,
        startDate,
        endDate,
        metrics,
      })
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get elimination rules
   * GET /api/reports/consolidated/elimination-rules
   */
  getEliminationRules: async (): Promise<EliminationRule[]> => {
    try {
      const response = await apiClient.get<ConsolidatedReportResponse<EliminationRule[]>>(
        '/reports/consolidated/elimination-rules'
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Create elimination rule
   * POST /api/reports/consolidated/elimination-rules
   */
  createEliminationRule: async (
    rule: Omit<EliminationRule, 'id'>
  ): Promise<EliminationRule> => {
    try {
      const response = await apiClient.post<ConsolidatedReportResponse<EliminationRule>>(
        '/reports/consolidated/elimination-rules',
        rule
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Update elimination rule
   * PUT /api/reports/consolidated/elimination-rules/:id
   */
  updateEliminationRule: async (
    id: string,
    updates: Partial<EliminationRule>
  ): Promise<EliminationRule> => {
    try {
      const response = await apiClient.put<ConsolidatedReportResponse<EliminationRule>>(
        `/reports/consolidated/elimination-rules/${id}`,
        updates
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Delete elimination rule
   * DELETE /api/reports/consolidated/elimination-rules/:id
   */
  deleteEliminationRule: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/reports/consolidated/elimination-rules/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get currency conversion rates
   * GET /api/reports/consolidated/exchange-rates
   */
  getExchangeRates: async (
    currencies: string[],
    date?: string
  ): Promise<CurrencyConversion[]> => {
    try {
      const response = await apiClient.get<ConsolidatedReportResponse<CurrencyConversion[]>>(
        '/reports/consolidated/exchange-rates',
        {
          params: {
            currencies: currencies.join(','),
            date,
          },
        }
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Set manual exchange rate
   * POST /api/reports/consolidated/exchange-rates
   */
  setExchangeRate: async (conversion: Omit<CurrencyConversion, 'source'>): Promise<CurrencyConversion> => {
    try {
      const response = await apiClient.post<ConsolidatedReportResponse<CurrencyConversion>>(
        '/reports/consolidated/exchange-rates',
        conversion
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Get consolidation summary
   * POST /api/reports/consolidated/summary
   */
  getConsolidationSummary: async (
    filters: ConsolidationFilters
  ): Promise<ConsolidationSummary> => {
    try {
      const response = await apiClient.post<ConsolidatedReportResponse<ConsolidationSummary>>(
        '/reports/consolidated/summary',
        filters
      )
      return response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  /**
   * Export consolidated report
   * POST /api/reports/consolidated/export
   */
  exportConsolidatedReport: async (
    filters: ConsolidationFilters,
    format: 'pdf' | 'excel' | 'csv'
  ): Promise<Blob> => {
    try {
      const response = await apiClient.post(
        '/reports/consolidated/export',
        { ...filters, format },
        {
          responseType: 'blob',
        }
      )
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export default consolidatedReportService
