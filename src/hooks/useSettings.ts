import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import settingsService, {
  UpdateAccountSettings,
  UpdateAppearanceSettings,
  UpdateDisplaySettings,
  UpdateNotificationSettings,
} from '@/services/settingsService'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useUpdateAccountSettings = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: UpdateAccountSettings) =>
      settingsService.updateAccountSettings(data),
    onSuccess: () => {
      toast.success(t('toast.settings.accountSettingsUpdated'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast.settings.accountSettingsUpdateFailed'))
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: UpdateAppearanceSettings) =>
      settingsService.updateAppearanceSettings(data),
    onSuccess: () => {
      toast.success(t('toast.settings.appearanceSettingsUpdated'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast.settings.appearanceSettingsUpdateFailed'))
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: UpdateDisplaySettings) =>
      settingsService.updateDisplaySettings(data),
    onSuccess: () => {
      toast.success(t('toast.settings.displaySettingsUpdated'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast.settings.displaySettingsUpdateFailed'))
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: UpdateNotificationSettings) =>
      settingsService.updateNotificationSettings(data),
    onSuccess: () => {
      toast.success(t('toast.settings.notificationSettingsUpdated'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('toast.settings.notificationSettingsUpdateFailed'))
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['settings'], refetchType: 'all' })
    },
  })
}
