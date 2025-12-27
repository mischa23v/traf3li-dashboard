import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import { QueryKeys } from '@/lib/query-keys'
import appsService, { GetAppsParams, ConnectAppData } from '@/services/appsService'
import { toast } from 'sonner'
import { invalidateCache } from '@/lib/cache-invalidation'

export const useApps = (params?: GetAppsParams) => {
  return useQuery({
    queryKey: QueryKeys.apps.list(params),
    queryFn: () => appsService.getApps(params),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useApp = (appId: string) => {
  return useQuery({
    queryKey: QueryKeys.apps.detail(appId),
    queryFn: () => appsService.getApp(appId),
    enabled: !!appId,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

export const useConnectApp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, data }: { appId: string; data?: ConnectAppData }) =>
      appsService.connectApp(appId, data),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم ربط التطبيق بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: QueryKeys.apps.all() }, (old: any) => {
        if (!old) return old
        // Handle { apps: [...] } structure
        if (old.apps && Array.isArray(old.apps)) {
          return {
            ...old,
            apps: old.apps.map((app: any) => app._id === data._id ? data : app)
          }
        }
        if (Array.isArray(old)) return old.map((app: any) => app._id === data._id ? data : app)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل ربط التطبيق')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.apps.all()
    },
  })
}

export const useDisconnectApp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appId: string) => appsService.disconnectApp(appId),
    // Update cache on success (Stable & Correct)
    onSuccess: (data) => {
      toast.success('تم فصل التطبيق بنجاح')

      // Manually update the cache
      queryClient.setQueriesData({ queryKey: QueryKeys.apps.all() }, (old: any) => {
        if (!old) return old
        // Handle { apps: [...] } structure
        if (old.apps && Array.isArray(old.apps)) {
          return {
            ...old,
            apps: old.apps.map((app: any) => app._id === data._id ? data : app)
          }
        }
        if (Array.isArray(old)) return old.map((app: any) => app._id === data._id ? data : app)
        return old
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل فصل التطبيق')
    },
    onSettled: async () => {
      // Delay to allow DB propagation
      await new Promise(resolve => setTimeout(resolve, 1000))
      return await invalidateCache.apps.all()
    },
  })
}
