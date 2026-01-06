import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import authService from '@/services/authService'
import { ROUTES } from '@/constants/routes'
import { validateRedirectUrl } from '@/lib/security-headers'

// ============================================
// SVG ICONS
// ============================================
const Icons = {
  TrafliLogo: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  XCircle: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

type VerifyStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid'

export function MagicLinkVerify() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const setUser = useAuthStore((state) => state.setUser)
  const search = useSearch({ from: '/(auth)/magic-link/verify' })

  // State
  const [status, setStatus] = useState<VerifyStatus>('loading')
  const [error, setError] = useState('')

  // Get token from URL
  const token = (search as any)?.token as string | undefined

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('invalid')
        setError(t('magicLink.verify.noToken', 'رابط غير صالح | Invalid link'))
        return
      }

      try {
        const user = await authService.verifyMagicLink({ token })
        setUser(user as any)
        setStatus('success')

        // Redirect to dashboard after short delay
        // SECURITY: Validate redirect URL to prevent open redirect attacks
        setTimeout(() => {
          const rawRedirect = (search as { redirect?: string })?.redirect;
          const redirectTo = validateRedirectUrl(rawRedirect, { defaultUrl: '/' });
          navigate({ to: redirectTo })
        }, 2000)
      } catch (err: any) {
        const errorMessage = err.message?.toLowerCase() || ''

        if (errorMessage.includes('expired') || errorMessage.includes('منتهي')) {
          setStatus('expired')
          setError(t('magicLink.verify.expired', 'انتهت صلاحية الرابط | Link has expired'))
        } else if (errorMessage.includes('invalid') || errorMessage.includes('غير صالح')) {
          setStatus('invalid')
          setError(t('magicLink.verify.invalid', 'رابط غير صالح | Invalid link'))
        } else {
          setStatus('error')
          setError(err.message || t('magicLink.verify.failed', 'فشل التحقق | Verification failed'))
        }
      }
    }

    verifyToken()
  }, [token])

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-6">
              <Icons.TrafliLogo />
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 text-center">
              {/* Loading State */}
              {status === 'loading' && (
                <div className="space-y-4">
                  <div className="flex justify-center text-emerald-500">
                    <Icons.Spinner />
                  </div>
                  <h2 className="text-xl font-bold text-[#0f172a]">
                    {t('magicLink.verify.loading', 'جاري التحقق... | Verifying...')}
                  </h2>
                  <p className="text-slate-500">
                    {t('magicLink.verify.pleaseWait', 'يرجى الانتظار | Please wait')}
                  </p>
                </div>
              )}

              {/* Success State */}
              {status === 'success' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <Icons.CheckCircle />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-[#0f172a]">
                    {t('magicLink.verify.success', 'تم تسجيل الدخول بنجاح! | Login Successful!')}
                  </h2>
                  <p className="text-slate-500">
                    {t('magicLink.verify.redirecting', 'جاري إعادة التوجيه... | Redirecting...')}
                  </p>
                </div>
              )}

              {/* Error States */}
              {(status === 'error' || status === 'expired' || status === 'invalid') && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <Icons.XCircle />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-[#0f172a]">
                    {status === 'expired'
                      ? t('magicLink.verify.expiredTitle', 'انتهت صلاحية الرابط | Link Expired')
                      : status === 'invalid'
                        ? t('magicLink.verify.invalidTitle', 'رابط غير صالح | Invalid Link')
                        : t('magicLink.verify.errorTitle', 'حدث خطأ | Error Occurred')}
                  </h2>
                  <p className="text-slate-500">
                    {error}
                  </p>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-3">
                    <Link
                      to={ROUTES.auth.magicLink}
                      className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      {t('magicLink.verify.requestNew', 'طلب رابط جديد | Request New Link')}
                    </Link>
                    <Link
                      to={ROUTES.auth.signIn}
                      className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white text-[#0f172a] font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                    >
                      {t('magicLink.verify.usePassword', 'تسجيل الدخول بكلمة المرور | Login with Password')}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                {t('magicLink.verify.needHelp', 'تحتاج مساعدة؟ | Need help?')}{' '}
                <Link to="/support" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {t('magicLink.verify.contactSupport', 'تواصل معنا | Contact Support')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MagicLinkVerify
