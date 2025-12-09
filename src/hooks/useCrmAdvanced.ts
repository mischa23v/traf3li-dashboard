/**
 * Advanced CRM Hooks
 * React Query hooks for email marketing, lead scoring, and WhatsApp
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  TrackBehaviorData,
  LeadScoreConfig,
  SendMessageData,
  SendTemplateMessageData,
  CreateTemplateData,
  CreateBroadcastData,
  ConversationFilters,
} from '@/types/crm-advanced'

// ═══════════════════════════════════════════════════════════════
// EMAIL TEMPLATE HOOKS
// ═══════════════════════════════════════════════════════════════

export const useEmailTemplates = (category?: string) => {
  return useQuery({
    queryKey: ['email-templates', category],
    queryFn: () => emailTemplateService.getTemplates(category),
    staleTime: 5 * 60 * 1000,
  })
}

export const useEmailTemplate = (id: string) => {
  return useQuery({
    queryKey: ['email-template', id],
    queryFn: () => emailTemplateService.getTemplate(id),
    enabled: !!id,
  })
}

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEmailTemplateData) => emailTemplateService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      toast.success('تم إنشاء القالب بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء القالب')
    },
  })
}

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEmailTemplateData> }) =>
      emailTemplateService.updateTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
      queryClient.invalidateQueries({ queryKey: ['email-template', variables.id] })
      toast.success('تم تحديث القالب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التحديث')
    },
  })
}

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => emailTemplateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] })
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

export const useEmailCampaigns = (filters?: CampaignFilters) => {
  return useQuery({
    queryKey: ['email-campaigns', filters],
    queryFn: () => emailCampaignService.getCampaigns(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export const useEmailCampaign = (id: string) => {
  return useQuery({
    queryKey: ['email-campaign', id],
    queryFn: () => emailCampaignService.getCampaign(id),
    enabled: !!id,
  })
}

export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCampaignData) => emailCampaignService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] })
      toast.success('تم إنشاء الحملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إنشاء الحملة')
    },
  })
}

export const useSendCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => emailCampaignService.sendCampaign(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] })
      toast.success(`تم إرسال الحملة إلى ${data.sent} مستلم`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إرسال الحملة')
    },
  })
}

export const useScheduleCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, sendAt, timezone }: { id: string; sendAt: Date; timezone: string }) =>
      emailCampaignService.scheduleCampaign(id, sendAt, timezone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] })
      toast.success('تم جدولة الحملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الجدولة')
    },
  })
}

export const usePauseCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => emailCampaignService.pauseCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] })
      toast.success('تم إيقاف الحملة مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإيقاف')
    },
  })
}

export const useResumeCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => emailCampaignService.resumeCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-campaigns'] })
      toast.success('تم استئناف الحملة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الاستئناف')
    },
  })
}

export const useCampaignAnalytics = (id: string) => {
  return useQuery({
    queryKey: ['campaign-analytics', id],
    queryFn: () => emailCampaignService.getAnalytics(id),
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30 seconds during active campaigns
  })
}

// ═══════════════════════════════════════════════════════════════
// DRIP CAMPAIGN HOOKS
// ═══════════════════════════════════════════════════════════════

export const useDripCampaigns = () => {
  return useQuery({
    queryKey: ['drip-campaigns'],
    queryFn: () => dripCampaignService.getCampaigns(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useDripCampaign = (id: string) => {
  return useQuery({
    queryKey: ['drip-campaign', id],
    queryFn: () => dripCampaignService.getCampaign(id),
    enabled: !!id,
  })
}

export const useCreateDripCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDripCampaignData) => dripCampaignService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drip-campaigns'] })
      toast.success('تم إنشاء حملة التنقيط')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإنشاء')
    },
  })
}

export const useActivateDripCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dripCampaignService.activateCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drip-campaigns'] })
      toast.success('تم تفعيل الحملة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التفعيل')
    },
  })
}

export const usePauseDripCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dripCampaignService.pauseCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drip-campaigns'] })
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
}) => {
  return useQuery({
    queryKey: ['subscribers', params],
    queryFn: () => subscriberService.getSubscribers(params),
    staleTime: 2 * 60 * 1000,
  })
}

export const useImportSubscribers = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, options }: { file: File; options?: { tags?: string[]; updateExisting?: boolean } }) =>
      subscriberService.importSubscribers(file, options),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
      toast.success(`تم استيراد ${data.imported} مشترك`)
      if (data.updated > 0) toast.info(`تم تحديث ${data.updated} مشترك موجود`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الاستيراد')
    },
  })
}

export const useUnsubscribe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      subscriberService.unsubscribe(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] })
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

export const useSegments = () => {
  return useQuery({
    queryKey: ['segments'],
    queryFn: () => segmentService.getSegments(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateSegment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSegmentData) => segmentService.createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] })
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
}) => {
  return useQuery({
    queryKey: ['lead-scores', params],
    queryFn: () => leadScoringService.getScores(params),
    staleTime: 2 * 60 * 1000,
  })
}

export const useLeadScore = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-score', leadId],
    queryFn: () => leadScoringService.getLeadScore(leadId),
    enabled: !!leadId,
  })
}

export const useCalculateLeadScore = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (leadId: string) => leadScoringService.calculateScore(leadId),
    onSuccess: (_, leadId) => {
      queryClient.invalidateQueries({ queryKey: ['lead-scores'] })
      queryClient.invalidateQueries({ queryKey: ['lead-score', leadId] })
      toast.success('تم حساب التقييم')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحساب')
    },
  })
}

export const useCalculateAllScores = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => leadScoringService.calculateAllScores(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-scores'] })
      toast.success(`تم حساب تقييم ${data.calculated} عميل محتمل`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الحساب')
    },
  })
}

export const useLeadLeaderboard = (limit: number = 10) => {
  return useQuery({
    queryKey: ['lead-leaderboard', limit],
    queryFn: () => leadScoringService.getLeaderboard(limit),
    staleTime: 2 * 60 * 1000,
  })
}

export const useLeadScoreDistribution = () => {
  return useQuery({
    queryKey: ['lead-score-distribution'],
    queryFn: () => leadScoringService.getDistribution(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useTrackLeadBehavior = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TrackBehaviorData) => leadScoringService.trackBehavior(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-score', variables.leadId] })
    },
  })
}

export const useLeadScoringConfig = () => {
  return useQuery({
    queryKey: ['lead-scoring-config'],
    queryFn: () => leadScoringService.getConfig(),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export const useUpdateLeadScoringConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<LeadScoreConfig>) => leadScoringService.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-scoring-config'] })
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

export const useWhatsAppConversations = (filters?: ConversationFilters) => {
  return useQuery({
    queryKey: ['whatsapp-conversations', filters],
    queryFn: () => whatsAppService.getConversations(filters),
    staleTime: 30 * 1000,
    refetchInterval: 10000, // Refresh every 10 seconds
  })
}

export const useWhatsAppConversation = (id: string) => {
  return useQuery({
    queryKey: ['whatsapp-conversation', id],
    queryFn: () => whatsAppService.getConversation(id),
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds for active chat
  })
}

export const useSendWhatsAppMessage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendMessageData) => whatsAppService.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] })
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversation'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في إرسال الرسالة')
    },
  })
}

export const useSendWhatsAppTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendTemplateMessageData) => whatsAppService.sendTemplateMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] })
      toast.success('تم إرسال رسالة القالب')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإرسال')
    },
  })
}

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => whatsAppService.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] })
    },
  })
}

export const useAssignConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, userId }: { conversationId: string; userId: string }) =>
      whatsAppService.assignConversation(conversationId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] })
      toast.success('تم تعيين المحادثة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في التعيين')
    },
  })
}

export const useWhatsAppTemplates = () => {
  return useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: () => whatsAppService.getTemplates(),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateWhatsAppTemplate = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTemplateData) => whatsAppService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      toast.success('تم إرسال القالب للموافقة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإرسال')
    },
  })
}

export const useWhatsAppBroadcasts = () => {
  return useQuery({
    queryKey: ['whatsapp-broadcasts'],
    queryFn: () => whatsAppService.getBroadcasts(),
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateWhatsAppBroadcast = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBroadcastData) => whatsAppService.createBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-broadcasts'] })
      toast.success('تم إنشاء البث')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإنشاء')
    },
  })
}

export const useSendWhatsAppBroadcast = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => whatsAppService.sendBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-broadcasts'] })
      toast.success('تم بدء إرسال البث')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل في الإرسال')
    },
  })
}
