/**
 * Campaign Hooks
 * React Query hooks for Campaign management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'
import { campaignService } from '@/services/campaignService'
import type {
  Campaign,
  CreateCampaignData,
  CampaignStatistics,
  CampaignAnalytics,
} from '@/services/campaignService'
import type { CampaignFilters } from '@/types/crm-extended'

// ==================== Cache Configuration ====================
// Cache data for 30 minutes to reduce API calls
// Data is refreshed automatically when mutations occur
const STATS_STALE_TIME = CACHE_TIMES.LONG // 30 minutes
const STATS_GC_TIME = CACHE_TIMES.GC_LONG // 1 hour (keep in cache)
const LIST_STALE_TIME = CACHE_TIMES.MEDIUM // 5 minutes for lists

// ═══════════════════════════════════════════════════════════════
// QUERY HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all campaigns with optional filters
 */
export const useCampaigns = (params?: CampaignFilters, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.campaigns.list(params),
    queryFn: () => campaignService.getCampaigns(params),
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
    enabled,
  })
}

/**
 * Get single campaign
 */
export const useCampaign = (campaignId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.campaigns.detail(campaignId),
    queryFn: () => campaignService.getCampaign(campaignId),
    enabled: !!campaignId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get campaign leads
 */
export const useCampaignLeads = (
  campaignId: string,
  params?: { page?: number; limit?: number },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: QueryKeys.campaigns.leads(campaignId, params),
    queryFn: () => campaignService.getCampaignLeads(campaignId, params),
    enabled: !!campaignId && enabled,
    staleTime: LIST_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get campaign statistics
 */
export const useCampaignStats = (campaignId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.campaigns.stats(campaignId),
    queryFn: () => campaignService.getCampaignStats(campaignId),
    enabled: !!campaignId && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

/**
 * Get campaign analytics (charts data)
 */
export const useCampaignAnalytics = (campaignId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QueryKeys.campaigns.analytics(campaignId),
    queryFn: () => campaignService.getCampaignAnalytics(campaignId),
    enabled: !!campaignId && enabled,
    staleTime: STATS_STALE_TIME,
    gcTime: STATS_GC_TIME,
  })
}

// ═══════════════════════════════════════════════════════════════
// MUTATION HOOKS
// ═══════════════════════════════════════════════════════════════

/**
 * Create new campaign
 */
export const useCreateCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCampaignData) => campaignService.createCampaign(data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم إنشاء الحملة بنجاح')

      // Manually update the cache with the REAL campaign from server
      queryClient.setQueriesData({ queryKey: ['campaigns'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: ... } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: [data, ...old.data],
            total: (old.total || old.data.length) + 1
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
      toast.error(error.message || 'فشل إنشاء الحملة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.campaigns.all()
    },
  })
}

/**
 * Update campaign
 */
export const useUpdateCampaign = () => {
  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: Partial<Campaign> }) =>
      campaignService.updateCampaign(campaignId, data),
    onSuccess: () => {
      toast.success('تم تحديث الحملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث الحملة')
    },
    onSettled: async (_, __, { campaignId }) => {
      await invalidateCache.campaigns.all()
      return await invalidateCache.campaigns.detail(campaignId)
    },
  })
}

/**
 * Delete campaign
 */
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (campaignId: string) => campaignService.deleteCampaign(campaignId),
    // Update cache on success (Stable & Correct)
    onSuccess: (_, campaignId) => {
      toast.success('تم حذف الحملة بنجاح')

      // Optimistically remove campaign from all lists
      queryClient.setQueriesData({ queryKey: ['campaigns'] }, (old: any) => {
        if (!old) return old

        // Handle { data: [...], total: ... } structure
        if (old.data && Array.isArray(old.data)) {
          return {
            ...old,
            data: old.data.filter((item: any) => item._id !== campaignId),
            total: Math.max(0, (old.total || old.data.length) - 1)
          }
        }

        // Handle Array structure
        if (Array.isArray(old)) {
          return old.filter((item: any) => item._id !== campaignId)
        }

        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف الحملة')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.campaigns.all()
    },
  })
}

/**
 * Duplicate campaign
 */
export const useDuplicateCampaign = () => {
  return useMutation({
    mutationFn: (campaignId: string) => campaignService.duplicateCampaign(campaignId),
    onSuccess: () => {
      toast.success('تم نسخ الحملة بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل نسخ الحملة')
    },
    onSettled: async () => {
      return await invalidateCache.campaigns.all()
    },
  })
}

/**
 * Pause campaign
 */
export const usePauseCampaign = () => {
  return useMutation({
    mutationFn: (campaignId: string) => campaignService.pauseCampaign(campaignId),
    onSuccess: () => {
      toast.success('تم إيقاف الحملة مؤقتاً')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إيقاف الحملة')
    },
    onSettled: async (_, __, campaignId) => {
      await invalidateCache.campaigns.all()
      return await invalidateCache.campaigns.detail(campaignId)
    },
  })
}

/**
 * Resume campaign
 */
export const useResumeCampaign = () => {
  return useMutation({
    mutationFn: (campaignId: string) => campaignService.resumeCampaign(campaignId),
    onSuccess: () => {
      toast.success('تم استئناف الحملة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استئناف الحملة')
    },
    onSettled: async (_, __, campaignId) => {
      await invalidateCache.campaigns.all()
      return await invalidateCache.campaigns.detail(campaignId)
    },
  })
}

/**
 * Complete campaign
 */
export const useCompleteCampaign = () => {
  return useMutation({
    mutationFn: (campaignId: string) => campaignService.completeCampaign(campaignId),
    onSuccess: () => {
      toast.success('تم إكمال الحملة')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إكمال الحملة')
    },
    onSettled: async (_, __, campaignId) => {
      await invalidateCache.campaigns.all()
      return await invalidateCache.campaigns.detail(campaignId)
    },
  })
}
