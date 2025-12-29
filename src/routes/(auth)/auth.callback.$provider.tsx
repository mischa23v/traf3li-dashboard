/**
 * OAuth Callback Route
 * Handles OAuth provider callbacks and redirects to sign-up for new users
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import oauthService from '@/services/oauthService'
import { Loader2 } from 'lucide-react'

// Debug logging for OAuth callback
const callbackLog = (message: string, data?: any) => {
  console.log(`[OAUTH-CALLBACK] ${message}`, data !== undefined ? data : '')
}
const callbackError = (message: string, error?: any) => {
  console.error(`[OAUTH-CALLBACK] ❌ ${message}`, error || '')
}

export const Route = createFileRoute('/(auth)/auth/callback/$provider')({
  component: OAuthCallback,
})

function OAuthCallback() {
  const { provider } = Route.useParams()
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const setUser = useAuthStore((state) => state.setUser)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      callbackLog('=== OAUTH CALLBACK ROUTE START ===')
      callbackLog('Current URL:', window.location.href)

      // Get authorization code and state from URL
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const errorParam = urlParams.get('error')

      callbackLog('URL params:', {
        hasCode: !!code,
        codeLength: code?.length,
        hasState: !!state,
        hasError: !!errorParam,
        provider,
      })

      if (errorParam) {
        callbackError('Provider returned error:', errorParam)
        setError(isRTL ? 'فشل تسجيل الدخول: ' + errorParam : 'Login failed: ' + errorParam)
        return
      }

      if (!code) {
        callbackError('No authorization code in URL')
        setError(isRTL ? 'لم يتم استلام رمز التفويض' : 'No authorization code received')
        return
      }

      try {
        callbackLog('Calling oauthService.handleCallback...')
        const { user, isNewUser } = await oauthService.handleCallback(
          provider as any,
          code,
          state || undefined
        )

        callbackLog('handleCallback returned:', {
          userEmail: user.email,
          userId: user._id,
          isNewUser,
        })

        if (isNewUser) {
          callbackLog('New user - redirecting to sign-up')
          // New user - redirect to sign-up with pre-filled data
          const oauthData = {
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            avatar: user.avatar || '',
            oauthProvider: provider,
            oauthVerified: 'true',
          }

          // Encode data as URL params
          const params = new URLSearchParams(oauthData)
          navigate({ to: '/sign-up', search: params.toString() })
        } else {
          // Existing user - log them in
          callbackLog('Existing user - setting user in store and navigating to /')
          callbackLog('Token state before setUser:', {
            accessToken: localStorage.getItem('accessToken') ? 'present' : 'missing',
            refreshToken: localStorage.getItem('refreshToken') ? 'present' : 'missing',
            user: localStorage.getItem('user') ? 'present' : 'missing',
          })

          setUser(user)

          callbackLog('Token state after setUser:', {
            accessToken: localStorage.getItem('accessToken') ? 'present' : 'missing',
            refreshToken: localStorage.getItem('refreshToken') ? 'present' : 'missing',
            user: localStorage.getItem('user') ? 'present' : 'missing',
          })

          toast.success(isRTL ? 'تم تسجيل الدخول بنجاح' : 'Logged in successfully')
          callbackLog('=== OAUTH CALLBACK SUCCESS - Navigating to / ===')
          navigate({ to: '/' })
        }
      } catch (err: any) {
        callbackError('OAuth callback failed:', {
          message: err?.message,
          status: err?.status,
          code: err?.code,
        })
        setError(err.message || (isRTL ? 'فشل المصادقة' : 'Authentication failed'))
      }
    }

    handleCallback()
  }, [provider, navigate, setUser, isRTL])

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0f172a] mb-2">
            {isRTL ? 'فشل تسجيل الدخول' : 'Login Failed'}
          </h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => navigate({ to: '/sign-in' })}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all"
          >
            {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 max-w-md w-full text-center">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#0f172a] mb-2">
          {isRTL ? 'جاري التحقق...' : 'Verifying...'}
        </h2>
        <p className="text-slate-500">
          {isRTL ? 'يرجى الانتظار بينما نتحقق من حسابك' : 'Please wait while we verify your account'}
        </p>
      </div>
    </div>
  )
}
