import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'
import invoiceTemplatesService, {
  type TemplateFilters,
  type CreateTemplateData,
  type UpdateTemplateData,
} from '@/services/invoiceTemplatesService'
import { useTranslation } from 'react-i18next'

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
  })
}

// Create template
export function useCreateTemplate() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateTemplateData) => invoiceTemplatesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.createSuccess'),
      })
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) })
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.updateSuccess'),
      })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.deleteSuccess'),
      })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.duplicateSuccess'),
      })
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
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      queryClient.invalidateQueries({ queryKey: templateKeys.default() })
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.setDefaultSuccess'),
      })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.all })
      toast({
        title: t('common.success'),
        description: t('invoiceTemplates.importSuccess'),
      })
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
