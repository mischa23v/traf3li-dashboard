/**
 * Accounting Hooks - Backward Compatibility Export
 *
 * This file maintains backward compatibility by re-exporting all hooks
 * from the new modular structure in ./accounting/*
 *
 * All new code should import directly from '@/hooks/accounting' or specific modules.
 * This file exists solely to prevent breaking changes in existing code.
 */

// Re-export everything from the accounting modules
export * from './accounting'

// Re-export types from accounting service for convenience
export type {
  Account,
  AccountFilters,
  AccountType,
  AccountSubType,
  GLEntry,
  GLEntryFilters,
  JournalEntry,
  CreateJournalEntryData,
  SimpleJournalEntryData,
  FiscalPeriod,
  FiscalPeriodBalances,
  RecurringTransaction,
  CreateRecurringTransactionData,
  RecurringStatus,
  RecurringTransactionType,
  PriceLevel,
  CreatePriceLevelData,
  Bill,
  BillFilters,
  CreateBillData,
  Vendor,
  VendorFilters,
  CreateVendorData,
  Retainer,
  RetainerStatus,
  CreateRetainerData,
  RetainerDepositData,
  RetainerConsumeData,
  Lead,
  LeadFilters,
  CreateLeadData,
  LeadStage,
  LeadActivity,
} from '@/services/accountingService'
