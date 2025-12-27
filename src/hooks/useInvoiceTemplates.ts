import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from '@/hooks/use-toast'
import invoiceTemplatesService, {
  type TemplateFilters,
  type CreateTemplateData,
  type UpdateTemplateData,
} from '@/services/invoiceTemplatesService'
import { useTranslation } from 'react-i18next'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// Query key factory
export const templateKeys = {
  all: ['invoice-templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: TemplateFilters) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  default: () => [...templateKeys.all, 'default'] as const,
}

// Get all templates
export function useInvoiceTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: () => invoiceTemplatesService.getAll(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Get single template
export function useInvoiceTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => invoiceTemplatesService.getById(id),
    enabled: !!id,
  })
}

// Get default template
export function useDefaultTemplate() {
  return useQuery({
    queryKey: templateKeys.default(),
    queryFn: () => invoiceTemplatesService.getDefault(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// Create template
export function useCreateTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateTemplateData) => invoiceTemplatesService.create(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.createSuccess'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: templateKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { templates: [...] } structure
        if (old.templates && Array.isArray(old.templates)) {
          return {
            ...old,
            templates: [data, ...old.templates]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: templateKeys.all, refetchType: 'all' })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// Update template
export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateData }) =>
      invoiceTemplatesService.update(id, data),
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.updateSuccess'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.all })
      await queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// Delete template
export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => invoiceTemplatesService.delete(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.deleteSuccess'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: templateKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { templates: [...] } structure
        if (old.templates && Array.isArray(old.templates)) {
          return {
            ...old,
            templates: old.templates.filter((t: any) => t._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((t: any) => t._id !== id)
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: templateKeys.all, refetchType: 'all' })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// Duplicate template
export function useDuplicateTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, name, nameAr }: { id: string; name: string; nameAr: string }) =>
      invoiceTemplatesService.duplicate(id, name, nameAr),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.duplicateSuccess'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: templateKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { templates: [...] } structure
        if (old.templates && Array.isArray(old.templates)) {
          return {
            ...old,
            templates: [data, ...old.templates]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: templateKeys.all, refetchType: 'all' })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// Set template as default
export function useSetDefaultTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => invoiceTemplatesService.setDefault(id),
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.setDefaultSuccess'),
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: templateKeys.all })
      await queryClient.invalidateQueries({ queryKey: templateKeys.default() })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}

// Preview template
export function usePreviewTemplate(id: string) {
  return useQuery({
    queryKey: [...templateKeys.detail(id), 'preview'],
    queryFn: () => invoiceTemplatesService.preview(id),
    enabled: !!id,
  })
}

// Import template
export function useImportTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (file: File) => invoiceTemplatesService.import(file),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.importSuccess'),
      })

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: templateKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { templates: [...] } structure
        if (old.templates && Array.isArray(old.templates)) {
          return {
            ...old,
            templates: [data, ...old.templates]
          }
        }
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: templateKeys.all, refetchType: 'all' })
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('common.error'),
        description: error.message,
      })
    },
  })
}
