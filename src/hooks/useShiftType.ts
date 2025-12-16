import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getShiftTypes,
  getShiftType,
  getShiftTypeStats,
  getDefaultShift,
  createShiftType,
  updateShiftType,
  deleteShiftType,
  bulkDeleteShiftTypes,
  setAsDefaultShift,
  activateShiftType,
  deactivateShiftType,
  cloneShiftType,
  calculateWorkingHours,
  getShiftsByDay,
  getActiveShifts,
  getRamadanShifts,
  exportShiftTypes,
  importShiftTypes,
  validateShiftTimes,
  type ShiftTypeFilters,
  type CreateShiftTypeData,
  type UpdateShiftTypeData,
  type DayOfWeek,
} from '@/services/shiftTypeService'

// Query keys
export const shiftTypeKeys = {
  all: ['shift-types'] as const,
  lists: () => [...shiftTypeKeys.all, 'list'] as const,
  list: (filters?: ShiftTypeFilters) => [...shiftTypeKeys.lists(), filters] as const,
  details: () => [...shiftTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...shiftTypeKeys.details(), id] as const,
  stats: () => [...shiftTypeKeys.all, 'stats'] as const,
  default: () => [...shiftTypeKeys.all, 'default'] as const,
  byDay: (day: DayOfWeek) => [...shiftTypeKeys.all, 'by-day', day] as const,
  active: () => [...shiftTypeKeys.all, 'active'] as const,
  ramadan: () => [...shiftTypeKeys.all, 'ramadan'] as const,
}

// Get all shift types
export const useShiftTypes = (filters?: ShiftTypeFilters) => {
  return useQuery({
    queryKey: shiftTypeKeys.list(filters),
    queryFn: () => getShiftTypes(filters),
  })
}

// Get single shift type
export const useShiftType = (shiftTypeId: string) => {
  return useQuery({
    queryKey: shiftTypeKeys.detail(shiftTypeId),
    queryFn: () => getShiftType(shiftTypeId),
    enabled: !!shiftTypeId,
  })
}

// Get stats
export const useShiftTypeStats = () => {
  return useQuery({
    queryKey: shiftTypeKeys.stats(),
    queryFn: getShiftTypeStats,
  })
}

// Get default shift
export const useDefaultShift = () => {
  return useQuery({
    queryKey: shiftTypeKeys.default(),
    queryFn: getDefaultShift,
  })
}

// Get shifts by day
export const useShiftsByDay = (day: DayOfWeek) => {
  return useQuery({
    queryKey: shiftTypeKeys.byDay(day),
    queryFn: () => getShiftsByDay(day),
    enabled: !!day,
  })
}

// Get active shifts
export const useActiveShifts = () => {
  return useQuery({
    queryKey: shiftTypeKeys.active(),
    queryFn: getActiveShifts,
  })
}

// Get Ramadan shifts
export const useRamadanShifts = () => {
  return useQuery({
    queryKey: shiftTypeKeys.ramadan(),
    queryFn: getRamadanShifts,
  })
}

// Create shift type
export const useCreateShiftType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateShiftTypeData) => createShiftType(data),
    onSuccess: () => {
      toast.success('تم إنشاء نوع الوردية بنجاح')
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء نوع الوردية')
    },
  })
}

// Update shift type
export const useUpdateShiftType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shiftTypeId, data }: { shiftTypeId: string; data: UpdateShiftTypeData }) =>
      updateShiftType(shiftTypeId, data),
    onSuccess: (_, { shiftTypeId }) => {
      toast.success('تم تحديث نوع الوردية بنجاح')
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.detail(shiftTypeId) })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث نوع الوردية')
    },
  })
}

// Delete shift type
export const useDeleteShiftType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (shiftTypeId: string) => deleteShiftType(shiftTypeId),
    onSuccess: () => {
      toast.success('تم حذف نوع الوردية بنجاح')
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف نوع الوردية')
    },
  })
}

// Bulk delete shift types
export const useBulkDeleteShiftTypes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteShiftTypes(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} نوع وردية بنجاح`)
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.stats() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.all })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف أنواع الورديات')
    },
  })
}

// Set as default
export const useSetAsDefaultShift = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (shiftTypeId: string) => setAsDefaultShift(shiftTypeId),
    onSuccess: (_, shiftTypeId) => {
      toast.success('تم تعيين الوردية الافتراضية بنجاح')
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.detail(shiftTypeId) })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.default() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين الوردية الافتراضية')
    },
  })
}

// Activate shift type
export const useActivateShiftType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (shiftTypeId: string) => activateShiftType(shiftTypeId),
    onSuccess: (_, shiftTypeId) => {
      toast.success('تم تفعيل نوع الوردية بنجاح')
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.detail(shiftTypeId) })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.active() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفعيل نوع الوردية')
    },
  })
}

// Deactivate shift type
export const useDeactivateShiftType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (shiftTypeId: string) => deactivateShiftType(shiftTypeId),
    onSuccess: (_, shiftTypeId) => {
      toast.success('تم إلغاء تفعيل نوع الوردية بنجاح')
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.detail(shiftTypeId) })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.active() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء تفعيل نوع الوردية')
    },
  })
}

// Clone shift type
export const useCloneShiftType = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ shiftTypeId, data }: { shiftTypeId: string; data?: { name?: string; nameAr?: string } }) =>
      cloneShiftType(shiftTypeId, data),
    onSuccess: () => {
      toast.success('تم نسخ نوع الوردية بنجاح')
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ نوع الوردية')
    },
  })
}

// Calculate working hours
export const useCalculateWorkingHours = () => {
  return useMutation({
    mutationFn: ({ shiftTypeId, checkIn, checkOut, date }: {
      shiftTypeId: string
      checkIn: string
      checkOut: string
      date?: string
    }) => calculateWorkingHours(shiftTypeId, checkIn, checkOut, date),
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حساب ساعات العمل')
    },
  })
}

// Validate shift times
export const useValidateShiftTimes = () => {
  return useMutation({
    mutationFn: (data: {
      startTime: string
      endTime: string
      breakStartTime?: string
      breakEndTime?: string
    }) => validateShiftTimes(data),
  })
}

// Export shift types
export const useExportShiftTypes = () => {
  return useMutation({
    mutationFn: (filters?: ShiftTypeFilters) => exportShiftTypes(filters),
    onSuccess: () => {
      toast.success('تم تصدير أنواع الورديات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير أنواع الورديات')
    },
  })
}

// Import shift types
export const useImportShiftTypes = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => importShiftTypes(file),
    onSuccess: (result) => {
      toast.success(`تم استيراد ${result.success} نوع وردية بنجاح${result.failed > 0 ? ` (فشل ${result.failed})` : ''}`)
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: shiftTypeKeys.stats() })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استيراد أنواع الورديات')
    },
  })
}
