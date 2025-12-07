import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import lawyersService, { type LawyerFilters } from '@/services/lawyersService'
import apiClient, { handleApiError } from '@/lib/api'
import { toast } from 'sonner'

// Extended Staff interfaces for CRUD operations
export interface CreateStaffData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'admin' | 'lawyer' | 'paralegal' | 'assistant'
  specialization?: string
  status?: 'active' | 'inactive'
}

export interface UpdateStaffData extends Partial<CreateStaffData> { }

// Staff service extensions (for CRUD operations)
const staffService = {
  createStaff: async (data: CreateStaffData) => {
    try {
      const response = await apiClient.post('/lawyers', data)
      return response.data.lawyer || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  updateStaff: async (id: string, data: UpdateStaffData) => {
    try {
      const response = await apiClient.put(`/lawyers/${id}`, data)
      return response.data.lawyer || response.data.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  deleteStaff: async (id: string) => {
    try {
      await apiClient.delete(`/lawyers/${id}`)
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },

  bulkDeleteStaff: async (ids: string[]) => {
    try {
      const response = await apiClient.delete('/lawyers/bulk', {
        data: { ids },
      })
      return response.data
    } catch (error: any) {
      throw new Error(handleApiError(error))
    }
  },
}

export const useStaff = (filters?: LawyerFilters) => {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: () => lawyersService.getAll(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useStaffMember = (staffId: string) => {
  return useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => lawyersService.getById(staffId),
    enabled: !!staffId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['staff', 'team'],
    queryFn: () => lawyersService.getTeamMembers(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStaffData) => staffService.createStaff(data),
    onSuccess: (data) => {
      toast.success('تم إضافة عضو الفريق بنجاح')
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['staff'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة عضو الفريق')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' })
    },
  })
}

export const useUpdateStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      staffId,
      data,
    }: {
      staffId: string
      data: UpdateStaffData
    }) => staffService.updateStaff(staffId, data),
    onSuccess: (data) => {
      toast.success('تم تحديث بيانات عضو الفريق بنجاح')
      // Update specific staff member in cache
      queryClient.setQueryData(['staff', data.id], data)
      // Update list cache
      queryClient.setQueriesData({ queryKey: ['staff'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((item: any) => (item.id === data.id ? data : item))
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث بيانات عضو الفريق')
    },
    onSettled: async (_, __, variables) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' })
      await queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId], refetchType: 'all' })
    },
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffId: string) => staffService.deleteStaff(staffId),
    onSuccess: (_, staffId) => {
      toast.success('تم حذف عضو الفريق بنجاح')
      // Remove from cache
      queryClient.setQueriesData({ queryKey: ['staff'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.filter((item: any) => item.id !== staffId)
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف عضو الفريق')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' })
    },
  })
}

export const useBulkDeleteStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffIds: string[]) => staffService.bulkDeleteStaff(staffIds),
    onSuccess: (_, staffIds) => {
      toast.success('تم حذف أعضاء الفريق بنجاح')
      // Remove from cache
      queryClient.setQueriesData({ queryKey: ['staff'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.filter((item: any) => !staffIds.includes(item.id))
        }
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف أعضاء الفريق')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' })
    },
  })
}
