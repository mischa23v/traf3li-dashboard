import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import pdfmeService, {
  type PdfmeTemplateFilters,
  type CreatePdfmeTemplateData,
  type UpdatePdfmeTemplateData,
  type PdfmeTemplateCategory,
} from '@/services/pdfmeService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

// Query keys
export const pdfmeKeys = {
  all: ['pdfme'] as const,
  templates: () => [...pdfmeKeys.all, 'templates'] as const,
  template: (id: string) => [...pdfmeKeys.all, 'template', id] as const,
  defaultTemplate: (category: string) => [...pdfmeKeys.all, 'default', category] as const,
  list: (filters: PdfmeTemplateFilters) => [...pdfmeKeys.templates(), filters] as const,
}

// Get all templates
export const usePdfmeTemplates = (filters?: PdfmeTemplateFilters) => {
  return useQuery({
    queryKey: pdfmeKeys.list(filters || {}),
    queryFn: () => pdfmeService.getTemplates(filters),
    staleTime: CACHE_TIMES.SHORT, // 2 minutes
  })
}

// Get single template
export const usePdfmeTemplate = (id: string) => {
  return useQuery({
    queryKey: pdfmeKeys.template(id),
    queryFn: () => pdfmeService.getTemplate(id),
    enabled: !!id,
  })
}

// Get default template for category
export const useDefaultPdfmeTemplate = (category: PdfmeTemplateCategory) => {
  return useQuery({
    queryKey: pdfmeKeys.defaultTemplate(category),
    queryFn: () => pdfmeService.getDefaultTemplate(category),
    enabled: !!category,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

// Create template
export const useCreatePdfmeTemplate = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreatePdfmeTemplateData) => pdfmeService.createTemplate(data),
    // Update cache on success
    onSuccess: (data) => {
      toast({
        title: t('status.success'),
        description: t('pdfme.createSuccess', 'Template created successfully'),
      })

      // Manually update the cache with the new template
      queryClient.setQueriesData({ queryKey: pdfmeKeys.all }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: ... } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1,
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('pdfme.createError', 'Failed to create template'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: pdfmeKeys.all, refetchType: 'all' })
    },
  })
}

// Update template
export const useUpdatePdfmeTemplate = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePdfmeTemplateData }) =>
      pdfmeService.updateTemplate(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: pdfmeKeys.all })

      const previousQueries = queryClient.getQueriesData({ queryKey: pdfmeKeys.all })
      const previousTemplate = queryClient.getQueryData(pdfmeKeys.template(id))

      queryClient.setQueriesData({ queryKey: pdfmeKeys.all }, (old: any) => {
        if (!old) return old

        const list = Array.isArray(old) ? old : old.data || old.templates || []
        const updatedList = list.map((item: any) =>
          item._id === id ? { ...item, ...data } : item
        )

        if (Array.isArray(old)) {
          return updatedList
        }

        return {
          ...old,
          data: updatedList,
        }
      })

      if (previousTemplate) {
        queryClient.setQueryData(pdfmeKeys.template(id), {
          ...(previousTemplate as object),
          ...data,
        })
      }

      return { previousQueries, previousTemplate }
    },
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any, { id }, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      if (context?.previousTemplate) {
        queryClient.setQueryData(pdfmeKeys.template(id), context.previousTemplate)
      }
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message || t('pdfme.updateError', 'Failed to update template'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: pdfmeKeys.all })
      return await queryClient.invalidateQueries({ queryKey: pdfmeKeys.template(id) })
    },
  })
}

// Delete template
export const useDeletePdfmeTemplate = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => pdfmeService.deleteTemplate(id),
    // Update cache on success
    onSuccess: (_, id) => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })

      // Optimistically remove template from all lists
      queryClient.setQueriesData({ queryKey: pdfmeKeys.all }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: ... } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.data.length) - 1),
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== id)
        }

        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message || t('pdfme.deleteError', 'Failed to delete template'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: pdfmeKeys.all, refetchType: 'all' })
    },
  })
}

// Clone template
export const useClonePdfmeTemplate = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: { name?: string; nameAr?: string } }) =>
      pdfmeService.cloneTemplate(id, data),
    // Update cache on success
    onSuccess: (data) => {
      toast({
        title: t('status.success'),
        description: t('pdfme.cloneSuccess', 'Template cloned successfully'),
      })

      // Manually update the cache with the cloned template
      queryClient.setQueriesData({ queryKey: pdfmeKeys.all }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: ... } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1,
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return [data, ...old]
        }

        return old
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('pdfme.cloneError', 'Failed to clone template'),
      })
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await queryClient.invalidateQueries({ queryKey: pdfmeKeys.all, refetchType: 'all' })
    },
  })
}

// Set default template
export const useSetDefaultPdfmeTemplate = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => pdfmeService.setDefaultTemplate(id),
    onSuccess: (data: PdfmeTemplate) => {
      toast({
        title: t('status.success'),
        description: t('pdfme.setDefaultSuccess', 'Default template set successfully'),
      })

      // Invalidate the default template cache for this category
      if (data?.category) {
        queryClient.invalidateQueries({
          queryKey: pdfmeKeys.defaultTemplate(data.category),
        })
      }
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message ||
          t('pdfme.setDefaultError', 'Failed to set default template'),
      })
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: pdfmeKeys.all })
    },
  })
}

// Preview template
export const usePreviewPdfmeTemplate = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ id, inputs }: { id: string; inputs?: Record<string, any> }) => {
      const blob = await pdfmeService.previewTemplate(id, inputs)
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      // Clean up after a delay to allow the browser to open the PDF
      setTimeout(() => window.URL.revokeObjectURL(url), 1000)
      return blob
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message || t('pdfme.previewError', 'Failed to preview template'),
      })
    },
  })
}

// Generate PDF
export const useGeneratePdf = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      templateId,
      inputs,
      type = 'pdf',
      fileName,
    }: {
      templateId: string
      inputs: Record<string, any>
      type?: 'pdf' | 'base64' | 'arraybuffer'
      fileName?: string
    }) => {
      const result = await pdfmeService.generatePdf(templateId, inputs, type)

      // If it's a blob (PDF), download it
      if (result instanceof Blob) {
        const url = window.URL.createObjectURL(result)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName || 'document.pdf')
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }

      return result
    },
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('pdfme.generateSuccess', 'PDF generated successfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description:
          error.response?.data?.message || t('pdfme.generateError', 'Failed to generate PDF'),
      })
    },
  })
}
