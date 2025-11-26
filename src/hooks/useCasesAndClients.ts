/**
 * Cases and Clients Hooks
 * TanStack Query hooks for cases and clients operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import casesService, {
  CaseFilters,
  CreateCaseData,
  UpdateCaseData,
  AddNoteData,
  AddDocumentData,
  AddHearingData,
  CaseStatus,
  CaseOutcome,
  Case,
} from '@/services/casesService'
import clientsService, {
  ClientFilters,
  CreateClientData,
} from '@/services/clientsService'

// ==================== CASES ====================

/**
 * Fetch all cases with optional filters
 */
export const useCases = (filters?: CaseFilters) => {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => casesService.getCases(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Fetch single case by ID
 */
export const useCase = (id: string) => {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => casesService.getCase(id),
    enabled: !!id,
  })
}

/**
 * Calculate case statistics from fetched cases
 */
export const useCaseStatistics = (cases: Case[] | undefined) => {
  if (!cases) {
    return {
      total: 0,
      active: 0,
      closed: 0,
      won: 0,
      lost: 0,
      settled: 0,
      onHold: 0,
      highPriority: 0,
      totalClaimAmount: 0,
      avgProgress: 0,
    }
  }
  return casesService.calculateStatistics(cases)
}

/**
 * Create new case mutation
 */
export const useCreateCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateCaseData) => casesService.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success(t('cases.createSuccess', 'تم إنشاء القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.createError', 'فشل إنشاء القضية'))
    },
  })
}

/**
 * Update case mutation
 */
export const useUpdateCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCaseData }) =>
      casesService.updateCase(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      toast.success(t('cases.updateSuccess', 'تم تحديث القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.updateError', 'فشل تحديث القضية'))
    },
  })
}

/**
 * Delete case mutation
 */
export const useDeleteCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => casesService.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast.success(t('cases.deleteSuccess', 'تم حذف القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.deleteError', 'فشل حذف القضية'))
    },
  })
}

/**
 * Add note to case mutation
 */
export const useAddCaseNote = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddNoteData }) =>
      casesService.addNote(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      toast.success(t('cases.noteAddSuccess', 'تمت إضافة الملاحظة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.noteAddError', 'فشل إضافة الملاحظة'))
    },
  })
}

/**
 * Add document to case mutation
 */
export const useAddCaseDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddDocumentData }) =>
      casesService.addDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      toast.success(t('cases.documentAddSuccess', 'تمت إضافة المستند بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentAddError', 'فشل إضافة المستند'))
    },
  })
}

/**
 * Add hearing to case mutation
 */
export const useAddCaseHearing = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddHearingData }) =>
      casesService.addHearing(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      toast.success(t('cases.hearingAddSuccess', 'تمت إضافة الجلسة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.hearingAddError', 'فشل إضافة الجلسة'))
    },
  })
}

/**
 * Update case status mutation
 */
export const useUpdateCaseStatus = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CaseStatus }) =>
      casesService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      toast.success(t('cases.statusUpdateSuccess', 'تم تحديث حالة القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.statusUpdateError', 'فشل تحديث حالة القضية'))
    },
  })
}

/**
 * Update case outcome mutation
 */
export const useUpdateCaseOutcome = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: CaseOutcome }) =>
      casesService.updateOutcome(id, outcome),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
      queryClient.invalidateQueries({ queryKey: ['cases', id] })
      toast.success(t('cases.outcomeUpdateSuccess', 'تم تحديث نتيجة القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.outcomeUpdateError', 'فشل تحديث نتيجة القضية'))
    },
  })
}

// ==================== CLIENTS ====================

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getClient(id),
    enabled: !!id,
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateClientData) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success(t('clients.createSuccess', 'تم إنشاء العميل بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('clients.createError', 'فشل إنشاء العميل'))
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      clientsService.updateClient(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', id] })
      toast.success(t('clients.updateSuccess', 'تم تحديث العميل بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('clients.updateError', 'فشل تحديث العميل'))
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success(t('clients.deleteSuccess', 'تم حذف العميل بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('clients.deleteError', 'فشل حذف العميل'))
    },
  })
}

export const useSearchClients = (query: string) => {
  return useQuery({
    queryKey: ['clients', 'search', query],
    queryFn: () => clientsService.searchClients(query),
    enabled: query.length >= 2,
    staleTime: 1 * 60 * 1000,
  })
}

export const useClientStats = () => {
  return useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: () => clientsService.getStats(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTopRevenueClients = (limit: number = 10) => {
  return useQuery({
    queryKey: ['clients', 'top-revenue', limit],
    queryFn: () => clientsService.getTopRevenue(limit),
    staleTime: 5 * 60 * 1000,
  })
}
