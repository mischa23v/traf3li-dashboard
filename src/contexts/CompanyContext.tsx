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
  activeFirmId: string | null
  activeCompany: Company | null
  activeCompanyAccess: UserCompanyAccess | null

  // Multi-select mode (for consolidated views)
  selectedFirmIds: string[]
  isMultiSelectMode: boolean

  // User's accessible companies
  accessibleCompanies: Company[]
  accessibleCompaniesMap: Map<string, Company>
  userCompanyAccess: UserCompanyAccess[]

  // Loading states
  isLoading: boolean
  isSwitching: boolean

  // Actions
  switchCompany: (firmId: string) => Promise<void>
  toggleMultiSelect: () => void
  selectCompany: (firmId: string) => void
  deselectCompany: (firmId: string) => void
  selectAllCompanies: () => void
  clearSelectedCompanies: () => void
  setSelectedFirmIds: (firmIds: string[]) => void

  // Helpers
  canAccessCompany: (firmId: string) => boolean
  getCompanyAccess: (firmId: string) => UserCompanyAccess | undefined
  hasRole: (firmId: string, role: UserCompanyAccess['role']) => boolean
  canManageCompany: (firmId: string) => boolean // owner or admin

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
  const [selectedFirmIds, setSelectedFirmIds] = useState<string[]>([])

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
    mutationFn: (firmId: string) => companyService.switchCompany(firmId),
    onSuccess: (data) => {
      // Invalidate active company query
      queryClient.invalidateQueries({ queryKey: ['company', 'active'] })

      // Invalidate all data queries since company context changed
      queryClient.invalidateQueries()

      // Update local storage
      localStorage.setItem('activeFirmId', data.firmId)

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
  const activeFirmId = activeCompanyData?.firmId || null
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

  // Sync selectedFirmIds with activeFirmId when not in multi-select mode
  useEffect(() => {
    if (!isMultiSelectMode && activeFirmId) {
      setSelectedFirmIds([activeFirmId])
    }
  }, [isMultiSelectMode, activeFirmId])

  // Actions
  const switchCompany = useCallback(
    async (firmId: string) => {
      if (firmId === activeFirmId) {
        return // Already active
      }
      await switchMutation.mutateAsync(firmId)
    },
    [activeFirmId, switchMutation]
  )

  const toggleMultiSelect = useCallback(() => {
    setIsMultiSelectMode((prev) => !prev)
    if (isMultiSelectMode) {
      // Exiting multi-select mode, reset to active company only
      if (activeFirmId) {
        setSelectedFirmIds([activeFirmId])
      }
    }
  }, [isMultiSelectMode, activeFirmId])

  const selectCompany = useCallback((firmId: string) => {
    setSelectedFirmIds((prev) => {
      if (prev.includes(firmId)) {
        return prev
      }
      return [...prev, firmId]
    })
  }, [])

  const deselectCompany = useCallback((firmId: string) => {
    setSelectedFirmIds((prev) => prev.filter((id) => id !== firmId))
  }, [])

  const selectAllCompanies = useCallback(() => {
    setSelectedFirmIds(accessibleCompanies.map((c) => c._id))
  }, [accessibleCompanies])

  const clearSelectedCompanies = useCallback(() => {
    setSelectedFirmIds(activeFirmId ? [activeFirmId] : [])
  }, [activeFirmId])

  // Helpers
  const canAccessCompany = useCallback(
    (firmId: string): boolean => {
      return accessibleCompaniesMap.has(firmId)
    },
    [accessibleCompaniesMap]
  )

  const getCompanyAccess = useCallback(
    (firmId: string): UserCompanyAccess | undefined => {
      return userCompanyAccess.find((access) => access.firmId === firmId)
    },
    [userCompanyAccess]
  )

  const hasRole = useCallback(
    (firmId: string, role: UserCompanyAccess['role']): boolean => {
      const access = getCompanyAccess(firmId)
      return access?.role === role
    },
    [getCompanyAccess]
  )

  const canManageCompany = useCallback(
    (firmId: string): boolean => {
      const access = getCompanyAccess(firmId)
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
      activeFirmId,
      activeCompany,
      activeCompanyAccess,
      selectedFirmIds,
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
      setSelectedFirmIds,
      canAccessCompany,
      getCompanyAccess,
      hasRole,
      canManageCompany,
      refetch,
    }),
    [
      activeFirmId,
      activeCompany,
      activeCompanyAccess,
      selectedFirmIds,
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
