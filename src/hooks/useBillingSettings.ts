/**
 * Billing Settings Hooks
 * TanStack Query hooks for billing settings operations
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
import billingSettingsService, {
  UpdateCompanySettingsData,
  CreateTaxData,
  CreatePaymentModeData,
  UpdateFinanceSettingsData,
} from '@/services/billingSettingsService'
import paymentTermsService, {
  CreatePaymentTermsData,
  UpdatePaymentTermsData,
} from '@/services/paymentTermsService'

// ==================== COMPANY SETTINGS ====================

export const useCompanySettings = () => {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: () => billingSettingsService.getCompanySettings(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

export const useUpdateCompanySettings = () => {
  return useMutation({
    mutationFn: (data: UpdateCompanySettingsData) =>
      billingSettingsService.updateCompanySettings(data),
    onSuccess: () => {
      toast.success('تم تحديث إعدادات الشركة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إعدادات الشركة')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.companySettings()
    },
  })
}

export const useUpdateCompanyLogo = () => {
  return useMutation({
    mutationFn: (file: File) => billingSettingsService.updateCompanyLogo(file),
    onSuccess: () => {
      toast.success('تم تحديث شعار الشركة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث شعار الشركة')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.companySettings()
    },
  })
}

// ==================== TAXES ====================

export const useTaxes = () => {
  return useQuery({
    queryKey: ['taxes'],
    queryFn: () => billingSettingsService.getTaxes(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

export const useCreateTax = () => {
  return useMutation({
    mutationFn: (data: CreateTaxData) => billingSettingsService.createTax(data),
    onSuccess: () => {
      toast.success('تم إنشاء الضريبة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الضريبة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.billingSettings.taxes()
    },
  })
}

export const useUpdateTax = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaxData> }) =>
      billingSettingsService.updateTax(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الضريبة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الضريبة')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.taxesLight()
    },
  })
}

export const useDeleteTax = () => {
  return useMutation({
    mutationFn: (id: string) => billingSettingsService.deleteTax(id),
    onSuccess: () => {
      toast.success('تم حذف الضريبة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الضريبة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.billingSettings.taxes()
    },
  })
}

export const useSetDefaultTax = () => {
  return useMutation({
    mutationFn: (id: string) => billingSettingsService.setDefaultTax(id),
    onSuccess: () => {
      toast.success('تم تعيين الضريبة الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين الضريبة الافتراضية')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.taxesLight()
    },
  })
}

// ==================== PAYMENT MODES ====================

export const usePaymentModes = () => {
  return useQuery({
    queryKey: ['payment-modes'],
    queryFn: () => billingSettingsService.getPaymentModes(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

export const useCreatePaymentMode = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentModeData) =>
      billingSettingsService.createPaymentMode(data),
    onSuccess: () => {
      toast.success('تم إنشاء طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء طريقة الدفع')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.billingSettings.paymentModes()
    },
  })
}

export const useUpdatePaymentMode = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePaymentModeData> }) =>
      billingSettingsService.updatePaymentMode(id, data),
    onSuccess: () => {
      toast.success('تم تحديث طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث طريقة الدفع')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.paymentModesLight()
    },
  })
}

export const useDeletePaymentMode = () => {
  return useMutation({
    mutationFn: (id: string) => billingSettingsService.deletePaymentMode(id),
    onSuccess: () => {
      toast.success('تم حذف طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف طريقة الدفع')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.billingSettings.paymentModes()
    },
  })
}

export const useSetDefaultPaymentMode = () => {
  return useMutation({
    mutationFn: (id: string) => billingSettingsService.setDefaultPaymentMode(id),
    onSuccess: () => {
      toast.success('تم تعيين طريقة الدفع الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين طريقة الدفع الافتراضية')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.paymentModesLight()
    },
  })
}

// ==================== FINANCE SETTINGS ====================

export const useFinanceSettings = () => {
  return useQuery({
    queryKey: ['finance-settings'],
    queryFn: () => billingSettingsService.getFinanceSettings(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

export const useUpdateFinanceSettings = () => {
  return useMutation({
    mutationFn: (data: UpdateFinanceSettingsData) =>
      billingSettingsService.updateFinanceSettings(data),
    onSuccess: () => {
      toast.success('تم تحديث الإعدادات المالية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الإعدادات المالية')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.financeSettings()
    },
  })
}

// ==================== PAYMENT TERMS ====================

export const usePaymentTerms = () => {
  return useQuery({
    queryKey: ['payment-terms'],
    queryFn: () => paymentTermsService.getPaymentTerms(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

export const usePaymentTerm = (id: string) => {
  return useQuery({
    queryKey: ['payment-terms', id],
    queryFn: () => paymentTermsService.getPaymentTerm(id),
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

export const useCreatePaymentTerms = () => {
  return useMutation({
    mutationFn: (data: CreatePaymentTermsData) =>
      paymentTermsService.createPaymentTerms(data),
    onSuccess: () => {
      toast.success('تم إنشاء شروط الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء شروط الدفع')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.billingSettings.paymentTerms()
    },
  })
}

export const useUpdatePaymentTerms = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentTermsData }) =>
      paymentTermsService.updatePaymentTerms(id, data),
    onSuccess: () => {
      toast.success('تم تحديث شروط الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث شروط الدفع')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.paymentTermsLight()
    },
  })
}

export const useDeletePaymentTerms = () => {
  return useMutation({
    mutationFn: (id: string) => paymentTermsService.deletePaymentTerms(id),
    onSuccess: () => {
      toast.success('تم حذف شروط الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف شروط الدفع')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.billingSettings.paymentTerms()
    },
  })
}

export const useSetDefaultPaymentTerms = () => {
  return useMutation({
    mutationFn: (id: string) => paymentTermsService.setDefaultPaymentTerms(id),
    onSuccess: () => {
      toast.success('تم تعيين شروط الدفع الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين شروط الدفع الافتراضية')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.paymentTermsLight()
    },
  })
}

export const useInitializePaymentTermsTemplates = () => {
  return useMutation({
    mutationFn: () => paymentTermsService.initializeTemplates(),
    onSuccess: () => {
      toast.success('تم تهيئة القوالب الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تهيئة القوالب')
    },
    onSettled: async () => {
      await invalidateCache.billingSettings.paymentTermsLight()
    },
  })
}
