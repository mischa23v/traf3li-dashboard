/**
 * Company Context Provider
 * Manages active company context and multi-company state
 */

import React, { createContext, useContext, useCallback, useMemo, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import companyService, { type Company, type UserCompanyAccess } from '@/services/companyService'
import { toast } from 'sonner'

// ==================== TYPES ====================

interface CompanyContextValue {
  // Active company state
  activeCompanyId: string | null
  activeCompany: Company | null
  activeCompanyAccess: UserCompanyAccess | null

  // Multi-select mode (for consolidated views)
  selectedCompanyIds: string[]
  isMultiSelectMode: boolean

  // User's accessible companies
  accessibleCompanies: Company[]
  accessibleCompaniesMap: Map<string, Company>
  userCompanyAccess: UserCompanyAccess[]

  // Loading states
  isLoading: boolean
  isSwitching: boolean

  // Actions
  switchCompany: (companyId: string) => Promise<void>
  toggleMultiSelect: () => void
  selectCompany: (companyId: string) => void
  deselectCompany: (companyId: string) => void
  selectAllCompanies: () => void
  clearSelectedCompanies: () => void
  setSelectedCompanyIds: (companyIds: string[]) => void

  // Helpers
  canAccessCompany: (companyId: string) => boolean
  getCompanyAccess: (companyId: string) => UserCompanyAccess | undefined
  hasRole: (companyId: string, role: UserCompanyAccess['role']) => boolean
  canManageCompany: (companyId: string) => boolean // owner or admin

  // Refresh
  refetch: () => void
}

// ==================== CONTEXT ====================

const CompanyContext = createContext<CompanyContextValue | null>(null)

// ==================== PROVIDER ====================

interface CompanyProviderProps {
  children: React.ReactNode
}

export function CompanyProvider({ children }: CompanyProviderProps) {
  const queryClient = useQueryClient()

  // Local state for multi-select mode
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([])

  // Fetch active company
  const {
    data: activeCompanyData,
    isLoading: isLoadingActive,
    refetch: refetchActive,
  } = useQuery({
    queryKey: ['company', 'active'],
    queryFn: () => companyService.getActiveCompany(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch accessible companies
  const {
    data: accessibleData,
    isLoading: isLoadingAccessible,
    refetch: refetchAccessible,
  } = useQuery({
    queryKey: ['companies', 'accessible'],
    queryFn: () => companyService.getUserAccessibleCompanies(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Switch company mutation
  const switchMutation = useMutation({
    mutationFn: (companyId: string) => companyService.switchCompany(companyId),
    onSuccess: (data) => {
      // Invalidate active company query
      queryClient.invalidateQueries({ queryKey: ['company', 'active'] })

      // Invalidate all data queries since company context changed
      queryClient.invalidateQueries()

      // Update local storage
      localStorage.setItem('activeCompanyId', data.companyId)

      toast.success(
        `تم التبديل إلى: ${data.company.nameAr || data.company.name}`,
        {
          description: 'جاري تحديث البيانات...',
        }
      )
    },
    onError: (error: any) => {
      toast.error('فشل التبديل بين الشركات', {
        description: error.message || 'حدث خطأ أثناء تبديل الشركة',
      })
    },
  })

  // Derived state
  const activeCompanyId = activeCompanyData?.companyId || null
  const activeCompany = activeCompanyData?.company || null
  const activeCompanyAccess = activeCompanyData?.access || null

  const accessibleCompanies = accessibleData?.companies || []
  const userCompanyAccess = accessibleData?.access || []

  // Create companies map for quick lookup
  const accessibleCompaniesMap = useMemo(() => {
    const map = new Map<string, Company>()
    accessibleCompanies.forEach((company) => {
      map.set(company._id, company)
    })
    return map
  }, [accessibleCompanies])

  // Sync selectedCompanyIds with activeCompanyId when not in multi-select mode
  useEffect(() => {
    if (!isMultiSelectMode && activeCompanyId) {
      setSelectedCompanyIds([activeCompanyId])
    }
  }, [isMultiSelectMode, activeCompanyId])

  // Actions
  const switchCompany = useCallback(
    async (companyId: string) => {
      if (companyId === activeCompanyId) {
        return // Already active
      }
      await switchMutation.mutateAsync(companyId)
    },
    [activeCompanyId, switchMutation]
  )

  const toggleMultiSelect = useCallback(() => {
    setIsMultiSelectMode((prev) => !prev)
    if (isMultiSelectMode) {
      // Exiting multi-select mode, reset to active company only
      if (activeCompanyId) {
        setSelectedCompanyIds([activeCompanyId])
      }
    }
  }, [isMultiSelectMode, activeCompanyId])

  const selectCompany = useCallback((companyId: string) => {
    setSelectedCompanyIds((prev) => {
      if (prev.includes(companyId)) {
        return prev
      }
      return [...prev, companyId]
    })
  }, [])

  const deselectCompany = useCallback((companyId: string) => {
    setSelectedCompanyIds((prev) => prev.filter((id) => id !== companyId))
  }, [])

  const selectAllCompanies = useCallback(() => {
    setSelectedCompanyIds(accessibleCompanies.map((c) => c._id))
  }, [accessibleCompanies])

  const clearSelectedCompanies = useCallback(() => {
    setSelectedCompanyIds(activeCompanyId ? [activeCompanyId] : [])
  }, [activeCompanyId])

  // Helpers
  const canAccessCompany = useCallback(
    (companyId: string): boolean => {
      return accessibleCompaniesMap.has(companyId)
    },
    [accessibleCompaniesMap]
  )

  const getCompanyAccess = useCallback(
    (companyId: string): UserCompanyAccess | undefined => {
      return userCompanyAccess.find((access) => access.companyId === companyId)
    },
    [userCompanyAccess]
  )

  const hasRole = useCallback(
    (companyId: string, role: UserCompanyAccess['role']): boolean => {
      const access = getCompanyAccess(companyId)
      return access?.role === role
    },
    [getCompanyAccess]
  )

  const canManageCompany = useCallback(
    (companyId: string): boolean => {
      const access = getCompanyAccess(companyId)
      return access?.role === 'owner' || access?.role === 'admin'
    },
    [getCompanyAccess]
  )

  const refetch = useCallback(() => {
    refetchActive()
    refetchAccessible()
  }, [refetchActive, refetchAccessible])

  // Context value
  const value: CompanyContextValue = useMemo(
    () => ({
      activeCompanyId,
      activeCompany,
      activeCompanyAccess,
      selectedCompanyIds,
      isMultiSelectMode,
      accessibleCompanies,
      accessibleCompaniesMap,
      userCompanyAccess,
      isLoading: isLoadingActive || isLoadingAccessible,
      isSwitching: switchMutation.isPending,
      switchCompany,
      toggleMultiSelect,
      selectCompany,
      deselectCompany,
      selectAllCompanies,
      clearSelectedCompanies,
      setSelectedCompanyIds,
      canAccessCompany,
      getCompanyAccess,
      hasRole,
      canManageCompany,
      refetch,
    }),
    [
      activeCompanyId,
      activeCompany,
      activeCompanyAccess,
      selectedCompanyIds,
      isMultiSelectMode,
      accessibleCompanies,
      accessibleCompaniesMap,
      userCompanyAccess,
      isLoadingActive,
      isLoadingAccessible,
      switchMutation.isPending,
      switchCompany,
      toggleMultiSelect,
      selectCompany,
      deselectCompany,
      selectAllCompanies,
      clearSelectedCompanies,
      canAccessCompany,
      getCompanyAccess,
      hasRole,
      canManageCompany,
      refetch,
    ]
  )

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
}

// ==================== HOOK ====================

export function useCompanyContext() {
  const context = useContext(CompanyContext)

  if (!context) {
    throw new Error('useCompanyContext must be used within CompanyProvider')
  }

  return context
}

// Export types
export type { CompanyContextValue }
