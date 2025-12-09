/**
 * CRM Hooks
 * React Query hooks for Lead, Pipeline, Referral, and Activity management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  leadService,
  pipelineService,
  referralService,
  crmActivityService,
} from '@/services/crmService'
import type {
  Lead,
  CreateLeadData,
  LeadFilters,
  LeadStatus,
  Pipeline,
  CreatePipelineData,
  CreateStageData,
  PipelineStage,
  PipelineFilters,
  Referral,
  CreateReferralData,
  ReferralFilters,
  FeePaymentData,
  CrmActivity,
  CreateActivityData,
  ActivityFilters,
  LogCallData,
  LogEmailData,
  LogMeetingData,
  AddNoteData,
} from '@/types/crm'

// ═══════════════════════════════════════════════════════════════
// LEAD HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all leads with optional filters
 */
export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadService.getLeads(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Get single lead with activities
 */
export const useLead = (leadId: string) => {
  return useQuery({
    queryKey: ['leads', leadId],
    queryFn: () => leadService.getLead(leadId),
    enabled: !!leadId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get lead statistics
 */
export const useLeadStats = (params?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['leads', 'stats', params],
    queryFn: () => leadService.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get leads by pipeline (Kanban view)
 */
export const useLeadsByPipeline = (pipelineId?: string) => {
  return useQuery({
    queryKey: ['leads', 'pipeline', pipelineId],
    queryFn: () => leadService.getByPipeline(pipelineId),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Get leads needing follow-up
 */
export const useLeadsNeedingFollowUp = (limit?: number) => {
  return useQuery({
    queryKey: ['leads', 'follow-up', limit],
    queryFn: () => leadService.getNeedingFollowUp(limit),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get lead activities
 */
export const useLeadActivities = (
  leadId: string,
  params?: { type?: string; page?: number }
) => {
  return useQuery({
    queryKey: ['leads', leadId, 'activities', params],
    queryFn: () => leadService.getActivities(leadId, params),
    enabled: !!leadId,
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Create new lead
 */
export const useCreateLead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLeadData) => leadService.createLead(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء العميل المحتمل بنجاح')

      // Manually update the cache with the REAL lead from server
      queryClient.setQueriesData({ queryKey: ['leads'] }, (old: any) => {
        if (!old) return old

        // Handle { leads: [...] } structure
        if (old.leads && Array.isArray(old.leads)) {
          return {
            ...old,
            leads: [data, ...old.leads],
            total: (old.total || old.leads.length) + 1
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
      toast.error(error.message || 'فشل إنشاء العميل المحتمل')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['leads'], refetchType: 'all' })
    },
  })
}

/**
 * Update lead
 */
export const useUpdateLead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: Partial<Lead> }) =>
      leadService.updateLead(leadId, data),
    onSuccess: () => {
      toast.success('تم تحديث العميل المحتمل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث العميل المحتمل')
    },
    onSettled: async (_, __, { leadId }) => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] })
      return await queryClient.invalidateQueries({ queryKey: ['leads', leadId] })
    },
  })
}

/**
 * Delete lead
 */
export const useDeleteLead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (leadId: string) => leadService.deleteLead(leadId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, leadId) => {
      toast.success('تم حذف العميل المحتمل بنجاح')

      // Optimistically remove lead from all lists
      queryClient.setQueriesData({ queryKey: ['leads'] }, (old: any) => {
        if (!old) return old

        // Handle { leads: [...] } structure
        if (old.leads && Array.isArray(old.leads)) {
          return {
            ...old,
            leads: old.leads.filter((item: any) => item._id !== leadId),
            total: Math.max(0, (old.total || old.leads.length) - 1)
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== leadId)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف العميل المحتمل')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['leads'], refetchType: 'all' })
    },
  })
}

/**
 * Update lead status
 */
export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      leadId,
      status,
      notes,
      lostReason,
    }: {
      leadId: string
      status: LeadStatus
      notes?: string
      lostReason?: string
    }) => leadService.updateLeadStatus(leadId, { status, notes, lostReason }),
    onSuccess: () => {
      toast.success('تم تحديث حالة العميل المحتمل')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الحالة')
    },
    onSettled: async (_, __, { leadId }) => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] })
      return await queryClient.invalidateQueries({ queryKey: ['leads', leadId] })
    },
  })
}

/**
 * Move lead to different pipeline stage
 */
export const useMoveLeadToStage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      leadId,
      stageId,
      notes,
    }: {
      leadId: string
      stageId: string
      notes?: string
    }) => leadService.moveLeadToStage(leadId, { stageId, notes }),
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نقل العميل المحتمل')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] })
      return await queryClient.invalidateQueries({ queryKey: ['leads', 'pipeline'] })
    },
  })
}

/**
 * Preview lead conversion (before actual conversion)
 */
export const usePreviewLeadConversion = (leadId: string) => {
  return useQuery({
    queryKey: ['leads', leadId, 'conversion-preview'],
    queryFn: () => leadService.previewConversion(leadId),
    enabled: !!leadId,
    staleTime: 0, // Always fetch fresh data
  })
}

/**
 * Convert lead to client
 */
export const useConvertLead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (leadId: string) => leadService.convertToClient(leadId),
    onSuccess: () => {
      toast.success('تم تحويل العميل المحتمل إلى عميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحويل العميل المحتمل')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leads'] })
      return await queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

/**
 * Schedule follow-up for lead
 */
export const useScheduleFollowUp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      leadId,
      date,
      note,
    }: {
      leadId: string
      date: string
      note?: string
    }) => leadService.scheduleFollowUp(leadId, { date, note }),
    onSuccess: () => {
      toast.success('تم جدولة المتابعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل جدولة المتابعة')
    },
    onSettled: async (_, __, { leadId }) => {
      await queryClient.invalidateQueries({ queryKey: ['leads', leadId] })
      return await queryClient.invalidateQueries({ queryKey: ['leads', 'follow-up'] })
    },
  })
}

/**
 * Log activity for lead
 */
export const useLogLeadActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      leadId,
      data,
    }: {
      leadId: string
      data: CreateActivityData
    }) => leadService.logActivity(leadId, data),
    onSuccess: () => {
      toast.success('تم تسجيل النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل النشاط')
    },
    onSettled: async (_, __, { leadId }) => {
      await queryClient.invalidateQueries({ queryKey: ['leads', leadId] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all pipelines
 */
export const usePipelines = (params?: PipelineFilters) => {
  return useQuery({
    queryKey: ['pipelines', params],
    queryFn: () => pipelineService.getPipelines(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get single pipeline with stage counts
 */
export const usePipeline = (pipelineId: string) => {
  return useQuery({
    queryKey: ['pipelines', pipelineId],
    queryFn: () => pipelineService.getPipeline(pipelineId),
    enabled: !!pipelineId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get pipeline statistics
 */
export const usePipelineStats = (pipelineId: string) => {
  return useQuery({
    queryKey: ['pipelines', pipelineId, 'stats'],
    queryFn: () => pipelineService.getStats(pipelineId),
    enabled: !!pipelineId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create new pipeline
 */
export const useCreatePipeline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePipelineData) =>
      pipelineService.createPipeline(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء مسار المبيعات بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['pipelines'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء مسار المبيعات')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['pipelines'], refetchType: 'all' })
    },
  })
}

/**
 * Update pipeline
 */
export const useUpdatePipeline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pipelineId,
      data,
    }: {
      pipelineId: string
      data: Partial<Pipeline>
    }) => pipelineService.updatePipeline(pipelineId, data),
    onSuccess: () => {
      toast.success('تم تحديث مسار المبيعات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث مسار المبيعات')
    },
    onSettled: async (_, __, { pipelineId }) => {
      await queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      return await queryClient.invalidateQueries({
        queryKey: ['pipelines', pipelineId],
      })
    },
  })
}

/**
 * Delete pipeline
 */
export const useDeletePipeline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pipelineId: string) =>
      pipelineService.deletePipeline(pipelineId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, pipelineId) => {
      toast.success('تم حذف مسار المبيعات بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['pipelines'] }, (old: any) => {
        if (!old) return old
        if (Array.isArray(old)) return old.filter((item: any) => item._id !== pipelineId)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف مسار المبيعات')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['pipelines'], refetchType: 'all' })
    },
  })
}

/**
 * Add stage to pipeline
 */
export const useAddPipelineStage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pipelineId,
      data,
    }: {
      pipelineId: string
      data: CreateStageData
    }) => pipelineService.addStage(pipelineId, data),
    onSuccess: () => {
      toast.success('تم إضافة المرحلة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة المرحلة')
    },
    onSettled: async (_, __, { pipelineId }) => {
      return await queryClient.invalidateQueries({
        queryKey: ['pipelines', pipelineId],
      })
    },
  })
}

/**
 * Update pipeline stage
 */
export const useUpdatePipelineStage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pipelineId,
      stageId,
      data,
    }: {
      pipelineId: string
      stageId: string
      data: Partial<PipelineStage>
    }) => pipelineService.updateStage(pipelineId, stageId, data),
    onSuccess: () => {
      toast.success('تم تحديث المرحلة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث المرحلة')
    },
    onSettled: async (_, __, { pipelineId }) => {
      return await queryClient.invalidateQueries({
        queryKey: ['pipelines', pipelineId],
      })
    },
  })
}

/**
 * Remove stage from pipeline
 */
export const useRemovePipelineStage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pipelineId,
      stageId,
    }: {
      pipelineId: string
      stageId: string
    }) => pipelineService.removeStage(pipelineId, stageId),
    onSuccess: () => {
      toast.success('تم حذف المرحلة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المرحلة')
    },
    onSettled: async (_, __, { pipelineId }) => {
      return await queryClient.invalidateQueries({
        queryKey: ['pipelines', pipelineId],
      })
    },
  })
}

/**
 * Reorder pipeline stages
 */
export const useReorderPipelineStages = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pipelineId,
      stageOrders,
    }: {
      pipelineId: string
      stageOrders: { stageId: string; order: number }[]
    }) => pipelineService.reorderStages(pipelineId, stageOrders),
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إعادة ترتيب المراحل')
    },
    onSettled: async (_, __, { pipelineId }) => {
      return await queryClient.invalidateQueries({
        queryKey: ['pipelines', pipelineId],
      })
    },
  })
}

/**
 * Set pipeline as default
 */
export const useSetDefaultPipeline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pipelineId: string) =>
      pipelineService.setDefault(pipelineId),
    onSuccess: () => {
      toast.success('تم تعيين مسار المبيعات الافتراضي')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعيين مسار المبيعات الافتراضي')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

/**
 * Duplicate pipeline
 */
export const useDuplicatePipeline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pipelineId,
      data,
    }: {
      pipelineId: string
      data?: { name?: string; nameAr?: string }
    }) => pipelineService.duplicate(pipelineId, data),
    onSuccess: () => {
      toast.success('تم نسخ مسار المبيعات بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ مسار المبيعات')
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// REFERRAL HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all referrals
 */
export const useReferrals = (filters?: ReferralFilters) => {
  return useQuery({
    queryKey: ['referrals', filters],
    queryFn: () => referralService.getReferrals(filters),
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get single referral
 */
export const useReferral = (referralId: string) => {
  return useQuery({
    queryKey: ['referrals', referralId],
    queryFn: () => referralService.getReferral(referralId),
    enabled: !!referralId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get referral statistics
 */
export const useReferralStats = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['referrals', 'stats', params],
    queryFn: () => referralService.getStats(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get top referrers
 */
export const useTopReferrers = (limit?: number) => {
  return useQuery({
    queryKey: ['referrals', 'top', limit],
    queryFn: () => referralService.getTopReferrers(limit),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create new referral
 */
export const useCreateReferral = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReferralData) =>
      referralService.createReferral(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء مصدر الإحالة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['referrals'] }, (old: any) => {
        if (!old) return old

        // Handle { referrals: [...] } structure
        if (old.referrals && Array.isArray(old.referrals)) {
          return {
            ...old,
            referrals: [data, ...old.referrals],
            total: (old.total || old.referrals.length) + 1
          }
        }

        if (Array.isArray(old)) return [data, ...old]
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء مصدر الإحالة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['referrals'], refetchType: 'all' })
    },
  })
}

/**
 * Update referral
 */
export const useUpdateReferral = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      referralId,
      data,
    }: {
      referralId: string
      data: Partial<Referral>
    }) => referralService.updateReferral(referralId, data),
    onSuccess: () => {
      toast.success('تم تحديث مصدر الإحالة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث مصدر الإحالة')
    },
    onSettled: async (_, __, { referralId }) => {
      await queryClient.invalidateQueries({ queryKey: ['referrals'] })
      return await queryClient.invalidateQueries({
        queryKey: ['referrals', referralId],
      })
    },
  })
}

/**
 * Delete referral
 */
export const useDeleteReferral = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (referralId: string) =>
      referralService.deleteReferral(referralId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, referralId) => {
      toast.success('تم حذف مصدر الإحالة بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: ['referrals'] }, (old: any) => {
        if (!old) return old

        // Handle { referrals: [...] } structure
        if (old.referrals && Array.isArray(old.referrals)) {
          return {
            ...old,
            referrals: old.referrals.filter((item: any) => item._id !== referralId),
            total: Math.max(0, (old.total || old.referrals.length) - 1)
          }
        }

        if (Array.isArray(old)) return old.filter((item: any) => item._id !== referralId)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف مصدر الإحالة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await queryClient.invalidateQueries({ queryKey: ['referrals'], refetchType: 'all' })
    },
  })
}

/**
 * Update referral status
 */
export const useUpdateReferralStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      referralId,
      status,
    }: {
      referralId: string
      status: string
    }) => referralService.updateReferral(referralId, { status }),
    onSuccess: () => {
      toast.success('تم تحديث حالة الإحالة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة الإحالة')
    },
    onSettled: async (_, __, { referralId }) => {
      await queryClient.invalidateQueries({ queryKey: ['referrals'] })
      return await queryClient.invalidateQueries({
        queryKey: ['referrals', referralId],
      })
    },
  })
}

/**
 * Mark referral reward as paid
 */
export const useMarkReferralPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (referralId: string) =>
      referralService.updateReferral(referralId, {
        rewardPaid: true,
        rewardPaidAt: new Date().toISOString()
      }),
    onSuccess: () => {
      toast.success('تم تأكيد دفع المكافأة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تأكيد الدفع')
    },
    onSettled: async (_, __, referralId) => {
      await queryClient.invalidateQueries({ queryKey: ['referrals'] })
      return await queryClient.invalidateQueries({
        queryKey: ['referrals', referralId],
      })
    },
  })
}

/**
 * Add lead referral
 */
export const useAddLeadReferral = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      referralId,
      leadId,
      caseValue,
    }: {
      referralId: string
      leadId: string
      caseValue?: number
    }) => referralService.addLeadReferral(referralId, { leadId, caseValue }),
    onSuccess: () => {
      toast.success('تم ربط العميل المحتمل بمصدر الإحالة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل ربط العميل المحتمل')
    },
    onSettled: async (_, __, { referralId }) => {
      return await queryClient.invalidateQueries({
        queryKey: ['referrals', referralId],
      })
    },
  })
}

/**
 * Mark referral lead as converted
 */
export const useMarkReferralConverted = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      referralId,
      leadId,
      clientId,
    }: {
      referralId: string
      leadId: string
      clientId: string
    }) => referralService.markConverted(referralId, leadId, clientId),
    onSuccess: () => {
      toast.success('تم تسجيل تحويل الإحالة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل التحويل')
    },
    onSettled: async (_, __, { referralId }) => {
      await queryClient.invalidateQueries({
        queryKey: ['referrals', referralId],
      })
      return await queryClient.invalidateQueries({ queryKey: ['referrals', 'stats'] })
    },
  })
}

/**
 * Record referral fee payment
 */
export const useRecordReferralPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      referralId,
      data,
    }: {
      referralId: string
      data: FeePaymentData
    }) => referralService.recordPayment(referralId, data),
    onSuccess: () => {
      toast.success('تم تسجيل الدفعة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الدفعة')
    },
    onSettled: async (_, __, { referralId }) => {
      await queryClient.invalidateQueries({
        queryKey: ['referrals', referralId],
      })
      return await queryClient.invalidateQueries({ queryKey: ['referrals', 'stats'] })
    },
  })
}

/**
 * Calculate referral fee
 */
export const useCalculateReferralFee = (
  referralId: string,
  caseValue: number
) => {
  return useQuery({
    queryKey: ['referrals', referralId, 'calculate-fee', caseValue],
    queryFn: () => referralService.calculateFee(referralId, caseValue),
    enabled: !!referralId && caseValue > 0,
    staleTime: 0, // Always fresh
  })
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all activities
 */
export const useActivities = (params?: ActivityFilters) => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => crmActivityService.getActivities(params),
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Get single activity
 */
export const useActivity = (activityId: string) => {
  return useQuery({
    queryKey: ['activities', activityId],
    queryFn: () => crmActivityService.getActivity(activityId),
    enabled: !!activityId,
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Get activity timeline
 */
export const useActivityTimeline = (params?: {
  entityTypes?: string
  types?: string
  limit?: number
}) => {
  return useQuery({
    queryKey: ['activity-timeline', params],
    queryFn: () => crmActivityService.getTimeline(params),
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Get activity statistics
 */
export const useActivityStats = (params?: {
  startDate?: string
  endDate?: string
}) => {
  return useQuery({
    queryKey: ['activities', 'stats', params],
    queryFn: () => crmActivityService.getStats(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get entity activities
 */
export const useEntityActivities = (
  entityType: string,
  entityId: string,
  params?: { type?: string }
) => {
  return useQuery({
    queryKey: ['activities', 'entity', entityType, entityId, params],
    queryFn: () =>
      crmActivityService.getEntityActivities(entityType, entityId, params),
    enabled: !!entityType && !!entityId,
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Get upcoming tasks
 */
export const useUpcomingTasks = (params?: {
  assignedTo?: string
  endDate?: string
  limit?: number
}) => {
  return useQuery({
    queryKey: ['activities', 'tasks', 'upcoming', params],
    queryFn: () => crmActivityService.getUpcomingTasks(params),
    staleTime: 1 * 60 * 1000,
  })
}

/**
 * Create activity
 */
export const useCreateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateActivityData) =>
      crmActivityService.createActivity(data),
    onSuccess: () => {
      toast.success('تم إنشاء النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء النشاط')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

/**
 * Update activity
 */
export const useUpdateActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      activityId,
      data,
    }: {
      activityId: string
      data: Partial<CrmActivity>
    }) => crmActivityService.updateActivity(activityId, data),
    onSuccess: () => {
      toast.success('تم تحديث النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث النشاط')
    },
    onSettled: async (_, __, { activityId }) => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      await queryClient.invalidateQueries({
        queryKey: ['activities', activityId],
      })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

/**
 * Delete activity
 */
export const useDeleteActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      crmActivityService.deleteActivity(activityId),
    onSuccess: () => {
      toast.success('تم حذف النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف النشاط')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

/**
 * Update activity status
 */
export const useUpdateActivityStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      activityId,
      status,
    }: {
      activityId: string
      status: string
    }) => crmActivityService.updateActivity(activityId, { status }),
    onSuccess: () => {
      toast.success('تم تحديث حالة النشاط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث حالة النشاط')
    },
    onSettled: async (_, __, { activityId }) => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
      return await queryClient.invalidateQueries({
        queryKey: ['activities', activityId],
      })
    },
  })
}

/**
 * Complete task
 */
export const useCompleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      activityId,
      outcomeNotes,
    }: {
      activityId: string
      outcomeNotes?: string
    }) => crmActivityService.completeTask(activityId, outcomeNotes),
    onSuccess: () => {
      toast.success('تم إكمال المهمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال المهمة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

/**
 * Log call activity
 */
export const useLogCall = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LogCallData) => crmActivityService.logCall(data),
    onSuccess: () => {
      toast.success('تم تسجيل المكالمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل المكالمة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

/**
 * Log email activity
 */
export const useLogEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LogEmailData) => crmActivityService.logEmail(data),
    onSuccess: () => {
      toast.success('تم تسجيل البريد الإلكتروني بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل البريد الإلكتروني')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

/**
 * Log meeting activity
 */
export const useLogMeeting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LogMeetingData) => crmActivityService.logMeeting(data),
    onSuccess: () => {
      toast.success('تم تسجيل الاجتماع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الاجتماع')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}

/**
 * Add note activity
 */
export const useAddNote = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AddNoteData) => crmActivityService.addNote(data),
    onSuccess: () => {
      toast.success('تم إضافة الملاحظة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الملاحظة')
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
      return await queryClient.invalidateQueries({ queryKey: ['activity-timeline'] })
    },
  })
}
