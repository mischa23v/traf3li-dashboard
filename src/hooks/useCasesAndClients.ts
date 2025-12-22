/**
 * Cases and Clients Hooks
 * TanStack Query hooks for cases and clients operations
 * Includes automatic calendar/event sync for hearings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Analytics } from '@/lib/analytics'
import casesService, {
  CaseFilters,
  CreateCaseData,
  UpdateCaseData,
  AddNoteData,
  AddDocumentData,
  AddHearingData,
  AddClaimData,
  UpdateNoteData,
  UpdateHearingData,
  UpdateClaimData,
  AddTimelineEventData,
  UpdateTimelineEventData,
  GetUploadUrlData,
  ConfirmUploadData,
  CaseStatus,
  CaseOutcome,
  Case,
  AuditLogEntry,
  CaseCategory,
  PipelineStage,
  CasePipelineCard,
  PipelineStatistics,
  MoveCaseToStageData,
  EndCaseData,
} from '@/services/casesService'
import clientsService, {
  ClientFilters,
  CreateClientData,
} from '@/services/clientsService'
import lawyersService, {
  LawyerFilters,
  Lawyer,
} from '@/services/lawyersService'
import eventsService from '@/services/eventsService'
import remindersService from '@/services/remindersService'

// ==================== Cache Configuration ====================
const STATS_STALE_TIME = 30 * 60 * 1000 // 30 minutes
const STATS_GC_TIME = 60 * 60 * 1000 // 1 hour
const LIST_STALE_TIME = 5 * 60 * 1000 // 5 minutes for lists

// ==================== CASES ====================

/**
 * Fetch all cases with optional filters
 * @param filters - Optional case filters
 * @param isEnabled - Optional flag to defer loading (defaults to true)
 */
export const useCases = (filters?: CaseFilters, isEnabled = true) => {
  return useQuery({
    queryKey: ['cases', filters],
    queryFn: () => casesService.getCases(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled: isEnabled, // Allow deferred loading for performance
  })
}

/**
 * Fetch single case by ID
 * retry: false prevents the "freeze" effect when 403/404 occurs
 */
export const useCase = (id: string) => {
  return useQuery({
    queryKey: ['cases', id],
    queryFn: () => casesService.getCase(id),
    enabled: !!id,
    retry: false, // Don't retry on 403/404 - prevents page freeze
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success(t('cases.createSuccess', 'تم إنشاء القضية بنجاح'))

      // Track analytics event
      Analytics.caseCreated(data.caseType || data.type || 'general')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['cases'] }, (old: any) => {
        if (!old) return old

        // Handle { cases: [...] } structure
        if (old.cases && Array.isArray(old.cases)) {
          return {
            ...old,
            cases: [data, ...old.cases],
            total: (old.total || old.cases.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.createError', 'فشل إنشاء القضية'))
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['cases'], refetchType: 'all' })
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
    onSuccess: (_, { id, data }) => {
      toast.success(t('cases.updateSuccess', 'تم تحديث القضية بنجاح'))

      // Track analytics - especially status changes
      Analytics.caseUpdated(id)
      if (data.status === 'closed' || data.status === 'completed') {
        Analytics.caseClosed(id)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.updateError', 'فشل تحديث القضية'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
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
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success(t('cases.deleteSuccess', 'تم حذف القضية بنجاح'))

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['cases'] }, (old: any) => {
        if (!old) return old

        // Handle { cases: [...] } structure
        if (old.cases && Array.isArray(old.cases)) {
          return {
            ...old,
            cases: old.cases.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.cases.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.deleteError', 'فشل حذف القضية'))
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['cases'], refetchType: 'all' })
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
    onSuccess: () => {
      toast.success(t('cases.noteAddSuccess', 'تمت إضافة الملاحظة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.noteAddError', 'فشل إضافة الملاحظة'))
    },
    onSettled: async (_, __, { id }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
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
    onSuccess: () => {
      toast.success(t('cases.documentAddSuccess', 'تمت إضافة المستند بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentAddError', 'فشل إضافة المستند'))
    },
    onSettled: async (_, __, { id }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
    },
  })
}

/**
 * Add hearing to case mutation
 * Automatically creates a calendar event and reminder for the hearing
 */
export const useAddCaseHearing = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ id, data, caseInfo }: {
      id: string
      data: AddHearingData
      caseInfo?: { title?: string; caseNumber?: string }
    }) => {
      // First, add the hearing to the case
      const result = await casesService.addHearing(id, data)

      // Then, automatically create a calendar event for this hearing
      try {
        const hearingTitle = caseInfo?.title
          ? `جلسة محكمة - ${caseInfo.title}`
          : 'جلسة محكمة'

        await eventsService.createEvent({
          title: hearingTitle,
          description: data.notes || `جلسة محكمة${caseInfo?.caseNumber ? ` - قضية رقم ${caseInfo.caseNumber}` : ''}`,
          type: 'hearing',
          startDate: data.date,
          endDate: data.date,
          allDay: false,
          location: data.location ? { type: 'physical', address: data.location } : undefined,
          caseId: id,
          status: 'scheduled',
          priority: 'high',
        })

        // Also create a reminder 1 day before the hearing
        const hearingDate = new Date(data.date)
        const reminderDate = new Date(hearingDate)
        reminderDate.setDate(reminderDate.getDate() - 1)

        await remindersService.createReminder({
          title: `تذكير: ${hearingTitle}`,
          description: `موعد الجلسة غداً في ${data.location || 'المحكمة'}`,
          type: 'hearing',
          reminderDate: reminderDate.toISOString(),
          priority: 'high',
          relatedCase: id,
          notification: {
            channels: ['push', 'email'],
          },
        })
      } catch (syncError) {
        // Log but don't fail the operation if event/reminder creation fails
      }

      return result
    },
    onSuccess: () => {
      toast.success(t('cases.hearingAddSuccess', 'تمت إضافة الجلسة بنجاح وتم إنشاء حدث في التقويم'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.hearingAddError', 'فشل إضافة الجلسة'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases', id] })
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      return await queryClient.invalidateQueries({ queryKey: ['reminders'] })
    },
  })
}

/**
 * Add claim to case mutation
 */
export const useAddCaseClaim = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddClaimData }) =>
      casesService.addClaim(id, data),
    onSuccess: () => {
      toast.success(t('cases.claimAddSuccess', 'تمت إضافة المطالبة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.claimAddError', 'فشل إضافة المطالبة'))
    },
    onSettled: async (_, __, { id }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
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
    onSuccess: () => {
      toast.success(t('cases.statusUpdateSuccess', 'تم تحديث حالة القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.statusUpdateError', 'فشل تحديث حالة القضية'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
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
    onSuccess: () => {
      toast.success(t('cases.outcomeUpdateSuccess', 'تم تحديث نتيجة القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.outcomeUpdateError', 'فشل تحديث نتيجة القضية'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
    },
  })
}

// ==================== CLIENTS ====================

export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => clientsService.getClients(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useClient = (id: string) => {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getClient(id),
    enabled: !!id,
    retry: false, // Don't retry on 403/404 - prevents page freeze
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: CreateClientData) => clientsService.createClient(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data, variables) => {
      toast.success(t('clients.createSuccess', 'تم إنشاء العميل بنجاح'))

      // Track analytics - CLIENT ENGAGEMENT METRIC
      Analytics.clientCreated(variables.type || data.type || 'individual')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['clients'] }, (old: any) => {
        if (!old) return old

        // Handle { clients: [...] } structure
        if (old.clients && Array.isArray(old.clients)) {
          return {
            ...old,
            clients: [data, ...old.clients],
            total: (old.total || old.clients.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('clients.createError', 'فشل إنشاء العميل'))
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['clients'], refetchType: 'all' })
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClientData> }) =>
      clientsService.updateClient(id, data),
    onSuccess: () => {
      toast.success(t('clients.updateSuccess', 'تم تحديث العميل بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('clients.updateError', 'فشل تحديث العميل'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
      return await queryClient.invalidateQueries({ queryKey: ['clients', id] })
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success(t('clients.deleteSuccess', 'تم حذف العميل بنجاح'))

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['clients'] }, (old: any) => {
        if (!old) return old

        // Handle { clients: [...] } structure
        if (old.clients && Array.isArray(old.clients)) {
          return {
            ...old,
            clients: old.clients.filter((item: any) => item._id !== id),
            total: Math.max(0, (old.total || old.clients.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== id)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('clients.deleteError', 'فشل حذف العميل'))
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['clients'], refetchType: 'all' })
    },
  })
}

export const useSearchClients = (query: string) => {
  return useQuery({
    queryKey: ['clients', 'search', query],
    queryFn: () => clientsService.searchClients(query),
    enabled: query.length >= 2,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useClientStats = () => {
  return useQuery({
    queryKey: ['clients', 'stats'],
    queryFn: () => clientsService.getStats(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useTopRevenueClients = (limit: number = 10) => {
  return useQuery({
    queryKey: ['clients', 'top-revenue', limit],
    queryFn: () => clientsService.getTopRevenue(limit),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ==================== LAWYERS/TEAM ====================

/**
 * Get all lawyers/team members
 */
export const useLawyers = (filters?: LawyerFilters) => {
  return useQuery({
    queryKey: ['lawyers', filters],
    queryFn: () => lawyersService.getAll(filters),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get single lawyer by ID
 */
export const useLawyer = (id: string) => {
  return useQuery({
    queryKey: ['lawyers', id],
    queryFn: () => lawyersService.getById(id),
    enabled: !!id,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get team members available for task assignment
 * @param isEnabled - Optional flag to defer loading (defaults to true)
 */
export const useTeamMembers = (isEnabled = true) => {
  return useQuery({
    queryKey: ['lawyers', 'team'],
    queryFn: () => lawyersService.getTeamMembers(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled: isEnabled, // Allow deferred loading for performance
  })
}

// ==================== NOTES CRUD ====================

/**
 * Update note in case mutation
 */
export const useUpdateCaseNote = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, noteId, data }: { caseId: string; noteId: string; data: UpdateNoteData }) =>
      casesService.updateNote(caseId, noteId, data),
    onSuccess: () => {
      toast.success(t('cases.noteUpdateSuccess', 'تم تحديث الملاحظة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.noteUpdateError', 'فشل تحديث الملاحظة'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Delete note from case mutation
 */
export const useDeleteCaseNote = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, noteId }: { caseId: string; noteId: string }) =>
      casesService.deleteNote(caseId, noteId),
    onSuccess: () => {
      toast.success(t('cases.noteDeleteSuccess', 'تم حذف الملاحظة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.noteDeleteError', 'فشل حذف الملاحظة'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

// ==================== HEARINGS CRUD ====================

/**
 * Update hearing in case mutation
 * Also invalidates calendar queries to keep calendar in sync
 */
export const useUpdateCaseHearing = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, hearingId, data }: { caseId: string; hearingId: string; data: UpdateHearingData }) =>
      casesService.updateHearing(caseId, hearingId, data),
    onSuccess: () => {
      toast.success(t('cases.hearingUpdateSuccess', 'تم تحديث الجلسة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.hearingUpdateError', 'فشل تحديث الجلسة'))
    },
    onSettled: async (_, __, { caseId }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
      return await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Delete hearing from case mutation
 * Also invalidates calendar queries to keep calendar in sync
 */
export const useDeleteCaseHearing = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, hearingId }: { caseId: string; hearingId: string }) =>
      casesService.deleteHearing(caseId, hearingId),
    onSuccess: () => {
      toast.success(t('cases.hearingDeleteSuccess', 'تم حذف الجلسة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.hearingDeleteError', 'فشل حذف الجلسة'))
    },
    onSettled: async (_, __, { caseId }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
      return await queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// ==================== CLAIMS CRUD ====================

/**
 * Update claim in case mutation
 */
export const useUpdateCaseClaim = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, claimId, data }: { caseId: string; claimId: string; data: UpdateClaimData }) =>
      casesService.updateClaim(caseId, claimId, data),
    onSuccess: () => {
      toast.success(t('cases.claimUpdateSuccess', 'تم تحديث المطالبة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.claimUpdateError', 'فشل تحديث المطالبة'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Delete claim from case mutation
 */
export const useDeleteCaseClaim = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, claimId }: { caseId: string; claimId: string }) =>
      casesService.deleteClaim(caseId, claimId),
    onSuccess: () => {
      toast.success(t('cases.claimDeleteSuccess', 'تم حذف المطالبة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.claimDeleteError', 'فشل حذف المطالبة'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

// ==================== TIMELINE CRUD ====================

/**
 * Add timeline event to case mutation
 */
export const useAddCaseTimelineEvent = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: AddTimelineEventData }) =>
      casesService.addTimelineEvent(caseId, data),
    onSuccess: () => {
      toast.success(t('cases.timelineAddSuccess', 'تمت إضافة الحدث بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.timelineAddError', 'فشل إضافة الحدث'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Update timeline event in case mutation
 */
export const useUpdateCaseTimelineEvent = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, eventId, data }: { caseId: string; eventId: string; data: UpdateTimelineEventData }) =>
      casesService.updateTimelineEvent(caseId, eventId, data),
    onSuccess: () => {
      toast.success(t('cases.timelineUpdateSuccess', 'تم تحديث الحدث بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.timelineUpdateError', 'فشل تحديث الحدث'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Delete timeline event from case mutation
 */
export const useDeleteCaseTimelineEvent = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, eventId }: { caseId: string; eventId: string }) =>
      casesService.deleteTimelineEvent(caseId, eventId),
    onSuccess: () => {
      toast.success(t('cases.timelineDeleteSuccess', 'تم حذف الحدث بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.timelineDeleteError', 'فشل حذف الحدث'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

// ==================== DOCUMENT MANAGEMENT ====================

/**
 * Upload document to case (full flow: get URL -> upload to S3 -> confirm)
 */
export const useUploadCaseDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({
      caseId,
      file,
      category,
      description,
    }: {
      caseId: string
      file: File
      category: 'contract' | 'evidence' | 'correspondence' | 'judgment' | 'pleading' | 'other'
      description?: string
    }) => {
      // Step 1: Get presigned upload URL
      const { uploadUrl, fileKey, bucket } = await casesService.getDocumentUploadUrl(caseId, {
        filename: file.name,
        contentType: file.type,
        category,
      })

      // Step 2: Upload file directly to S3
      await casesService.uploadFileToS3(uploadUrl, file)

      // Step 3: Confirm upload and save metadata to DB
      return casesService.confirmDocumentUpload(caseId, {
        filename: file.name,
        fileKey,
        bucket,
        type: file.type,
        size: file.size,
        category,
        description,
      })
    },
    onSuccess: () => {
      toast.success(t('cases.documentUploadSuccess', 'تم رفع المستند بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentUploadError', 'فشل رفع المستند'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Download case document
 */
export const useDownloadCaseDocument = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ caseId, docId }: { caseId: string; docId: string }) => {
      const { downloadUrl, filename } = await casesService.getDocumentDownloadUrl(caseId, docId)

      // Create a temporary link and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return { downloadUrl, filename }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentDownloadError', 'فشل تحميل المستند'))
    },
  })
}

/**
 * Delete case document
 */
export const useDeleteCaseDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, docId }: { caseId: string; docId: string }) =>
      casesService.deleteDocument(caseId, docId),
    onSuccess: () => {
      toast.success(t('cases.documentDeleteSuccess', 'تم حذف المستند بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentDeleteError', 'فشل حذف المستند'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

// ==================== AUDIT HISTORY ====================

/**
 * Get audit history for case
 */
export const useCaseAuditHistory = (caseId: string) => {
  return useQuery({
    queryKey: ['cases', caseId, 'audit'],
    queryFn: () => casesService.getAuditHistory(caseId),
    enabled: !!caseId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Update case progress mutation
 * PATCH /api/cases/:id/progress
 */
export const useUpdateCaseProgress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      casesService.updateProgress(id, progress),
    onSuccess: () => {
      toast.success(t('cases.progressUpdateSuccess', 'تم تحديث تقدم القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.progressUpdateError', 'فشل تحديث تقدم القضية'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
    },
  })
}

// ==================== STATISTICS ====================

/**
 * Fetch case statistics from API
 * GET /api/cases/statistics
 * @param enabled - Whether to enable the query (defaults to true)
 */
export const useCaseStatisticsFromAPI = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['cases', 'statistics'],
    queryFn: () => casesService.getStatistics(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Combined hook for fetching cases and clients together
 * Useful for dropdowns and filters that need both data sources
 */
export const useCasesAndClients = () => {
  const casesQuery = useCases()
  const clientsQuery = useClients()

  return {
    data: {
      cases: casesQuery.data?.data || [],
      clients: clientsQuery.data?.data || [],
    },
    isLoading: casesQuery.isLoading || clientsQuery.isLoading,
    isError: casesQuery.isError || clientsQuery.isError,
    error: casesQuery.error || clientsQuery.error,
  }
}

// ==================== PIPELINE ====================

/**
 * Fetch pipeline cases for a specific category
 * GET /api/cases/pipeline?category=:category
 */
export const usePipelineCases = (category: CaseCategory) => {
  return useQuery({
    queryKey: ['cases', 'pipeline', category],
    queryFn: () => casesService.getPipelineCases(category),
    enabled: !!category,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Fetch pipeline statistics
 * GET /api/cases/pipeline/statistics
 */
export const usePipelineStatistics = (category?: CaseCategory) => {
  return useQuery({
    queryKey: ['cases', 'pipeline', 'statistics', category],
    queryFn: () => casesService.getPipelineStatistics(category),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Fetch valid pipeline stages for a category
 * GET /api/cases/pipeline/stages?category=:category
 */
export const usePipelineStages = (category: CaseCategory) => {
  return useQuery({
    queryKey: ['cases', 'pipeline', 'stages', category],
    queryFn: () => casesService.getPipelineStages(category),
    enabled: !!category,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Move case to a new pipeline stage
 * PATCH /api/cases/:id/stage
 */
export const useMoveCaseToStage = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: MoveCaseToStageData }) =>
      casesService.moveCaseToStage(caseId, data),
    onSuccess: () => {
      toast.success(t('cases.stageUpdateSuccess', 'تم نقل القضية للمرحلة الجديدة بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.stageUpdateError', 'فشل نقل القضية'))
    },
    onSettled: async (_, __, { caseId }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases', 'pipeline'] })
      await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
      return await queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}

/**
 * End a case (mark as won/lost/settled)
 * POST /api/cases/:id/end
 */
export const useEndCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: EndCaseData }) =>
      casesService.endCase(caseId, data),
    onSuccess: () => {
      toast.success(t('cases.endCaseSuccess', 'تم إنهاء القضية بنجاح'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.endCaseError', 'فشل إنهاء القضية'))
    },
    onSettled: async (_, __, { caseId }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases', 'pipeline'] })
      await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
      return await queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}
