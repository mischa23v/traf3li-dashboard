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

// ==================== QUERY HOOKS ====================

/**
 * Get all companies
 */
export const useCompanies = (filters?: CompanyFilters) => {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => companyService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get company by ID
 */
export const useCompany = (id: string | undefined) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get company hierarchy tree
 */
export const useCompanyTree = (rootCompanyId?: string) => {
  return useQuery({
    queryKey: ['companies', 'tree', rootCompanyId],
    queryFn: () => companyService.getTree(rootCompanyId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get child companies
 */
export const useChildCompanies = (parentId: string | undefined) => {
  return useQuery({
    queryKey: ['companies', parentId, 'children'],
    queryFn: () => companyService.getChildren(parentId!),
    enabled: !!parentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get user's accessible companies
 */
export const useAccessibleCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'accessible'],
    queryFn: () => companyService.getUserAccessibleCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get active company
 */
export const useActiveCompany = () => {
  return useQuery({
    queryKey: ['company', 'active'],
    queryFn: () => companyService.getActiveCompany(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get company access list
 */
export const useCompanyAccessList = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['company', companyId, 'access'],
    queryFn: () => companyService.getAccessList(companyId!),
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ==================== MUTATION HOOKS ====================

/**
 * Create company
 */
export const useCreateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompanyData) => companyService.create(data),
    onSuccess: (newCompany) => {
      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] })

      // Invalidate tree if parent exists
      if (newCompany.parentCompanyId) {
        queryClient.invalidateQueries({
          queryKey: ['companies', newCompany.parentCompanyId, 'children'],
        })
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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCompanyData }) =>
      companyService.update(id, data),
    onSuccess: (updatedCompany, variables) => {
      // Invalidate specific company
      queryClient.invalidateQueries({ queryKey: ['company', variables.id] })

      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: ['companies'] })

      // Invalidate tree
      queryClient.invalidateQueries({ queryKey: ['companies', 'tree'] })

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
      queryClient.invalidateQueries({ queryKey: ['companies'] })

      // Invalidate tree
      queryClient.invalidateQueries({ queryKey: ['companies', 'tree'] })

      // Remove from cache
      queryClient.removeQueries({ queryKey: ['company', deletedId] })

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newParentId }: { id: string; newParentId: string | null }) =>
      companyService.move(id, newParentId),
    onSuccess: (movedCompany) => {
      // Invalidate companies list and tree
      queryClient.invalidateQueries({ queryKey: ['companies'] })

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (companyId: string) => companyService.switchCompany(companyId),
    onSuccess: (data) => {
      // Invalidate active company
      queryClient.invalidateQueries({ queryKey: ['company', 'active'] })

      // Invalidate ALL queries since company context changed
      queryClient.invalidateQueries()

      // Update localStorage
      localStorage.setItem('activeCompanyId', data.companyId)

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      companyId,
      userId,
      data,
    }: {
      companyId: string
      userId: string
      data: {
        role: UserCompanyAccess['role']
        permissions?: string[]
        canAccessChildren?: boolean
        canAccessParent?: boolean
        isDefault?: boolean
      }
    }) => companyService.grantAccess(companyId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company', variables.companyId, 'access'] })

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ companyId, userId }: { companyId: string; userId: string }) =>
      companyService.revokeAccess(companyId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company', variables.companyId, 'access'] })

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
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      companyId,
      userId,
      data,
    }: {
      companyId: string
      userId: string
      data: Partial<UserCompanyAccess>
    }) => companyService.updateAccess(companyId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company', variables.companyId, 'access'] })

      toast.success('تم تحديث الصلاحية بنجاح')
    },
    onError: (error: any) => {
      toast.error('فشل تحديث الصلاحية', {
        description: error.message || 'حدث خطأ أثناء تحديث الصلاحية',
      })
    },
  })
}
