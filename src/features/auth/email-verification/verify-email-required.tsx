/**
 * Verify Email Required Page
 * Shown when user tries to login with unverified email (403 EMAIL_NOT_VERIFIED)
 * Backend blocks login for users registered after 2025-02-01 without verified email
 *
 * Note: This page cannot resend verification emails because user is NOT logged in.
 * Backend may auto-resend when returning 403, indicated by verificationResent flag.
 */

import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/constants/routes'

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
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
}

export function VerifyEmailRequired() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const search = useSearch({ from: '/(auth)/verify-email-required' })

  // Get email and verification status from URL params
  const email = (search as { email?: string })?.email || ''
  const initialVerificationSent = (search as { verificationSent?: boolean })?.verificationSent || false

  // Note: We cannot resend verification email from this page because user is NOT logged in.
  // The backend may auto-resend when returning 403, indicated by verificationResent flag.
  // If user needs another email, they should contact support or try registering again.

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
              {/* Email Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                  <Icons.Mail />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-[#0f172a] mb-3">
                {isRtl ? 'يرجى تأكيد بريدك الإلكتروني' : 'Please Verify Your Email'}
              </h2>

              {/* Description */}
              <p className="text-slate-500 mb-2">
                {isRtl
                  ? 'يجب تأكيد بريدك الإلكتروني قبل تسجيل الدخول.'
                  : 'You need to verify your email before you can log in.'}
              </p>

              {/* Email display */}
              {email && (
                <div className="bg-slate-50 rounded-xl py-3 px-4 mb-6">
                  <p className="text-sm text-slate-600" dir="ltr">
                    {email}
                  </p>
                </div>
              )}

              {/* Success message if verification was just sent by backend */}
              {initialVerificationSent && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-3 px-4 mb-6 flex items-center gap-2 justify-center">
                  <span className="text-emerald-600">
                    <Icons.CheckCircle />
                  </span>
                  <p className="text-sm text-emerald-700">
                    {isRtl
                      ? 'تم إرسال رابط التحقق! تحقق من بريدك الإلكتروني.'
                      : 'Verification link sent! Check your email.'}
                  </p>
                </div>
              )}

              {/* Instructions */}
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

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Back to login - primary action */}
                <Link
                  to={ROUTES.auth.signIn}
                  className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {isRtl ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </Link>

                {/* Contact support for resend */}
                <p className="text-sm text-slate-500 text-center">
                  {isRtl
                    ? 'لم تستلم الرابط؟ تحقق من مجلد الرسائل غير المرغوبة أو '
                    : "Didn't receive the link? Check your spam folder or "}
                  <Link to="/support" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    {isRtl ? 'تواصل مع الدعم' : 'contact support'}
                  </Link>
                </p>
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
