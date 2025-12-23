import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import settingsService, {
  UpdateAccountSettings,
  UpdateAppearanceSettings,
  UpdateDisplaySettings,
  UpdateNotificationSettings,
} from '@/services/settingsService'
import { toast } from 'sonner'

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['settings'], refetchType: 'all' })
    },
  })
}

export const useUpdateAppearanceSettings = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['settings'], refetchType: 'all' })
    },
  })
}

export const useUpdateDisplaySettings = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['settings'], refetchType: 'all' })
    },
  })
}

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient()

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
      await queryClient.invalidateQueries({ queryKey: ['settings'], refetchType: 'all' })
    },
  })
}
