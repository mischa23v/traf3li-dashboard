/**
 * Users Hooks
 * React Query hooks for user management matching backend user.route.js
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import usersService, {
  GetLawyersParams,
  GetUsersParams,
  UpdateUserProfileData,
  PushSubscriptionData,
  NotificationPreferences,
  ConvertToFirmData,
} from '@/services/usersService'
import { toast } from 'sonner'

// ==================== QUERY KEYS ====================

export const userKeys = {
  all: ['users'] as const,
  list: (params?: GetUsersParams) => [...userKeys.all, 'list', params] as const,
  lawyers: (params?: GetLawyersParams) => [...userKeys.all, 'lawyers', params] as const,
  team: () => [...userKeys.all, 'team'] as const,
  profile: (userId: string) => [...userKeys.all, 'profile', userId] as const,
  lawyerProfile: (username: string) => [...userKeys.all, 'lawyer', username] as const,
  vapidKey: () => [...userKeys.all, 'vapid-key'] as const,
  pushSubscription: () => [...userKeys.all, 'push-subscription'] as const,
  notificationPreferences: () => [...userKeys.all, 'notification-preferences'] as const,
}

// ==================== ADMIN USER MANAGEMENT HOOKS ====================

/**
 * Hook to fetch users with pagination and filters (admin/internal)
 */
export const useUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ==================== LAWYER HOOKS ====================

/**
 * Hook to fetch all lawyers with filters (public)
 */
export const useLawyers = (params?: GetLawyersParams) => {
  return useQuery({
    queryKey: userKeys.lawyers(params),
    queryFn: () => usersService.getLawyers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch team members (protected)
 * @param isEnabled - Optional flag to defer loading (defaults to true)
 */
export const useTeamMembers = (isEnabled = true) => {
  return useQuery({
    queryKey: userKeys.team(),
    queryFn: () => usersService.getTeamMembers(),
    staleTime: 2 * 60 * 1000,
    enabled: isEnabled, // Allow deferred loading for performance
  })
}

/**
 * Hook to fetch user profile by ID (public)
 */
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: userKeys.profile(userId),
    queryFn: () => usersService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch lawyer profile by username (public)
 */
export const useLawyerProfile = (username: string) => {
  return useQuery({
    queryKey: userKeys.lawyerProfile(username),
    queryFn: () => usersService.getLawyerProfile(username),
    enabled: !!username,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to update user profile (protected)
 */
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserProfileData }) =>
      usersService.updateUserProfile(userId, data),
    onSuccess: (data, variables) => {
      toast.success('تم تحديث الملف الشخصي بنجاح')
      queryClient.setQueryData(userKeys.profile(variables.userId), data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الملف الشخصي')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.profile(variables.userId) })
      await queryClient.invalidateQueries({ queryKey: userKeys.lawyers() })
    },
  })
}

/**
 * Hook to delete user account (protected)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersService.deleteUser(userId),
    onSuccess: () => {
      toast.success('تم حذف الحساب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الحساب')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

// ==================== PUSH NOTIFICATION HOOKS ====================

/**
 * Hook to fetch VAPID public key (public)
 */
export const useVapidPublicKey = () => {
  return useQuery({
    queryKey: userKeys.vapidKey(),
    queryFn: () => usersService.getVapidPublicKey(),
    staleTime: Infinity, // Public key rarely changes
  })
}

/**
 * Hook to fetch push subscription status (protected)
 */
export const usePushSubscriptionStatus = () => {
  return useQuery({
    queryKey: userKeys.pushSubscription(),
    queryFn: () => usersService.getPushSubscriptionStatus(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to save push subscription (protected)
 */
export const useSavePushSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subscription: PushSubscriptionData) =>
      usersService.savePushSubscription(subscription),
    onSuccess: () => {
      toast.success('تم تفعيل الإشعارات بنجاح')
      queryClient.invalidateQueries({ queryKey: userKeys.pushSubscription() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفعيل الإشعارات')
    },
  })
}

/**
 * Hook to delete push subscription (protected)
 */
export const useDeletePushSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => usersService.deletePushSubscription(),
    onSuccess: () => {
      toast.success('تم إلغاء الإشعارات بنجاح')
      queryClient.invalidateQueries({ queryKey: userKeys.pushSubscription() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الإشعارات')
    },
  })
}

/**
 * Hook to fetch notification preferences (protected)
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: userKeys.notificationPreferences(),
    queryFn: () => usersService.getNotificationPreferences(),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to update notification preferences (protected)
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (preferences: NotificationPreferences) =>
      usersService.updateNotificationPreferences(preferences),
    onSuccess: () => {
      toast.success('تم تحديث تفضيلات الإشعارات بنجاح')
      queryClient.invalidateQueries({ queryKey: userKeys.notificationPreferences() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث تفضيلات الإشعارات')
    },
  })
}

// ==================== FIRM CONVERSION HOOKS ====================

/**
 * Hook to convert solo lawyer to firm owner (protected)
 */
export const useConvertToFirm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ConvertToFirmData) => usersService.convertToFirm(data),
    onSuccess: () => {
      toast.success('تم تحويل الحساب إلى مكتب بنجاح')
      // Invalidate all user-related queries as the user structure changed
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحويل الحساب إلى مكتب')
    },
  })
}
