/**
 * Billing Settings Hooks
 * TanStack Query hooks for billing settings operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import billingSettingsService, {
  UpdateCompanySettingsData,
  CreateTaxData,
  CreatePaymentModeData,
  UpdateFinanceSettingsData,
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
      queryClient.invalidateQueries({ queryKey: ['company-settings'] })
      toast.success('تم تحديث إعدادات الشركة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إعدادات الشركة')
    },
  })
}

export const useUpdateCompanyLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => billingSettingsService.updateCompanyLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] })
      toast.success('تم تحديث شعار الشركة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث شعار الشركة')
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
      toast.success('تم إنشاء الضريبة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء الضريبة')
    },
  })
}

export const useUpdateTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaxData> }) =>
      billingSettingsService.updateTax(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
      toast.success('تم تحديث الضريبة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الضريبة')
    },
  })
}

export const useDeleteTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.deleteTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
      toast.success('تم حذف الضريبة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الضريبة')
    },
  })
}

export const useSetDefaultTax = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.setDefaultTax(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxes'] })
      toast.success('تم تعيين الضريبة الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين الضريبة الافتراضية')
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
      toast.success('تم إنشاء طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء طريقة الدفع')
    },
  })
}

export const useUpdatePaymentMode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePaymentModeData> }) =>
      billingSettingsService.updatePaymentMode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
      toast.success('تم تحديث طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث طريقة الدفع')
    },
  })
}

export const useDeletePaymentMode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.deletePaymentMode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
      toast.success('تم حذف طريقة الدفع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف طريقة الدفع')
    },
  })
}

export const useSetDefaultPaymentMode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => billingSettingsService.setDefaultPaymentMode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-modes'] })
      toast.success('تم تعيين طريقة الدفع الافتراضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين طريقة الدفع الافتراضية')
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
      queryClient.invalidateQueries({ queryKey: ['finance-settings'] })
      toast.success('تم تحديث الإعدادات المالية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الإعدادات المالية')
    },
  })
}
