import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { invalidateCache } from '@/lib/cache-invalidation'
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
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

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
  return useMutation({
    mutationFn: (data: CreateVehicleData) => createVehicle(data),
    onSuccess: () => {
      invalidateCache.vehicles.lists()
      invalidateCache.vehicles.stats()
      invalidateCache.vehicles.fleetSummary()
    },
  })
}

// Update vehicle
export const useUpdateVehicle = () => {
  return useMutation({
    mutationFn: ({ vehicleId, data }: { vehicleId: string; data: UpdateVehicleData }) =>
      updateVehicle(vehicleId, data),
    onSuccess: (_, { vehicleId }) => {
      invalidateCache.vehicles.detail(vehicleId)
      invalidateCache.vehicles.lists()
      invalidateCache.vehicles.stats()
    },
  })
}

// Delete vehicle
export const useDeleteVehicle = () => {
  return useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onSuccess: () => {
      invalidateCache.vehicles.lists()
      invalidateCache.vehicles.stats()
      invalidateCache.vehicles.fleetSummary()
    },
  })
}

// Assign vehicle
export const useAssignVehicle = () => {
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
      invalidateCache.vehicles.detail(vehicleId)
      invalidateCache.vehicles.lists()
      invalidateCache.vehicles.stats()
    },
  })
}

// Unassign vehicle
export const useUnassignVehicle = () => {
  return useMutation({
    mutationFn: (vehicleId: string) => unassignVehicle(vehicleId),
    onSuccess: (_, vehicleId) => {
      invalidateCache.vehicles.detail(vehicleId)
      invalidateCache.vehicles.lists()
      invalidateCache.vehicles.stats()
    },
  })
}

// Bulk delete vehicles
export const useBulkDeleteVehicles = () => {
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteVehicles(ids),
    onSuccess: () => {
      invalidateCache.vehicles.lists()
      invalidateCache.vehicles.stats()
      invalidateCache.vehicles.fleetSummary()
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
  return useMutation({
    mutationFn: (data: CreateVehicleLogData) => createVehicleLog(data),
    onSuccess: (data) => {
      invalidateCache.vehicleLogs.lists()
      invalidateCache.vehicles.detail(data.vehicleId)
      invalidateCache.vehicles.stats()
      // Invalidate utilization and expenses for the vehicle
      invalidateCache.vehicles.utilization(data.vehicleId)
      invalidateCache.vehicles.expenses(data.vehicleId)
    },
  })
}

// Update reimbursement status
export const useUpdateReimbursementStatus = () => {
  return useMutation({
    mutationFn: ({ logId, data }: {
      logId: string
      data: {
        reimbursementStatus: ReimbursementStatus
        notes?: string
      }
    }) => updateReimbursementStatus(logId, data),
    onSuccess: (updatedLog) => {
      invalidateCache.vehicleLogs.lists()
      // Invalidate expenses for the vehicle
      invalidateCache.vehicles.expenses(updatedLog.vehicleId)
    },
  })
}

// Export vehicle logs
export const useExportVehicleLogs = () => {
  return useMutation({
    mutationFn: (filters?: VehicleLogFilters) => exportVehicleLogs(filters),
  })
}
