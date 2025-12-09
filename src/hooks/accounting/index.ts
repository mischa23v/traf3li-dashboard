/**
 * Accounting Hooks - Barrel Export
 * Central export point for all accounting-related hooks
 */

// ==================== ACCOUNTS & GL ENTRIES ====================
export * from './useAccounts'

// ==================== JOURNAL ENTRIES ====================
export * from './useJournalEntries'

// ==================== FISCAL YEAR & PERIODS ====================
export * from './useFiscalYear'

// ==================== RECONCILIATION ====================
export * from './useReconciliation'

// ==================== BUDGETS ====================
export * from './useBudgets'

// ==================== FINANCIAL REPORTS ====================
export * from './useReports'

// ==================== BILLS & VENDORS ====================
export * from './useBills'

// ==================== RETAINERS ====================
export * from './useRetainers'

// ==================== LEADS ====================
export * from './useLeads'

// ==================== PRICE LEVELS ====================
export * from './usePriceLevels'

// ==================== RECURRING TRANSACTIONS ====================
export * from './useRecurring'

// ==================== CONSOLIDATED QUERY KEYS ====================

import { accountKeys } from './useAccounts'
import { journalEntryKeys } from './useJournalEntries'
import { fiscalYearKeys } from './useFiscalYear'
import { reconciliationKeys } from './useReconciliation'
import { budgetKeys } from './useBudgets'
import { reportKeys } from './useReports'
import { billKeys } from './useBills'
import { retainerKeys } from './useRetainers'
import { leadKeys } from './useLeads'
import { priceLevelKeys } from './usePriceLevels'
import { recurringKeys } from './useRecurring'

/**
 * Consolidated accounting query keys
 * Combines all query keys from individual modules for backward compatibility
 */
export const accountingKeys = {
  all: ['accounting'] as const,
  // Accounts
  accounts: accountKeys.accounts,
  accountsList: accountKeys.accountsList,
  account: accountKeys.account,
  accountTypes: accountKeys.accountTypes,
  // GL Entries
  glEntries: accountKeys.glEntries,
  glEntriesList: accountKeys.glEntriesList,
  glEntry: accountKeys.glEntry,
  // Journal Entries
  journalEntries: journalEntryKeys.journalEntries,
  journalEntriesList: journalEntryKeys.journalEntriesList,
  journalEntry: journalEntryKeys.journalEntry,
  // Fiscal Periods
  fiscalPeriods: fiscalYearKeys.fiscalPeriods,
  fiscalPeriodsList: fiscalYearKeys.fiscalPeriodsList,
  fiscalPeriod: fiscalYearKeys.fiscalPeriod,
  fiscalPeriodBalances: fiscalYearKeys.fiscalPeriodBalances,
  currentFiscalPeriod: fiscalYearKeys.currentFiscalPeriod,
  fiscalYearsSummary: fiscalYearKeys.fiscalYearsSummary,
  canPost: fiscalYearKeys.canPost,
  // Recurring Transactions
  recurring: recurringKeys.recurring,
  recurringList: recurringKeys.recurringList,
  recurringItem: recurringKeys.recurringItem,
  recurringUpcoming: recurringKeys.recurringUpcoming,
  // Price Levels
  priceLevels: priceLevelKeys.priceLevels,
  priceLevelsList: priceLevelKeys.priceLevelsList,
  priceLevel: priceLevelKeys.priceLevel,
  clientRate: priceLevelKeys.clientRate,
  // Bills
  bills: billKeys.bills,
  billsList: billKeys.billsList,
  bill: billKeys.bill,
  // Vendors
  vendors: billKeys.vendors,
  vendorsList: billKeys.vendorsList,
  vendor: billKeys.vendor,
  // Retainers
  retainers: retainerKeys.retainers,
  retainersList: retainerKeys.retainersList,
  retainer: retainerKeys.retainer,
  retainerTransactions: retainerKeys.retainerTransactions,
  // Leads
  leads: leadKeys.leads,
  leadsList: leadKeys.leadsList,
  lead: leadKeys.lead,
  leadStats: leadKeys.leadStats,
  // Reports
  reports: reportKeys.reports,
  profitLoss: reportKeys.profitLoss,
  balanceSheet: reportKeys.balanceSheet,
  trialBalance: reportKeys.trialBalance,
  arAging: reportKeys.arAging,
  caseProfitability: reportKeys.caseProfitability,
}
