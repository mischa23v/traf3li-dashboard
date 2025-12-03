import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import contactsService, {
  type ContactFilters,
  type CreateContactData,
  type UpdateContactData,
} from '@/services/contactsService'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

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
  return useQuery({
    queryKey: contactsKeys.list(filters || {}),
    queryFn: () => contactsService.getContacts(filters),
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
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.createdSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: contactsKeys.all })
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
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: contactsKeys.all })
      return await queryClient.invalidateQueries({ queryKey: contactsKeys.detail(id) })
    },
  })
}

// Delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => contactsService.deleteContact(id),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: contactsKeys.all })
    },
  })
}

// Bulk delete contacts
export const useBulkDeleteContacts = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (ids: string[]) => contactsService.bulkDeleteContacts(ids),
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.deletedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: contactsKeys.all })
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
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { contactId, caseId }) => {
      await queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) })
      return await queryClient.invalidateQueries({ queryKey: contactsKeys.byCase(caseId) })
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
    onSuccess: () => {
      toast({
        title: t('status.success'),
        description: t('status.updatedSuccessfully'),
      })
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('status.error'),
        description: error.response?.data?.message || t('common.unknownError'),
      })
    },
    onSettled: async (_, __, { contactId, caseId }) => {
      await queryClient.invalidateQueries({ queryKey: contactsKeys.detail(contactId) })
      return await queryClient.invalidateQueries({ queryKey: contactsKeys.byCase(caseId) })
    },
  })
}
