import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import appsService, { GetAppsParams, ConnectAppData } from '@/services/appsService'
import { toast } from 'sonner'

export const useApps = (params?: GetAppsParams) => {
  return useQuery({
    queryKey: ['apps', params],
    queryFn: () => appsService.getApps(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useApp = (appId: string) => {
  return useQuery({
    queryKey: ['apps', appId],
    queryFn: () => appsService.getApp(appId),
    enabled: !!appId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useConnectApp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ appId, data }: { appId: string; data?: ConnectAppData }) =>
      appsService.connectApp(appId, data),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['apps'] })
      toast.success('تم ربط التطبيق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل ربط التطبيق')
    },
  })
}

export const useDisconnectApp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appId: string) => appsService.disconnectApp(appId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['apps'] })
      toast.success('تم فصل التطبيق بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل فصل التطبيق')
    },
  })
}
