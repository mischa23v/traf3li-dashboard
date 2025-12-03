import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import usersService, {
  GetUsersParams,
  CreateUserData,
  UpdateUserData,
} from '@/services/usersService'
import { toast } from 'sonner'

export const useUsers = (params?: GetUsersParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersService.getUsers(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => usersService.getUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserData) => usersService.createUser(data),
    onSuccess: (data) => {
      toast.success('تم إنشاء المستخدم بنجاح')
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['users'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المستخدم')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      usersService.updateUser(userId, data),
    onSuccess: (data) => {
      toast.success('تم تحديث المستخدم بنجاح')
      // Update specific user in cache
      queryClient.setQueryData(['users', data.id], data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: ['users'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item.id === data.id ? data : item))
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المستخدم')
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['users', variables.userId], refetchType: 'all' })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersService.deleteUser(userId),
    onSuccess: (_, userId) => {
      toast.success('تم حذف المستخدم بنجاح')
      // Remove from cache
      queryClient.setQueriesData({ queryKey: ['users'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.filter((item: any) => item.id !== userId)
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المستخدم')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' })
    },
  })
}

export const useDeleteMultipleUsers = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userIds: string[]) => usersService.deleteMultipleUsers(userIds),
    onSuccess: (_, userIds) => {
      toast.success('تم حذف المستخدمين بنجاح')
      // Remove from cache
      queryClient.setQueriesData({ queryKey: ['users'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.filter((item: any) => !userIds.includes(item.id))
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المستخدمين')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' })
    },
  })
}

export const useInviteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      usersService.inviteUser(email, role),
    onSuccess: () => {
      toast.success('تم إرسال الدعوة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إرسال الدعوة')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['users'], refetchType: 'all' })
    },
  })
}
