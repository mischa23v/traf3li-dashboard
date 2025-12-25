/**
 * Manufacturing Hooks
 * React Query hooks for Manufacturing operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import manufacturingService from '@/services/manufacturingService'
import type { ManufacturingFilters, CreateBomData, CreateWorkOrderData, Workstation, ManufacturingSettings } from '@/types/manufacturing'

// Query Keys
export const manufacturingKeys = {
  all: ['manufacturing'] as const,
  boms: () => [...manufacturingKeys.all, 'boms'] as const,
  bomList: (filters?: { itemId?: string; isActive?: boolean }) => [...manufacturingKeys.boms(), { filters }] as const,
  bomDetail: (id: string) => [...manufacturingKeys.boms(), id] as const,
  workstations: () => [...manufacturingKeys.all, 'workstations'] as const,
  workstationDetail: (id: string) => [...manufacturingKeys.workstations(), id] as const,
  workOrders: () => [...manufacturingKeys.all, 'work-orders'] as const,
  workOrderList: (filters?: ManufacturingFilters) => [...manufacturingKeys.workOrders(), { filters }] as const,
  workOrderDetail: (id: string) => [...manufacturingKeys.workOrders(), id] as const,
  jobCards: () => [...manufacturingKeys.all, 'job-cards'] as const,
  jobCardDetail: (id: string) => [...manufacturingKeys.jobCards(), id] as const,
  productionPlans: () => [...manufacturingKeys.all, 'production-plans'] as const,
  productionPlanDetail: (id: string) => [...manufacturingKeys.productionPlans(), id] as const,
  stats: () => [...manufacturingKeys.all, 'stats'] as const,
  settings: () => [...manufacturingKeys.all, 'settings'] as const,
}

// BOMs
export function useBOMs(filters?: { itemId?: string; isActive?: boolean }) {
  return useQuery({
    queryKey: manufacturingKeys.bomList(filters),
    queryFn: () => manufacturingService.getBOMs(filters),
  })
}

export function useBOM(id: string) {
  return useQuery({
    queryKey: manufacturingKeys.bomDetail(id),
    queryFn: () => manufacturingService.getBOMById(id),
    enabled: !!id,
  })
}

export function useCreateBOM() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBomData) => manufacturingService.createBOM(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms() })
      toast.success('تم إنشاء قائمة المواد بنجاح | BOM created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء قائمة المواد | Failed to create BOM')
    },
  })
}

export function useUpdateBOM() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBomData> }) => manufacturingService.updateBOM(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.bomDetail(id) })
      toast.success('تم تحديث قائمة المواد بنجاح | BOM updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث قائمة المواد | Failed to update BOM')
    },
  })
}

export function useDeleteBOM() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => manufacturingService.deleteBOM(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.boms() })
      toast.success('تم حذف قائمة المواد بنجاح | BOM deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف قائمة المواد | Failed to delete BOM')
    },
  })
}

// Workstations
export function useWorkstations(filters?: { status?: 'active' | 'inactive' }) {
  return useQuery({
    queryKey: [...manufacturingKeys.workstations(), filters],
    queryFn: () => manufacturingService.getWorkstations(filters),
  })
}

export function useWorkstation(id: string) {
  return useQuery({
    queryKey: manufacturingKeys.workstationDetail(id),
    queryFn: () => manufacturingService.getWorkstationById(id),
    enabled: !!id,
  })
}

export function useCreateWorkstation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Workstation, '_id' | 'workstationId' | 'createdAt' | 'updatedAt'>) => manufacturingService.createWorkstation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workstations() })
      toast.success('تم إنشاء محطة العمل بنجاح | Workstation created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء محطة العمل | Failed to create workstation')
    },
  })
}

export function useUpdateWorkstation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Workstation> }) => manufacturingService.updateWorkstation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workstations() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workstationDetail(id) })
      toast.success('تم تحديث محطة العمل بنجاح | Workstation updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث محطة العمل | Failed to update workstation')
    },
  })
}

export function useDeleteWorkstation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => manufacturingService.deleteWorkstation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workstations() })
      toast.success('تم حذف محطة العمل بنجاح | Workstation deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف محطة العمل | Failed to delete workstation')
    },
  })
}

// Work Orders
export function useWorkOrders(filters?: ManufacturingFilters) {
  return useQuery({
    queryKey: manufacturingKeys.workOrderList(filters),
    queryFn: () => manufacturingService.getWorkOrders(filters),
  })
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: manufacturingKeys.workOrderDetail(id),
    queryFn: () => manufacturingService.getWorkOrderById(id),
    enabled: !!id,
  })
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWorkOrderData) => manufacturingService.createWorkOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrders() })
      toast.success('تم إنشاء أمر العمل بنجاح | Work order created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء أمر العمل | Failed to create work order')
    },
  })
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWorkOrderData> }) => manufacturingService.updateWorkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrders() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrderDetail(id) })
      toast.success('تم تحديث أمر العمل بنجاح | Work order updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث أمر العمل | Failed to update work order')
    },
  })
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => manufacturingService.deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrders() })
      toast.success('تم حذف أمر العمل بنجاح | Work order deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف أمر العمل | Failed to delete work order')
    },
  })
}

export function useStartWorkOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => manufacturingService.startWorkOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrders() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrderDetail(id) })
      toast.success('تم بدء أمر العمل | Work order started')
    },
    onError: () => {
      toast.error('فشل بدء أمر العمل | Failed to start work order')
    },
  })
}

export function useCompleteWorkOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => manufacturingService.completeWorkOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrders() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrderDetail(id) })
      toast.success('تم إكمال أمر العمل | Work order completed')
    },
    onError: () => {
      toast.error('فشل إكمال أمر العمل | Failed to complete work order')
    },
  })
}

export function useStopWorkOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => manufacturingService.stopWorkOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrders() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.workOrderDetail(id) })
      toast.success('تم إيقاف أمر العمل | Work order stopped')
    },
    onError: () => {
      toast.error('فشل إيقاف أمر العمل | Failed to stop work order')
    },
  })
}

// Job Cards
export function useJobCards(filters?: { workOrderId?: string; status?: string }) {
  return useQuery({
    queryKey: [...manufacturingKeys.jobCards(), filters],
    queryFn: () => manufacturingService.getJobCards(filters),
  })
}

export function useJobCard(id: string) {
  return useQuery({
    queryKey: manufacturingKeys.jobCardDetail(id),
    queryFn: () => manufacturingService.getJobCardById(id),
    enabled: !!id,
  })
}

export function useCreateJobCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => manufacturingService.createJobCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.jobCards() })
      toast.success('تم إنشاء بطاقة العمل بنجاح | Job card created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء بطاقة العمل | Failed to create job card')
    },
  })
}

export function useStartJobCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => manufacturingService.startJobCard(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.jobCards() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.jobCardDetail(id) })
      toast.success('تم بدء بطاقة العمل | Job card started')
    },
    onError: () => {
      toast.error('فشل بدء بطاقة العمل | Failed to start job card')
    },
  })
}

export function useCompleteJobCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, completedQty }: { id: string; completedQty: number }) => manufacturingService.completeJobCard(id, completedQty),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.jobCards() })
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.jobCardDetail(id) })
      toast.success('تم إكمال بطاقة العمل | Job card completed')
    },
    onError: () => {
      toast.error('فشل إكمال بطاقة العمل | Failed to complete job card')
    },
  })
}

// Production Plans
export function useProductionPlans() {
  return useQuery({
    queryKey: manufacturingKeys.productionPlans(),
    queryFn: () => manufacturingService.getProductionPlans(),
  })
}

export function useProductionPlan(id: string) {
  return useQuery({
    queryKey: manufacturingKeys.productionPlanDetail(id),
    queryFn: () => manufacturingService.getProductionPlanById(id),
    enabled: !!id,
  })
}

export function useCreateProductionPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => manufacturingService.createProductionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.productionPlans() })
      toast.success('تم إنشاء خطة الإنتاج بنجاح | Production plan created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء خطة الإنتاج | Failed to create production plan')
    },
  })
}

// Stats
export function useManufacturingStats() {
  return useQuery({
    queryKey: manufacturingKeys.stats(),
    queryFn: () => manufacturingService.getManufacturingStats(),
  })
}

// Settings
export function useManufacturingSettings() {
  return useQuery({
    queryKey: manufacturingKeys.settings(),
    queryFn: () => manufacturingService.getManufacturingSettings(),
  })
}

export function useUpdateManufacturingSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ManufacturingSettings>) => manufacturingService.updateManufacturingSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturingKeys.settings() })
      toast.success('تم تحديث الإعدادات بنجاح | Settings updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الإعدادات | Failed to update settings')
    },
  })
}
