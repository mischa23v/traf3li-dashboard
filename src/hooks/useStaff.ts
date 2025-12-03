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

export interface UpdateStaffData extends Partial<CreateStaffData> {}

// Staff service extensions (for CRUD operations)
const staffService = {
  createStaff: async (data: CreateStaffData) => {
    try {
      const response = await apiClient.post('/lawyers', data)
      return response.data.lawyer || response.data.data
    } catch (error: any) {
      console.error('Create staff error:', error)
      throw new Error(handleApiError(error))
    }
  },

  updateStaff: async (id: string, data: UpdateStaffData) => {
    try {
      const response = await apiClient.put(`/lawyers/${id}`, data)
      return response.data.lawyer || response.data.data
    } catch (error: any) {
      console.error('Update staff error:', error)
      throw new Error(handleApiError(error))
    }
  },

  deleteStaff: async (id: string) => {
    try {
      await apiClient.delete(`/lawyers/${id}`)
    } catch (error: any) {
      console.error('Delete staff error:', error)
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
      console.error('Bulk delete staff error:', error)
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
    onSuccess: () => {
      toast.success('تم إضافة عضو الفريق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة عضو الفريق')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['staff'] })
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
    onSuccess: () => {
      toast.success('تم تحديث بيانات عضو الفريق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث بيانات عضو الفريق')
    },
    onSettled: async (_, __, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['staff'] })
      await queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] })
    },
  })
}

export const useDeleteStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffId: string) => staffService.deleteStaff(staffId),
    onSuccess: () => {
      toast.success('تم حذف عضو الفريق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف عضو الفريق')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

export const useBulkDeleteStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (staffIds: string[]) => staffService.bulkDeleteStaff(staffIds),
    onSuccess: () => {
      toast.success('تم حذف أعضاء الفريق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف أعضاء الفريق')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}
