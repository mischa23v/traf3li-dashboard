/**
 * Contact Hooks
 * React Query hooks for Contact management
 * Follows the same pattern as useCrm.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import { contactService } from '@/services/contactService'
import type {
  Contact,
  CreateContactData,
  Case,
} from '@/services/contactService'
import type { ContactFilters } from '@/services/contactsService'
import type { CrmActivity } from '@/types/crm'
import type { ContactConflictCheck } from '@/types/crm-extended'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when mutations occur
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all contacts with optional filters
 */
export const useContacts = (filters?: ContactFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.contacts.list(filters),
    queryFn: () => contactService.getContacts(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single contact
 */
export const useContact = (contactId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.contacts.detail(contactId),
    queryFn: () => contactService.getContact(contactId),
    enabled: !!contactId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get contact cases
 */
export const useContactCases = (contactId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...QueryKeys.contacts.detail(contactId), 'cases'] as const,
    queryFn: () => contactService.getContactCases(contactId),
    enabled: !!contactId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get contact activities
 */
export const useContactActivities = (
  contactId: string,
  params?: { page?: number; limit?: number },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...QueryKeys.contacts.detail(contactId), 'activities', params] as const,
    queryFn: () => contactService.getContactActivities(contactId, params),
    enabled: !!contactId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new contact
 */
export const useCreateContact = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContactData) => contactService.createContact(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء جهة الاتصال بنجاح')

      // Manually update the cache with the REAL contact from server
      queryClient.setQueriesData({ queryKey: ['contacts'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: N } structure
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
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء جهة الاتصال')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return await invalidateCache.contacts.all()
    },
  })
}

/**
 * Update contact
 */
export const useUpdateContact = () => {
  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: Partial<Contact> }) =>
      contactService.updateContact(contactId, data),
    onSuccess: () => {
      toast.success('تم تحديث جهة الاتصال بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث جهة الاتصال')
    },
    onSettled: async (_, __, { contactId }) => {
      await invalidateCache.contacts.all()
      return await invalidateCache.contacts.detail(contactId)
    },
  })
}

/**
 * Delete contact
 */
export const useDeleteContact = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contactId: string) => contactService.deleteContact(contactId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, contactId) => {
      toast.success('تم حذف جهة الاتصال بنجاح')

      // Optimistically remove contact from all lists
      queryClient.setQueriesData({ queryKey: ['contacts'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: N } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== contactId),
            total: Math.max(0, (old.total || old.data.length) - 1),
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== contactId)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف جهة الاتصال')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return await invalidateCache.contacts.all()
    },
  })
}

/**
 * Bulk delete contacts
 */
export const useBulkDeleteContacts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (contactIds: string[]) => {
      // Delete contacts sequentially to avoid overwhelming the server
      for (const contactId of contactIds) {
        await contactService.deleteContact(contactId)
      }
    },
    onSuccess: (_, contactIds) => {
      toast.success(`تم حذف ${contactIds.length} جهات اتصال بنجاح`)

      // Optimistically remove contacts from all lists
      queryClient.setQueriesData({ queryKey: ['contacts'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: N } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => !contactIds.includes(item._id)),
            total: Math.max(0, (old.total || old.data.length) - contactIds.length),
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => !contactIds.includes(item._id))
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف جهات الاتصال')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return await invalidateCache.contacts.all()
    },
  })
}

/**
 * Run conflict check
 */
export const useRunConflictCheck = () => {
  return useMutation({
    mutationFn: (contactId: string) => contactService.runConflictCheck(contactId),
    onSuccess: () => {
      toast.success('تم إجراء فحص تعارض المصالح بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل فحص تعارض المصالح')
    },
    onSettled: async (_, __, contactId) => {
      return await invalidateCache.contacts.detail(contactId)
    },
  })
}

/**
 * Update conflict status
 */
export const useUpdateConflictStatus = () => {
  return useMutation({
    mutationFn: ({
      contactId,
      status,
      notes,
    }: {
      contactId: string
      status: string
      notes?: string
    }) => contactService.updateConflictStatus(contactId, { status, notes }),
    onSuccess: () => {
      toast.success('تم تحديث حالة تعارض المصالح بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة تعارض المصالح')
    },
    onSettled: async (_, __, { contactId }) => {
      return await invalidateCache.contacts.detail(contactId)
    },
  })
}

/**
 * Link contact to case
 */
export const useLinkContactToCase = () => {
  return useMutation({
    mutationFn: ({
      contactId,
      caseId,
      role,
    }: {
      contactId: string
      caseId: string
      role: string
    }) => contactService.linkToCase(contactId, caseId, role),
    onSuccess: () => {
      toast.success('تم ربط جهة الاتصال بالقضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل ربط جهة الاتصال بالقضية')
    },
    onSettled: async (_, __, { contactId, caseId }) => {
      await invalidateCache.contacts.detail(contactId)
      return await invalidateCache.contacts.byCase(caseId)
    },
  })
}

/**
 * Unlink contact from case
 */
export const useUnlinkContactFromCase = () => {
  return useMutation({
    mutationFn: ({ contactId, caseId }: { contactId: string; caseId: string }) =>
      contactService.unlinkFromCase(contactId, caseId),
    onSuccess: () => {
      toast.success('تم فك ارتباط جهة الاتصال من القضية بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل فك ارتباط جهة الاتصال من القضية')
    },
    onSettled: async (_, __, { contactId, caseId }) => {
      await invalidateCache.contacts.detail(contactId)
      return await invalidateCache.contacts.byCase(caseId)
    },
  })
}

/**
 * Merge contacts
 */
export const useMergeContacts = () => {
  return useMutation({
    mutationFn: ({ primaryId, secondaryIds }: { primaryId: string; secondaryIds: string[] }) =>
      contactService.mergeContacts(primaryId, secondaryIds),
    onSuccess: () => {
      toast.success('تم دمج جهات الاتصال بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل دمج جهات الاتصال')
    },
    onSettled: async (_, __, { primaryId }) => {
      await invalidateCache.contacts.all()
      return await invalidateCache.contacts.detail(primaryId)
    },
  })
}
