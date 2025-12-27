/**
 * OAuth Hooks
 * React Query hooks for OAuth/Social login operations
 */

import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { CACHE_TIMES } from '@/config/cache'
import { invalidateCache } from '@/lib/cache-invalidation'
import oauthService, {
  type OAuthProvider,
  type OAuthProviderConfig,
} from '@/services/oauthService'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Hook to start OAuth flow (web)
 */
export const useOAuthLogin = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async ({
      provider,
      returnUrl = '/dashboard',
    }: {
      provider: OAuthProvider
      returnUrl?: string
    }) => {
      await oauthService.startWebFlow(provider, returnUrl)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تسجيل الدخول', {
        description: 'حدث خطأ أثناء الاتصال بالمزود',
      })
    },
  })
}

/**
 * Hook to handle OAuth callback
 */
export const useOAuthCallback = () => {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async ({
      provider,
      code,
      state,
    }: {
      provider: OAuthProvider
      code: string
      state?: string
    }) => {
      return await oauthService.handleCallback(provider, code, state)
    },
    onSuccess: (data) => {
      setUser(data.user)
      invalidateCache.user.profile()

      if (data.isNewUser) {
        toast.success('مرحباً بك!', {
          description: 'يرجى إكمال بيانات حسابك',
        })
        // Redirect new OAuth users to complete their profile and select role
        navigate({ to: '/sign-up/complete-profile' })
      } else {
        toast.success('تم تسجيل الدخول بنجاح')
        navigate({ to: '/dashboard' })
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل المصادقة', {
        description: 'يرجى المحاولة مرة أخرى',
      })
      navigate({ to: '/sign-in' })
    },
  })
}

/**
 * Hook to get available OAuth providers
 */
export const useAvailableProviders = () => {
  return useQuery<OAuthProviderConfig[]>({
    queryKey: ['oauth', 'providers'],
    queryFn: () => oauthService.getAvailableProviders(),
    staleTime: CACHE_TIMES.HOUR, // 1 hour
    gcTime: CACHE_TIMES.GC_LONG,
  })
}

/**
 * Hook to get linked OAuth providers for current user
 */
export const useLinkedProviders = () => {
  return useQuery<OAuthProvider[]>({
    queryKey: ['oauth', 'linked'],
    queryFn: () => oauthService.getLinkedProviders(),
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  })
}

/**
 * Hook to link OAuth provider
 */
export const useLinkProvider = () => {
  return useMutation({
    mutationFn: async ({
      provider,
      returnUrl,
    }: {
      provider: OAuthProvider
      returnUrl?: string
    }) => {
      await oauthService.linkProvider(provider, returnUrl)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل ربط الحساب')
    },
  })
}

/**
 * Hook to unlink OAuth provider
 */
export const useUnlinkProvider = () => {
  return useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      await oauthService.unlinkProvider(provider)
    },
    onSuccess: (_, provider) => {
      invalidateCache.oauth.linked()
      toast.success('تم إلغاء الربط بنجاح')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء الربط')
    },
  })
}
