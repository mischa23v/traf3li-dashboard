/**
 * Accounting Hooks
 * TanStack Query hooks for accounting operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  })
}

export const useAccounts = (filters?: AccountFilters) => {
  return useQuery({
    queryKey: accountingKeys.accountsList(filters),
    queryFn: () => accountingService.getAccounts(filters),
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
    onError: () => {
      toast.error('فشل في إنشاء الحساب')
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
    onError: () => {
      toast.error('فشل في تحديث الحساب')
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
    onError: () => {
      toast.error('فشل في حذف الحساب')
    },
  })
}

// ==================== GL ENTRIES HOOKS ====================

export const useGLEntries = (filters?: GLEntryFilters) => {
  return useQuery({
    queryKey: accountingKeys.glEntriesList(filters),
    queryFn: () => accountingService.getGLEntries(filters),
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
    onError: () => {
      toast.error('فشل في إنشاء القيد')
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
    onError: () => {
      toast.error('فشل في إنشاء القيد')
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
    onError: () => {
      toast.error('فشل في ترحيل القيد')
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
    onError: () => {
      toast.error('فشل في إلغاء القيد')
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
    onError: () => {
      toast.error('فشل في حذف القيد')
    },
  })
}

// ==================== FISCAL PERIODS HOOKS ====================

export const useFiscalPeriods = () => {
  return useQuery({
    queryKey: accountingKeys.fiscalPeriodsList(),
    queryFn: accountingService.getFiscalPeriods,
  })
}

export const useCurrentFiscalPeriod = () => {
  return useQuery({
    queryKey: accountingKeys.currentFiscalPeriod(),
    queryFn: accountingService.getCurrentFiscalPeriod,
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
    onError: () => {
      toast.error('فشل في إنشاء السنة المالية')
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
    onError: () => {
      toast.error('فشل في فتح الفترة المالية')
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
    onError: () => {
      toast.error('فشل في إغلاق الفترة المالية')
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
    onError: () => {
      toast.error('فشل في إعادة فتح الفترة المالية')
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
    onError: () => {
      toast.error('فشل في قفل الفترة المالية')
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
    onError: () => {
      toast.error('فشل في إغلاق نهاية السنة')
    },
  })
}

// ==================== RECURRING TRANSACTIONS HOOKS ====================

export const useRecurringTransactions = (filters?: { status?: RecurringStatus; transactionType?: RecurringTransactionType }) => {
  return useQuery({
    queryKey: accountingKeys.recurringList(filters),
    queryFn: () => accountingService.getRecurringTransactions(filters),
  })
}

export const useUpcomingRecurring = () => {
  return useQuery({
    queryKey: accountingKeys.recurringUpcoming(),
    queryFn: accountingService.getUpcomingRecurring,
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
    onError: () => {
      toast.error('فشل في إنشاء المعاملة المتكررة')
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
    onError: () => {
      toast.error('فشل في تحديث المعاملة المتكررة')
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
    onError: () => {
      toast.error('فشل في إيقاف المعاملة المتكررة')
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
    onError: () => {
      toast.error('فشل في استئناف المعاملة المتكررة')
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
    onError: () => {
      toast.error('فشل في إلغاء المعاملة المتكررة')
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
    onError: () => {
      toast.error('فشل في إنشاء المعاملة')
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
    onError: () => {
      toast.error('فشل في حذف المعاملة المتكررة')
    },
  })
}

// ==================== PRICE LEVELS HOOKS ====================

export const usePriceLevels = () => {
  return useQuery({
    queryKey: accountingKeys.priceLevelsList(),
    queryFn: accountingService.getPriceLevels,
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
    onError: () => {
      toast.error('فشل في إنشاء مستوى السعر')
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
    onError: () => {
      toast.error('فشل في تحديث مستوى السعر')
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
    onError: () => {
      toast.error('فشل في حذف مستوى السعر')
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
    onError: () => {
      toast.error('فشل في تعيين المستوى الافتراضي')
    },
  })
}

// ==================== BILLS HOOKS ====================

export const useBills = (filters?: BillFilters) => {
  return useQuery({
    queryKey: accountingKeys.billsList(filters),
    queryFn: () => accountingService.getBills(filters),
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
    onError: () => {
      toast.error('فشل في إنشاء الفاتورة')
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
    onError: () => {
      toast.error('فشل في تحديث الفاتورة')
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
    onError: () => {
      toast.error('فشل في اعتماد الفاتورة')
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
    onError: () => {
      toast.error('فشل في تسجيل الدفع')
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
    onError: () => {
      toast.error('فشل في ترحيل الفاتورة')
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
    onError: () => {
      toast.error('فشل في حذف الفاتورة')
    },
  })
}

// ==================== DEBIT NOTES HOOKS ====================

export const useDebitNotes = (filters?: DebitNoteFilters) => {
  return useQuery({
    queryKey: accountingKeys.debitNotesList(filters),
    queryFn: () => accountingService.getDebitNotes(filters),
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
    onError: () => {
      toast.error('فشل في إنشاء إشعار الخصم')
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
    onError: () => {
      toast.error('فشل في تحديث إشعار الخصم')
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
    onError: () => {
      toast.error('فشل في اعتماد إشعار الخصم')
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
    onError: () => {
      toast.error('فشل في تطبيق إشعار الخصم')
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
    onError: () => {
      toast.error('فشل في إلغاء إشعار الخصم')
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
    onError: () => {
      toast.error('فشل في حذف إشعار الخصم')
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
    onError: () => {
      toast.error('فشل في تصدير إشعارات الخصم')
    },
  })
}

// ==================== VENDORS HOOKS ====================

export const useVendors = (filters?: VendorFilters) => {
  return useQuery({
    queryKey: accountingKeys.vendorsList(filters),
    queryFn: () => accountingService.getVendors(filters),
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
    onError: () => {
      toast.error('فشل في إنشاء المورد')
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
    onError: () => {
      toast.error('فشل في تحديث المورد')
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
    onError: () => {
      toast.error('فشل في حذف المورد')
    },
  })
}

// ==================== RETAINERS HOOKS ====================

export const useRetainers = (filters?: { clientId?: string; status?: RetainerStatus }) => {
  return useQuery({
    queryKey: accountingKeys.retainersList(filters),
    queryFn: () => accountingService.getRetainers(filters),
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
    onError: () => {
      toast.error('فشل في إنشاء حساب الأمانة')
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
    onError: () => {
      toast.error('فشل في إيداع المبلغ')
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
    onError: () => {
      toast.error('فشل في السحب من حساب الأمانة')
    },
  })
}

// ==================== LEADS HOOKS ====================

export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: accountingKeys.leadsList(filters),
    queryFn: () => accountingService.getLeads(filters),
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
    onError: () => {
      toast.error('فشل في إنشاء العميل المحتمل')
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
    onError: () => {
      toast.error('فشل في تحديث العميل المحتمل')
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
    onError: () => {
      toast.error('فشل في حذف العميل المحتمل')
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
    onError: () => {
      toast.error('فشل في تحويل العميل المحتمل')
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
    onError: () => {
      toast.error('فشل في تحديث مرحلة العميل المحتمل')
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
    onError: () => {
      toast.error('فشل في إضافة النشاط')
    },
  })
}

// ==================== REPORTS HOOKS ====================

export const useProfitLossReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: accountingKeys.profitLoss(startDate, endDate),
    queryFn: () => accountingService.getProfitLossReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

export const useBalanceSheetReport = (asOfDate?: string) => {
  return useQuery({
    queryKey: accountingKeys.balanceSheet(asOfDate),
    queryFn: () => accountingService.getBalanceSheetReport(asOfDate),
  })
}

export const useTrialBalanceReport = (asOfDate?: string) => {
  return useQuery({
    queryKey: accountingKeys.trialBalance(asOfDate),
    queryFn: () => accountingService.getTrialBalanceReport(asOfDate),
  })
}

export const useARAgingReport = () => {
  return useQuery({
    queryKey: accountingKeys.arAging(),
    queryFn: accountingService.getARAgingReport,
  })
}

export const useCaseProfitabilityReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: accountingKeys.caseProfitability(startDate, endDate),
    queryFn: () => accountingService.getCaseProfitabilityReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
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
    onError: () => {
      toast.error('فشل في ترحيل الفاتورة')
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
    onError: () => {
      toast.error('فشل في تسجيل الدفع')
    },
  })
}
