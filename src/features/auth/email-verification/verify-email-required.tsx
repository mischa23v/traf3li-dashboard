/**
 * Verify Email Required Page
 * Shown when user tries to access a feature that requires email verification
 * or other actions (subscribe, retry payment, etc.)
 *
 * Gold Standard Implementation:
 * - Uses PUBLIC /auth/request-verification-email endpoint (no auth required)
 * - Solves circular dependency where users couldn't resend verification
 * - Rate limiting with cooldown timer
 * - User enumeration prevention (same response regardless of email existence)
 * - Supports multiple action types (verify_email, subscribe, retry_payment, upgrade_tier)
 */

import { useState, useEffect, useRef } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'
import authService from '@/services/authService'
import { RequiredActionType } from '@/types/featureAccess'

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
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Spinner: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  AtSymbol: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
    </svg>
  ),
}

/**
 * Get page content based on action type
 */
function getActionContent(action: RequiredActionType | undefined, isRtl: boolean) {
  switch (action) {
    case RequiredActionType.SUBSCRIBE:
      return {
        icon: <Icons.CreditCard />,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        title: isRtl ? 'اشتراك مطلوب' : 'Subscription Required',
        description: isRtl
          ? 'هذه الميزة تتطلب اشتراكاً فعالاً. اختر الخطة المناسبة لك.'
          : 'This feature requires an active subscription. Choose the plan that works for you.',
        ctaText: isRtl ? 'عرض الخطط' : 'View Plans',
        ctaUrl: ROUTES.dashboard.settings.billing,
        showEmailForm: false,
      }

    case RequiredActionType.UPGRADE_TIER:
      return {
        icon: <Icons.Star />,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-500',
        title: isRtl ? 'ترقية مطلوبة' : 'Upgrade Required',
        description: isRtl
          ? 'هذه الميزة متوفرة في خطة أعلى. قم بترقية خطتك للوصول إليها.'
          : 'This feature is available in a higher plan. Upgrade your plan to access it.',
        ctaText: isRtl ? 'ترقية الخطة' : 'Upgrade Plan',
        ctaUrl: ROUTES.dashboard.settings.billing,
        showEmailForm: false,
      }

    case RequiredActionType.RETRY_PAYMENT:
      return {
        icon: <Icons.AlertCircle />,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        title: isRtl ? 'فشل الدفع' : 'Payment Failed',
        description: isRtl
          ? 'فشلت عملية الدفع الأخيرة. يرجى تحديث معلومات الدفع لاستعادة الوصول.'
          : 'Your last payment failed. Please update your payment information to restore access.',
        ctaText: isRtl ? 'تحديث الدفع' : 'Update Payment',
        ctaUrl: ROUTES.dashboard.settings.billing,
        showEmailForm: false,
      }

    case RequiredActionType.VERIFY_EMAIL:
    default:
      return {
        icon: <Icons.Mail />,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        title: isRtl ? 'يرجى تأكيد بريدك الإلكتروني' : 'Please Verify Your Email',
        description: isRtl
          ? 'يجب تأكيد بريدك الإلكتروني للوصول إلى هذه الميزة.'
          : 'You need to verify your email to access this feature.',
        ctaText: isRtl ? 'إرسال رابط التفعيل' : 'Send Verification Link',
        ctaUrl: null, // Uses the email form instead
        showEmailForm: true,
      }
  }
}

export function VerifyEmailRequired() {
  const { i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const search = useSearch({ from: '/(auth)/verify-email-required' })

  // Get params from URL
  const initialEmail = (search as { email?: string })?.email || ''
  const initialVerificationSent = (search as { verificationSent?: boolean })?.verificationSent || false
  const actionParam = (search as { action?: string })?.action as RequiredActionType | undefined
  const returnTo = (search as { returnTo?: string })?.returnTo || ROUTES.dashboard.home

  // Get content based on action type
  const content = getActionContent(actionParam, isRtl)

  // State for email verification form
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [hasSentOnce, setHasSentOnce] = useState(initialVerificationSent)

  // Double-click prevention
  const isSubmittingRef = useRef(false)

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  // Handle resend verification email
  const handleResend = async (e?: React.FormEvent) => {
    e?.preventDefault()

    // Validation
    if (!email || !email.includes('@')) {
      setMessage(isRtl ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address')
      setMessageType('error')
      return
    }

    // Prevent double-click
    if (isSubmittingRef.current || isLoading || cooldown > 0) return
    isSubmittingRef.current = true

    setIsLoading(true)
    setMessage('')

    try {
      const response = await authService.requestVerificationEmail(email.trim().toLowerCase())

      if (response.code === 'RATE_LIMITED') {
        // Rate limited - show cooldown
        const waitTime = response.waitSeconds || 60
        setCooldown(waitTime)
        setMessage(
          isRtl
            ? `يرجى الانتظار ${Math.ceil(waitTime / 60)} دقيقة قبل إعادة الإرسال`
            : `Please wait ${Math.ceil(waitTime / 60)} minute(s) before resending`
        )
        setMessageType('error')
      } else {
        // Success (always returns success for enumeration prevention)
        setHasSentOnce(true)
        setCooldown(60) // 1 minute cooldown after successful send
        setMessage(
          isRtl
            ? 'إذا كان هذا البريد مسجلاً وغير مُفعّل، سيتم إرسال رابط التفعيل. تحقق من صندوق الوارد.'
            : 'If this email is registered and not verified, a verification link will be sent. Check your inbox.'
        )
        setMessageType('success')
      }
    } catch {
      // Even on error, show generic success message (enumeration prevention)
      setHasSentOnce(true)
      setCooldown(60)
      setMessage(
        isRtl
          ? 'إذا كان هذا البريد مسجلاً وغير مُفعّل، سيتم إرسال رابط التفعيل.'
          : 'If this email is registered and not verified, a verification link will be sent.'
      )
      setMessageType('success')
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  // Format cooldown time
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs}s`
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
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`w-24 h-24 rounded-full ${content.iconBg} flex items-center justify-center ${content.iconColor}`}>
                  {content.icon}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-[#0f172a] mb-3 text-center">
                {content.title}
              </h2>

              {/* Description */}
              <p className="text-slate-500 mb-6 text-center">
                {content.description}
              </p>

              {/* Message Display */}
              {message && (
                <div
                  className={`rounded-xl py-3 px-4 mb-6 flex items-center gap-2 ${
                    messageType === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : messageType === 'error'
                        ? 'bg-red-50 border border-red-200 text-red-700'
                        : 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}
                >
                  {messageType === 'success' && (
                    <span className="text-emerald-600 flex-shrink-0">
                      <Icons.CheckCircle />
                    </span>
                  )}
                  <p className="text-sm">{message}</p>
                </div>
              )}

              {/* Initial verification sent message */}
              {initialVerificationSent && !message && content.showEmailForm && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 mb-6 flex items-center gap-2">
                  <span className="text-emerald-600 flex-shrink-0">
                    <Icons.CheckCircle />
                  </span>
                  <p className="text-sm text-emerald-700">
                    {isRtl
                      ? 'تم إرسال رابط التحقق! تحقق من بريدك الإلكتروني.'
                      : 'Verification link sent! Check your email.'}
                  </p>
                </div>
              )}

              {/* Email Input Form (for verify_email action only) */}
              {content.showEmailForm && (
                <form onSubmit={handleResend} className="mb-6">
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <div className="relative" dir="ltr">
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Icons.AtSymbol />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 ps-11 pe-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none transition-all focus:border-emerald-500 text-start"
                      placeholder={isRtl ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      dir="ltr"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Resend Button */}
                  <button
                    type="submit"
                    disabled={isLoading || cooldown > 0 || !email}
                    className="w-full h-12 mt-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Icons.Spinner />
                        {isRtl ? 'جاري الإرسال...' : 'Sending...'}
                      </>
                    ) : cooldown > 0 ? (
                      <>
                        <Icons.Clock />
                        {isRtl ? `إعادة الإرسال بعد ${formatCooldown(cooldown)}` : `Resend in ${formatCooldown(cooldown)}`}
                      </>
                    ) : hasSentOnce ? (
                      isRtl ? 'إعادة إرسال رابط التفعيل' : 'Resend Verification Link'
                    ) : (
                      content.ctaText
                    )}
                  </button>
                </form>
              )}

              {/* CTA Button (for non-email actions) */}
              {!content.showEmailForm && content.ctaUrl && (
                <Link
                  to={content.ctaUrl}
                  search={{ returnTo }}
                  className="w-full h-12 mb-6 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {content.ctaText}
                </Link>
              )}

              {/* Instructions (for email verification only) */}
              {content.showEmailForm && (
                <div className="text-start bg-slate-50 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-[#0f172a] mb-2">
                    {isRtl ? 'الخطوات التالية:' : 'Next steps:'}
                  </p>
                  <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                    <li>
                      {isRtl
                        ? 'تحقق من صندوق البريد الوارد (وأيضاً مجلد الرسائل غير المرغوبة)'
                        : 'Check your inbox (and spam folder)'}
                    </li>
                    <li>
                      {isRtl
                        ? 'انقر على رابط التحقق في الرسالة'
                        : 'Click the verification link in the email'}
                    </li>
                    <li>
                      {isRtl
                        ? 'عد إلى هذه الصفحة وسجّل الدخول'
                        : 'Come back here and log in'}
                    </li>
                  </ol>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Back to login */}
                <Link
                  to={ROUTES.auth.signIn}
                  className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white text-[#0f172a] font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                >
                  {isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                {isRtl ? 'تحتاج مساعدة؟' : 'Need help?'}{' '}
                <Link to="/support" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {isRtl ? 'تواصل معنا' : 'Contact Support'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailRequired
