/**
 * CRM Hooks
 * React Query hooks for Lead, Pipeline, Referral, and Activity management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
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

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when mutations occur
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// LEAD HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all leads with optional filters
 */
export const useLeads = (filters?: LeadFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.leads.list(filters),
    queryFn: () => leadService.getLeads(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single lead with activities
 */
export const useLead = (leadId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.leads.detail(leadId),
    queryFn: () => leadService.getLead(leadId),
    enabled: !!leadId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get lead statistics
 */
export const useLeadStats = (params?: { startDate?: string; endDate?: string }, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.leads.stats(params),
    queryFn: () => leadService.getStats(params),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get leads by pipeline (Kanban view)
 */
export const useLeadsByPipeline = (pipelineId?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.leads.pipeline(pipelineId),
    queryFn: () => leadService.getByPipeline(pipelineId),
    enabled: !!pipelineId && enabled, // Only fetch when we have a valid pipeline ID
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get leads needing follow-up
 */
export const useLeadsNeedingFollowUp = (limit?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.leads.followUp(limit),
    queryFn: () => leadService.getNeedingFollowUp(limit),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get lead activities
 */
export const useLeadActivities = (
  leadId: string,
  params?: { type?: string; page?: number },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.leads.activities(leadId, params),
    queryFn: () => leadService.getActivities(leadId, params),
    enabled: !!leadId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
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
      return await invalidateCache.leads.all()
    },
  })
}

/**
 * Update lead
 */
export const useUpdateLead = () => {
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
      await invalidateCache.leads.all()
      return await invalidateCache.leads.detail(leadId)
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
      return await invalidateCache.leads.all()
    },
  })
}

/**
 * Update lead status
 */
export const useUpdateLeadStatus = () => {
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
      await invalidateCache.leads.all()
      return await invalidateCache.leads.detail(leadId)
    },
  })
}

/**
 * Move lead to different pipeline stage
 */
export const useMoveLeadToStage = () => {
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
      await invalidateCache.leads.all()
      return await invalidateCache.leads.pipeline()
    },
  })
}

/**
 * Preview lead conversion (before actual conversion)
 */
export const usePreviewLeadConversion = (leadId: string) => {
  return useQuery({
    queryKey: QueryKeys.leads.conversionPreview(leadId),
    queryFn: () => leadService.previewConversion(leadId),
    enabled: !!leadId,
    staleTime: CACHE_TIMES.INSTANT, // Always fetch fresh data
  })
}

/**
 * Convert lead to client
 */
export const useConvertLead = () => {
  return useMutation({
    mutationFn: (leadId: string) => leadService.convertToClient(leadId),
    onSuccess: () => {
      toast.success('تم تحويل العميل المحتمل إلى عميل بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحويل العميل المحتمل')
    },
    onSettled: async () => {
      await invalidateCache.leads.all()
      return await invalidateCache.clients.all()
    },
  })
}

/**
 * Schedule follow-up for lead
 */
export const useScheduleFollowUp = () => {
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
      await invalidateCache.leads.detail(leadId)
      return await invalidateCache.leads.followUp()
    },
  })
}

/**
 * Log activity for lead
 */
export const useLogLeadActivity = () => {
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
      await invalidateCache.leads.detail(leadId)
      return await invalidateCache.activities.timeline()
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// PIPELINE HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all pipelines
 */
export const usePipelines = (params?: PipelineFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.pipelines.list(params),
    queryFn: () => pipelineService.getPipelines(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single pipeline with stage counts
 */
export const usePipeline = (pipelineId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.pipelines.detail(pipelineId),
    queryFn: () => pipelineService.getPipeline(pipelineId),
    enabled: !!pipelineId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get pipeline statistics
 */
export const usePipelineStats = (pipelineId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.pipelines.stats(pipelineId),
    queryFn: () => pipelineService.getStats(pipelineId),
    enabled: !!pipelineId && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
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
      return await invalidateCache.pipelines.all()
    },
  })
}

/**
 * Update pipeline
 */
export const useUpdatePipeline = () => {
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
      await invalidateCache.pipelines.all()
      return await invalidateCache.pipelines.detail(pipelineId)
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
      return await invalidateCache.pipelines.all()
    },
  })
}

/**
 * Add stage to pipeline
 */
export const useAddPipelineStage = () => {
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
      return await invalidateCache.pipelines.detail(pipelineId)
    },
  })
}

/**
 * Update pipeline stage
 */
export const useUpdatePipelineStage = () => {
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
      return await invalidateCache.pipelines.detail(pipelineId)
    },
  })
}

/**
 * Remove stage from pipeline
 */
export const useRemovePipelineStage = () => {
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
      return await invalidateCache.pipelines.detail(pipelineId)
    },
  })
}

/**
 * Reorder pipeline stages
 */
export const useReorderPipelineStages = () => {
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
      return await invalidateCache.pipelines.detail(pipelineId)
    },
  })
}

/**
 * Set pipeline as default
 */
export const useSetDefaultPipeline = () => {
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
      return await invalidateCache.pipelines.all()
    },
  })
}

/**
 * Duplicate pipeline
 */
export const useDuplicatePipeline = () => {
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
      return await invalidateCache.pipelines.all()
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// REFERRAL HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all referrals
 */
export const useReferrals = (filters?: ReferralFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.referrals.list(filters),
    queryFn: () => referralService.getReferrals(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single referral
 */
export const useReferral = (referralId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.referrals.detail(referralId),
    queryFn: () => referralService.getReferral(referralId),
    enabled: !!referralId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get referral statistics
 */
export const useReferralStats = (params?: {
  startDate?: string
  endDate?: string
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.referrals.stats(params),
    queryFn: () => referralService.getStats(params),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get top referrers
 */
export const useTopReferrers = (limit?: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.referrals.top(limit),
    queryFn: () => referralService.getTopReferrers(limit),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
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
      return await invalidateCache.referrals.all()
    },
  })
}

/**
 * Update referral
 */
export const useUpdateReferral = () => {
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
      await invalidateCache.referrals.all()
      return await invalidateCache.referrals.detail(referralId)
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
      return await invalidateCache.referrals.all()
    },
  })
}

/**
 * Update referral status
 */
export const useUpdateReferralStatus = () => {
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
      await invalidateCache.referrals.all()
      return await invalidateCache.referrals.detail(referralId)
    },
  })
}

/**
 * Mark referral reward as paid
 */
export const useMarkReferralPaid = () => {
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
      await invalidateCache.referrals.all()
      return await invalidateCache.referrals.detail(referralId)
    },
  })
}

/**
 * Add lead referral
 */
export const useAddLeadReferral = () => {
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
      return await invalidateCache.referrals.detail(referralId)
    },
  })
}

/**
 * Mark referral lead as converted
 */
export const useMarkReferralConverted = () => {
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
      await invalidateCache.referrals.detail(referralId)
      return await invalidateCache.referrals.stats()
    },
  })
}

/**
 * Record referral fee payment
 */
export const useRecordReferralPayment = () => {
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
      await invalidateCache.referrals.detail(referralId)
      return await invalidateCache.referrals.stats()
    },
  })
}

/**
 * Calculate referral fee
 */
export const useCalculateReferralFee = (
  referralId: string,
  caseValue: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.referrals.calculateFee(referralId, caseValue),
    queryFn: () => referralService.calculateFee(referralId, caseValue),
    enabled: !!referralId && caseValue > 0 && enabled,
    staleTime: CACHE_TIMES.INSTANT, // Always fresh
  })
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all activities
 */
export const useActivities = (params?: ActivityFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.activities.list(params),
    queryFn: () => crmActivityService.getActivities(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single activity
 */
export const useActivity = (activityId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.activities.detail(activityId),
    queryFn: () => crmActivityService.getActivity(activityId),
    enabled: !!activityId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get activity timeline
 */
export const useActivityTimeline = (params?: {
  entityTypes?: string
  types?: string
  limit?: number
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.activities.timeline(params),
    queryFn: () => crmActivityService.getTimeline(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * CRM Transactions Hook
 * Fetches CRM activity logs for the transactions view
 * Uses the existing crmActivityService.getActivities under the hood
 */
export const useCrmTransactions = (params?: {
  type?: string
  entity_type?: string
  period?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  pageSize?: number
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmTransactions.list(params),
    queryFn: () => crmActivityService.getActivities(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * CRM Transaction Stats Hook
 * Fetches stats for CRM transactions view hero section
 */
export const useCrmTransactionStats = (params?: {
  startDate?: string
  endDate?: string
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmTransactions.stats(params),
    queryFn: () => crmActivityService.getStats(params),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get activity statistics
 */
export const useActivityStats = (params?: {
  startDate?: string
  endDate?: string
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.activities.stats(params),
    queryFn: () => crmActivityService.getStats(params),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get entity activities
 */
export const useEntityActivities = (
  entityType: string,
  entityId: string,
  params?: { type?: string },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.activities.entity(entityType, entityId, params),
    queryFn: () =>
      crmActivityService.getEntityActivities(entityType, entityId, params),
    enabled: !!entityType && !!entityId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get upcoming tasks
 */
export const useUpcomingTasks = (params?: {
  assignedTo?: string
  endDate?: string
  limit?: number
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.activities.tasks.upcoming(params),
    queryFn: () => crmActivityService.getUpcomingTasks(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Create activity
 */
export const useCreateActivity = () => {
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
      await invalidateCache.activities.all()
      return await invalidateCache.activities.timeline()
    },
  })
}

/**
 * Update activity
 */
export const useUpdateActivity = () => {
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
      await invalidateCache.activities.all()
      await invalidateCache.activities.detail(activityId)
      return await invalidateCache.activities.timeline()
    },
  })
}

/**
 * Delete activity
 */
export const useDeleteActivity = () => {
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
      await invalidateCache.activities.all()
      return await invalidateCache.activities.timeline()
    },
  })
}

/**
 * Update activity status
 */
export const useUpdateActivityStatus = () => {
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
      await invalidateCache.activities.all()
      await invalidateCache.activities.timeline()
      return await invalidateCache.activities.detail(activityId)
    },
  })
}

/**
 * Complete task
 */
export const useCompleteTask = () => {
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
      await invalidateCache.activities.all()
      return await invalidateCache.activities.timeline()
    },
  })
}

/**
 * Log call activity
 */
export const useLogCall = () => {
  return useMutation({
    mutationFn: (data: LogCallData) => crmActivityService.logCall(data),
    onSuccess: () => {
      toast.success('تم تسجيل المكالمة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل المكالمة')
    },
    onSettled: async () => {
      await invalidateCache.activities.all()
      return await invalidateCache.activities.timeline()
    },
  })
}

/**
 * Log email activity
 */
export const useLogEmail = () => {
  return useMutation({
    mutationFn: (data: LogEmailData) => crmActivityService.logEmail(data),
    onSuccess: () => {
      toast.success('تم تسجيل البريد الإلكتروني بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل البريد الإلكتروني')
    },
    onSettled: async () => {
      await invalidateCache.activities.all()
      return await invalidateCache.activities.timeline()
    },
  })
}

/**
 * Log meeting activity
 */
export const useLogMeeting = () => {
  return useMutation({
    mutationFn: (data: LogMeetingData) => crmActivityService.logMeeting(data),
    onSuccess: () => {
      toast.success('تم تسجيل الاجتماع بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الاجتماع')
    },
    onSettled: async () => {
      await invalidateCache.activities.all()
      return await invalidateCache.activities.timeline()
    },
  })
}

/**
 * Add note activity
 */
export const useAddNote = () => {
  return useMutation({
    mutationFn: (data: AddNoteData) => crmActivityService.addNote(data),
    onSuccess: () => {
      toast.success('تم إضافة الملاحظة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إضافة الملاحظة')
    },
    onSettled: async () => {
      await invalidateCache.activities.all()
      return await invalidateCache.activities.timeline()
    },
  })
}
