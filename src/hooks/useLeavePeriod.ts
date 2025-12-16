import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getLeavePeriods,
  getLeavePeriod,
  createLeavePeriod,
  updateLeavePeriod,
  deleteLeavePeriod,
  getActivePeriod,
  allocateLeavesForPeriod,
  getPeriodStatistics,
  activateLeavePeriod,
  deactivateLeavePeriod,
  getLeavePeriodsByYear,
  checkDateInPeriod,
  getAllocationSummary,
  LeavePeriodFilters,
  CreateLeavePeriodData,
  UpdateLeavePeriodData,
  AllocateLeavesRequest,
} from '@/services/leavePeriodService'

// Query keys
export const leavePeriodKeys = {
  all: ['leave-periods'] as const,
  lists: () => [...leavePeriodKeys.all, 'list'] as const,
  list: (filters: LeavePeriodFilters) => [...leavePeriodKeys.lists(), filters] as const,
  details: () => [...leavePeriodKeys.all, 'detail'] as const,
  detail: (id: string) => [...leavePeriodKeys.details(), id] as const,
  active: () => [...leavePeriodKeys.all, 'active'] as const,
  statistics: (periodId: string) => [...leavePeriodKeys.all, 'statistics', periodId] as const,
  byYear: (year: number) => [...leavePeriodKeys.all, 'year', year] as const,
  allocationSummary: (periodId: string) => [...leavePeriodKeys.all, 'allocation-summary', periodId] as const,
}

// Get leave periods list
export const useLeavePeriods = (filters?: LeavePeriodFilters) => {
  return useQuery({
    queryKey: leavePeriodKeys.list(filters || {}),
    queryFn: () => getLeavePeriods(filters),
  })
}

// Get single leave period
export const useLeavePeriod = (id: string) => {
  return useQuery({
    queryKey: leavePeriodKeys.detail(id),
    queryFn: () => getLeavePeriod(id),
    enabled: !!id,
  })
}

// Get active leave period
export const useActiveLeavePeriod = () => {
  return useQuery({
    queryKey: leavePeriodKeys.active(),
    queryFn: getActivePeriod,
  })
}

// Get leave periods by year
export const useLeavePeriodsByYear = (year: number) => {
  return useQuery({
    queryKey: leavePeriodKeys.byYear(year),
    queryFn: () => getLeavePeriodsByYear(year),
    enabled: !!year,
  })
}

// Get period statistics
export const usePeriodStatistics = (periodId: string) => {
  return useQuery({
    queryKey: leavePeriodKeys.statistics(periodId),
    queryFn: () => getPeriodStatistics(periodId),
    enabled: !!periodId,
  })
}

// Get allocation summary
export const useAllocationSummary = (periodId: string) => {
  return useQuery({
    queryKey: leavePeriodKeys.allocationSummary(periodId),
    queryFn: () => getAllocationSummary(periodId),
    enabled: !!periodId,
  })
}

// Create leave period
export const useCreateLeavePeriod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeavePeriodData) => createLeavePeriod(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.active() })
    },
  })
}

// Update leave period
export const useUpdateLeavePeriod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeavePeriodData }) =>
      updateLeavePeriod(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.active() })
    },
  })
}

// Delete leave period
export const useDeleteLeavePeriod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLeavePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.active() })
    },
  })
}

// Activate leave period
export const useActivateLeavePeriod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => activateLeavePeriod(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.active() })
    },
  })
}

// Deactivate leave period
export const useDeactivateLeavePeriod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deactivateLeavePeriod(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.lists() })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.active() })
    },
  })
}

// Allocate leaves for period
export const useAllocateLeavesForPeriod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ periodId, data }: { periodId: string; data?: Omit<AllocateLeavesRequest, 'periodId'> }) =>
      allocateLeavesForPeriod(periodId, data),
    onSuccess: (_, { periodId }) => {
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.detail(periodId) })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.statistics(periodId) })
      queryClient.invalidateQueries({ queryKey: leavePeriodKeys.allocationSummary(periodId) })
      // Also invalidate leave balance queries if they exist
      queryClient.invalidateQueries({ queryKey: ['leave-requests', 'balance'] })
    },
  })
}

// Check if date is in period
export const useCheckDateInPeriod = () => {
  return useMutation({
    mutationFn: (date: string) => checkDateInPeriod(date),
  })
}
