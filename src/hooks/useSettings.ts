import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import settingsService, {
  UpdateAccountSettings,
  UpdateAppearanceSettings,
  UpdateDisplaySettings,
  UpdateNotificationSettings,
} from '@/services/settingsService'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useUpdateAccountSettings = () => {
  return useMutation({
    mutationFn: (data: UpdateAccountSettings) =>
      settingsService.updateAccountSettings(data),
    onSuccess: () => {
      toast.success('Account settings updated successfully | تم تحديث إعدادات الحساب بنجاح')
    },
    onError: (error: Error) => {
      // Error message is already bilingual from the service
      toast.error(error.message)
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.settings.all()
    },
  })
}

export const useUpdateAppearanceSettings = () => {
  return useMutation({
    mutationFn: (data: UpdateAppearanceSettings) =>
      settingsService.updateAppearanceSettings(data),
    onSuccess: () => {
      toast.success('Appearance settings updated successfully | تم تحديث إعدادات المظهر بنجاح')
    },
    onError: (error: Error) => {
      // Error message is already bilingual from the service
      toast.error(error.message)
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.settings.all()
    },
  })
}

export const useUpdateDisplaySettings = () => {
  return useMutation({
    mutationFn: (data: UpdateDisplaySettings) =>
      settingsService.updateDisplaySettings(data),
    onSuccess: () => {
      toast.success('Display settings updated successfully | تم تحديث إعدادات العرض بنجاح')
    },
    onError: (error: Error) => {
      // Error message is already bilingual from the service
      toast.error(error.message)
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.settings.all()
    },
  })
}

export const useUpdateNotificationSettings = () => {
  return useMutation({
    mutationFn: (data: UpdateNotificationSettings) =>
      settingsService.updateNotificationSettings(data),
    onSuccess: () => {
      toast.success('Notification settings updated successfully | تم تحديث إعدادات الإشعارات بنجاح')
    },
    onError: (error: Error) => {
      // Error message is already bilingual from the service
      toast.error(error.message)
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await invalidateCache.settings.all()
    },
  })
}
