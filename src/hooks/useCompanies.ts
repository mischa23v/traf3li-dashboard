/**
 * Company Hooks
 * React Query hooks for company operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import companyService, {
  type Company,
  type CompanyFilters,
  type CreateCompanyData,
  type UpdateCompanyData,
  type UserCompanyAccess,
  type CompanyTreeNode,
} from '@/services/companyService'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'

// ==================== QUERY HOOKS ====================

/**
 * Get all companies
 */
export const useCompanies = (filters?: CompanyFilters) => {
  return useQuery({
    queryKey: ['firms', filters],
    queryFn: () => companyService.getAll(filters),
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Get company by ID
 */
export const useCompany = (id: string | undefined) => {
  return useQuery({
    queryKey: ['firm', id],
    queryFn: () => companyService.getById(id!),
    enabled: !!id,
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get company hierarchy tree
 */
export const useCompanyTree = (rootFirmId?: string) => {
  return useQuery({
    queryKey: ['firms', 'tree', rootFirmId],
    queryFn: () => companyService.getTree(rootFirmId),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get child companies
 */
export const useChildCompanies = (parentId: string | undefined) => {
  return useQuery({
    queryKey: ['firms', parentId, 'children'],
    queryFn: () => companyService.getChildren(parentId!),
    enabled: !!parentId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

/**
 * Get user's accessible companies
 */
export const useAccessibleCompanies = () => {
  return useQuery({
    queryKey: ['firms', 'accessible'],
    queryFn: () => companyService.getUserAccessibleCompanies(),
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get active company
 */
export const useActiveCompany = () => {
  return useQuery({
    queryKey: ['firm', 'active'],
    queryFn: () => companyService.getActiveCompany(),
    retry: 1,
    staleTime: CACHE_TIMES.MEDIUM,
  })
}

/**
 * Get company access list
 */
export const useCompanyAccessList = (firmId: string | undefined) => {
  return useQuery({
    queryKey: ['firm', firmId, 'access'],
    queryFn: () => companyService.getAccessList(firmId!),
    enabled: !!firmId,
    staleTime: CACHE_TIMES.SHORT,
  })
}

// ==================== MUTATION HOOKS ====================

/**
 * Create company
 */
export const useCreateCompany = () => {
  return useMutation({
    mutationFn: (data: CreateCompanyData) => companyService.create(data),
    onSuccess: (newCompany) => {
      // Invalidate companies list
      invalidateCache.companies.all()

      // Invalidate tree if parent exists
      if (newCompany.parentFirmId) {
        invalidateCache.companies.children(newCompany.parentFirmId)
      }

      toast.success('تم إنشاء الشركة بنجاح', {
        description: `${newCompany.nameAr || newCompany.name}`,
      })
    },
    onError: (error: any) => {
      toast.error('فشل إنشاء الشركة', {
        description: error.message || 'حدث خطأ أثناء إنشاء الشركة',
      })
    },
  })
}

/**
 * Update company
 */
export const useUpdateCompany = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) =>
      companyService.update(id, data),
    onSuccess: (updatedCompany, variables) => {
      // Invalidate specific company
      invalidateCache.companies.detail(variables.id)

      // Invalidate companies list
      invalidateCache.companies.all()

      // Invalidate tree
      invalidateCache.companies.tree()

      toast.success('تم تحديث الشركة بنجاح', {
        description: `${updatedCompany.nameAr || updatedCompany.name}`,
      })
    },
    onError: (error: any) => {
      toast.error('فشل تحديث الشركة', {
        description: error.message || 'حدث خطأ أثناء تحديث الشركة',
      })
    },
  })
}

/**
 * Delete company
 */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => companyService.delete(id),
    onSuccess: (_, deletedId) => {
      // Invalidate companies list
      invalidateCache.companies.all()

      // Invalidate tree
      invalidateCache.companies.tree()

      // Remove from cache
      queryClient.removeQueries({ queryKey: ['firm', deletedId] })

      toast.success('تم حذف الشركة بنجاح')
    },
    onError: (error: any) => {
      toast.error('فشل حذف الشركة', {
        description: error.message || 'حدث خطأ أثناء حذف الشركة',
      })
    },
  })
}

/**
 * Move company to different parent
 */
export const useMoveCompany = () => {
  return useMutation({
    mutationFn: ({ id, newParentId }: { id: string; newParentId: string | null }) =>
      companyService.move(id, newParentId),
    onSuccess: (movedCompany) => {
      // Invalidate companies list and tree
      invalidateCache.companies.all()

      toast.success('تم نقل الشركة بنجاح', {
        description: `${movedCompany.nameAr || movedCompany.name}`,
      })
    },
    onError: (error: any) => {
      toast.error('فشل نقل الشركة', {
        description: error.message || 'حدث خطأ أثناء نقل الشركة',
      })
    },
  })
}

/**
 * Switch company
 */
export const useSwitchCompany = () => {
  return useMutation({
    mutationFn: (firmId: string) => companyService.switchCompany(firmId),
    onSuccess: (data) => {
      // Invalidate active company
      invalidateCache.companies.active()

      // Invalidate ALL queries since company context changed
      invalidateCache.all()

      // Update localStorage
      localStorage.setItem('activeFirmId', data.firmId)

      toast.success(`تم التبديل إلى: ${data.company.nameAr || data.company.name}`, {
        description: 'جاري تحديث البيانات...',
      })
    },
    onError: (error: any) => {
      toast.error('فشل التبديل بين الشركات', {
        description: error.message || 'حدث خطأ أثناء تبديل الشركة',
      })
    },
  })
}

/**
 * Grant user access to company
 */
export const useGrantCompanyAccess = () => {
  return useMutation({
    mutationFn: ({
      firmId,
      userId,
      data,
    }: {
      firmId: string
      userId: string
      data: {
        role: UserCompanyAccess['role']
        permissions?: string[]
        canAccessChildren?: boolean
        canAccessParent?: boolean
        isDefault?: boolean
      }
    }) => companyService.grantAccess(firmId, userId, data),
    onSuccess: (_, variables) => {
      invalidateCache.companies.access(variables.firmId)

      toast.success('تم منح الصلاحية بنجاح')
    },
    onError: (error: any) => {
      toast.error('فشل منح الصلاحية', {
        description: error.message || 'حدث خطأ أثناء منح الصلاحية',
      })
    },
  })
}

/**
 * Revoke user access to company
 */
export const useRevokeCompanyAccess = () => {
  return useMutation({
    mutationFn: ({ firmId, userId }: { firmId: string; userId: string }) =>
      companyService.revokeAccess(firmId, userId),
    onSuccess: (_, variables) => {
      invalidateCache.companies.access(variables.firmId)

      toast.success('تم إلغاء الصلاحية بنجاح')
    },
    onError: (error: any) => {
      toast.error('فشل إلغاء الصلاحية', {
        description: error.message || 'حدث خطأ أثناء إلغاء الصلاحية',
      })
    },
  })
}

/**
 * Update user access to company
 */
export const useUpdateCompanyAccess = () => {
  return useMutation({
    mutationFn: ({
      firmId,
      userId,
      data,
    }: {
      firmId: string
      userId: string
      data: Partial<UserCompanyAccess>
    }) => companyService.updateAccess(firmId, userId, data),
    onSuccess: (_, variables) => {
      invalidateCache.companies.access(variables.firmId)

      toast.success('تم تحديث الصلاحية بنجاح')
    },
    onError: (error: any) => {
      toast.error('فشل تحديث الصلاحية', {
        description: error.message || 'حدث خطأ أثناء تحديث الصلاحية',
      })
    },
  })
}
