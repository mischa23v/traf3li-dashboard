import { useSearch, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { OtpForm } from './components/otp-form'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'
import { AuthHeader } from '@/components/auth/auth-header'
import { AuthFooter } from '@/components/auth/auth-footer'
import type { OtpSearchParams } from '@/routes/(auth)/otp'

// Scale/Balance Icon - matches sign-in page exactly
const TrafliLogo = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
  </svg>
)

export function Otp() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  // Get search params (email, purpose, token from sign-in redirect)
  const search = useSearch({ from: '/(auth)/otp' }) as OtpSearchParams

  // Get OTP data from auth store (set during login)
  const otpData = useAuthStore((state) => state.otpData)
  const clearOtpData = useAuthStore((state) => state.clearOtpData)

  // Use auth store data first, fall back to URL search params
  // Auth store is more reliable as it's set during the actual login flow
  const email = otpData?.fullEmail || search.email
  const purpose = search.purpose || 'login'
  const loginSessionToken = otpData?.loginSessionToken || search.token
  // Session expiry from backend (default 600 seconds = 10 minutes)
  const sessionExpiresIn = otpData?.loginSessionExpiresIn || 600

  // Security: For login purpose, loginSessionToken is REQUIRED
  // If missing, redirect back to sign-in
  useEffect(() => {
    if (purpose === 'login' && !loginSessionToken) {
      console.warn('[OTP] Missing loginSessionToken for login purpose, redirecting to sign-in')
      navigate({ to: ROUTES.auth.signIn })
    }
  }, [purpose, loginSessionToken, navigate])

  // Clear OTP data from store after successful verification
  const handleSuccess = () => {
    clearOtpData()
    navigate({ to: '/' })
  }

  // Handle cancel - clear OTP data and go back to sign-in
  const handleCancel = () => {
    clearOtpData()
    navigate({ to: ROUTES.auth.signIn })
  }

  // Show masked email for display
  const displayEmail = otpData?.email || (email ? maskEmail(email) : '')

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <AuthHeader />

      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        {/* Outer large box - white */}
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
          {/* Logo and title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F8F9FA] text-[#0f172a] mb-4">
              <TrafliLogo />
            </div>
            <h1 className="text-2xl font-bold text-[#0f172a] mb-1">
              {isRTL ? 'رمز التحقق' : 'Verification Code'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isRTL ? 'تم إرسال رمز التحقق إلى' : 'A verification code has been sent to'}
            </p>
            {displayEmail && (
              <p className="font-medium text-emerald-600 text-sm mt-1">{displayEmail}</p>
            )}
          </div>

          {/* Inner smaller box - white with subtle border */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <OtpForm
              email={email}
              purpose={purpose}
              loginSessionToken={loginSessionToken}
              sessionExpiresIn={sessionExpiresIn}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </div>

        {/* Footer - inside content area, closer to card */}
        <AuthFooter />
      </div>
    </div>
  )
}

/**
 * Mask email for display: user@example.com -> u***r@example.com
 */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain || local.length <= 2) {
    return email
  }
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 3))}${local[local.length - 1]}@${domain}`
}
