/**
 * Accounting Hooks
 * TanStack Query hooks for accounting operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import {
  accountingService,
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
  DebitNote,
  DebitNoteFilters,
  CreateDebitNoteData,
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

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ==================== QUERY KEYS ====================

export const accountingKeys = {
  all: ['accounting'] as const,
  // Accounts
  accounts: () => [...accountingKeys.all, 'accounts'] as const,
  accountsList: (filters?: AccountFilters) => [...accountingKeys.accounts(), 'list', filters] as const,
  account: (id: string) => [...accountingKeys.accounts(), id] as const,
  accountTypes: () => [...accountingKeys.accounts(), 'types'] as const,
  // GL Entries
  glEntries: () => [...accountingKeys.all, 'gl-entries'] as const,
  glEntriesList: (filters?: GLEntryFilters) => [...accountingKeys.glEntries(), 'list', filters] as const,
  glEntry: (id: string) => [...accountingKeys.glEntries(), id] as const,
  // Journal Entries
  journalEntries: () => [...accountingKeys.all, 'journal-entries'] as const,
  journalEntriesList: (filters?: { status?: string }) => [...accountingKeys.journalEntries(), 'list', filters] as const,
  journalEntry: (id: string) => [...accountingKeys.journalEntries(), id] as const,
  // Fiscal Periods
  fiscalPeriods: () => [...accountingKeys.all, 'fiscal-periods'] as const,
  fiscalPeriodsList: () => [...accountingKeys.fiscalPeriods(), 'list'] as const,
  fiscalPeriod: (id: string) => [...accountingKeys.fiscalPeriods(), id] as const,
  fiscalPeriodBalances: (id: string) => [...accountingKeys.fiscalPeriods(), id, 'balances'] as const,
  currentFiscalPeriod: () => [...accountingKeys.fiscalPeriods(), 'current'] as const,
  fiscalYearsSummary: () => [...accountingKeys.fiscalPeriods(), 'years-summary'] as const,
  canPost: (date: string) => [...accountingKeys.fiscalPeriods(), 'can-post', date] as const,
  // Recurring Transactions
  recurring: () => [...accountingKeys.all, 'recurring'] as const,
  recurringList: (filters?: { status?: RecurringStatus; transactionType?: RecurringTransactionType }) => [...accountingKeys.recurring(), 'list', filters] as const,
  recurringItem: (id: string) => [...accountingKeys.recurring(), id] as const,
  recurringUpcoming: () => [...accountingKeys.recurring(), 'upcoming'] as const,
  // Price Levels
  priceLevels: () => [...accountingKeys.all, 'price-levels'] as const,
  priceLevelsList: () => [...accountingKeys.priceLevels(), 'list'] as const,
  priceLevel: (id: string) => [...accountingKeys.priceLevels(), id] as const,
  clientRate: (clientId: string, baseRate: number, serviceType?: string) =>
    [...accountingKeys.priceLevels(), 'client-rate', clientId, baseRate, serviceType] as const,
  // Bills
  bills: () => [...accountingKeys.all, 'bills'] as const,
  billsList: (filters?: BillFilters) => [...accountingKeys.bills(), 'list', filters] as const,
  bill: (id: string) => [...accountingKeys.bills(), id] as const,
  // Debit Notes
  debitNotes: () => [...accountingKeys.all, 'debit-notes'] as const,
  debitNotesList: (filters?: DebitNoteFilters) => [...accountingKeys.debitNotes(), 'list', filters] as const,
  debitNote: (id: string) => [...accountingKeys.debitNotes(), id] as const,
  billDebitNotes: (billId: string) => [...accountingKeys.bills(), billId, 'debit-notes'] as const,
  // Vendors
  vendors: () => [...accountingKeys.all, 'vendors'] as const,
  vendorsList: (filters?: VendorFilters) => [...accountingKeys.vendors(), 'list', filters] as const,
  vendor: (id: string) => [...accountingKeys.vendors(), id] as const,
  // Retainers
  retainers: () => [...accountingKeys.all, 'retainers'] as const,
  retainersList: (filters?: { clientId?: string; status?: RetainerStatus }) => [...accountingKeys.retainers(), 'list', filters] as const,
  retainer: (id: string) => [...accountingKeys.retainers(), id] as const,
  retainerTransactions: (id: string) => [...accountingKeys.retainers(), id, 'transactions'] as const,
  // Leads
  leads: () => [...accountingKeys.all, 'leads'] as const,
  leadsList: (filters?: LeadFilters) => [...accountingKeys.leads(), 'list', filters] as const,
  lead: (id: string) => [...accountingKeys.leads(), id] as const,
  leadStats: () => [...accountingKeys.leads(), 'stats'] as const,
  // Reports
  reports: () => [...accountingKeys.all, 'reports'] as const,
  profitLoss: (startDate: string, endDate: string) => [...accountingKeys.reports(), 'profit-loss', startDate, endDate] as const,
  balanceSheet: (asOfDate?: string) => [...accountingKeys.reports(), 'balance-sheet', asOfDate] as const,
  trialBalance: (asOfDate?: string) => [...accountingKeys.reports(), 'trial-balance', asOfDate] as const,
  arAging: () => [...accountingKeys.reports(), 'ar-aging'] as const,
  caseProfitability: (startDate: string, endDate: string) => [...accountingKeys.reports(), 'case-profitability', startDate, endDate] as const,
}

// ==================== ACCOUNTS HOOKS ====================

export const useAccountTypes = () => {
  return useQuery({
    queryKey: accountingKeys.accountTypes(),
    queryFn: accountingService.getAccountTypes,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useAccounts = (filters?: AccountFilters) => {
  return useQuery({
    queryKey: accountingKeys.accountsList(filters),
    queryFn: () => accountingService.getAccounts(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.account(id),
    queryFn: () => accountingService.getAccount(id),
    enabled: !!id,
  })
}

export const useCreateAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Account>) => accountingService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() })
      toast.success('تم إنشاء الحساب بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create account | فشل في إنشاء الحساب'
      toast.error(message)
    },
  })
}

export const useUpdateAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountingService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() })
      toast.success('تم تحديث الحساب بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update account | فشل في تحديث الحساب'
      toast.error(message)
    },
  })
}

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() })
      toast.success('تم حذف الحساب بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete account | فشل في حذف الحساب'
      toast.error(message)
    },
  })
}

// ==================== GL ENTRIES HOOKS ====================

export const useGLEntries = (filters?: GLEntryFilters) => {
  return useQuery({
    queryKey: accountingKeys.glEntriesList(filters),
    queryFn: () => accountingService.getGLEntries(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useGLEntry = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.glEntry(id),
    queryFn: () => accountingService.getGLEntry(id),
    enabled: !!id,
  })
}

// ==================== JOURNAL ENTRIES HOOKS ====================

export const useJournalEntries = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: accountingKeys.journalEntriesList(filters),
    queryFn: () => accountingService.getJournalEntries(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useJournalEntry = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.journalEntry(id),
    queryFn: () => accountingService.getJournalEntry(id),
    enabled: !!id,
  })
}

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateJournalEntryData) => accountingService.createJournalEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journalEntries() })
      toast.success('تم إنشاء القيد بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create journal entry | فشل في إنشاء القيد'
      toast.error(message)
    },
  })
}

export const useCreateSimpleJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SimpleJournalEntryData) => accountingService.createSimpleJournalEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journalEntries() })
      toast.success('تم إنشاء القيد بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create journal entry | فشل في إنشاء القيد'
      toast.error(message)
    },
  })
}

export const usePostJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.postJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journalEntries() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم ترحيل القيد بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to post journal entry | فشل في ترحيل القيد'
      toast.error(message)
    },
  })
}

export const useVoidJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.voidJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journalEntries() })
      toast.success('تم إلغاء القيد بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to void journal entry | فشل في إلغاء القيد'
      toast.error(message)
    },
  })
}

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journalEntries() })
      toast.success('تم حذف القيد بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete journal entry | فشل في حذف القيد'
      toast.error(message)
    },
  })
}

// ==================== FISCAL PERIODS HOOKS ====================

export const useFiscalPeriods = () => {
  return useQuery({
    queryKey: accountingKeys.fiscalPeriodsList(),
    queryFn: accountingService.getFiscalPeriods,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCurrentFiscalPeriod = () => {
  return useQuery({
    queryKey: accountingKeys.currentFiscalPeriod(),
    queryFn: accountingService.getCurrentFiscalPeriod,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCanPostToDate = (date: string) => {
  return useQuery({
    queryKey: accountingKeys.canPost(date),
    queryFn: () => accountingService.canPostToDate(date),
    enabled: !!date,
  })
}

export const useFiscalYearsSummary = () => {
  return useQuery({
    queryKey: accountingKeys.fiscalYearsSummary(),
    queryFn: accountingService.getFiscalYearsSummary,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useFiscalPeriod = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.fiscalPeriod(id),
    queryFn: () => accountingService.getFiscalPeriod(id),
    enabled: !!id,
  })
}

export const useFiscalPeriodBalances = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.fiscalPeriodBalances(id),
    queryFn: () => accountingService.getFiscalPeriodBalances(id),
    enabled: !!id,
  })
}

export const useCreateFiscalYear = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ fiscalYear, startMonth }: { fiscalYear: number; startMonth: number }) =>
      accountingService.createFiscalYear(fiscalYear, startMonth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.fiscalPeriods() })
      toast.success('تم إنشاء السنة المالية بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create fiscal year | فشل في إنشاء السنة المالية'
      toast.error(message)
    },
  })
}

export const useOpenFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.openFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.fiscalPeriods() })
      toast.success('تم فتح الفترة المالية')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to open fiscal period | فشل في فتح الفترة المالية'
      toast.error(message)
    },
  })
}

export const useCloseFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.closeFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.fiscalPeriods() })
      toast.success('تم إغلاق الفترة المالية')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to close fiscal period | فشل في إغلاق الفترة المالية'
      toast.error(message)
    },
  })
}

export const useReopenFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.reopenFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.fiscalPeriods() })
      toast.success('تم إعادة فتح الفترة المالية')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to reopen fiscal period | فشل في إعادة فتح الفترة المالية'
      toast.error(message)
    },
  })
}

export const useLockFiscalPeriod = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.lockFiscalPeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.fiscalPeriods() })
      toast.success('تم قفل الفترة المالية نهائياً')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to lock fiscal period | فشل في قفل الفترة المالية'
      toast.error(message)
    },
  })
}

export const useYearEndClosing = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.yearEndClosing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.fiscalPeriods() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.journalEntries() })
      toast.success('تم إغلاق نهاية السنة بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to close year-end | فشل في إغلاق نهاية السنة'
      toast.error(message)
    },
  })
}

// ==================== RECURRING TRANSACTIONS HOOKS ====================

export const useRecurringTransactions = (filters?: { status?: RecurringStatus; transactionType?: RecurringTransactionType }) => {
  return useQuery({
    queryKey: accountingKeys.recurringList(filters),
    queryFn: () => accountingService.getRecurringTransactions(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useUpcomingRecurring = () => {
  return useQuery({
    queryKey: accountingKeys.recurringUpcoming(),
    queryFn: accountingService.getUpcomingRecurring,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useRecurringTransaction = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.recurringItem(id),
    queryFn: () => accountingService.getRecurringTransaction(id),
    enabled: !!id,
  })
}

export const useCreateRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRecurringTransactionData) => accountingService.createRecurringTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.recurring() })
      toast.success('تم إنشاء المعاملة المتكررة بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create recurring transaction | فشل في إنشاء المعاملة المتكررة'
      toast.error(message)
    },
  })
}

export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRecurringTransactionData> }) =>
      accountingService.updateRecurringTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.recurring() })
      toast.success('تم تحديث المعاملة المتكررة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update recurring transaction | فشل في تحديث المعاملة المتكررة'
      toast.error(message)
    },
  })
}

export const usePauseRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.pauseRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.recurring() })
      toast.success('تم إيقاف المعاملة المتكررة مؤقتاً')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to pause recurring transaction | فشل في إيقاف المعاملة المتكررة'
      toast.error(message)
    },
  })
}

export const useResumeRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.resumeRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.recurring() })
      toast.success('تم استئناف المعاملة المتكررة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to resume recurring transaction | فشل في استئناف المعاملة المتكررة'
      toast.error(message)
    },
  })
}

export const useCancelRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.cancelRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.recurring() })
      toast.success('تم إلغاء المعاملة المتكررة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to cancel recurring transaction | فشل في إلغاء المعاملة المتكررة'
      toast.error(message)
    },
  })
}

export const useGenerateRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.generateRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.recurring() })
      toast.success('تم إنشاء المعاملة بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to generate transaction | فشل في إنشاء المعاملة'
      toast.error(message)
    },
  })
}

export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteRecurringTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.recurring() })
      toast.success('تم حذف المعاملة المتكررة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete recurring transaction | فشل في حذف المعاملة المتكررة'
      toast.error(message)
    },
  })
}

// ==================== PRICE LEVELS HOOKS ====================

export const usePriceLevels = () => {
  return useQuery({
    queryKey: accountingKeys.priceLevelsList(),
    queryFn: accountingService.getPriceLevels,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const usePriceLevel = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.priceLevel(id),
    queryFn: () => accountingService.getPriceLevel(id),
    enabled: !!id,
  })
}

export const useClientRate = (clientId: string, baseRate: number, serviceType?: string) => {
  return useQuery({
    queryKey: accountingKeys.clientRate(clientId, baseRate, serviceType),
    queryFn: () => accountingService.getClientRate(clientId, baseRate, serviceType),
    enabled: !!clientId && baseRate > 0,
  })
}

export const useCreatePriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePriceLevelData) => accountingService.createPriceLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.priceLevels() })
      toast.success('تم إنشاء مستوى السعر بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create price level | فشل في إنشاء مستوى السعر'
      toast.error(message)
    },
  })
}

export const useUpdatePriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePriceLevelData> }) =>
      accountingService.updatePriceLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.priceLevels() })
      toast.success('تم تحديث مستوى السعر')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update price level | فشل في تحديث مستوى السعر'
      toast.error(message)
    },
  })
}

export const useDeletePriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deletePriceLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.priceLevels() })
      toast.success('تم حذف مستوى السعر')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete price level | فشل في حذف مستوى السعر'
      toast.error(message)
    },
  })
}

export const useSetDefaultPriceLevel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.setDefaultPriceLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.priceLevels() })
      toast.success('تم تعيين المستوى الافتراضي')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to set default price level | فشل في تعيين المستوى الافتراضي'
      toast.error(message)
    },
  })
}

// ==================== BILLS HOOKS ====================

export const useBills = (filters?: BillFilters) => {
  return useQuery({
    queryKey: accountingKeys.billsList(filters),
    queryFn: () => accountingService.getBills(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useBill = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.bill(id),
    queryFn: () => accountingService.getBill(id),
    enabled: !!id,
  })
}

export const useCreateBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBillData) => accountingService.createBill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      toast.success('تم إنشاء الفاتورة بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create bill | فشل في إنشاء الفاتورة'
      toast.error(message)
    },
  })
}

export const useUpdateBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBillData> }) =>
      accountingService.updateBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      toast.success('تم تحديث الفاتورة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update bill | فشل في تحديث الفاتورة'
      toast.error(message)
    },
  })
}

export const useApproveBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.approveBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      toast.success('تم اعتماد الفاتورة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to approve bill | فشل في اعتماد الفاتورة'
      toast.error(message)
    },
  })
}

export const usePayBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: number; paymentMethod: string; notes?: string } }) =>
      accountingService.payBill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم تسجيل الدفع بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to record payment | فشل في تسجيل الدفع'
      toast.error(message)
    },
  })
}

export const usePostBillToGL = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.postBillToGL(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم ترحيل الفاتورة للقيود')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to post bill to GL | فشل في ترحيل الفاتورة'
      toast.error(message)
    },
  })
}

export const useDeleteBill = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      toast.success('تم حذف الفاتورة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete bill | فشل في حذف الفاتورة'
      toast.error(message)
    },
  })
}

// ==================== DEBIT NOTES HOOKS ====================

export const useDebitNotes = (filters?: DebitNoteFilters) => {
  return useQuery({
    queryKey: accountingKeys.debitNotesList(filters),
    queryFn: () => accountingService.getDebitNotes(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useDebitNote = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.debitNote(id),
    queryFn: () => accountingService.getDebitNote(id),
    enabled: !!id,
  })
}

export const useBillDebitNotes = (billId: string) => {
  return useQuery({
    queryKey: accountingKeys.billDebitNotes(billId),
    queryFn: () => accountingService.getBillDebitNotes(billId),
    enabled: !!billId,
  })
}

export const useCreateDebitNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDebitNoteData) => accountingService.createDebitNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.debitNotes() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      toast.success('تم إنشاء إشعار الخصم بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create debit note | فشل في إنشاء إشعار الخصم'
      toast.error(message)
    },
  })
}

export const useUpdateDebitNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDebitNoteData> }) =>
      accountingService.updateDebitNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.debitNotes() })
      toast.success('تم تحديث إشعار الخصم')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update debit note | فشل في تحديث إشعار الخصم'
      toast.error(message)
    },
  })
}

export const useApproveDebitNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      accountingService.approveDebitNote(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.debitNotes() })
      toast.success('تم اعتماد إشعار الخصم')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to approve debit note | فشل في اعتماد إشعار الخصم'
      toast.error(message)
    },
  })
}

export const useApplyDebitNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.applyDebitNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.debitNotes() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.bills() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.vendors() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم تطبيق إشعار الخصم')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to apply debit note | فشل في تطبيق إشعار الخصم'
      toast.error(message)
    },
  })
}

export const useCancelDebitNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      accountingService.cancelDebitNote(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.debitNotes() })
      toast.success('تم إلغاء إشعار الخصم')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to cancel debit note | فشل في إلغاء إشعار الخصم'
      toast.error(message)
    },
  })
}

export const useDeleteDebitNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteDebitNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.debitNotes() })
      toast.success('تم حذف إشعار الخصم')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete debit note | فشل في حذف إشعار الخصم'
      toast.error(message)
    },
  })
}

export const useExportDebitNotes = () => {
  return useMutation({
    mutationFn: (filters?: DebitNoteFilters & { format?: 'csv' | 'xlsx' | 'pdf' }) =>
      accountingService.exportDebitNotes(filters),
    onSuccess: (blob, { format = 'pdf' }) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `debit-notes.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('تم تصدير إشعارات الخصم بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to export debit notes | فشل في تصدير إشعارات الخصم'
      toast.error(message)
    },
  })
}

// ==================== VENDORS HOOKS ====================

export const useVendors = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: accountingKeys.vendorsList(filters),
    queryFn: () => accountingService.getVendors(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useVendor = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.vendor(id),
    queryFn: () => accountingService.getVendor(id),
    enabled: !!id,
  })
}

export const useCreateVendor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVendorData) => accountingService.createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.vendors() })
      toast.success('تم إنشاء المورد بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create vendor | فشل في إنشاء المورد'
      toast.error(message)
    },
  })
}

export const useUpdateVendor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVendorData> }) =>
      accountingService.updateVendor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.vendors() })
      toast.success('تم تحديث المورد')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update vendor | فشل في تحديث المورد'
      toast.error(message)
    },
  })
}

export const useDeleteVendor = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.vendors() })
      toast.success('تم حذف المورد')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete vendor | فشل في حذف المورد'
      toast.error(message)
    },
  })
}

// ==================== RETAINERS HOOKS ====================

export const useRetainers = (filters?: { clientId?: string; status?: RetainerStatus }) => {
  return useQuery({
    queryKey: accountingKeys.retainersList(filters),
    queryFn: () => accountingService.getRetainers(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useRetainer = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.retainer(id),
    queryFn: () => accountingService.getRetainer(id),
    enabled: !!id,
  })
}

export const useRetainerTransactions = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.retainerTransactions(id),
    queryFn: () => accountingService.getRetainerTransactions(id),
    enabled: !!id,
  })
}

export const useCreateRetainer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRetainerData) => accountingService.createRetainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.retainers() })
      toast.success('تم إنشاء حساب الأمانة بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create retainer account | فشل في إنشاء حساب الأمانة'
      toast.error(message)
    },
  })
}

export const useDepositToRetainer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RetainerDepositData }) =>
      accountingService.depositToRetainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.retainers() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم إيداع المبلغ بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to deposit amount | فشل في إيداع المبلغ'
      toast.error(message)
    },
  })
}

export const useConsumeFromRetainer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RetainerConsumeData }) =>
      accountingService.consumeFromRetainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.retainers() })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم السحب من حساب الأمانة')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to withdraw from retainer account | فشل في السحب من حساب الأمانة'
      toast.error(message)
    },
  })
}

// ==================== LEADS HOOKS ====================

export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: accountingKeys.leadsList(filters),
    queryFn: () => accountingService.getLeads(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useLead = (id: string) => {
  return useQuery({
    queryKey: accountingKeys.lead(id),
    queryFn: () => accountingService.getLead(id),
    enabled: !!id,
  })
}

export const useLeadStats = () => {
  return useQuery({
    queryKey: accountingKeys.leadStats(),
    queryFn: accountingService.getLeadStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateLeadData) => accountingService.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.leads() })
      toast.success('تم إنشاء العميل المحتمل بنجاح')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create lead | فشل في إنشاء العميل المحتمل'
      toast.error(message)
    },
  })
}

export const useUpdateLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeadData> }) =>
      accountingService.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.leads() })
      toast.success('تم تحديث العميل المحتمل')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update lead | فشل في تحديث العميل المحتمل'
      toast.error(message)
    },
  })
}

export const useDeleteLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountingService.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.leads() })
      toast.success('تم حذف العميل المحتمل')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete lead | فشل في حذف العميل المحتمل'
      toast.error(message)
    },
  })
}

export const useConvertLead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { createCase?: boolean; caseType?: string } }) =>
      accountingService.convertLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.leads() })
      toast.success('تم تحويل العميل المحتمل إلى عميل فعلي')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to convert lead | فشل في تحويل العميل المحتمل'
      toast.error(message)
    },
  })
}

export const useUpdateLeadStage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: LeadStage }) =>
      accountingService.updateLeadStage(id, stage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.leads() })
      toast.success('تم تحديث مرحلة العميل المحتمل')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update lead stage | فشل في تحديث مرحلة العميل المحتمل'
      toast.error(message)
    },
  })
}

export const useAddLeadActivity = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activity }: { id: string; activity: Omit<LeadActivity, '_id' | 'createdBy'> }) =>
      accountingService.addLeadActivity(id, activity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.leads() })
      toast.success('تم إضافة النشاط')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add activity | فشل في إضافة النشاط'
      toast.error(message)
    },
  })
}

// ==================== REPORTS HOOKS ====================

export const useProfitLossReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: accountingKeys.profitLoss(startDate, endDate),
    queryFn: () => accountingService.getProfitLossReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useBalanceSheetReport = (asOfDate?: string) => {
  return useQuery({
    queryKey: accountingKeys.balanceSheet(asOfDate),
    queryFn: () => accountingService.getBalanceSheetReport(asOfDate),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useTrialBalanceReport = (asOfDate?: string) => {
  return useQuery({
    queryKey: accountingKeys.trialBalance(asOfDate),
    queryFn: () => accountingService.getTrialBalanceReport(asOfDate),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useARAgingReport = () => {
  return useQuery({
    queryKey: accountingKeys.arAging(),
    queryFn: accountingService.getARAgingReport,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCaseProfitabilityReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: accountingKeys.caseProfitability(startDate, endDate),
    queryFn: () => accountingService.getCaseProfitabilityReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ==================== INVOICE GL INTEGRATION HOOKS ====================

export const usePostInvoiceToGL = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invoiceId: string) => accountingService.postInvoiceToGL(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم ترحيل الفاتورة للقيود')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to post bill to GL | فشل في ترحيل الفاتورة'
      toast.error(message)
    },
  })
}

export const useRecordPaymentForInvoice = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ invoiceId, data }: {
      invoiceId: string
      data: { amount: number; paymentDate: string; paymentMethod: string; bankAccountId?: string }
    }) => accountingService.recordPaymentForInvoice(invoiceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: accountingKeys.glEntries() })
      toast.success('تم تسجيل الدفع وترحيله للقيود')
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to record payment | فشل في تسجيل الدفع'
      toast.error(message)
    },
  })
}
