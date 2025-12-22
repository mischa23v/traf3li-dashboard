/**
 * Consolidated Report Service
 * Handles multi-company consolidated reporting with currency conversion and inter-company eliminations
 */

import apiClient, { handleApiError } from '@/lib/api'

// ==================== TYPES ====================

export interface ConsolidationFilters {
  firmIds: string[]
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
    firmId: string
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
  fromFirmId: string
  fromCompanyName: string
  fromCompanyNameAr?: string
  toFirmId: string
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
    firmId: string
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
    firmId: string
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
    firmId: string
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
  fromFirmIds?: string[]
  toFirmIds?: string[]
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

/**
 * Consolidated Report Service
 *
 * @description
 * This service handles multi-company consolidated reporting with currency conversion
 * and inter-company eliminations. It provides endpoints for generating consolidated
 * financial reports across multiple companies.
 *
 * @important
 * - The component exists at `/src/components/ConsolidatedReports.tsx`
 * - **Component is NOT currently accessible** - needs to be added to routing configuration
 * - Cash flow report is defined in ConsolidationFilters type but NOT implemented in service
 *
 * @apiPattern All endpoints follow the pattern:
 * - Base URL: `/api/reports/consolidated`
 * - Response format: `{ success: boolean, data: T }`
 * - Error handling: Uses handleApiError() for consistent error messages
 *
 * @endpoints Available Endpoints:
 *
 * **Report Generation:**
 * - POST   /reports/consolidated/profit-loss       - Generate consolidated P&L report
 * - POST   /reports/consolidated/balance-sheet     - Generate consolidated balance sheet
 * - POST   /reports/consolidated/summary           - Get consolidation summary metrics
 * - POST   /reports/consolidated/export            - Export report (PDF/Excel/CSV)
 *
 * **Inter-Company Management:**
 * - GET    /reports/consolidated/inter-company-transactions  - List inter-company transactions
 * - POST   /reports/consolidated/comparisons       - Get company metric comparisons
 *
 * **Elimination Rules:**
 * - GET    /reports/consolidated/elimination-rules           - List all elimination rules
 * - POST   /reports/consolidated/elimination-rules           - Create elimination rule
 * - PUT    /reports/consolidated/elimination-rules/:id       - Update elimination rule
 * - DELETE /reports/consolidated/elimination-rules/:id       - Delete elimination rule
 *
 * **Currency Management:**
 * - GET    /reports/consolidated/exchange-rates    - Get currency conversion rates
 * - POST   /reports/consolidated/exchange-rates    - Set manual exchange rate
 *
 * @notImplemented
 * - Cash Flow Report: Type 'cash_flow' exists in ConsolidationFilters.reportType
 *   but no corresponding service method (getConsolidatedCashFlow) is implemented.
 *   Backend endpoint may not exist yet.
 *
 * @example Basic Usage
 * ```typescript
 * import consolidatedReportService from '@/services/consolidatedReportService'
 *
 * // Generate consolidated P&L
 * const report = await consolidatedReportService.getConsolidatedProfitLoss({
 *   firmIds: ['firm1', 'firm2'],
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31',
 *   reportType: 'profit_loss',
 *   includeEliminationEntries: true,
 *   baseCurrency: 'SAR',
 *   consolidationMethod: 'full'
 * })
 * ```
 */
const consolidatedReportService = {
  /**
   * Generate consolidated profit & loss report
   *
   * @description
   * Generates a consolidated profit and loss statement across multiple companies
   * with currency conversion and inter-company eliminations.
   *
   * @endpoint POST /api/reports/consolidated/profit-loss
   *
   * @param {ConsolidationFilters} filters - Consolidation parameters
   * @param {string[]} filters.firmIds - Array of firm IDs to consolidate
   * @param {string} filters.startDate - Start date (YYYY-MM-DD)
   * @param {string} filters.endDate - End date (YYYY-MM-DD)
   * @param {string} filters.reportType - Report type (should be 'profit_loss')
   * @param {boolean} [filters.includeEliminationEntries] - Include elimination entries
   * @param {string} [filters.baseCurrency] - Base currency for consolidation (default: SAR)
   * @param {string} [filters.consolidationMethod] - Consolidation method (default: full)
   *
   * @returns {Promise<ConsolidatedProfitLoss>} Consolidated P&L report with:
   * - Income and expense line items broken down by company
   * - Inter-company eliminations
   * - Currency conversions
   * - Net income before and after eliminations
   *
   * @throws {Error} API error message from handleApiError()
   *
   * @example
   * const profitLoss = await consolidatedReportService.getConsolidatedProfitLoss({
   *   firmIds: ['firm1', 'firm2'],
   *   startDate: '2024-01-01',
   *   endDate: '2024-12-31',
   *   reportType: 'profit_loss',
   *   includeEliminationEntries: true,
   *   baseCurrency: 'SAR'
   * })
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
   *
   * @description
   * Generates a consolidated balance sheet across multiple companies showing
   * assets, liabilities, and equity with inter-company balance eliminations.
   *
   * @endpoint POST /api/reports/consolidated/balance-sheet
   *
   * @param {ConsolidationFilters} filters - Consolidation parameters
   * @param {string[]} filters.firmIds - Array of firm IDs to consolidate
   * @param {string} filters.startDate - Start date for period
   * @param {string} filters.endDate - End date/as-of date (YYYY-MM-DD)
   * @param {string} filters.reportType - Report type (should be 'balance_sheet')
   * @param {boolean} [filters.includeEliminationEntries] - Include elimination entries
   * @param {string} [filters.baseCurrency] - Base currency for consolidation
   *
   * @returns {Promise<ConsolidatedBalanceSheet>} Consolidated balance sheet with:
   * - Current and non-current assets by company
   * - Current and non-current liabilities by company
   * - Equity breakdown by company
   * - Inter-company balance eliminations
   * - Currency conversions
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Retrieves all inter-company transactions between specified firms for a given period.
   * Used for identifying and managing inter-company eliminations.
   *
   * @endpoint GET /api/reports/consolidated/inter-company-transactions
   *
   * @param {string[]} firmIds - Array of firm IDs to check for inter-company transactions
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   *
   * @queryParams Sent as URL parameters:
   * - firmIds: Comma-separated list of firm IDs
   * - startDate: ISO date string
   * - endDate: ISO date string
   *
   * @returns {Promise<InterCompanyTransaction[]>} List of inter-company transactions with:
   * - Transaction details (from/to companies, type, amount)
   * - Currency and conversion information
   * - Suggested elimination entries
   *
   * @throws {Error} API error message from handleApiError()
   */
  getInterCompanyTransactions: async (
    firmIds: string[],
    startDate: string,
    endDate: string
  ): Promise<InterCompanyTransaction[]> => {
    try {
      const response = await apiClient.get<ConsolidatedReportResponse<InterCompanyTransaction[]>>(
        '/reports/consolidated/inter-company-transactions',
        {
          params: {
            firmIds: firmIds.join(','),
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
   *
   * @description
   * Compares financial metrics across multiple companies for analysis and benchmarking.
   * Provides rankings, percentages, and statistical summaries.
   *
   * @endpoint POST /api/reports/consolidated/comparisons
   *
   * @param {string[]} firmIds - Array of firm IDs to compare
   * @param {string} startDate - Start date for period (YYYY-MM-DD)
   * @param {string} endDate - End date for period (YYYY-MM-DD)
   * @param {string[]} metrics - Array of metric names to compare (e.g., ['revenue', 'profit_margin'])
   *
   * @returns {Promise<CompanyMetricComparison[]>} Array of metric comparisons with:
   * - Metric values for each company
   * - Rankings and percentages of total
   * - Statistical summaries (total, average, median)
   *
   * @throws {Error} API error message from handleApiError()
   */
  getCompanyComparisons: async (
    firmIds: string[],
    startDate: string,
    endDate: string,
    metrics: string[]
  ): Promise<CompanyMetricComparison[]> => {
    try {
      const response = await apiClient.post<
        ConsolidatedReportResponse<CompanyMetricComparison[]>
      >('/reports/consolidated/comparisons', {
        firmIds,
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
   *
   * @description
   * Retrieves all configured elimination rules for inter-company transaction eliminations.
   *
   * @endpoint GET /api/reports/consolidated/elimination-rules
   *
   * @returns {Promise<EliminationRule[]>} List of all elimination rules with:
   * - Rule configuration (type, accounts, companies)
   * - Active/inactive status
   * - Automatic vs manual application
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Creates a new elimination rule for automated inter-company transaction eliminations.
   *
   * @endpoint POST /api/reports/consolidated/elimination-rules
   *
   * @param {Omit<EliminationRule, 'id'>} rule - New elimination rule (without ID)
   * @param {string} rule.name - Rule name
   * @param {string} rule.type - Rule type (inter_company_sales, loans, dividends, etc.)
   * @param {boolean} rule.enabled - Whether rule is active
   * @param {boolean} rule.automatic - Whether to apply automatically
   *
   * @returns {Promise<EliminationRule>} Created elimination rule with generated ID
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Updates an existing elimination rule by ID.
   *
   * @endpoint PUT /api/reports/consolidated/elimination-rules/:id
   *
   * @param {string} id - Elimination rule ID to update
   * @param {Partial<EliminationRule>} updates - Fields to update
   *
   * @returns {Promise<EliminationRule>} Updated elimination rule
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Deletes an elimination rule by ID. This action cannot be undone.
   *
   * @endpoint DELETE /api/reports/consolidated/elimination-rules/:id
   *
   * @param {string} id - Elimination rule ID to delete
   *
   * @returns {Promise<void>} No return value on success
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Retrieves currency conversion rates for specified currencies. Can optionally
   * specify a date for historical rates.
   *
   * @endpoint GET /api/reports/consolidated/exchange-rates
   *
   * @param {string[]} currencies - Array of currency codes (e.g., ['USD', 'EUR', 'SAR'])
   * @param {string} [date] - Optional date for historical rates (YYYY-MM-DD)
   *
   * @queryParams Sent as URL parameters:
   * - currencies: Comma-separated list of currency codes
   * - date: ISO date string (optional)
   *
   * @returns {Promise<CurrencyConversion[]>} Array of currency conversions with:
   * - Currency pair (from/to)
   * - Conversion rate
   * - Date and source (manual, auto, ECB, central bank)
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Sets a manual currency conversion rate. Used when automatic rates are unavailable
   * or when a specific rate needs to be enforced for consolidation purposes.
   *
   * @endpoint POST /api/reports/consolidated/exchange-rates
   *
   * @param {Omit<CurrencyConversion, 'source'>} conversion - Currency conversion to set
   * @param {string} conversion.fromCurrency - Source currency code
   * @param {string} conversion.toCurrency - Target currency code
   * @param {number} conversion.rate - Conversion rate
   * @param {string} conversion.date - Date for the rate (YYYY-MM-DD)
   *
   * @returns {Promise<CurrencyConversion>} Created currency conversion with source set to 'manual'
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Retrieves high-level summary metrics for a consolidated report including
   * totals, eliminations, and key financial ratios.
   *
   * @endpoint POST /api/reports/consolidated/summary
   *
   * @param {ConsolidationFilters} filters - Consolidation parameters
   * @param {string[]} filters.firmIds - Array of firm IDs to consolidate
   * @param {string} filters.startDate - Start date (YYYY-MM-DD)
   * @param {string} filters.endDate - End date (YYYY-MM-DD)
   *
   * @returns {Promise<ConsolidationSummary>} Summary metrics including:
   * - Total revenue, expenses, and net income
   * - Total assets, liabilities, and equity
   * - Inter-company eliminations count and amount
   * - Currencies involved and conversion rates used
   *
   * @throws {Error} API error message from handleApiError()
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
   *
   * @description
   * Exports a consolidated report in the specified format (PDF, Excel, or CSV).
   * Returns a Blob that can be downloaded by the user.
   *
   * @endpoint POST /api/reports/consolidated/export
   *
   * @param {ConsolidationFilters} filters - Consolidation parameters for the report
   * @param {'pdf' | 'excel' | 'csv'} format - Export format
   *   - 'pdf': Full formatted report with charts and tables
   *   - 'excel': Multi-sheet workbook with detailed data
   *   - 'csv': Simple comma-separated values for data analysis
   *
   * @returns {Promise<Blob>} File blob that can be downloaded
   *
   * @throws {Error} API error message from handleApiError()
   *
   * @example
   * const blob = await consolidatedReportService.exportConsolidatedReport(filters, 'pdf')
   * const url = window.URL.createObjectURL(blob)
   * const a = document.createElement('a')
   * a.href = url
   * a.download = 'consolidated-report.pdf'
   * a.click()
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
