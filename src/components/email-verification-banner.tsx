import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import authService from '@/services/authService'

// ============================================
// SVG ICONS
// ============================================
const Icons = {
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

interface EmailVerificationBannerProps {
  className?: string
}

export function EmailVerificationBanner({ className = '' }: EmailVerificationBannerProps) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const user = useAuthStore((state) => state.user)

  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [error, setError] = useState('')

  // Don't show if user is not logged in, email is verified, or banner is dismissed
  if (!user || user.isEmailVerified || isDismissed) {
    return null
  }

  const handleSendVerification = async () => {
    setIsLoading(true)
    setError('')

    try {
      await authService.sendVerificationEmail()
      setIsSent(true)
    } catch (err: any) {
      setError(err.message || t('emailVerification.sendFailed', 'فشل إرسال رابط التحقق | Failed to send verification link'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    setError('')

    try {
      await authService.resendVerificationEmail()
      setIsSent(true)
    } catch (err: any) {
      setError(err.message || t('emailVerification.resendFailed', 'فشل إعادة إرسال الرابط | Failed to resend link'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`bg-amber-50 border-b border-amber-200 ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600">
              <Icons.Mail />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <p className="font-medium text-amber-800">
                {isSent
                  ? t('emailVerification.sent', 'تم إرسال رابط التحقق! | Verification link sent!')
                  : t('emailVerification.unverified', 'بريدك الإلكتروني غير مُفعّل | Your email is not verified')}
              </p>
              {!isSent && (
                <p className="text-amber-700 text-sm">
                  {t('emailVerification.verifyPrompt', 'فعّل بريدك للوصول الكامل | Verify your email for full access')}
                </p>
              )}
              {isSent && (
                <p className="text-amber-700 text-sm">
                  {t('emailVerification.checkInbox', 'تحقق من صندوق الوارد | Check your inbox')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {error && (
              <span className="text-red-600 text-sm">{error}</span>
            )}

            {!isSent ? (
              <button
                onClick={handleSendVerification}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Icons.Spinner />
                    {t('emailVerification.sending', 'جاري الإرسال... | Sending...')}
                  </>
                ) : (
                  t('emailVerification.sendLink', 'إرسال رابط التفعيل | Send Verification Link')
                )}
              </button>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium hover:bg-amber-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Icons.Spinner />
                    {t('emailVerification.resending', 'جاري الإرسال... | Sending...')}
                  </>
                ) : (
                  t('emailVerification.resend', 'إعادة الإرسال | Resend')
                )}
              </button>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
              aria-label={t('emailVerification.dismiss', 'إخفاء | Dismiss')}
            >
              <Icons.X />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationBanner
