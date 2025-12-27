import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
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

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

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
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single shift type
export const useShiftType = (shiftTypeId: string) => {
  return useQuery({
    queryKey: shiftTypeKeys.detail(shiftTypeId),
    queryFn: () => getShiftType(shiftTypeId),
    enabled: !!shiftTypeId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get stats
export const useShiftTypeStats = () => {
  return useQuery({
    queryKey: shiftTypeKeys.stats(),
    queryFn: getShiftTypeStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get default shift
export const useDefaultShift = () => {
  return useQuery({
    queryKey: shiftTypeKeys.default(),
    queryFn: getDefaultShift,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get shifts by day
export const useShiftsByDay = (day: DayOfWeek) => {
  return useQuery({
    queryKey: shiftTypeKeys.byDay(day),
    queryFn: () => getShiftsByDay(day),
    enabled: !!day,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get active shifts
export const useActiveShifts = () => {
  return useQuery({
    queryKey: shiftTypeKeys.active(),
    queryFn: getActiveShifts,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get Ramadan shifts
export const useRamadanShifts = () => {
  return useQuery({
    queryKey: shiftTypeKeys.ramadan(),
    queryFn: getRamadanShifts,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create shift type
export const useCreateShiftType = () => {
  return useMutation({
    mutationFn: (data: CreateShiftTypeData) => createShiftType(data),
    onSuccess: () => {
      toast.success('تم إنشاء نوع الوردية بنجاح')
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.stats()
      invalidateCache.shiftTypes.all()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء نوع الوردية')
    },
  })
}

// Update shift type
export const useUpdateShiftType = () => {
  return useMutation({
    mutationFn: ({ shiftTypeId, data }: { shiftTypeId: string; data: UpdateShiftTypeData }) =>
      updateShiftType(shiftTypeId, data),
    onSuccess: (_, { shiftTypeId }) => {
      toast.success('تم تحديث نوع الوردية بنجاح')
      invalidateCache.shiftTypes.detail(shiftTypeId)
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث نوع الوردية')
    },
  })
}

// Delete shift type
export const useDeleteShiftType = () => {
  return useMutation({
    mutationFn: (shiftTypeId: string) => deleteShiftType(shiftTypeId),
    onSuccess: () => {
      toast.success('تم حذف نوع الوردية بنجاح')
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.stats()
      invalidateCache.shiftTypes.all()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف نوع الوردية')
    },
  })
}

// Bulk delete shift types
export const useBulkDeleteShiftTypes = () => {
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteShiftTypes(ids),
    onSuccess: (_, variables) => {
      toast.success(`تم حذف ${variables.length} نوع وردية بنجاح`)
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.stats()
      invalidateCache.shiftTypes.all()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف أنواع الورديات')
    },
  })
}

// Set as default
export const useSetAsDefaultShift = () => {
  return useMutation({
    mutationFn: (shiftTypeId: string) => setAsDefaultShift(shiftTypeId),
    onSuccess: (_, shiftTypeId) => {
      toast.success('تم تعيين الوردية الافتراضية بنجاح')
      invalidateCache.shiftTypes.detail(shiftTypeId)
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.default()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين الوردية الافتراضية')
    },
  })
}

// Activate shift type
export const useActivateShiftType = () => {
  return useMutation({
    mutationFn: (shiftTypeId: string) => activateShiftType(shiftTypeId),
    onSuccess: (_, shiftTypeId) => {
      toast.success('تم تفعيل نوع الوردية بنجاح')
      invalidateCache.shiftTypes.detail(shiftTypeId)
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.active()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تفعيل نوع الوردية')
    },
  })
}

// Deactivate shift type
export const useDeactivateShiftType = () => {
  return useMutation({
    mutationFn: (shiftTypeId: string) => deactivateShiftType(shiftTypeId),
    onSuccess: (_, shiftTypeId) => {
      toast.success('تم إلغاء تفعيل نوع الوردية بنجاح')
      invalidateCache.shiftTypes.detail(shiftTypeId)
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.active()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء تفعيل نوع الوردية')
    },
  })
}

// Clone shift type
export const useCloneShiftType = () => {
  return useMutation({
    mutationFn: ({ shiftTypeId, data }: { shiftTypeId: string; data?: { name?: string; nameAr?: string } }) =>
      cloneShiftType(shiftTypeId, data),
    onSuccess: () => {
      toast.success('تم نسخ نوع الوردية بنجاح')
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.stats()
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
  return useMutation({
    mutationFn: (file: File) => importShiftTypes(file),
    onSuccess: (result) => {
      toast.success(`تم استيراد ${result.success} نوع وردية بنجاح${result.failed > 0 ? ` (فشل ${result.failed})` : ''}`)
      invalidateCache.shiftTypes.lists()
      invalidateCache.shiftTypes.stats()
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استيراد أنواع الورديات')
    },
  })
}
