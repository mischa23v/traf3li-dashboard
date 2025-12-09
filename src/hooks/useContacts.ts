import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import contactsService, {
  type ContactFilters,
  type CreateContactData,
  type UpdateContactData,
} from '@/services/contactsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'
import { createOptimisticMutation } from '@/lib/mutation-utils'

// Query keys
export const contactsKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsKeys.all, 'list'] as const,
  list: (filters: ContactFilters) => [...contactsKeys.lists(), filters] as const,
  details: () => [...contactsKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactsKeys.details(), id] as const,
  byCase: (caseId: string) => [...contactsKeys.all, 'case', caseId] as const,
  byClient: (clientId: string) => [...contactsKeys.all, 'client', clientId] as const,
  search: (query: string) => [...contactsKeys.all, 'search', query] as const,
}

// Get all contacts
export const useContacts = (filters?: ContactFilters) => {
  // ============ DEBUG LOGGING ============
  const queryKey = contactsKeys.list(filters || {})
  console.log('%c[useContacts] Hook called with:', 'color: #0a0; font-weight: bold;', {
    filters,
    queryKey,
    filtersStringified: JSON.stringify(filters),
  })
  // ============ DEBUG END ============

  return useQuery({
    queryKey,
    queryFn: () => {
      console.log('%c[useContacts] queryFn EXECUTING', 'background: #0ff; color: #000;', { filters })
      return contactsService.getContacts(filters)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Get single contact
export const useContact = (id: string) => {
  return useQuery({
    queryKey: contactsKeys.detail(id),
    queryFn: () => contactsService.getContact(id),
    enabled: !!id,
  })
}

// Get contacts by case
export const useContactsByCase = (caseId: string) => {
  return useQuery({
    queryKey: contactsKeys.byCase(caseId),
    queryFn: () => contactsService.getContactsByCase(caseId),
    enabled: !!caseId,
  })
}

// Get contacts by client
export const useContactsByClient = (clientId: string) => {
  return useQuery({
    queryKey: contactsKeys.byClient(clientId),
    queryFn: () => contactsService.getContactsByClient(clientId),
    enabled: !!clientId,
  })
}

// Search contacts
export const useSearchContacts = (query: string) => {
  return useQuery({
    queryKey: contactsKeys.search(query),
    queryFn: () => contactsService.searchContacts(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Create contact
export const useCreateContact = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateContactData) => contactsService.createContact(data),
    onMutate: async (newContact) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactsKeys.lists() })

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({ queryKey: contactsKeys.lists() })

      // Optimistically update all list queries
      queryClient.setQueriesData({ queryKey: contactsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { contacts: [...] } structure
        if (old.contacts && Array.isArray(old.contacts)) {
          return {
            ...old,
            contacts: [{ ...newContact, _id: 'temp-' + Date.now() }, ...old.contacts]
          }
        }
        if (Array.isArray(old)) return [{ ...newContact, _id: 'temp-' + Date.now() }, ...old]
        return old
      })

      return { previousData }
    },
    onSuccess: (data) => {
      toast({
        title: t('status.success'),
        description: t('status.createdSuccessfully'),
      })

      // Update cache with real data
      queryClient.setQueriesData({ queryKey: contactsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { contacts: [...] } structure
        if (old.contacts && Array.isArray(old.contacts)) {
          return {
            ...old,
            contacts: old.contacts.map((c: any) =>
              c._id?.startsWith('temp-') ? data : c
            )
          }
        }
        if (Array.isArray(old)) return old.map((c: any) => c._id?.startsWith('temp-') ? data : c)
        return old
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Invalidate without delay
      await queryClient.invalidateQueries({ queryKey: contactsKeys.all, refetchType: 'all' })
    },
  })
}

// Update contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactData }) =>
      contactsService.updateContact(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactsKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: contactsKeys.lists() })

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(contactsKeys.detail(id))
      const previousLists = queryClient.getQueriesData({ queryKey: contactsKeys.lists() })

      // Optimistically update detail
      queryClient.setQueryData(contactsKeys.detail(id), (old: any) => {
        if (!old) return old
        return { ...old, ...data }
      })

      // Optimistically update lists
      queryClient.setQueriesData({ queryKey: contactsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { contacts: [...] } structure
        if (old.contacts && Array.isArray(old.contacts)) {
          return {
            ...old,
            contacts: old.contacts.map((c: any) =>
              c._id === id ? { ...c, ...data } : c
            )
          }
        }
        if (Array.isArray(old)) return old.map((c: any) => c._id === id ? { ...c, ...data } : c)
        return old
      })

      return { previousDetail, previousLists }
    },
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any, { id }, context) => {
      // Rollback on error
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(contactsKeys.detail(id), context.previousDetail)
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      // Invalidate without delay
      await queryClient.invalidateQueries({ queryKey: contactsKeys.all })
      await queryClient.invalidateQueries({ queryKey: contactsKeys.detail(id) })
    },
  })
}

// Delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactsKeys.lists() })

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({ queryKey: contactsKeys.lists() })

      // Optimistically update all list queries
      queryClient.setQueriesData({ queryKey: contactsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { contacts: [...] } structure
        if (old.contacts && Array.isArray(old.contacts)) {
          return {
            ...old,
            contacts: old.contacts.filter((c: any) => c._id !== id)
          }
        }
        if (Array.isArray(old)) return old.filter((c: any) => c._id !== id)
        return old
      })

      return { previousData }
    },
    onSuccess: (_, id) => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })
    },
    onError: (error: any, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Invalidate without delay
      await queryClient.invalidateQueries({ queryKey: contactsKeys.all, refetchType: 'all' })
    },
  })
}

// Bulk delete contacts
export const useBulkDeleteContacts = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => contactsService.bulkDeleteContacts(ids),
    onMutate: async (ids) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactsKeys.lists() })

      // Snapshot previous value
      const previousData = queryClient.getQueriesData({ queryKey: contactsKeys.lists() })

      // Optimistically update all list queries
      queryClient.setQueriesData({ queryKey: contactsKeys.lists() }, (old: any) => {
        if (!old) return old
        // Handle { contacts: [...] } structure
        if (old.contacts && Array.isArray(old.contacts)) {
          return {
            ...old,
            contacts: old.contacts.filter((c: any) => !ids.includes(c._id))
          }
        }
        if (Array.isArray(old)) return old.filter((c: any) => !ids.includes(c._id))
        return old
      })

      return { previousData }
    },
    onSuccess: (_, ids) => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })
    },
    onError: (error: any, _ids, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      // Invalidate without delay
      await queryClient.invalidateQueries({ queryKey: contactsKeys.all, refetchType: 'all' })
    },
  })
}

// Link contact to case
export const useLinkContactToCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ contactId, caseId }: { contactId: string; caseId: string }) =>
      contactsService.linkToCase(contactId, caseId),
    onMutate: async ({ contactId, caseId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactsKeys.detail(contactId) })
      await queryClient.cancelQueries({ queryKey: contactsKeys.byCase(caseId) })

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(contactsKeys.detail(contactId))
      const previousByCase = queryClient.getQueryData(contactsKeys.byCase(caseId))

      // Optimistically update detail to add case
      queryClient.setQueryData(contactsKeys.detail(contactId), (old: any) => {
        if (!old) return old
        const cases = old.cases || []
        if (!cases.includes(caseId)) {
          return { ...old, cases: [...cases, caseId] }
        }
        return old
      })

      return { previousDetail, previousByCase }
    },
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any, { contactId }, context) => {
      // Rollback on error
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(contactsKeys.detail(contactId), context.previousDetail)
      }
      if (context?.previousByCase !== undefined) {
        queryClient.setQueryData(contactsKeys.byCase(contactId), context.previousByCase)
      }

      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { contactId, caseId }) => {
      // Invalidate without delay
      await queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) })
      await queryClient.invalidateQueries({ queryKey: contactsKeys.byCase(caseId) })
    },
  })
}

// Unlink contact from case
export const useUnlinkContactFromCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ contactId, caseId }: { contactId: string; caseId: string }) =>
      contactsService.unlinkFromCase(contactId, caseId),
    onMutate: async ({ contactId, caseId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactsKeys.detail(contactId) })
      await queryClient.cancelQueries({ queryKey: contactsKeys.byCase(caseId) })

      // Snapshot previous values
      const previousDetail = queryClient.getQueryData(contactsKeys.detail(contactId))
      const previousByCase = queryClient.getQueryData(contactsKeys.byCase(caseId))

      // Optimistically update detail to remove case
      queryClient.setQueryData(contactsKeys.detail(contactId), (old: any) => {
        if (!old) return old
        const cases = old.cases || []
        return { ...old, cases: cases.filter((id: string) => id !== caseId) }
      })

      return { previousDetail, previousByCase }
    },
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any, { contactId }, context) => {
      // Rollback on error
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(contactsKeys.detail(contactId), context.previousDetail)
      }
      if (context?.previousByCase !== undefined) {
        queryClient.setQueryData(contactsKeys.byCase(contactId), context.previousByCase)
      }

      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { contactId, caseId }) => {
      // Invalidate without delay
      await queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) })
      await queryClient.invalidateQueries({ queryKey: contactsKeys.byCase(caseId) })
    },
  })
}
