import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { salaryComponentService } from '@/services/salaryComponentService'
import type {
  SalaryComponentFilters,
  CreateSalaryComponentData,
  UpdateSalaryComponentData,
  CalculateComponentParams,
  ComponentType,
} from '@/services/salaryComponentService'
import { toast } from 'sonner'

// Query Keys
export const salaryComponentKeys = {
  all: ['salary-components'] as const,
  lists: () => [...salaryComponentKeys.all, 'list'] as const,
  list: (filters?: SalaryComponentFilters) => [...salaryComponentKeys.lists(), filters] as const,
  details: () => [...salaryComponentKeys.all, 'detail'] as const,
  detail: (id: string) => [...salaryComponentKeys.details(), id] as const,
  earnings: () => [...salaryComponentKeys.all, 'earnings'] as const,
  deductions: () => [...salaryComponentKeys.all, 'deductions'] as const,
  byType: (type: ComponentType) => [...salaryComponentKeys.all, 'by-type', type] as const,
  stats: () => [...salaryComponentKeys.all, 'stats'] as const,
  usage: (id: string) => [...salaryComponentKeys.all, 'usage', id] as const,
}

// ==================== QUERY HOOKS ====================

// Get all salary components
export function useSalaryComponents(filters?: SalaryComponentFilters) {
  return useQuery({
    queryKey: salaryComponentKeys.list(filters),
    queryFn: () => salaryComponentService.getSalaryComponents(filters),
  })
}

// Get single salary component
export function useSalaryComponent(id: string) {
  return useQuery({
    queryKey: salaryComponentKeys.detail(id),
    queryFn: () => salaryComponentService.getSalaryComponent(id),
    enabled: !!id,
  })
}

// Get earning components
export function useEarningComponents() {
  return useQuery({
    queryKey: salaryComponentKeys.earnings(),
    queryFn: () => salaryComponentService.getEarningComponents(),
  })
}

// Get deduction components
export function useDeductionComponents() {
  return useQuery({
    queryKey: salaryComponentKeys.deductions(),
    queryFn: () => salaryComponentService.getDeductionComponents(),
  })
}

// Get components by type
export function useComponentsByType(type: ComponentType) {
  return useQuery({
    queryKey: salaryComponentKeys.byType(type),
    queryFn: () => salaryComponentService.getComponentsByType(type),
    enabled: !!type,
  })
}

// Get components statistics
export function useComponentsStats() {
  return useQuery({
    queryKey: salaryComponentKeys.stats(),
    queryFn: () => salaryComponentService.getComponentsStats(),
  })
}

// Get component usage
export function useComponentUsage(id: string) {
  return useQuery({
    queryKey: salaryComponentKeys.usage(id),
    queryFn: () => salaryComponentService.getComponentUsage(id),
    enabled: !!id,
  })
}

// ==================== MUTATION HOOKS ====================

// Create salary component
export function useCreateSalaryComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSalaryComponentData) =>
      salaryComponentService.createSalaryComponent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.all })
      toast.success('تم إنشاء مكون الراتب بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إنشاء مكون الراتب')
    },
  })
}

// Update salary component
export function useUpdateSalaryComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSalaryComponentData }) =>
      salaryComponentService.updateSalaryComponent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.lists() })
      toast.success('تم تحديث مكون الراتب بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل تحديث مكون الراتب')
    },
  })
}

// Delete salary component
export function useDeleteSalaryComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salaryComponentService.deleteSalaryComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.all })
      toast.success('تم حذف مكون الراتب بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل حذف مكون الراتب')
    },
  })
}

// Bulk delete salary components
export function useBulkDeleteSalaryComponents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => salaryComponentService.bulkDeleteSalaryComponents(ids),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.all })
      toast.success(`تم حذف ${result.deleted} مكون بنجاح`)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل حذف مكونات الراتب')
    },
  })
}

// Calculate component
export function useCalculateComponent() {
  return useMutation({
    mutationFn: (params: CalculateComponentParams) =>
      salaryComponentService.calculateComponent(params),
    onError: (error: any) => {
      toast.error(error?.message || 'فشل حساب مكون الراتب')
    },
  })
}

// Seed default Saudi components
export function useSeedDefaultComponents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => salaryComponentService.seedDefaultSaudiComponents(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.all })
      toast.success(`تم إنشاء ${result.created} مكون قياسي بنجاح`)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل إنشاء المكونات القياسية')
    },
  })
}

// Duplicate component
export function useDuplicateComponent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salaryComponentService.duplicateComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.all })
      toast.success('تم نسخ مكون الراتب بنجاح')
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل نسخ مكون الراتب')
    },
  })
}

// Validate formula
export function useValidateFormula() {
  return useMutation({
    mutationFn: (formula: string) => salaryComponentService.validateFormula(formula),
    onError: (error: any) => {
      toast.error(error?.message || 'فشل التحقق من صحة المعادلة')
    },
  })
}

// Toggle component status
export function useToggleComponentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => salaryComponentService.toggleComponentStatus(id),
    onSuccess: (component) => {
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.detail(component._id) })
      queryClient.invalidateQueries({ queryKey: salaryComponentKeys.lists() })
      const status = component.isActive ? 'تفعيل' : 'تعطيل'
      toast.success(`تم ${status} مكون الراتب بنجاح`)
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل تغيير حالة مكون الراتب')
    },
  })
}
