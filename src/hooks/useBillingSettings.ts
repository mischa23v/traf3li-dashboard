/**
 * Billing Settings Hooks
 * TanStack Query hooks for billing settings operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import billingSettingsService, {
  type UpdateCompanySettingsData,
  type CreateTaxData,
  type CreatePaymentModeData,
  type UpdateFinanceSettingsData,
} from '@/services/billingSettingsService'

// ==================== COMPANY SETTINGS ====================

export const useCompanySettings = () => {
  return useQuery({
    queryKey: ['company-settings'],
    queryFn: () => billingSettingsService.getCompanySettings(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpdateCompanySettings = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['company-settings'] })
    },
  })
}

export const useUpdateCompanyLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => billingSettingsService.updateCompanyLogo(file),
    onSuccess: () => {
      toast.success('تم تحديث شعار الشركة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث شعار الشركة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['company-settings'] })
    },
  })
}

// ==================== TAXES ====================

export const useTaxes = () => {
  return useQuery({
    queryKey: ['taxes'],
    queryFn: () => billingSettingsService.getTaxes(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaxData) => billingSettingsService.createTax(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء الضريبة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['taxes'] }, (old: any) => {
        if (!old) return old
        // Handle { taxes: [...] } structure
        if (old.taxes && Array.isArray(old.taxes)) {
          return {
            ...old,
            taxes: [data, ...old.taxes]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الضريبة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['taxes'], refetchType: 'all' })
    },
  })
}

export const useUpdateTax = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

export const useDeleteTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.deleteTax(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف الضريبة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['taxes'] }, (old: any) => {
        if (!old) return old
        // Handle { taxes: [...] } structure
        if (old.taxes && Array.isArray(old.taxes)) {
          return {
            ...old,
            taxes: old.taxes.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الضريبة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['taxes'], refetchType: 'all' })
    },
  })
}

export const useSetDefaultTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.setDefaultTax(id),
    onSuccess: () => {
      toast.success('تم تعيين الضريبة الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين الضريبة الافتراضية')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['taxes'] })
    },
  })
}

// ==================== PAYMENT MODES ====================

export const usePaymentModes = () => {
  return useQuery({
    queryKey: ['payment-modes'],
    queryFn: () => billingSettingsService.getPaymentModes(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreatePaymentMode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePaymentModeData) =>
      billingSettingsService.createPaymentMode(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء طريقة الدفع بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['payment-modes'] }, (old: any) => {
        if (!old) return old
        // Handle { paymentModes: [...] } structure
        if (old.paymentModes && Array.isArray(old.paymentModes)) {
          return {
            ...old,
            paymentModes: [data, ...old.paymentModes]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء طريقة الدفع')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['payment-modes'], refetchType: 'all' })
    },
  })
}

export const useUpdatePaymentMode = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
    },
  })
}

export const useDeletePaymentMode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.deletePaymentMode(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success('تم حذف طريقة الدفع بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['payment-modes'] }, (old: any) => {
        if (!old) return old
        // Handle { paymentModes: [...] } structure
        if (old.paymentModes && Array.isArray(old.paymentModes)) {
          return {
            ...old,
            paymentModes: old.paymentModes.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف طريقة الدفع')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['payment-modes'], refetchType: 'all' })
    },
  })
}

export const useSetDefaultPaymentMode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.setDefaultPaymentMode(id),
    onSuccess: () => {
      toast.success('تم تعيين طريقة الدفع الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين طريقة الدفع الافتراضية')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
    },
  })
}

// ==================== FINANCE SETTINGS ====================

export const useFinanceSettings = () => {
  return useQuery({
    queryKey: ['finance-settings'],
    queryFn: () => billingSettingsService.getFinanceSettings(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpdateFinanceSettings = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['finance-settings'] })
    },
  })
}
