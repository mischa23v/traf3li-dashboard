import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import authService from '@/services/authService'

// ============================================
// SVG ICONS
// ============================================
const Icons = {
  TrafliLogo: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Link: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  XCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  MailOpen: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19V8l9-6 9 6v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l9 6 9-6" />
    </svg>
  ),
}

type MagicLinkStep = 'email' | 'sent'

export function MagicLinkLogin() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const search = useSearch({ from: '/(auth)/magic-link' })

  // State
  const [step, setStep] = useState<MagicLinkStep>('email')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Handle send magic link
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError(t('magicLink.errors.emailRequired', 'البريد الإلكتروني مطلوب | Email is required'))
      return
    }

    if (!validateEmail(email)) {
      setError(t('magicLink.errors.invalidEmail', 'البريد الإلكتروني غير صالح | Invalid email'))
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.sendMagicLink({ email })
      setStep('sent')
      setCountdown(60) // 60 seconds before resend
      if (response.expiresIn) {
        setExpiresIn(response.expiresIn)
      }
    } catch (err: any) {
      setError(err.message || t('magicLink.errors.sendFailed', 'فشل في إرسال الرابط | Failed to send magic link'))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend magic link
  const handleResendMagicLink = async () => {
    if (countdown > 0) return

    setError('')
    setIsLoading(true)

    try {
      const response = await authService.sendMagicLink({ email })
      setCountdown(60)
      if (response.expiresIn) {
        setExpiresIn(response.expiresIn)
      }
    } catch (err: any) {
      setError(err.message || t('magicLink.errors.resendFailed', 'فشل في إعادة إرسال الرابط | Failed to resend magic link'))
    } finally {
      setIsLoading(false)
    }
  }

  // Go back to email step
  const handleBackToEmail = () => {
    setStep('email')
    setError('')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-6">
              <Icons.TrafliLogo />
            </div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
              {step === 'email'
                ? t('magicLink.title', 'تسجيل الدخول برابط سحري | Magic Link Login')
                : t('magicLink.sentTitle', 'تحقق من بريدك | Check Your Email')}
            </h1>
            <p className="text-slate-500 text-lg">
              {step === 'email'
                ? t('magicLink.subtitle', 'أدخل بريدك لتلقي رابط تسجيل الدخول | Enter your email to receive a login link')
                : t('magicLink.sentSubtitle', 'أرسلنا رابط تسجيل الدخول إلى {{email}} | We sent a login link to {{email}}', { email })}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {step === 'email' ? (
              // Email Step
              <form onSubmit={handleSendMagicLink} className="p-6 space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <Icons.XCircle />
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    {t('magicLink.email', 'البريد الإلكتروني | Email')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" dir="ltr">
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Icons.Mail />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      className="w-full h-12 ps-11 pe-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none transition-all focus:border-[#0f172a] text-start"
                      placeholder="name@example.com"
                      dir="ltr"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Icons.Spinner />
                      {t('magicLink.sending', 'جاري الإرسال... | Sending...')}
                    </>
                  ) : (
                    <>
                      <Icons.Link />
                      {t('magicLink.sendLink', 'إرسال رابط الدخول | Send Login Link')}
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-500">{t('magicLink.or', 'أو | or')}</span>
                  </div>
                </div>

                {/* Password Login Link */}
                <Link
                  to="/sign-in"
                  className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white text-[#0f172a] font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                >
                  {t('magicLink.usePassword', 'تسجيل الدخول بكلمة المرور | Login with Password')}
                </Link>
              </form>
            ) : (
              // Sent Step
              <div className="p-6 space-y-6 text-center">
                {/* Success Icon */}
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <Icons.MailOpen />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <Icons.XCircle />
                    {error}
                  </div>
                )}

                {/* Instructions */}
                <div className="space-y-2">
                  <p className="text-[#0f172a] font-medium">
                    {t('magicLink.checkInbox', 'تحقق من صندوق الوارد | Check your inbox')}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {t('magicLink.clickLink', 'انقر على الرابط في البريد الإلكتروني لتسجيل الدخول | Click the link in the email to log in')}
                  </p>
                  {expiresIn && (
                    <p className="text-amber-600 text-sm">
                      {t('magicLink.expiresIn', 'الرابط صالح لمدة {{minutes}} دقيقة | Link expires in {{minutes}} minutes', { minutes: Math.ceil(expiresIn / 60) })}
                    </p>
                  )}
                </div>

                {/* Resend Link */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">
                    {t('magicLink.didntReceive', 'لم يصلك الرابط؟ | Didn\'t receive the link?')}
                  </p>
                  <button
                    onClick={handleResendMagicLink}
                    disabled={countdown > 0 || isLoading}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Icons.Spinner />
                        {t('magicLink.resending', 'جاري الإرسال... | Sending...')}
                      </span>
                    ) : countdown > 0 ? (
                      t('magicLink.resendIn', 'إعادة الإرسال خلال {{seconds}} ثانية | Resend in {{seconds}}s', { seconds: countdown })
                    ) : (
                      t('magicLink.resend', 'إعادة إرسال الرابط | Resend Link')
                    )}
                  </button>
                </div>

                {/* Try Different Email */}
                <button
                  onClick={handleBackToEmail}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {t('magicLink.tryDifferentEmail', 'تجربة بريد إلكتروني آخر | Try a different email')}
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                {t('magicLink.termsPrefix', 'بتسجيل الدخول، أنت توافق على | By signing in, you agree to')}{' '}
                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {t('magicLink.terms', 'الشروط والأحكام | Terms')}
                </Link>{' '}
                {t('magicLink.and', 'و | and')}{' '}
                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {t('magicLink.privacy', 'سياسة الخصوصية | Privacy Policy')}
                </Link>
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-500 mt-6">
            {t('magicLink.noAccount', 'ليس لديك حساب؟ | Don\'t have an account?')}{' '}
            <Link to="/sign-up" className="text-emerald-600 hover:text-emerald-700 font-bold">
              {t('magicLink.signUp', 'إنشاء حساب جديد | Create Account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default MagicLinkLogin
