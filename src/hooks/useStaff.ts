import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import lawyersService, { type LawyerFilters } from '@/services/lawyersService'
import apiClient, { handleApiError } from '@/lib/api'
import { toast } from 'sonner'
import { useAuthStore, selectFirmId } from '@/stores/auth-store'
import firmService from '@/services/firmService'

// Extended Staff interfaces for CRUD operations
export interface CreateStaffData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'owner' | 'admin' | 'partner' | 'lawyer' | 'paralegal' | 'secretary' | 'accountant' | 'departed'
  specialization?: string
  status?: 'active' | 'departed' | 'suspended' | 'pending' | 'pending_approval'
}

// Invitation data interface
export interface InviteStaffData {
  email: string
  firstName: string
  lastName: string
  role: string
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

export const useStaff = (filters?: LawyerFilters & { showDeparted?: boolean }) => {
  const firmId = useAuthStore(selectFirmId)

  return useQuery({
    queryKey: ['staff', firmId, filters],
    queryFn: async () => {
      if (!firmId) {
        if (import.meta.env.DEV) {
          console.warn('[useStaff] No firmId found, falling back to lawyers endpoint')
        }
        return lawyersService.getAll(filters)
      }
      // Use firm team endpoint to get only firm members
      const result = await firmService.getTeamMembers(firmId, { showDeparted: filters?.showDeparted })
      let members = result.members || []

      // Apply filters if provided
      if (filters?.role) {
        members = members.filter((m: any) => m.role === filters.role)
      }
      if (filters?.status) {
        members = members.filter((m: any) => m.status === filters.status)
      }
      if (filters?.search) {
        const search = filters.search.toLowerCase()
        members = members.filter((m: any) =>
          m.email?.toLowerCase().includes(search) ||
          m.firstName?.toLowerCase().includes(search) ||
          m.lastName?.toLowerCase().includes(search)
        )
      }
      return members
    },
    enabled: !!firmId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

export const useStaffMember = (staffId: string) => {
  return useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => lawyersService.getById(staffId),
    enabled: !!staffId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

export const useTeamMembers = (isEnabled = true) => {
  return useQuery({
    queryKey: ['staff', 'team'],
    queryFn: () => lawyersService.getTeamMembers(),
    staleTime: CACHE_TIMES.MEDIUM,
    enabled: isEnabled, // Allow deferred loading for performance
  })
}

export const useCreateStaff = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateStaffData) => staffService.createStaff(data),
    onSuccess: (data) => {
      toast.success('Team member added successfully | تم إضافة عضو الفريق بنجاح')
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ['staff'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add team member | فشل إضافة عضو الفريق')
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
      toast.success('Team member updated successfully | تم تحديث بيانات عضو الفريق بنجاح')
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
      toast.error(error.message || 'Failed to update team member | فشل تحديث بيانات عضو الفريق')
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
      toast.success('Team member deleted successfully | تم حذف عضو الفريق بنجاح')
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
      toast.error(error.message || 'Failed to delete team member | فشل حذف عضو الفريق')
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
      toast.success('Team members deleted successfully | تم حذف أعضاء الفريق بنجاح')
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
      toast.error(error.message || 'Failed to delete team members | فشل حذف أعضاء الفريق')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' })
    },
  })
}

/**
 * Hook to invite a new staff member to the firm
 * Sends invitation email with code that they use during sign up
 */
export const useInviteStaff = () => {
  const queryClient = useQueryClient()
  const firmId = useAuthStore(selectFirmId)

  return useMutation({
    mutationFn: async (data: InviteStaffData) => {
      if (!firmId) {
        throw new Error('Firm ID not found | لم يتم العثور على معرف المكتب')
      }
      return firmService.inviteTeamMember(firmId, data)
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully | تم إرسال الدعوة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation | فشل إرسال الدعوة')
    },
    onSettled: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: ['staff'], refetchType: 'all' })
    },
  })
}
