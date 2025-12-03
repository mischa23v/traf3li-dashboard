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
    onSuccess: () => {
      toast.success('تم إنشاء المستخدم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء المستخدم')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserData }) =>
      usersService.updateUser(userId, data),
    onSuccess: () => {
      toast.success('تم تحديث المستخدم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المستخدم')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      await queryClient.invalidateQueries({ queryKey: ['users', variables.userId] })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => usersService.deleteUser(userId),
    onSuccess: () => {
      toast.success('تم حذف المستخدم بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المستخدم')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export const useDeleteMultipleUsers = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userIds: string[]) => usersService.deleteMultipleUsers(userIds),
    onSuccess: () => {
      toast.success('تم حذف المستخدمين بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المستخدمين')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
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
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
