/**
 * Email Settings Hooks
 * TanStack Query hooks for email settings operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import emailSettingsService, {
  UpdateSmtpConfigData,
  TestSmtpConnectionData,
  TestEmailData,
  CreateEmailSignatureData,
  CreateEmailTemplateData,
  UpdateEmailTemplateData,
} from '@/services/emailSettingsService'

// ==================== SMTP CONFIGURATION ====================

export const useSmtpConfig = () => {
  return useQuery({
    queryKey: ['smtp-config'],
    queryFn: () => emailSettingsService.getSmtpConfig(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useUpdateSmtpConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSmtpConfigData) =>
      emailSettingsService.updateSmtpConfig(data),
    onSuccess: () => {
      toast.success('تم تحديث إعدادات البريد الإلكتروني بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث إعدادات البريد الإلكتروني')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['smtp-config'] })
    },
  })
}

export const useTestSmtpConnection = () => {
  return useMutation({
    mutationFn: (data: TestSmtpConnectionData) =>
      emailSettingsService.testSmtpConnection(data),
    onSuccess: () => {
      toast.success('تم الاتصال بالخادم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل الاتصال بالخادم')
    },
  })
}

export const useSendTestEmail = () => {
  return useMutation({
    mutationFn: (data: TestEmailData) =>
      emailSettingsService.sendTestEmail(data),
    onSuccess: () => {
      toast.success('تم إرسال البريد التجريبي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال البريد التجريبي')
    },
  })
}

// ==================== EMAIL SIGNATURE ====================

export const useEmailSignatures = () => {
  return useQuery({
    queryKey: ['email-signatures'],
    queryFn: () => emailSettingsService.getEmailSignatures(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateEmailSignature = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmailSignatureData) =>
      emailSettingsService.createEmailSignature(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء التوقيع بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['email-signatures'] }, (old: any) => {
        if (!old) return old
        if (old.signatures && Array.isArray(old.signatures)) {
          return {
            ...old,
            signatures: [data, ...old.signatures]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء التوقيع')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['email-signatures'], refetchType: 'all' })
    },
  })
}

export const useUpdateEmailSignature = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmailSignatureData> }) =>
      emailSettingsService.updateEmailSignature(id, data),
    onSuccess: () => {
      toast.success('تم تحديث التوقيع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التوقيع')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['email-signatures'] })
    },
  })
}

export const useDeleteEmailSignature = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => emailSettingsService.deleteEmailSignature(id),
    onSuccess: (_, id) => {
      toast.success('تم حذف التوقيع بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['email-signatures'] }, (old: any) => {
        if (!old) return old
        if (old.signatures && Array.isArray(old.signatures)) {
          return {
            ...old,
            signatures: old.signatures.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التوقيع')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['email-signatures'], refetchType: 'all' })
    },
  })
}

export const useSetDefaultEmailSignature = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => emailSettingsService.setDefaultEmailSignature(id),
    onSuccess: () => {
      toast.success('تم تعيين التوقيع الافتراضي بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين التوقيع الافتراضي')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['email-signatures'] })
    },
  })
}

// ==================== EMAIL TEMPLATES ====================

export const useEmailTemplates = () => {
  return useQuery({
    queryKey: ['email-templates'],
    queryFn: () => emailSettingsService.getEmailTemplates(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useEmailTemplate = (id: string) => {
  return useQuery({
    queryKey: ['email-templates', id],
    queryFn: () => emailSettingsService.getEmailTemplate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEmailTemplateData) =>
      emailSettingsService.createEmailTemplate(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء القالب بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['email-templates'] }, (old: any) => {
        if (!old) return old
        if (old.templates && Array.isArray(old.templates)) {
          return {
            ...old,
            templates: [data, ...old.templates]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء القالب')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['email-templates'], refetchType: 'all' })
    },
  })
}

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplateData }) =>
      emailSettingsService.updateEmailTemplate(id, data),
    onSuccess: () => {
      toast.success('تم تحديث القالب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث القالب')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['email-templates'] })
    },
  })
}

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => emailSettingsService.deleteEmailTemplate(id),
    onSuccess: (_, id) => {
      toast.success('تم حذف القالب بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['email-templates'] }, (old: any) => {
        if (!old) return old
        if (old.templates && Array.isArray(old.templates)) {
          return {
            ...old,
            templates: old.templates.filter((item: any) => item._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف القالب')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['email-templates'], refetchType: 'all' })
    },
  })
}

export const useToggleEmailTemplateStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => emailSettingsService.toggleEmailTemplateStatus(id),
    onSuccess: () => {
      toast.success('تم تحديث حالة القالب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة القالب')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['email-templates'] })
    },
  })
}
