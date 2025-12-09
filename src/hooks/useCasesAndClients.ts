/**
 * Cases and Clients Hooks
 * TanStack Query hooks for cases and clients operations
 * Includes automatic calendar/event sync for hearings
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success(t('cases.createSuccess', 'تم إنشاء القضية بنجاح'))

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
    onSuccess: () => {
      toast.success(t('cases.updateSuccess', 'تم تحديث القضية بنجاح'))
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
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success(t('clients.createSuccess', 'تم إنشاء العميل بنجاح'))

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

// ==================== LAWYERS/TEAM ====================

/**
 * Get all lawyers/team members
 */
export const useLawyers = (filters?: LawyerFilters) => {
  return useQuery({
    queryKey: ['lawyers', filters],
    queryFn: () => lawyersService.getAll(filters),
    staleTime: 5 * 60 * 1000,
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
  })
}

/**
 * Get team members available for task assignment
 */
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ['lawyers', 'team'],
    queryFn: () => lawyersService.getTeamMembers(),
    staleTime: 5 * 60 * 1000,
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
    staleTime: 1 * 60 * 1000,
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
 */
export const useCaseStatisticsFromAPI = () => {
  return useQuery({
    queryKey: ['cases', 'statistics'],
    queryFn: () => casesService.getStatistics(),
    staleTime: 5 * 60 * 1000,
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
