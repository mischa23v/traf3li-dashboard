/**
 * Organizations Hook
 * React Query hooks for organization management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import organizationsService, {
  type Organization,
  type OrganizationFilters,
  type CreateOrganizationData,
  type UpdateOrganizationData,
  type OrganizationsResponse,
} from '@/services/organizationsService'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/hooks/use-language'

// Query Keys
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: OrganizationFilters) => [...organizationKeys.lists(), filters] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  search: (query: string) => [...organizationKeys.all, 'search', query] as const,
  byClient: (clientId: string) => [...organizationKeys.all, 'byClient', clientId] as const,
}

// ═══════════════════════════════════════════════════════════════
// GET ORGANIZATIONS
// ═══════════════════════════════════════════════════════════════

export function useOrganizations(filters?: OrganizationFilters) {
  return useQuery({
    queryKey: organizationKeys.list(filters || {}),
    queryFn: () => organizationsService.getOrganizations(filters),
  })
}

// ═══════════════════════════════════════════════════════════════
// GET SINGLE ORGANIZATION
// ═══════════════════════════════════════════════════════════════

export function useOrganization(id: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id),
    queryFn: () => organizationsService.getOrganization(id),
    enabled: !!id,
  })
}

// ═══════════════════════════════════════════════════════════════
// SEARCH ORGANIZATIONS
// ═══════════════════════════════════════════════════════════════

export function useSearchOrganizations(query: string) {
  return useQuery({
    queryKey: organizationKeys.search(query),
    queryFn: () => organizationsService.searchOrganizations(query),
    enabled: query.length >= 2,
  })
}

// ═══════════════════════════════════════════════════════════════
// GET ORGANIZATIONS BY CLIENT
// ═══════════════════════════════════════════════════════════════

export function useOrganizationsByClient(clientId: string) {
  return useQuery({
    queryKey: organizationKeys.byClient(clientId),
    queryFn: () => organizationsService.getOrganizationsByClient(clientId),
    enabled: !!clientId,
  })
}

// ═══════════════════════════════════════════════════════════════
// CREATE ORGANIZATION
// ═══════════════════════════════════════════════════════════════

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  return useMutation({
    mutationFn: (data: CreateOrganizationData) =>
      organizationsService.createOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      toast({
        title: isRTL ? 'تم إنشاء المنظمة' : 'Organization Created',
        description: isRTL
          ? 'تم إنشاء المنظمة بنجاح'
          : 'Organization has been created successfully',
      })
    },
    onError: (error: Error) => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل إنشاء المنظمة' : 'Failed to create organization'),
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// UPDATE ORGANIZATION
// ═══════════════════════════════════════════════════════════════

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationData }) =>
      organizationsService.updateOrganization(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.id) })
      toast({
        title: isRTL ? 'تم تحديث المنظمة' : 'Organization Updated',
        description: isRTL
          ? 'تم تحديث المنظمة بنجاح'
          : 'Organization has been updated successfully',
      })
    },
    onError: (error: Error) => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل تحديث المنظمة' : 'Failed to update organization'),
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// DELETE ORGANIZATION
// ═══════════════════════════════════════════════════════════════

export function useDeleteOrganization() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  return useMutation({
    mutationFn: (id: string) => organizationsService.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      toast({
        title: isRTL ? 'تم حذف المنظمة' : 'Organization Deleted',
        description: isRTL
          ? 'تم حذف المنظمة بنجاح'
          : 'Organization has been deleted successfully',
      })
    },
    onError: (error: Error) => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل حذف المنظمة' : 'Failed to delete organization'),
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// BULK DELETE ORGANIZATIONS
// ═══════════════════════════════════════════════════════════════

export function useBulkDeleteOrganizations() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  return useMutation({
    mutationFn: (ids: string[]) => organizationsService.bulkDeleteOrganizations(ids),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() })
      toast({
        title: isRTL ? 'تم حذف المنظمات' : 'Organizations Deleted',
        description: isRTL
          ? `تم حذف ${variables.length} منظمة بنجاح`
          : `${variables.length} organizations have been deleted successfully`,
      })
    },
    onError: (error: Error) => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل حذف المنظمات' : 'Failed to delete organizations'),
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// LINK ORGANIZATION TO CASE
// ═══════════════════════════════════════════════════════════════

export function useLinkOrganizationToCase() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  return useMutation({
    mutationFn: ({ organizationId, caseId }: { organizationId: string; caseId: string }) =>
      organizationsService.linkToCase(organizationId, caseId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.organizationId) })
      toast({
        title: isRTL ? 'تم الربط' : 'Linked',
        description: isRTL
          ? 'تم ربط المنظمة بالقضية بنجاح'
          : 'Organization has been linked to the case successfully',
      })
    },
    onError: (error: Error) => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل ربط المنظمة' : 'Failed to link organization'),
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// LINK ORGANIZATION TO CLIENT
// ═══════════════════════════════════════════════════════════════

export function useLinkOrganizationToClient() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  return useMutation({
    mutationFn: ({ organizationId, clientId }: { organizationId: string; clientId: string }) =>
      organizationsService.linkToClient(organizationId, clientId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.organizationId) })
      toast({
        title: isRTL ? 'تم الربط' : 'Linked',
        description: isRTL
          ? 'تم ربط المنظمة بالعميل بنجاح'
          : 'Organization has been linked to the client successfully',
      })
    },
    onError: (error: Error) => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل ربط المنظمة' : 'Failed to link organization'),
        variant: 'destructive',
      })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// LINK ORGANIZATION TO CONTACT
// ═══════════════════════════════════════════════════════════════

export function useLinkOrganizationToContact() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isRTL } = useLanguage()

  return useMutation({
    mutationFn: ({ organizationId, contactId }: { organizationId: string; contactId: string }) =>
      organizationsService.linkToContact(organizationId, contactId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.detail(variables.organizationId) })
      toast({
        title: isRTL ? 'تم الربط' : 'Linked',
        description: isRTL
          ? 'تم ربط المنظمة بجهة الاتصال بنجاح'
          : 'Organization has been linked to the contact successfully',
      })
    },
    onError: (error: Error) => {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل ربط المنظمة' : 'Failed to link organization'),
        variant: 'destructive',
      })
    },
  })
}

export default {
  useOrganizations,
  useOrganization,
  useSearchOrganizations,
  useOrganizationsByClient,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  useBulkDeleteOrganizations,
  useLinkOrganizationToCase,
  useLinkOrganizationToClient,
  useLinkOrganizationToContact,
}
