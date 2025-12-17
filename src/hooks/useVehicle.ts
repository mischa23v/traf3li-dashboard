import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  assignVehicle,
  unassignVehicle,
  getVehicleLogs,
  createVehicleLog,
  getVehicleExpenses,
  getVehiclesDueForService,
  getVehicleUtilization,
  getFleetSummary,
  getVehicleStats,
  updateReimbursementStatus,
  bulkDeleteVehicles,
  exportVehicles,
  exportVehicleLogs,
  type VehicleFilters,
  type VehicleLogFilters,
  type CreateVehicleData,
  type UpdateVehicleData,
  type CreateVehicleLogData,
  type VehicleAssignmentType,
  type ReimbursementStatus,
} from '@/services/vehicleService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// Query keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (filters?: VehicleFilters) => [...vehicleKeys.lists(), filters] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
  stats: () => [...vehicleKeys.all, 'stats'] as const,
  fleetSummary: () => [...vehicleKeys.all, 'fleet-summary'] as const,
  serviceDue: () => [...vehicleKeys.all, 'service-due'] as const,
  utilization: (id: string, dateRange?: { from: string; to: string }) =>
    [...vehicleKeys.all, 'utilization', id, dateRange] as const,
  expenses: (id: string, dateRange?: { from: string; to: string }) =>
    [...vehicleKeys.all, 'expenses', id, dateRange] as const,
}

export const vehicleLogKeys = {
  all: ['vehicle-logs'] as const,
  lists: () => [...vehicleLogKeys.all, 'list'] as const,
  list: (filters?: VehicleLogFilters) => [...vehicleLogKeys.lists(), filters] as const,
}

// ==================== VEHICLE QUERIES ====================

// Get all vehicles
export const useVehicles = (filters?: VehicleFilters) => {
  return useQuery({
    queryKey: vehicleKeys.list(filters),
    queryFn: () => getVehicles(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single vehicle
export const useVehicle = (vehicleId: string) => {
  return useQuery({
    queryKey: vehicleKeys.detail(vehicleId),
    queryFn: () => getVehicle(vehicleId),
    enabled: !!vehicleId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get vehicle stats
export const useVehicleStats = () => {
  return useQuery({
    queryKey: vehicleKeys.stats(),
    queryFn: getVehicleStats,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get fleet summary
export const useFleetSummary = () => {
  return useQuery({
    queryKey: vehicleKeys.fleetSummary(),
    queryFn: getFleetSummary,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get vehicles due for service
export const useVehiclesDueForService = () => {
  return useQuery({
    queryKey: vehicleKeys.serviceDue(),
    queryFn: getVehiclesDueForService,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get vehicle utilization
export const useVehicleUtilization = (vehicleId: string, dateRange?: { from: string; to: string }) => {
  return useQuery({
    queryKey: vehicleKeys.utilization(vehicleId, dateRange),
    queryFn: () => getVehicleUtilization(vehicleId, dateRange),
    enabled: !!vehicleId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get vehicle expenses
export const useVehicleExpenses = (vehicleId: string, dateRange?: { from: string; to: string }) => {
  return useQuery({
    queryKey: vehicleKeys.expenses(vehicleId, dateRange),
    queryFn: () => getVehicleExpenses(vehicleId, dateRange),
    enabled: !!vehicleId,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ==================== VEHICLE MUTATIONS ====================

// Create vehicle
export const useCreateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVehicleData) => createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.stats() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.fleetSummary() })
    },
  })
}

// Update vehicle
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: UpdateVehicleData }) =>
      updateVehicle(vehicleId, data),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.stats() })
    },
  })
}

// Delete vehicle
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.stats() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.fleetSummary() })
    },
  })
}

// Assign vehicle
export const useAssignVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ vehicleId, data }: {
      vehicleId: string
      data: {
        employeeId: string
        employeeName: string
        assignmentType: VehicleAssignmentType
        assignmentDate: string
      }
    }) => assignVehicle(vehicleId, data),
    onSuccess: (_, { vehicleId }) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.stats() })
    },
  })
}

// Unassign vehicle
export const useUnassignVehicle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vehicleId: string) => unassignVehicle(vehicleId),
    onSuccess: (_, vehicleId) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.stats() })
    },
  })
}

// Bulk delete vehicles
export const useBulkDeleteVehicles = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteVehicles(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.stats() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.fleetSummary() })
    },
  })
}

// Export vehicles
export const useExportVehicles = () => {
  return useMutation({
    mutationFn: (filters?: VehicleFilters) => exportVehicles(filters),
  })
}

// ==================== VEHICLE LOG QUERIES ====================

// Get vehicle logs
export const useVehicleLogs = (filters?: VehicleLogFilters) => {
  return useQuery({
    queryKey: vehicleLogKeys.list(filters),
    queryFn: () => getVehicleLogs(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ==================== VEHICLE LOG MUTATIONS ====================

// Create vehicle log
export const useCreateVehicleLog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVehicleLogData) => createVehicleLog(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleLogKeys.lists() })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.vehicleId) })
      queryClient.invalidateQueries({ queryKey: vehicleKeys.stats() })
      // Invalidate utilization and expenses for the vehicle
      queryClient.invalidateQueries({ queryKey: [...vehicleKeys.all, 'utilization', data.vehicleId] })
      queryClient.invalidateQueries({ queryKey: [...vehicleKeys.all, 'expenses', data.vehicleId] })
    },
  })
}

// Update reimbursement status
export const useUpdateReimbursementStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ logId, data }: {
      logId: string
      data: {
        reimbursementStatus: ReimbursementStatus
        notes?: string
      }
    }) => updateReimbursementStatus(logId, data),
    onSuccess: (updatedLog) => {
      queryClient.invalidateQueries({ queryKey: vehicleLogKeys.lists() })
      // Invalidate expenses for the vehicle
      queryClient.invalidateQueries({ queryKey: [...vehicleKeys.all, 'expenses', updatedLog.vehicleId] })
    },
  })
}

// Export vehicle logs
export const useExportVehicleLogs = () => {
  return useMutation({
    mutationFn: (filters?: VehicleLogFilters) => exportVehicleLogs(filters),
  })
}
