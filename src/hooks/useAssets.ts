import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAssets,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
  recordHandover,
  recordAcknowledgment,
  updateAssetLocation,
  recordMaintenance,
  reportRepair,
  updateRepairStatus,
  reportIncident,
  initiateReturn,
  completeReturn,
  transferAsset,
  disposeAsset,
  bulkDeleteAssets,
  getEmployeeAssets,
  getPendingReturns,
  getMaintenanceDue,
  getWarrantyExpiring,
  getAvailableAssets,
  type AssetFilters,
  type CreateAssetAssignmentData,
  type UpdateAssetAssignmentData,
  type AssetType,
  type AssetCondition,
  type ReturnReason,
  type IncidentType,
  type AssetAccessory,
} from '@/services/assetsService'

// Query keys
export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (filters?: AssetFilters) => [...assetKeys.lists(), filters] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetKeys.details(), id] as const,
  stats: () => [...assetKeys.all, 'stats'] as const,
  employee: (employeeId: string) => [...assetKeys.all, 'employee', employeeId] as const,
  pendingReturns: () => [...assetKeys.all, 'pending-returns'] as const,
  maintenanceDue: () => [...assetKeys.all, 'maintenance-due'] as const,
  warrantyExpiring: () => [...assetKeys.all, 'warranty-expiring'] as const,
  available: (assetType?: AssetType) => [...assetKeys.all, 'available', assetType] as const,
}

// Get assets list
export function useAssets(filters?: AssetFilters) {
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: () => getAssets(filters),
  })
}

// Get single asset
export function useAsset(assignmentId: string) {
  return useQuery({
    queryKey: assetKeys.detail(assignmentId),
    queryFn: () => getAsset(assignmentId),
    enabled: !!assignmentId,
  })
}

// Get asset stats
export function useAssetStats() {
  return useQuery({
    queryKey: assetKeys.stats(),
    queryFn: getAssetStats,
  })
}

// Get employee assets
export function useEmployeeAssets(employeeId: string) {
  return useQuery({
    queryKey: assetKeys.employee(employeeId),
    queryFn: () => getEmployeeAssets(employeeId),
    enabled: !!employeeId,
  })
}

// Get pending returns
export function usePendingReturns() {
  return useQuery({
    queryKey: assetKeys.pendingReturns(),
    queryFn: getPendingReturns,
  })
}

// Get maintenance due
export function useMaintenanceDue() {
  return useQuery({
    queryKey: assetKeys.maintenanceDue(),
    queryFn: getMaintenanceDue,
  })
}

// Get warranty expiring
export function useWarrantyExpiring() {
  return useQuery({
    queryKey: assetKeys.warrantyExpiring(),
    queryFn: getWarrantyExpiring,
  })
}

// Get available assets
export function useAvailableAssets(assetType?: AssetType) {
  return useQuery({
    queryKey: assetKeys.available(assetType),
    queryFn: () => getAvailableAssets(assetType),
  })
}

// Create asset
export function useCreateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssetAssignmentData) => createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.stats() })
    },
  })
}

// Update asset
export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: UpdateAssetAssignmentData }) =>
      updateAsset(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
    },
  })
}

// Delete asset
export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) => deleteAsset(assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.stats() })
    },
  })
}

// Record handover
export function useRecordHandover() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        handedOverBy: string
        handoverDate: string
        handoverMethod: 'in_person' | 'courier' | 'mail'
        handoverLocation?: string
        accessories?: AssetAccessory[]
        handoverChecklist?: Array<{ item: string; checked: boolean; notes?: string }>
        employeeSignature?: string
      }
    }) => recordHandover(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
    },
  })
}

// Record acknowledgment
export function useRecordAcknowledgment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        acknowledgmentMethod: 'digital_signature' | 'physical_signature' | 'email_confirmation' | 'system_acceptance'
        signature?: string
        termsAccepted: string[]
      }
    }) => recordAcknowledgment(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
    },
  })
}

// Update location
export function useUpdateAssetLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        locationType: 'office' | 'home' | 'field' | 'transit' | 'storage' | 'other'
        locationName: string
        building?: string
        floor?: string
        room?: string
        coordinates?: { latitude: number; longitude: number }
        reason?: string
      }
    }) => updateAssetLocation(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
    },
  })
}

// Record maintenance
export function useRecordMaintenance() {
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
        partsReplaced?: Array<{ partName: string; partNumber?: string; quantity: number; cost?: number }>
        laborCost?: number
        totalCost?: number
        downtime?: number
        nextServiceDue?: string
        notes?: string
      }
    }) => recordMaintenance(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetKeys.maintenanceDue() })
    },
  })
}

// Report repair
export function useReportRepair() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        issueDescription: string
        severity: 'minor' | 'moderate' | 'major' | 'critical'
        causeOfDamage?: 'normal_wear' | 'accident' | 'misuse' | 'manufacturing_defect' | 'external_factors' | 'unknown'
        photos?: string[]
      }
    }) => reportRepair(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
    },
  })
}

// Update repair status
export function useUpdateRepairStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, repairId, data }: {
      assignmentId: string
      repairId: string
      data: {
        repairStatus: 'assessed' | 'approved' | 'in_progress' | 'completed' | 'unrepairable'
        assessment?: {
          diagnosis: string
          repairEstimate: number
          repairRecommendation: 'repair' | 'replace' | 'write_off'
          repairTimeEstimate?: number
        }
        approved?: boolean
        approvedBy?: string
        repairedBy?: string
        vendorName?: string
        partsUsed?: Array<{ partName: string; quantity: number; cost?: number }>
        laborCost?: number
        totalRepairCost?: number
        assetFunctional?: boolean
        notes?: string
      }
    }) => updateRepairStatus(assignmentId, repairId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
    },
  })
}

// Report incident
export function useReportIncident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        incidentType: IncidentType
        incidentDate: string
        incidentDescription: string
        location?: string
        circumstances: {
          howItHappened?: string
          witnessPresent: boolean
          witnesses?: Array<{ witnessName: string; witnessContact?: string }>
          policeReportFiled?: boolean
          policeReportNumber?: string
        }
        photos?: string[]
      }
    }) => reportIncident(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetKeys.stats() })
    },
  })
}

// Initiate return
export function useInitiateReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        returnReason: ReturnReason
        returnReasonDetails?: string
        returnDueDate: string
        returnMethod: 'hand_delivery' | 'courier' | 'mail' | 'pickup'
        returnLocation?: string
      }
    }) => initiateReturn(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetKeys.pendingReturns() })
    },
  })
}

// Complete return
export function useCompleteReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        actualReturnDate: string
        returnedBy: string
        receivedBy: string
        inspection: {
          conditionAtReturn: AssetCondition
          damageAssessment?: {
            hasDamage: boolean
            damages?: Array<{ damageType: string; description: string; repairCost?: number }>
          }
          completenessCheck: {
            complete: boolean
            missingItems?: Array<{ itemType: string; description: string; replacementCost: number }>
          }
          dataCheck?: {
            dataWiped: boolean
            wipingMethod?: 'software' | 'physical_destruction'
          }
          functionalityTest?: {
            tested: boolean
            functional: boolean
            issues?: string[]
          }
          inspectionNotes?: string
        }
        returnCharges?: {
          hasCharges: boolean
          charges?: Array<{ chargeType: string; description: string; amount: number }>
          recoveryMethod?: 'salary_deduction' | 'final_settlement' | 'payment' | 'waived'
        }
        nextSteps: {
          assetStatus: 'available_for_reassignment' | 'needs_repair' | 'needs_maintenance' | 'retired' | 'disposed'
        }
      }
    }) => completeReturn(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetKeys.pendingReturns() })
      queryClient.invalidateQueries({ queryKey: assetKeys.stats() })
    },
  })
}

// Transfer asset
export function useTransferAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        transferType: 'employee_transfer' | 'department_transfer' | 'location_transfer' | 'temporary_reassignment'
        transferTo: {
          employeeId?: string
          department?: string
          location?: string
        }
        transferReason: string
        temporary: boolean
        expectedReturnDate?: string
      }
    }) => transferAsset(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
    },
  })
}

// Dispose asset
export function useDisposeAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ assignmentId, data }: {
      assignmentId: string
      data: {
        retirementReason: 'end_of_life' | 'obsolete' | 'damaged_beyond_repair' | 'upgrade' | 'lease_end' | 'cost_ineffective'
        disposalMethod: 'sale' | 'donation' | 'recycling' | 'trade_in' | 'return_to_vendor' | 'destruction' | 'storage'
        bookValue?: number
        sale?: { soldTo: string; salePrice: number }
        donation?: { donatedTo: string; donationValue: number; taxDeductible: boolean }
        dataDestruction?: {
          required: boolean
          destructionMethod?: 'software_wipe' | 'degaussing' | 'physical_destruction' | 'shredding'
        }
        notes?: string
      }
    }) => disposeAsset(assignmentId, data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.detail(assignmentId) })
      queryClient.invalidateQueries({ queryKey: assetKeys.stats() })
    },
  })
}

// Bulk delete assets
export function useBulkDeleteAssets() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteAssets(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() })
      queryClient.invalidateQueries({ queryKey: assetKeys.stats() })
    },
  })
}
