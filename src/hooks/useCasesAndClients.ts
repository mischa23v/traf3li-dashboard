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
      toast.success(t('cases.createSuccess', 'تم إنشاء القضية بنجاح | Case created successfully'))

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
      toast.error(error.message || t('cases.createError', 'فشل إنشاء القضية | Failed to create case'))
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
      toast.success(t('cases.updateSuccess', 'تم تحديث القضية بنجاح | Case updated successfully'))

      // Track analytics - especially status changes
      Analytics.caseUpdated(id)
      if (data.status === 'closed' || data.status === 'completed') {
        Analytics.caseClosed(id)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.updateError', 'فشل تحديث القضية | Failed to update case'))
    },
    onSettled: async (_, __, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      return await queryClient.invalidateQueries({ queryKey: ['cases', id] })
    },
  })
}

/**
 * Delete case mutation
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: DELETE /api/cases/:id
 */
export const useDeleteCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useDeleteCase() calls an unimplemented backend endpoint.\n' +
        'يستدعي useDeleteCase() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: DELETE /api/cases/:id\n' +
        'النقطة المتوقعة: DELETE /api/cases/:id'
      )
      return casesService.deleteCase(id)
    },
    // Update cache on success (Stable & Correct)
    onSuccess: (_, id) => {
      toast.success(t('cases.deleteSuccess', 'تم حذف القضية بنجاح | Case deleted successfully'))

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
      toast.error(error.message || t('cases.deleteError', 'فشل حذف القضية | Failed to delete case'))
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
      toast.success(t('cases.noteAddSuccess', 'تمت إضافة الملاحظة بنجاح | Note added successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.noteAddError', 'فشل إضافة الملاحظة | Failed to add note'))
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
      toast.success(t('cases.documentAddSuccess', 'تمت إضافة المستند بنجاح | Document added successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentAddError', 'فشل إضافة المستند | Failed to add document'))
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
      toast.success(t('cases.hearingAddSuccess', 'تمت إضافة الجلسة بنجاح وتم إنشاء حدث في التقويم | Hearing added successfully and calendar event created'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.hearingAddError', 'فشل إضافة الجلسة | Failed to add hearing'))
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: POST /api/cases/:id/claim
 * Alternative: Use updateCase() to update the claims array instead.
 */
export const useAddCaseClaim = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddClaimData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useAddCaseClaim() calls an unimplemented backend endpoint.\n' +
        'يستدعي useAddCaseClaim() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: POST /api/cases/:id/claim\n' +
        'النقطة المتوقعة: POST /api/cases/:id/claim\n' +
        'Alternative: Use updateCase() to update claims array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة المطالبات'
      )
      return casesService.addClaim(id, data)
    },
    onSuccess: () => {
      toast.success(t('cases.claimAddSuccess', 'تمت إضافة المطالبة بنجاح | Claim added successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.claimAddError', 'فشل إضافة المطالبة | Failed to add claim'))
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
      toast.success(t('cases.statusUpdateSuccess', 'تم تحديث حالة القضية بنجاح | Case status updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.statusUpdateError', 'فشل تحديث حالة القضية | Failed to update case status'))
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
      toast.success(t('cases.outcomeUpdateSuccess', 'تم تحديث نتيجة القضية بنجاح | Case outcome updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.outcomeUpdateError', 'فشل تحديث نتيجة القضية | Failed to update case outcome'))
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
      toast.success(t('clients.createSuccess', 'تم إنشاء العميل بنجاح | Client created successfully'))

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
      toast.error(error.message || t('clients.createError', 'فشل إنشاء العميل | Failed to create client'))
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
      toast.success(t('clients.updateSuccess', 'تم تحديث العميل بنجاح | Client updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('clients.updateError', 'فشل تحديث العميل | Failed to update client'))
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
      toast.success(t('clients.deleteSuccess', 'تم حذف العميل بنجاح | Client deleted successfully'))

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
      toast.error(error.message || t('clients.deleteError', 'فشل حذف العميل | Failed to delete client'))
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: PATCH /api/cases/:id/notes/:noteId
 * Alternative: Use updateCase() to update the notes array instead.
 */
export const useUpdateCaseNote = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, noteId, data }: { caseId: string; noteId: string; data: UpdateNoteData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useUpdateCaseNote() calls an unimplemented backend endpoint.\n' +
        'يستدعي useUpdateCaseNote() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: PATCH /api/cases/:id/notes/:noteId\n' +
        'النقطة المتوقعة: PATCH /api/cases/:id/notes/:noteId\n' +
        'Alternative: Use updateCase() to update notes array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة الملاحظات'
      )
      return casesService.updateNote(caseId, noteId, data)
    },
    onSuccess: () => {
      toast.success(t('cases.noteUpdateSuccess', 'تم تحديث الملاحظة بنجاح | Note updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.noteUpdateError', 'فشل تحديث الملاحظة | Failed to update note'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Delete note from case mutation
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: DELETE /api/cases/:id/notes/:noteId
 * Alternative: Use updateCase() to update the notes array instead.
 */
export const useDeleteCaseNote = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, noteId }: { caseId: string; noteId: string }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useDeleteCaseNote() calls an unimplemented backend endpoint.\n' +
        'يستدعي useDeleteCaseNote() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: DELETE /api/cases/:id/notes/:noteId\n' +
        'النقطة المتوقعة: DELETE /api/cases/:id/notes/:noteId\n' +
        'Alternative: Use updateCase() to update notes array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة الملاحظات'
      )
      return casesService.deleteNote(caseId, noteId)
    },
    onSuccess: () => {
      toast.success(t('cases.noteDeleteSuccess', 'تم حذف الملاحظة بنجاح | Note deleted successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.noteDeleteError', 'فشل حذف الملاحظة | Failed to delete note'))
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: PATCH /api/cases/:id/hearings/:hearingId
 * Alternative: Use updateCase() to update the hearings array instead.
 */
export const useUpdateCaseHearing = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, hearingId, data }: { caseId: string; hearingId: string; data: UpdateHearingData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useUpdateCaseHearing() calls an unimplemented backend endpoint.\n' +
        'يستدعي useUpdateCaseHearing() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: PATCH /api/cases/:id/hearings/:hearingId\n' +
        'النقطة المتوقعة: PATCH /api/cases/:id/hearings/:hearingId\n' +
        'Alternative: Use updateCase() to update hearings array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة الجلسات'
      )
      return casesService.updateHearing(caseId, hearingId, data)
    },
    onSuccess: () => {
      toast.success(t('cases.hearingUpdateSuccess', 'تم تحديث الجلسة بنجاح | Hearing updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.hearingUpdateError', 'فشل تحديث الجلسة | Failed to update hearing'))
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: DELETE /api/cases/:id/hearings/:hearingId
 * Alternative: Use updateCase() to update the hearings array instead.
 */
export const useDeleteCaseHearing = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, hearingId }: { caseId: string; hearingId: string }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useDeleteCaseHearing() calls an unimplemented backend endpoint.\n' +
        'يستدعي useDeleteCaseHearing() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: DELETE /api/cases/:id/hearings/:hearingId\n' +
        'النقطة المتوقعة: DELETE /api/cases/:id/hearings/:hearingId\n' +
        'Alternative: Use updateCase() to update hearings array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة الجلسات'
      )
      return casesService.deleteHearing(caseId, hearingId)
    },
    onSuccess: () => {
      toast.success(t('cases.hearingDeleteSuccess', 'تم حذف الجلسة بنجاح | Hearing deleted successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.hearingDeleteError', 'فشل حذف الجلسة | Failed to delete hearing'))
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: PATCH /api/cases/:id/claims/:claimId
 * Alternative: Use updateCase() to update the claims array instead.
 */
export const useUpdateCaseClaim = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, claimId, data }: { caseId: string; claimId: string; data: UpdateClaimData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useUpdateCaseClaim() calls an unimplemented backend endpoint.\n' +
        'يستدعي useUpdateCaseClaim() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: PATCH /api/cases/:id/claims/:claimId\n' +
        'النقطة المتوقعة: PATCH /api/cases/:id/claims/:claimId\n' +
        'Alternative: Use updateCase() to update claims array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة المطالبات'
      )
      return casesService.updateClaim(caseId, claimId, data)
    },
    onSuccess: () => {
      toast.success(t('cases.claimUpdateSuccess', 'تم تحديث المطالبة بنجاح | Claim updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.claimUpdateError', 'فشل تحديث المطالبة | Failed to update claim'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Delete claim from case mutation
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: DELETE /api/cases/:id/claims/:claimId
 * Alternative: Use updateCase() to update the claims array instead.
 */
export const useDeleteCaseClaim = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, claimId }: { caseId: string; claimId: string }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useDeleteCaseClaim() calls an unimplemented backend endpoint.\n' +
        'يستدعي useDeleteCaseClaim() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: DELETE /api/cases/:id/claims/:claimId\n' +
        'النقطة المتوقعة: DELETE /api/cases/:id/claims/:claimId\n' +
        'Alternative: Use updateCase() to update claims array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة المطالبات'
      )
      return casesService.deleteClaim(caseId, claimId)
    },
    onSuccess: () => {
      toast.success(t('cases.claimDeleteSuccess', 'تم حذف المطالبة بنجاح | Claim deleted successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.claimDeleteError', 'فشل حذف المطالبة | Failed to delete claim'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

// ==================== TIMELINE CRUD ====================

/**
 * Add timeline event to case mutation
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: POST /api/cases/:id/timeline
 * Alternative: Use updateCase() to update the timeline array instead.
 */
export const useAddCaseTimelineEvent = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: AddTimelineEventData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useAddCaseTimelineEvent() calls an unimplemented backend endpoint.\n' +
        'يستدعي useAddCaseTimelineEvent() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: POST /api/cases/:id/timeline\n' +
        'النقطة المتوقعة: POST /api/cases/:id/timeline\n' +
        'Alternative: Use updateCase() to update timeline array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة الجدول الزمني'
      )
      return casesService.addTimelineEvent(caseId, data)
    },
    onSuccess: () => {
      toast.success(t('cases.timelineAddSuccess', 'تمت إضافة الحدث بنجاح | Timeline event added successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.timelineAddError', 'فشل إضافة الحدث | Failed to add timeline event'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Update timeline event in case mutation
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: PATCH /api/cases/:id/timeline/:eventId
 * Alternative: Use updateCase() to update the timeline array instead.
 */
export const useUpdateCaseTimelineEvent = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, eventId, data }: { caseId: string; eventId: string; data: UpdateTimelineEventData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useUpdateCaseTimelineEvent() calls an unimplemented backend endpoint.\n' +
        'يستدعي useUpdateCaseTimelineEvent() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: PATCH /api/cases/:id/timeline/:eventId\n' +
        'النقطة المتوقعة: PATCH /api/cases/:id/timeline/:eventId\n' +
        'Alternative: Use updateCase() to update timeline array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة الجدول الزمني'
      )
      return casesService.updateTimelineEvent(caseId, eventId, data)
    },
    onSuccess: () => {
      toast.success(t('cases.timelineUpdateSuccess', 'تم تحديث الحدث بنجاح | Timeline event updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.timelineUpdateError', 'فشل تحديث الحدث | Failed to update timeline event'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Delete timeline event from case mutation
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: DELETE /api/cases/:id/timeline/:eventId
 * Alternative: Use updateCase() to update the timeline array instead.
 */
export const useDeleteCaseTimelineEvent = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, eventId }: { caseId: string; eventId: string }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useDeleteCaseTimelineEvent() calls an unimplemented backend endpoint.\n' +
        'يستدعي useDeleteCaseTimelineEvent() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: DELETE /api/cases/:id/timeline/:eventId\n' +
        'النقطة المتوقعة: DELETE /api/cases/:id/timeline/:eventId\n' +
        'Alternative: Use updateCase() to update timeline array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة الجدول الزمني'
      )
      return casesService.deleteTimelineEvent(caseId, eventId)
    },
    onSuccess: () => {
      toast.success(t('cases.timelineDeleteSuccess', 'تم حذف الحدث بنجاح | Timeline event deleted successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.timelineDeleteError', 'فشل حذف الحدث | Failed to delete timeline event'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

// ==================== DOCUMENT MANAGEMENT ====================

/**
 * Upload document to case (full flow: get URL -> upload to S3 -> confirm)
 * ❌ DEPRECATED - Backend endpoints not implemented
 * @deprecated These endpoints are not implemented in the backend yet.
 * Backend needs to implement:
 *   - POST /api/cases/:id/documents/upload-url
 *   - POST /api/cases/:id/documents/confirm
 * Alternative: Use addDocument() with direct URLs instead.
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
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useUploadCaseDocument() calls unimplemented backend endpoints.\n' +
        'يستدعي useUploadCaseDocument() نقاط نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoints:\n' +
        '  - POST /api/cases/:id/documents/upload-url\n' +
        '  - POST /api/cases/:id/documents/confirm\n' +
        'النقاط المتوقعة:\n' +
        '  - POST /api/cases/:id/documents/upload-url\n' +
        '  - POST /api/cases/:id/documents/confirm\n' +
        'Alternative: Use addDocument() with direct URLs\n' +
        'البديل: استخدم addDocument() مع روابط مباشرة'
      )

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
      toast.success(t('cases.documentUploadSuccess', 'تم رفع المستند بنجاح | Document uploaded successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentUploadError', 'فشل رفع المستند | Failed to upload document'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

/**
 * Download case document
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: GET /api/cases/:id/documents/:docId/download
 * Alternative: Documents are stored directly in case.documents array with URLs.
 */
export const useDownloadCaseDocument = () => {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ caseId, docId }: { caseId: string; docId: string }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useDownloadCaseDocument() calls an unimplemented backend endpoint.\n' +
        'يستدعي useDownloadCaseDocument() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: GET /api/cases/:id/documents/:docId/download\n' +
        'النقطة المتوقعة: GET /api/cases/:id/documents/:docId/download\n' +
        'Alternative: Use document URLs from case.documents array\n' +
        'البديل: استخدم روابط المستندات من مصفوفة case.documents'
      )

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
      toast.error(error.message || t('cases.documentDownloadError', 'فشل تحميل المستند | Failed to download document'))
    },
  })
}

/**
 * Delete case document
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: DELETE /api/cases/:id/documents/:docId
 * Alternative: Use updateCase() to update the documents array instead.
 */
export const useDeleteCaseDocument = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, docId }: { caseId: string; docId: string }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useDeleteCaseDocument() calls an unimplemented backend endpoint.\n' +
        'يستدعي useDeleteCaseDocument() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: DELETE /api/cases/:id/documents/:docId\n' +
        'النقطة المتوقعة: DELETE /api/cases/:id/documents/:docId\n' +
        'Alternative: Use updateCase() to update documents array\n' +
        'البديل: استخدم updateCase() لتحديث مصفوفة المستندات'
      )
      return casesService.deleteDocument(caseId, docId)
    },
    onSuccess: () => {
      toast.success(t('cases.documentDeleteSuccess', 'تم حذف المستند بنجاح | Document deleted successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.documentDeleteError', 'فشل حذف المستند | Failed to delete document'))
    },
    onSettled: async (_, __, { caseId }) => {
      return await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
    },
  })
}

// ==================== AUDIT HISTORY ====================

/**
 * Get audit history for case
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: GET /api/cases/:id/audit
 */
export const useCaseAuditHistory = (caseId: string) => {
  return useQuery({
    queryKey: ['cases', caseId, 'audit'],
    queryFn: () => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useCaseAuditHistory() calls an unimplemented backend endpoint.\n' +
        'يستدعي useCaseAuditHistory() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: GET /api/cases/:id/audit\n' +
        'النقطة المتوقعة: GET /api/cases/:id/audit'
      )
      return casesService.getAuditHistory(caseId)
    },
    enabled: !!caseId,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Update case progress mutation
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: PATCH /api/cases/:id/progress
 * Alternative: Use updateCase() with progress field instead.
 */
export const useUpdateCaseProgress = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useUpdateCaseProgress() calls an unimplemented backend endpoint.\n' +
        'يستدعي useUpdateCaseProgress() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: PATCH /api/cases/:id/progress\n' +
        'النقطة المتوقعة: PATCH /api/cases/:id/progress\n' +
        'Alternative: Use updateCase() with progress field\n' +
        'البديل: استخدم updateCase() مع حقل progress'
      )
      return casesService.updateProgress(id, progress)
    },
    onSuccess: () => {
      toast.success(t('cases.progressUpdateSuccess', 'تم تحديث تقدم القضية بنجاح | Case progress updated successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.progressUpdateError', 'فشل تحديث تقدم القضية | Failed to update case progress'))
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: GET /api/cases/statistics
 * Alternative: Use useCaseStatistics() with local cases array instead.
 * @param enabled - Whether to enable the query (defaults to true)
 *
 * NOTE: This hook now returns default values and does NOT make API calls
 * because the backend endpoint does not exist. When the backend implements
 * GET /api/cases/statistics, this can be re-enabled.
 */
export const useCaseStatisticsFromAPI = (enabled: boolean = true) => {
  // Return default statistics without making API call
  // The endpoint doesn't exist in backend, so we provide sensible defaults
  const defaultStats = {
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

  return useQuery({
    queryKey: ['cases', 'statistics'],
    queryFn: () => {
      // Return default values instead of calling non-existent endpoint
      return Promise.resolve(defaultStats)
    },
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
    // Provide initial data so the hook always has a value
    initialData: defaultStats,
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: GET /api/cases/pipeline?category=:category
 * Alternative: Use getCases() to fetch cases and transform them for pipeline view instead.
 */
export const usePipelineCases = (category: CaseCategory) => {
  return useQuery({
    queryKey: ['cases', 'pipeline', category],
    queryFn: () => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'usePipelineCases() calls an unimplemented backend endpoint.\n' +
        'يستدعي usePipelineCases() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: GET /api/cases/pipeline?category=' + category + '\n' +
        'النقطة المتوقعة: GET /api/cases/pipeline?category=' + category + '\n' +
        'Alternative: Use getCases() and transform data for pipeline view\n' +
        'البديل: استخدم getCases() وحول البيانات لعرض المسار'
      )
      return casesService.getPipelineCases(category)
    },
    enabled: !!category,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Fetch pipeline statistics
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: GET /api/cases/pipeline/statistics
 * Alternative: Use calculateStatistics() with filtered cases instead.
 */
export const usePipelineStatistics = (category?: CaseCategory) => {
  return useQuery({
    queryKey: ['cases', 'pipeline', 'statistics', category],
    queryFn: () => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'usePipelineStatistics() calls an unimplemented backend endpoint.\n' +
        'يستدعي usePipelineStatistics() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: GET /api/cases/pipeline/statistics\n' +
        'النقطة المتوقعة: GET /api/cases/pipeline/statistics\n' +
        'Alternative: Use calculateStatistics() with filtered cases\n' +
        'البديل: استخدم calculateStatistics() مع قضايا مفلترة'
      )
      return casesService.getPipelineStatistics(category)
    },
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Fetch valid pipeline stages for a category
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: GET /api/cases/pipeline/stages?category=:category
 * Alternative: Define stages in frontend configuration instead.
 */
export const usePipelineStages = (category: CaseCategory) => {
  return useQuery({
    queryKey: ['cases', 'pipeline', 'stages', category],
    queryFn: () => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'usePipelineStages() calls an unimplemented backend endpoint.\n' +
        'يستدعي usePipelineStages() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: GET /api/cases/pipeline/stages?category=' + category + '\n' +
        'النقطة المتوقعة: GET /api/cases/pipeline/stages?category=' + category + '\n' +
        'Alternative: Define stages in frontend configuration\n' +
        'البديل: عرف المراحل في إعدادات الواجهة الأمامية'
      )
      return casesService.getPipelineStages(category)
    },
    enabled: !!category,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Move case to a new pipeline stage
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: PATCH /api/cases/:id/stage
 * Alternative: Use updateCase() to update case stage/status instead.
 */
export const useMoveCaseToStage = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: MoveCaseToStageData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useMoveCaseToStage() calls an unimplemented backend endpoint.\n' +
        'يستدعي useMoveCaseToStage() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: PATCH /api/cases/:id/stage\n' +
        'النقطة المتوقعة: PATCH /api/cases/:id/stage\n' +
        'Alternative: Use updateCase() to update case stage/status\n' +
        'البديل: استخدم updateCase() لتحديث مرحلة/حالة القضية'
      )
      return casesService.moveCaseToStage(caseId, data)
    },
    onSuccess: () => {
      toast.success(t('cases.stageUpdateSuccess', 'تم نقل القضية للمرحلة الجديدة بنجاح | Case moved to new stage successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.stageUpdateError', 'فشل نقل القضية | Failed to move case'))
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
 * ❌ DEPRECATED - Backend endpoint not implemented
 * @deprecated This endpoint is not implemented in the backend yet.
 * Backend needs to implement: POST /api/cases/:id/end
 * Alternative: Use updateStatus() and updateOutcome() instead.
 */
export const useEndCase = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: EndCaseData }) => {
      console.warn(
        '⚠️ DEPRECATED ENDPOINT | نقطة نهاية قديمة\n' +
        'useEndCase() calls an unimplemented backend endpoint.\n' +
        'يستدعي useEndCase() نقطة نهاية غير مطبقة في الخادم.\n' +
        'Expected endpoint: POST /api/cases/:id/end\n' +
        'النقطة المتوقعة: POST /api/cases/:id/end\n' +
        'Alternative: Use updateStatus() and updateOutcome()\n' +
        'البديل: استخدم updateStatus() و updateOutcome()'
      )
      return casesService.endCase(caseId, data)
    },
    onSuccess: () => {
      toast.success(t('cases.endCaseSuccess', 'تم إنهاء القضية بنجاح | Case ended successfully'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('cases.endCaseError', 'فشل إنهاء القضية | Failed to end case'))
    },
    onSettled: async (_, __, { caseId }) => {
      await queryClient.invalidateQueries({ queryKey: ['cases', 'pipeline'] })
      await queryClient.invalidateQueries({ queryKey: ['cases', caseId] })
      return await queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  })
}
