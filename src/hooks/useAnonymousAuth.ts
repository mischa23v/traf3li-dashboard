/**
 * Anonymous/Guest Authentication Hooks
 * React hooks for guest sessions and account conversion
 */

import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import anonymousAuthService, {
  type AnonymousUser,
  type ConvertAccountData,
} from '@/services/anonymousAuthService'
import { useAuthStore } from '@/stores/auth-store'
import { invalidateCache } from '@/lib/cache-invalidation'

/**
 * Hook to login as guest
 */
export function useLoginAsGuest() {
  const { t } = useTranslation()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation<AnonymousUser>({
    mutationFn: () => anonymousAuthService.loginAsGuest(),
    onSuccess: (user) => {
      setUser(user)
      invalidateCache.user.profile()
      toast.success(t('auth.guestWelcome', 'مرحباً! تم إنشاء جلسة ضيف'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.guestError', 'فشل إنشاء جلسة الضيف'))
    },
  })
}

/**
 * Hook to convert anonymous account to full account
 */
export function useConvertAccount() {
  const { t } = useTranslation()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: ConvertAccountData) =>
      anonymousAuthService.convertToFullAccount(data),
    onSuccess: (user) => {
      setUser(user)
      invalidateCache.user.profile()
      toast.success(t('auth.accountCreated', 'تم إنشاء حسابك بنجاح!'))
      navigate({ to: '/dashboard' })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.conversionError', 'فشل تحويل الحساب'))
    },
  })
}

/**
 * Hook to extend anonymous session
 */
export function useExtendAnonymousSession() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: () => anonymousAuthService.extendSession(),
    onSuccess: (data) => {
      invalidateCache.user.profile()
      toast.success(t('auth.sessionExtended', 'تم تمديد الجلسة'))
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.extendError', 'فشل تمديد الجلسة'))
    },
  })
}

/**
 * Hook to delete anonymous session
 */
export function useDeleteAnonymousSession() {
  const { t } = useTranslation()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => anonymousAuthService.deleteSession(),
    onSuccess: () => {
      setUser(null)
      toast.success(t('auth.sessionDeleted', 'تم حذف الجلسة'))
      navigate({ to: '/sign-in' })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('auth.deleteError', 'فشل حذف الجلسة'))
    },
  })
}

/**
 * Hook to check anonymous status
 */
export function useAnonymousStatus() {
  return {
    isAnonymous: anonymousAuthService.isAnonymous(),
    expiresAt: anonymousAuthService.getExpiresAt(),
    daysRemaining: anonymousAuthService.getDaysRemaining(),
    isAboutToExpire: anonymousAuthService.isAboutToExpire(),
  }
}

export default {
  useLoginAsGuest,
  useConvertAccount,
  useExtendAnonymousSession,
  useDeleteAnonymousSession,
  useAnonymousStatus,
}
