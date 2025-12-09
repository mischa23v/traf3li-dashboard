/**
 * Financial Reports Hooks
 * TanStack Query hooks for financial reporting
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { accountingService } from '@/services/accountingService'
import { accountKeys } from './useAccounts'

// ==================== QUERY KEYS ====================

export const reportKeys = {
  all: ['accounting'] as const,
  reports: () => [...reportKeys.all, 'reports'] as const,
  profitLoss: (startDate: string, endDate: string) => [...reportKeys.reports(), 'profit-loss', startDate, endDate] as const,
  balanceSheet: (asOfDate?: string) => [...reportKeys.reports(), 'balance-sheet', asOfDate] as const,
  trialBalance: (asOfDate?: string) => [...reportKeys.reports(), 'trial-balance', asOfDate] as const,
  arAging: () => [...reportKeys.reports(), 'ar-aging'] as const,
  caseProfitability: (startDate: string, endDate: string) => [...reportKeys.reports(), 'case-profitability', startDate, endDate] as const,
}

// ==================== FINANCIAL REPORT HOOKS ====================

/**
 * Fetch profit and loss report for a date range
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Query result with profit and loss report data
 */
export const useProfitLossReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: reportKeys.profitLoss(startDate, endDate),
    queryFn: () => accountingService.getProfitLossReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

/**
 * Fetch balance sheet report as of a specific date
 * @param asOfDate - As-of date (ISO format), defaults to current date
 * @returns Query result with balance sheet report data
 */
export const useBalanceSheetReport = (asOfDate?: string) => {
  return useQuery({
    queryKey: reportKeys.balanceSheet(asOfDate),
    queryFn: () => accountingService.getBalanceSheetReport(asOfDate),
  })
}

/**
 * Fetch trial balance report as of a specific date
 * @param asOfDate - As-of date (ISO format), defaults to current date
 * @returns Query result with trial balance report data
 */
export const useTrialBalanceReport = (asOfDate?: string) => {
  return useQuery({
    queryKey: reportKeys.trialBalance(asOfDate),
    queryFn: () => accountingService.getTrialBalanceReport(asOfDate),
  })
}

/**
 * Fetch accounts receivable aging report
 * @returns Query result with AR aging report data
 */
export const useARAgingReport = () => {
  return useQuery({
    queryKey: reportKeys.arAging(),
    queryFn: accountingService.getARAgingReport,
  })
}

/**
 * Fetch case profitability report for a date range
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Query result with case profitability report data
 */
export const useCaseProfitabilityReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: reportKeys.caseProfitability(startDate, endDate),
    queryFn: () => accountingService.getCaseProfitabilityReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

// ==================== INVOICE GL INTEGRATION HOOKS ====================

/**
 * Post an invoice to the general ledger
 * @returns Mutation for posting invoice to GL
 */
export const usePostInvoiceToGL = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invoiceId: string) => accountingService.postInvoiceToGL(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: accountKeys.glEntries() })
      toast.success('تم ترحيل الفاتورة للقيود')
    },
    onError: () => {
      toast.error('فشل في ترحيل الفاتورة')
    },
  })
}

/**
 * Record a payment for an invoice and post to GL
 * @returns Mutation for recording invoice payment
 */
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
      queryClient.invalidateQueries({ queryKey: accountKeys.glEntries() })
      toast.success('تم تسجيل الدفع وترحيله للقيود')
    },
    onError: () => {
      toast.error('فشل في تسجيل الدفع')
    },
  })
}
