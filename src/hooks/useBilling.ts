/**
 * Billing Hooks
 * React Query hooks for billing and subscription operations
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
import billingService, {
  type ChangePlanData,
  type CreatePaymentMethodData,
  type BillingHistoryFilters,
} from '@/services/billingService'

// ==================== SUBSCRIPTION ====================

export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => billingService.getSubscription(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
    retry: 2,
  })
}

export const useUsageMetrics = () => {
  return useQuery({
    queryKey: ['usage-metrics'],
    queryFn: () => billingService.getUsageMetrics(),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

export const useChangePlan = () => {
  return useMutation({
    mutationFn: (data: ChangePlanData) => billingService.changePlan(data),
    onSuccess: () => {
      toast.success('تم تغيير الخطة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تغيير الخطة')
    },
    onSettled: async () => {
      await Promise.all([
        invalidateCache.billing.subscription(),
        invalidateCache.billing.usageMetrics(),
        invalidateCache.billing.history(),
      ])
    },
  })
}

export const useCancelSubscription = () => {
  return useMutation({
    mutationFn: () => billingService.cancelSubscription(),
    onSuccess: () => {
      toast.success('تم إلغاء الاشتراك بنجاح. سيتم إلغاء تفعيله في نهاية الفترة الحالية')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الاشتراك')
    },
    onSettled: async () => {
      await invalidateCache.billing.subscription()
    },
  })
}

export const useReactivateSubscription = () => {
  return useMutation({
    mutationFn: () => billingService.reactivateSubscription(),
    onSuccess: () => {
      toast.success('تم إعادة تفعيل الاشتراك بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة تفعيل الاشتراك')
    },
    onSettled: async () => {
      await invalidateCache.billing.subscription()
    },
  })
}

export const useUpcomingInvoice = (planId?: string) => {
  return useQuery({
    queryKey: ['upcoming-invoice', planId],
    queryFn: () => billingService.getUpcomingInvoice(planId as any),
    enabled: !!planId,
    staleTime: CACHE_TIMES.CALENDAR.GRID, // 1 minute
  })
}

// ==================== PAYMENT METHODS ====================

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => billingService.getPaymentMethods(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useAddPaymentMethod = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentMethodData) => billingService.addPaymentMethod(data),
    onSuccess: () => {
      toast.success('تم إضافة طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة طريقة الدفع')
    },
    onSettled: async () => {
      await invalidateCache.billing.paymentMethods()
    },
  })
}

export const useSetDefaultPaymentMethod = () => {
  return useMutation({
    mutationFn: (id: string) => billingService.setDefaultPaymentMethod(id),
    onSuccess: () => {
      toast.success('تم تعيين طريقة الدفع الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين طريقة الدفع الافتراضية')
    },
    onSettled: async () => {
      await invalidateCache.billing.paymentMethods()
    },
  })
}

export const useRemovePaymentMethod = () => {
  return useMutation({
    mutationFn: (id: string) => billingService.removePaymentMethod(id),
    onSuccess: () => {
      toast.success('تم حذف طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف طريقة الدفع')
    },
    onSettled: async () => {
      await invalidateCache.billing.paymentMethods()
    },
  })
}

export const useCreateSetupIntent = () => {
  return useMutation({
    mutationFn: () => billingService.createSetupIntent(),
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء جلسة الدفع')
    },
  })
}

// ==================== BILLING HISTORY ====================

export const useBillingHistory = (filters?: BillingHistoryFilters) => {
  return useQuery({
    queryKey: ['billing-history', filters],
    queryFn: () => billingService.getBillingHistory(filters),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => billingService.getInvoice(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: (id: string) => billingService.downloadInvoice(id),
    onSuccess: (blob, id) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('تم تحميل الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحميل الفاتورة')
    },
  })
}

export const usePayInvoice = () => {
  return useMutation({
    mutationFn: (id: string) => billingService.payInvoice(id),
    onSuccess: () => {
      toast.success('تم دفع الفاتورة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل دفع الفاتورة')
    },
    onSettled: async () => {
      await Promise.all([
        invalidateCache.billing.history(),
        invalidateCache.billing.subscription(),
      ])
    },
  })
}
