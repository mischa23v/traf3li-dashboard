/**
 * Quality Hooks
 * React Query hooks for Quality Management operations
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import qualityService from '@/services/qualityService'
import type { QualityFilters, CreateQualityInspectionData, QualityInspectionTemplate, QualityAction, NonConformanceReport, QualitySettings } from '@/types/quality'

// Query Keys
export const qualityKeys = {
  all: ['quality'] as const,
  inspections: () => [...qualityKeys.all, 'inspections'] as const,
  inspectionList: (filters?: QualityFilters) => [...qualityKeys.inspections(), { filters }] as const,
  inspectionDetail: (id: string) => [...qualityKeys.inspections(), id] as const,
  templates: () => [...qualityKeys.all, 'templates'] as const,
  templateDetail: (id: string) => [...qualityKeys.templates(), id] as const,
  parameters: () => [...qualityKeys.all, 'parameters'] as const,
  actions: () => [...qualityKeys.all, 'actions'] as const,
  actionDetail: (id: string) => [...qualityKeys.actions(), id] as const,
  ncrs: () => [...qualityKeys.all, 'ncrs'] as const,
  ncrDetail: (id: string) => [...qualityKeys.ncrs(), id] as const,
  stats: () => [...qualityKeys.all, 'stats'] as const,
  settings: () => [...qualityKeys.all, 'settings'] as const,
}

// Inspections
export function useInspections(filters?: QualityFilters) {
  return useQuery({
    queryKey: qualityKeys.inspectionList(filters),
    queryFn: () => qualityService.getInspections(filters),
  })
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: qualityKeys.inspectionDetail(id),
    queryFn: () => qualityService.getInspectionById(id),
    enabled: !!id,
  })
}

export function useCreateInspection() {
  
  return useMutation({
    mutationFn: (data: CreateQualityInspectionData) => qualityService.createInspection(data),
    onSuccess: () => {
      invalidateCache.quality.inspections()
      toast.success('تم إنشاء الفحص بنجاح | Inspection created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء الفحص | Failed to create inspection')
    },
  })
}

export function useUpdateInspection() {
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateQualityInspectionData> }) => qualityService.updateInspection(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.quality.inspections()
      invalidateCache.quality.inspectionDetail(id)
      toast.success('تم تحديث الفحص بنجاح | Inspection updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الفحص | Failed to update inspection')
    },
  })
}

export function useDeleteInspection() {
  
  return useMutation({
    mutationFn: (id: string) => qualityService.deleteInspection(id),
    onSuccess: () => {
      invalidateCache.quality.inspections()
      toast.success('تم حذف الفحص بنجاح | Inspection deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف الفحص | Failed to delete inspection')
    },
  })
}

export function useSubmitInspection() {
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => qualityService.submitInspection(id, status as any),
    onSuccess: (_, { id }) => {
      invalidateCache.quality.inspections()
      invalidateCache.quality.inspectionDetail(id)
      toast.success('تم تقديم نتيجة الفحص | Inspection submitted')
    },
    onError: () => {
      toast.error('فشل تقديم الفحص | Failed to submit inspection')
    },
  })
}

// Templates
export function useTemplates() {
  return useQuery({
    queryKey: qualityKeys.templates(),
    queryFn: () => qualityService.getTemplates(),
  })
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: qualityKeys.templateDetail(id),
    queryFn: () => qualityService.getTemplateById(id),
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  
  return useMutation({
    mutationFn: (data: Omit<QualityInspectionTemplate, '_id' | 'templateId' | 'createdAt' | 'updatedAt'>) => qualityService.createTemplate(data),
    onSuccess: () => {
      invalidateCache.quality.templates()
      toast.success('تم إنشاء القالب بنجاح | Template created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء القالب | Failed to create template')
    },
  })
}

export function useUpdateTemplate() {
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QualityInspectionTemplate> }) => qualityService.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.quality.templates()
      invalidateCache.quality.templateDetail(id)
      toast.success('تم تحديث القالب بنجاح | Template updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث القالب | Failed to update template')
    },
  })
}

export function useDeleteTemplate() {
  
  return useMutation({
    mutationFn: (id: string) => qualityService.deleteTemplate(id),
    onSuccess: () => {
      invalidateCache.quality.templates()
      toast.success('تم حذف القالب بنجاح | Template deleted successfully')
    },
    onError: () => {
      toast.error('فشل حذف القالب | Failed to delete template')
    },
  })
}

// Parameters
export function useParameters() {
  return useQuery({
    queryKey: qualityKeys.parameters(),
    queryFn: () => qualityService.getParameters(),
  })
}

export function useCreateParameter() {
  
  return useMutation({
    mutationFn: (data: any) => qualityService.createParameter(data),
    onSuccess: () => {
      invalidateCache.quality.parameters()
      toast.success('تم إنشاء المعيار بنجاح | Parameter created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء المعيار | Failed to create parameter')
    },
  })
}

// Actions
export function useActions(filters?: { status?: string; type?: string }) {
  return useQuery({
    queryKey: [...qualityKeys.actions(), filters],
    queryFn: () => qualityService.getActions(filters),
  })
}

export function useAction(id: string) {
  return useQuery({
    queryKey: qualityKeys.actionDetail(id),
    queryFn: () => qualityService.getActionById(id),
    enabled: !!id,
  })
}

export function useCreateAction() {
  
  return useMutation({
    mutationFn: (data: Omit<QualityAction, '_id' | 'actionId' | 'actionNumber' | 'createdAt' | 'updatedAt'>) => qualityService.createAction(data),
    onSuccess: () => {
      invalidateCache.quality.actions()
      toast.success('تم إنشاء الإجراء بنجاح | Action created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء الإجراء | Failed to create action')
    },
  })
}

export function useUpdateAction() {
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QualityAction> }) => qualityService.updateAction(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.quality.actions()
      invalidateCache.quality.actionDetail(id)
      toast.success('تم تحديث الإجراء بنجاح | Action updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الإجراء | Failed to update action')
    },
  })
}

// NCRs
export function useNCRs(filters?: { status?: string }) {
  return useQuery({
    queryKey: [...qualityKeys.ncrs(), filters],
    queryFn: () => qualityService.getNCRs(filters),
  })
}

export function useNCR(id: string) {
  return useQuery({
    queryKey: qualityKeys.ncrDetail(id),
    queryFn: () => qualityService.getNCRById(id),
    enabled: !!id,
  })
}

export function useCreateNCR() {
  
  return useMutation({
    mutationFn: (data: Omit<NonConformanceReport, '_id' | 'ncrId' | 'ncrNumber' | 'createdAt' | 'updatedAt'>) => qualityService.createNCR(data),
    onSuccess: () => {
      invalidateCache.quality.ncrs()
      toast.success('تم إنشاء تقرير عدم المطابقة بنجاح | NCR created successfully')
    },
    onError: () => {
      toast.error('فشل إنشاء التقرير | Failed to create NCR')
    },
  })
}

export function useUpdateNCR() {
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NonConformanceReport> }) => qualityService.updateNCR(id, data),
    onSuccess: (_, { id }) => {
      invalidateCache.quality.ncrs()
      invalidateCache.quality.ncrDetail(id)
      toast.success('تم تحديث التقرير بنجاح | NCR updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث التقرير | Failed to update NCR')
    },
  })
}

// Stats
export function useQualityStats() {
  return useQuery({
    queryKey: qualityKeys.stats(),
    queryFn: () => qualityService.getQualityStats(),
  })
}

// Settings
export function useQualitySettings() {
  return useQuery({
    queryKey: qualityKeys.settings(),
    queryFn: () => qualityService.getQualitySettings(),
  })
}

export function useUpdateQualitySettings() {
  
  return useMutation({
    mutationFn: (data: Partial<QualitySettings>) => qualityService.updateQualitySettings(data),
    onSuccess: () => {
      invalidateCache.quality.settings()
      toast.success('تم تحديث الإعدادات بنجاح | Settings updated successfully')
    },
    onError: () => {
      toast.error('فشل تحديث الإعدادات | Failed to update settings')
    },
  })
}
