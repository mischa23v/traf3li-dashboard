import { Link, useSearch, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/auth-store'
import type { OtpSearchParams } from '@/routes/(auth)/otp'

export function Otp() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const navigate = useNavigate()

  // Get search params (email, purpose, token from sign-in redirect)
  const search = useSearch({ from: '/(auth)/otp' }) as OtpSearchParams

  // Get OTP data from auth store (set during login)
  const otpData = useAuthStore((state) => state.otpData)
  const clearOtpData = useAuthStore((state) => state.clearOtpData)

  // Use search params or fall back to store data
  const email = search.email || otpData?.fullEmail
  const purpose = search.purpose || 'login'
  const loginSessionToken = search.token || otpData?.loginSessionToken
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

  // Show masked email for display
  const displayEmail = otpData?.email || (email ? maskEmail(email) : '')

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            {isRTL ? 'المصادقة الثنائية' : 'Two-factor Authentication'}
          </CardTitle>
          <CardDescription>
            {isRTL ? (
              <>
                يرجى إدخال رمز المصادقة. <br />
                تم إرسال رمز المصادقة إلى بريدك الإلكتروني
                {displayEmail && <strong className="ms-1 font-medium">{displayEmail}</strong>}
              </>
            ) : (
              <>
                Please enter the authentication code. <br />
                We have sent the authentication code to your email
                {displayEmail && <strong className="ms-1 font-medium">{displayEmail}</strong>}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm
            email={email}
            purpose={purpose}
            loginSessionToken={loginSessionToken}
            sessionExpiresIn={sessionExpiresIn}
            onSuccess={handleSuccess}
          />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            {isRTL ? 'لم تستلم الرمز؟ ' : "Haven't received it? "}
            <Link
              to={ROUTES.auth.signIn}
              className='hover:text-primary underline underline-offset-4'
            >
              {isRTL ? 'إعادة إرسال رمز جديد' : 'Resend a new code'}
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
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
