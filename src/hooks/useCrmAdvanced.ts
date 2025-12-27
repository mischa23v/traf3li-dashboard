/**
 * Advanced CRM Hooks
 * React Query hooks for email marketing, lead scoring, and WhatsApp
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { QueryKeys } from '@/lib/query-keys'
import { invalidateCache } from '@/lib/cache-invalidation'
import {
  emailTemplateService,
  emailCampaignService,
  dripCampaignService,
  subscriberService,
  segmentService,
  leadScoringService,
  whatsAppService,
} from '@/services/crmAdvancedService'
import type {
  CreateEmailTemplateData,
  CreateCampaignData,
  CampaignFilters,
  CreateDripCampaignData,
  CreateSegmentData,
  LeadScoreConfig,
  SendMessageData,
  SendTemplateMessageData,
  CreateTemplateData,
  CreateBroadcastData,
  ConversationFilters,
} from '@/types/crm-advanced'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when mutations occur
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useEmailTemplates = (category?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.emailTemplatesList(category),
    queryFn: () => emailTemplateService.getTemplates(category),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useEmailTemplate = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.emailTemplate(id),
    queryFn: () => emailTemplateService.getTemplate(id),
    enabled: !!id && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateEmailTemplate = () => {
  return useMutation({
    mutationFn: (data: CreateEmailTemplateData) => emailTemplateService.createTemplate(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.emailTemplates()
      toast.success('تم إنشاء القالب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء القالب')
    },
  })
}

export const useUpdateEmailTemplate = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmailTemplateData> }) =>
      emailTemplateService.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.emailTemplates()
      invalidateCache.crmAdvanced.emailTemplate(variables.id)
      toast.success('تم تحديث القالب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

export const useDeleteEmailTemplate = () => {
  return useMutation({
    mutationFn: (id: string) => emailTemplateService.deleteTemplate(id),
    onSuccess: () => {
      invalidateCache.crmAdvanced.emailTemplates()
      toast.success('تم حذف القالب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحذف')
    },
  })
}

export const usePreviewTemplate = () => {
  return useMutation({
    mutationFn: ({ id, sampleData }: { id: string; sampleData?: Record<string, string> }) =>
      emailTemplateService.previewTemplate(id, sampleData),
  })
}

// ═══════════════════════════════════════════════════════════════
// EMAIL CAMPAIGN HOOKS
// ═══════════════════════════════════════════════════════════════

export const useEmailCampaigns = (filters?: CampaignFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.emailCampaignsList(filters),
    queryFn: () => emailCampaignService.getCampaigns(filters),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useEmailCampaign = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.emailCampaign(id),
    queryFn: () => emailCampaignService.getCampaign(id),
    enabled: !!id && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateEmailCampaign = () => {
  return useMutation({
    mutationFn: (data: CreateCampaignData) => emailCampaignService.createCampaign(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.emailCampaigns()
      toast.success('تم إنشاء الحملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء الحملة')
    },
  })
}

export const useSendCampaign = () => {
  return useMutation({
    mutationFn: (id: string) => emailCampaignService.sendCampaign(id),
    onSuccess: (data) => {
      invalidateCache.crmAdvanced.emailCampaigns()
      toast.success(`تم إرسال الحملة إلى ${data.sent} مستلم`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إرسال الحملة')
    },
  })
}

export const useScheduleCampaign = () => {
  return useMutation({
    mutationFn: ({ id, sendAt, timezone }: { id: string; sendAt: Date; timezone: string }) =>
      emailCampaignService.scheduleCampaign(id, sendAt, timezone),
    onSuccess: () => {
      invalidateCache.crmAdvanced.emailCampaigns()
      toast.success('تم جدولة الحملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الجدولة')
    },
  })
}

export const usePauseCampaign = () => {
  return useMutation({
    mutationFn: (id: string) => emailCampaignService.pauseCampaign(id),
    onSuccess: () => {
      invalidateCache.crmAdvanced.emailCampaigns()
      toast.success('تم إيقاف الحملة مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإيقاف')
    },
  })
}

export const useResumeCampaign = () => {
  return useMutation({
    mutationFn: (id: string) => emailCampaignService.resumeCampaign(id),
    onSuccess: () => {
      invalidateCache.crmAdvanced.emailCampaigns()
      toast.success('تم استئناف الحملة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الاستئناف')
    },
  })
}

export const useCampaignAnalytics = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.campaignAnalytics(id),
    queryFn: () => emailCampaignService.getAnalytics(id),
    enabled: !!id && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    refetchInterval: 30000, // Refresh every 30 seconds during active campaigns
    retry: false,
  })
}

// ═══════════════════════════════════════════════════════════════
// DRIP CAMPAIGN HOOKS
// ═══════════════════════════════════════════════════════════════

export const useDripCampaigns = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.dripCampaigns(),
    queryFn: () => dripCampaignService.getCampaigns(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useDripCampaign = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.dripCampaign(id),
    queryFn: () => dripCampaignService.getCampaign(id),
    enabled: !!id && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCreateDripCampaign = () => {
  return useMutation({
    mutationFn: (data: CreateDripCampaignData) => dripCampaignService.createCampaign(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.dripCampaigns()
      toast.success('تم إنشاء حملة التنقيط')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإنشاء')
    },
  })
}

export const useActivateDripCampaign = () => {
  return useMutation({
    mutationFn: (id: string) => dripCampaignService.activateCampaign(id),
    onSuccess: () => {
      invalidateCache.crmAdvanced.dripCampaigns()
      toast.success('تم تفعيل الحملة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التفعيل')
    },
  })
}

export const usePauseDripCampaign = () => {
  return useMutation({
    mutationFn: (id: string) => dripCampaignService.pauseCampaign(id),
    onSuccess: () => {
      invalidateCache.crmAdvanced.dripCampaigns()
      toast.success('تم إيقاف الحملة مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإيقاف')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// SUBSCRIBER HOOKS
// ═══════════════════════════════════════════════════════════════

export const useSubscribers = (params?: {
  status?: string
  tags?: string[]
  search?: string
  page?: number
  limit?: number
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.subscribersList(params),
    queryFn: () => subscriberService.getSubscribers(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useImportSubscribers = () => {
  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: { tags?: string[]; updateExisting?: boolean } }) =>
      subscriberService.importSubscribers(file, options),
    onSuccess: (data) => {
      invalidateCache.crmAdvanced.subscribers()
      toast.success(`تم استيراد ${data.imported} مشترك`)
      if (data.updated > 0) toast.info(`تم تحديث ${data.updated} مشترك موجود`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الاستيراد')
    },
  })
}

export const useUnsubscribe = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      subscriberService.unsubscribe(id, reason),
    onSuccess: () => {
      invalidateCache.crmAdvanced.subscribers()
      toast.success('تم إلغاء الاشتراك')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإلغاء')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// SEGMENT HOOKS
// ═══════════════════════════════════════════════════════════════

export const useSegments = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.segments(),
    queryFn: () => segmentService.getSegments(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useCreateSegment = () => {
  return useMutation({
    mutationFn: (data: CreateSegmentData) => segmentService.createSegment(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.segments()
      toast.success('تم إنشاء الشريحة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإنشاء')
    },
  })
}

export const usePreviewSegment = () => {
  return useMutation({
    mutationFn: ({ id, limit }: { id: string; limit?: number }) =>
      segmentService.previewSegment(id, limit),
  })
}

// ═══════════════════════════════════════════════════════════════
// LEAD SCORING HOOKS
// ═══════════════════════════════════════════════════════════════

export const useLeadScores = (params?: {
  grade?: string
  minScore?: number
  maxScore?: number
}, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.leadScoresList(params),
    queryFn: () => leadScoringService.getScores(params),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useLeadInsights = (leadId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.leadInsights(leadId),
    queryFn: () => leadScoringService.getLeadInsights(leadId),
    enabled: !!leadId && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

export const useCalculateLeadScore = () => {
  return useMutation({
    mutationFn: (leadId: string) => leadScoringService.calculateScore(leadId),
    onSuccess: (_, leadId) => {
      invalidateCache.crmAdvanced.leadScores()
      invalidateCache.crmAdvanced.leadInsights(leadId)
      toast.success('تم حساب التقييم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحساب')
    },
  })
}

export const useCalculateAllScores = () => {
  return useMutation({
    mutationFn: () => leadScoringService.calculateAllScores(),
    onSuccess: (data) => {
      invalidateCache.crmAdvanced.leadScores()
      toast.success(`تم حساب تقييم ${data.calculated} عميل محتمل`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحساب')
    },
  })
}

export const useLeadLeaderboard = (limit: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.leadLeaderboard(limit),
    queryFn: () => leadScoringService.getLeaderboard(limit),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useLeadScoreDistribution = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.leadScoreDistribution(),
    queryFn: () => leadScoringService.getDistribution(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

// Lead Scoring Tracking Hooks
export const useTrackEmailOpen = () => {
  return useMutation({
    mutationFn: (data: { leadId: string; campaignId?: string; emailId?: string }) =>
      leadScoringService.trackEmailOpen(data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.leadInsights(variables.leadId)
      invalidateCache.crmAdvanced.leadScores()
    },
  })
}

export const useTrackEmailClick = () => {
  return useMutation({
    mutationFn: (data: { leadId: string; campaignId?: string; emailId?: string; linkUrl?: string }) =>
      leadScoringService.trackEmailClick(data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.leadInsights(variables.leadId)
      invalidateCache.crmAdvanced.leadScores()
    },
  })
}

export const useTrackDocumentView = () => {
  return useMutation({
    mutationFn: (data: { leadId: string; documentId: string; documentType?: string }) =>
      leadScoringService.trackDocumentView(data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.leadInsights(variables.leadId)
      invalidateCache.crmAdvanced.leadScores()
    },
  })
}

export const useTrackWebsiteVisit = () => {
  return useMutation({
    mutationFn: (data: { leadId: string; pageUrl: string; duration?: number }) =>
      leadScoringService.trackWebsiteVisit(data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.leadInsights(variables.leadId)
      invalidateCache.crmAdvanced.leadScores()
    },
  })
}

export const useTrackFormSubmit = () => {
  return useMutation({
    mutationFn: (data: { leadId: string; formId: string; formType?: string }) =>
      leadScoringService.trackFormSubmit(data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.leadInsights(variables.leadId)
      invalidateCache.crmAdvanced.leadScores()
    },
  })
}

export const useTrackMeeting = () => {
  return useMutation({
    mutationFn: (data: { leadId: string; meetingId?: string; duration?: number; outcome?: string }) =>
      leadScoringService.trackMeeting(data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.leadInsights(variables.leadId)
      invalidateCache.crmAdvanced.leadScores()
    },
  })
}

export const useTrackCall = () => {
  return useMutation({
    mutationFn: (data: { leadId: string; callId?: string; duration?: number; outcome?: string }) =>
      leadScoringService.trackCall(data),
    onSuccess: (_, variables) => {
      invalidateCache.crmAdvanced.leadInsights(variables.leadId)
      invalidateCache.crmAdvanced.leadScores()
    },
  })
}

export const useLeadScoringConfig = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.leadScoringConfig(),
    queryFn: () => leadScoringService.getConfig(),
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
    retry: false,
  })
}

export const useUpdateLeadScoringConfig = () => {
  return useMutation({
    mutationFn: (data: Partial<LeadScoreConfig>) => leadScoringService.updateConfig(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.leadScoringConfig()
      toast.success('تم تحديث إعدادات التقييم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// WHATSAPP HOOKS
// ═══════════════════════════════════════════════════════════════

export const useWhatsAppConversations = (filters?: ConversationFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.whatsAppConversationsList(filters),
    queryFn: () => whatsAppService.getConversations(filters),
    staleTime: 30 * 1000,
    gcTime: STATS_GC_TIME,
    enabled,
    refetchInterval: 30000, // Refresh every 30 seconds (reduced from 10s for performance)
    retry: false,
  })
}

export const useWhatsAppConversation = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.whatsAppConversation(id),
    queryFn: () => whatsAppService.getConversation(id),
    enabled: !!id && enabled,
    staleTime: 30 * 1000,
    gcTime: STATS_GC_TIME,
    refetchInterval: 5000, // Refresh every 5 seconds for active chat
    retry: false,
  })
}

export const useSendWhatsAppMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendMessageData) => whatsAppService.sendMessage(data),
    onSuccess: () => {
      // Invalidate all whatsapp queries to ensure list updates
      invalidateCache.crmAdvanced.whatsAppConversations()
      // Also refetch to force immediate update
      queryClient.refetchQueries({ queryKey: QueryKeys.crmAdvanced.whatsAppConversations() })
      toast.success('تم إرسال الرسالة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إرسال الرسالة')
    },
  })
}

export const useSendWhatsAppTemplate = () => {
  return useMutation({
    mutationFn: (data: SendTemplateMessageData) => whatsAppService.sendTemplateMessage(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.whatsAppConversations()
      toast.success('تم إرسال رسالة القالب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإرسال')
    },
  })
}

export const useMarkConversationAsRead = () => {
  return useMutation({
    mutationFn: (conversationId: string) => whatsAppService.markAsRead(conversationId),
    onSuccess: () => {
      invalidateCache.crmAdvanced.whatsAppConversations()
    },
  })
}

export const useAssignConversation = () => {
  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      whatsAppService.assignConversation(conversationId, userId),
    onSuccess: () => {
      invalidateCache.crmAdvanced.whatsAppConversations()
      toast.success('تم تعيين المحادثة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التعيين')
    },
  })
}

export const useWhatsAppTemplates = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.whatsAppTemplates(),
    queryFn: () => whatsAppService.getTemplates(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useCreateWhatsAppTemplate = () => {
  return useMutation({
    mutationFn: (data: CreateTemplateData) => whatsAppService.createTemplate(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.whatsAppTemplates()
      toast.success('تم إرسال القالب للموافقة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإرسال')
    },
  })
}

export const useWhatsAppBroadcasts = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.crmAdvanced.whatsAppBroadcasts(),
    queryFn: () => whatsAppService.getBroadcasts(),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

export const useCreateWhatsAppBroadcast = () => {
  return useMutation({
    mutationFn: (data: CreateBroadcastData) => whatsAppService.createBroadcast(data),
    onSuccess: () => {
      invalidateCache.crmAdvanced.whatsAppBroadcasts()
      toast.success('تم إنشاء البث')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإنشاء')
    },
  })
}

export const useSendWhatsAppBroadcast = () => {
  return useMutation({
    mutationFn: (id: string) => whatsAppService.sendBroadcast(id),
    onSuccess: () => {
      invalidateCache.crmAdvanced.whatsAppBroadcasts()
      toast.success('تم بدء إرسال البث')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإرسال')
    },
  })
}
