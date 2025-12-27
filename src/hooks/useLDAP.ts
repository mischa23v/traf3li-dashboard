import { useQuery, useMutation } from '@tanstack/react-query'
import { CACHE_TIMES } from '@/config/cache'
import ldapService, { LDAPConfigFormData } from '@/services/ldapService'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { invalidateCache } from '@/lib/cache-invalidation'
import { QueryKeys } from '@/lib/query-keys'

/**
 * Hook to fetch LDAP configuration
 */
export const useLDAPConfig = () => {
  return useQuery({
    queryKey: QueryKeys.ldap.config(),
    queryFn: () => ldapService.getConfig(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

/**
 * Hook to fetch LDAP sync status
 */
export const useLDAPSyncStatus = () => {
  return useQuery({
    queryKey: QueryKeys.ldap.syncStatus(),
    queryFn: () => ldapService.getSyncStatus(),
    staleTime: CACHE_TIMES.REALTIME.LIVE_FEED, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds when sync is running
  })
}

/**
 * Hook to save LDAP configuration
 */
export const useSaveLDAPConfig = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (data: LDAPConfigFormData) => ldapService.saveConfig(data),
    onSuccess: () => {
      toast.success(isRTL ? 'تم حفظ إعدادات LDAP بنجاح' : 'LDAP configuration saved successfully')
      invalidateCache.ldap.config()
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل حفظ إعدادات LDAP' : 'Failed to save LDAP configuration'))
    },
  })
}

/**
 * Hook to update LDAP configuration (partial update)
 */
export const useUpdateLDAPConfig = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (data: Partial<LDAPConfigFormData>) => ldapService.updateConfig(data),
    onSuccess: () => {
      toast.success(isRTL ? 'تم تحديث إعدادات LDAP بنجاح' : 'LDAP configuration updated successfully')
      invalidateCache.ldap.config()
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل تحديث إعدادات LDAP' : 'Failed to update LDAP configuration'))
    },
  })
}

/**
 * Hook to test LDAP connection
 */
export const useTestLDAPConnection = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (data: LDAPConfigFormData) => ldapService.testConnection(data),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(isRTL ? data.messageAr : data.message)
      } else {
        toast.error(isRTL ? data.messageAr : data.message)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل اختبار الاتصال' : 'Connection test failed'))
    },
  })
}

/**
 * Hook to test LDAP user lookup
 */
export const useTestLDAPUserLookup = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: (username: string) => ldapService.testUserLookup(username),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(isRTL ? 'تم العثور على المستخدم بنجاح' : 'User found successfully')
      } else {
        toast.error(isRTL ? 'لم يتم العثور على المستخدم' : 'User not found')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل البحث عن المستخدم' : 'User lookup failed'))
    },
  })
}

/**
 * Hook to sync LDAP users
 */
export const useSyncLDAPUsers = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: () => ldapService.syncUsers(),
    onSuccess: (data) => {
      toast.success(isRTL ? data.messageAr : data.message)
      invalidateCache.ldap.syncStatus()
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشلت مزامنة المستخدمين' : 'User sync failed'))
    },
  })
}

/**
 * Hook to delete LDAP configuration
 */
export const useDeleteLDAPConfig = () => {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  return useMutation({
    mutationFn: () => ldapService.deleteConfig(),
    onSuccess: () => {
      toast.success(isRTL ? 'تم حذف إعدادات LDAP بنجاح' : 'LDAP configuration deleted successfully')
      invalidateCache.ldap.config()
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل حذف إعدادات LDAP' : 'Failed to delete LDAP configuration'))
    },
  })
}
