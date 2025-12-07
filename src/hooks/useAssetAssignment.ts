import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAssetAssignments,
  getAssetAssignment,
  createAssetAssignment,
  updateAssetAssignment,
  deleteAssetAssignment,
  getAssetAssignmentStats,
  acknowledgeAssignment,
  initiateReturn,
  completeReturn,
  recordMaintenance,
  reportIncident,
  resolveIncident,
  updateAssetStatus,
  bulkDeleteAssetAssignments,
  getEmployeeAssetAssignments,
  getOverdueReturns,
  getMaintenanceDue,
  exportAssetAssignments,
  issueClearanceCertificate,
  type AssetAssignmentFilters,
  type CreateAssetAssignmentData,
  type UpdateAssetAssignmentData,
  type AssetAssignmentStatus,
  type AssetCondition,
  type ReturnReason,
  type IncidentType,
} from '@/services/assetAssignmentService'

// Query keys
export const assetAssignmentKeys = {
  all: ['asset-assignments'] as const,
  lists: () => [...assetAssignmentKeys.all, 'list'] as const,
  list: (filters?: AssetAssignmentFilters) => [...assetAssignmentKeys.lists(), filters] as const,
  details: () => [...assetAssignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetAssignmentKeys.details(), id] as const,
  stats: () => [...assetAssignmentKeys.all, 'stats'] as const,
  byEmployee: (employeeId: string) => [...assetAssignmentKeys.all, 'employee', employeeId] as const,
  overdueReturns: () => [...assetAssignmentKeys.all, 'overdue-returns'] as const,
  maintenanceDue: () => [...assetAssignmentKeys.all, 'maintenance-due'] as const,
}

// Get all asset assignments
export const useAssetAssignments = (filters?: AssetAssignmentFilters) => {
  return useQuery({
    queryKey: assetAssignmentKeys.list(filters),
    queryFn: () => getAssetAssignments(filters),
  })
}

// Get single asset assignment
export const useAssetAssignment = (assignmentId: string) => {
  return useQuery({
    queryKey: assetAssignmentKeys.detail(assignmentId),
    queryFn: () => getAssetAssignment(assignmentId),
    enabled: !!assignmentId,
  })
}

// Get asset assignment stats
export const useAssetAssignmentStats = () => {
  return useQuery({
    queryKey: assetAssignmentKeys.stats(),
    queryFn: getAssetAssignmentStats,
  })
}

// Get employee asset assignments
export const useEmployeeAssetAssignments = (employeeId: string) => {
  return useQuery({
    queryKey: assetAssignmentKeys.byEmployee(employeeId),
    queryFn: () => getEmployeeAssetAssignments(employeeId),
    enabled: !!employeeId,
  })
}

// Get overdue returns
export const useOverdueReturns = () => {
  return useQuery({
    queryKey: assetAssignmentKeys.overdueReturns(),
    queryFn: getOverdueReturns,
  })
}

// Get maintenance due
export const useMaintenanceDue = () => {
  return useQuery({
    queryKey: assetAssignmentKeys.maintenanceDue(),
    queryFn: getMaintenanceDue,
  })
}

// Create asset assignment
export const useCreateAssetAssignment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssetAssignmentData) => createAssetAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.stats() })
    },
  })
}

// Update asset assignment
export const useUpdateAssetAssignment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: UpdateAssetAssignmentData }) =>
      updateAssetAssignment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
    },
  })
}

// Delete asset assignment
export const useDeleteAssetAssignment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) => deleteAssetAssignment(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.stats() })
    },
  })
}

// Acknowledge assignment
export const useAcknowledgeAssignment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        signature?: string
        acknowledgmentMethod?: 'digital_signature' | 'physical_signature' | 'email_confirmation' | 'system_acceptance'
      }
    }) => acknowledgeAssignment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
    },
  })
}

// Initiate return
export const useInitiateReturn = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        returnReason: ReturnReason
        returnReasonDetails?: string
        returnDueDate: string
      }
    }) => initiateReturn(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.stats() })
    },
  })
}

// Complete return
export const useCompleteReturn = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        actualReturnDate: string
        returnedBy: string
        returnMethod: 'hand_delivery' | 'courier' | 'mail' | 'pickup'
        returnLocation?: string
        receivedBy: string
        receivedByName?: string
        conditionAtReturn: AssetCondition
        hasDamage?: boolean
        damages?: Array<{
          damageType: string
          description: string
          repairCost?: number
        }>
        dataWiped?: boolean
        notes?: string
      }
    }) => completeReturn(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.stats() })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.overdueReturns() })
    },
  })
}

// Record maintenance
export const useRecordMaintenance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        maintenanceType: 'preventive' | 'corrective' | 'inspection' | 'upgrade'
        maintenanceDate: string
        performedBy: 'internal' | 'vendor' | 'manufacturer'
        technician?: string
        vendorName?: string
        description: string
        partsReplaced?: Array<{
          partName: string
          partNumber?: string
          quantity: number
          cost?: number
        }>
        laborCost?: number
        totalCost?: number
        nextServiceDue?: string
        notes?: string
      }
    }) => recordMaintenance(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.maintenanceDue() })
    },
  })
}

// Report incident
export const useReportIncident = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        incidentType: IncidentType
        incidentDate: string
        incidentDescription: string
        location?: string
        severity: 'minor' | 'moderate' | 'major' | 'critical'
        dataLoss?: boolean
        financialLoss?: number
        notes?: string
      }
    }) => reportIncident(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.stats() })
    },
  })
}

// Resolve incident
export const useResolveIncident = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, incidentId, data }: {
      assignmentId: string
      incidentId: string
      data: {
        resolutionAction: string
        assetRecoverable: boolean
        notes?: string
      }
    }) => resolveIncident(assignmentId, incidentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
    },
  })
}

// Update asset status
export const useUpdateAssetStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        status: AssetAssignmentStatus
        notes?: string
      }
    }) => updateAssetStatus(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.stats() })
    },
  })
}

// Bulk delete
export const useBulkDeleteAssetAssignments = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAssetAssignments(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.stats() })
    },
  })
}

// Export asset assignments
export const useExportAssetAssignments = () => {
  return useMutation({
    mutationFn: (filters?: AssetAssignmentFilters) => exportAssetAssignments(filters),
  })
}

// Issue clearance certificate
export const useIssueClearanceCertificate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) => issueClearanceCertificate(assignmentId),
    onSuccess: (_, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: assetAssignmentKeys.detail(assignmentId) })
    },
  })
}
