'use client'

import { useState, useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ShieldCheck, Loader2, KeyRound, ArrowLeft } from 'lucide-react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'
import { verifyMFA, verifyBackupCode } from '@/services/mfa.service'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Validates redirect URLs to prevent open redirect vulnerabilities
 * Only allows relative paths that start with '/'
 * Blocks absolute URLs and protocol-relative URLs
 */
const isValidRedirect = (url: string): boolean => {
  if (!url || url.startsWith('//') || url.includes('://')) return false
  return url.startsWith('/')
}

/**
 * MFA Challenge Page
 * Shown after successful password login when MFA is enabled
 * NCA ECC 2-1-3 Compliance
 *
 * Backend: POST /api/auth/mfa/verify { userId, token }
 * Only TOTP supported (no SMS/email)
 */
export function MFAChallenge() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useAuthStore((state) => state.logout)
  const search = useSearch({ from: '/(auth)/mfa-challenge' })
  const isRTL = i18n.language === 'ar'

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [backupCode, setBackupCode] = useState('')

  // Get redirect URL from search params with validation to prevent open redirect
  const rawRedirect = (search as any)?.redirect || '/'
  const redirectTo = isValidRedirect(rawRedirect) ? rawRedirect : '/'
  // Get userId - either from user object or from search params (set during login)
  const userId = user?._id || (search as any)?.userId || ''

  // If user is not in MFA pending state and no userId, redirect appropriately
  useEffect(() => {
    if (!user && !userId) {
      navigate({ to: '/sign-in' })
    } else if (user && !user.mfaPending) {
      // Already verified, go to dashboard
      navigate({ to: redirectTo })
    }
  }, [user, userId, navigate, redirectTo])

  // Handle MFA code verification
  const handleVerify = async () => {
    if (code.length !== 6) {
      setError(t('mfa.verify.enterCode'))
      return
    }

    if (!userId) {
      setError(t('mfa.errors.verificationFailed'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await verifyMFA(userId, code)

      if (!response.error && response.valid) {
        // Update user state to remove mfaPending
        if (user) {
          setUser({
            ...user,
            mfaPending: false,
          })
        }
        toast.success(t('mfa.verify.success'))
        navigate({ to: redirectTo })
      } else {
        setError(t('mfa.verify.invalidCode'))
      }
    } catch (err: any) {
      const errorCode = err.response?.data?.code
      if (errorCode === 'INVALID_TOKEN') {
        setError(t('mfa.verify.invalidCode'))
      } else if (errorCode === 'AUTH_RATE_LIMIT_EXCEEDED') {
        setError(t('mfa.verify.tooManyAttempts'))
      } else {
        const message = err.response?.data?.messageEn || err.response?.data?.message
        setError(message || t('mfa.errors.verificationFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle backup code verification
  const handleBackupCodeVerify = async () => {
    const cleanCode = backupCode.replace(/[\s]/g, '').toUpperCase()
    if (cleanCode.length < 8) {
      setError(t('mfa.errors.invalidBackupCode'))
      return
    }

    if (!userId) {
      setError(t('mfa.errors.verificationFailed'))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await verifyBackupCode(userId, cleanCode)

      if (!response.error && response.valid) {
        // Update user state to remove mfaPending
        if (user) {
          setUser({
            ...user,
            mfaPending: false,
          })
        }

        // Warn if low on backup codes
        if (response.remainingCodes <= 2 && response.warning) {
          toast.warning(t('mfa.backup.lowCodesWarning'))
        }

        toast.success(t('mfa.verify.success'))
        navigate({ to: redirectTo })
      } else {
        setError(t('mfa.errors.invalidBackupCode'))
      }
    } catch (err: any) {
      const errorCode = err.response?.data?.code
      if (errorCode === 'INVALID_CODE') {
        setError(t('mfa.errors.invalidBackupCode'))
      } else if (errorCode === 'INVALID_FORMAT') {
        setError(t('mfa.errors.invalidBackupFormat'))
      } else {
        const message = err.response?.data?.messageEn || err.response?.data?.message
        setError(message || t('mfa.errors.verificationFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel/logout
  const handleCancel = async () => {
    await logout()
    navigate({ to: '/sign-in' })
  }

  // Auto-submit when code is complete
  useEffect(() => {
    if (code.length === 6 && !isLoading) {
      handleVerify()
    }
  }, [code])

  return (
    <div className="min-h-screen bg-[#F8F9FA]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
              {t('mfa.challenge.title')}
            </h1>
            <p className="text-slate-500 text-lg">
              {t('mfa.challenge.descriptionTotp')}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 space-y-6">
              {!useBackupCode ? (
                <>
                  {/* OTP Input */}
                  <div className="flex flex-col items-center gap-4">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={(value) => {
                        setCode(value)
                        setError(null)
                      }}
                      disabled={isLoading}
                      autoFocus
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>

                    {/* Error Message */}
                    {error && (
                      <p className="text-sm text-destructive text-center" role="alert">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={handleVerify}
                    disabled={isLoading || code.length !== 6}
                    className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin me-2" />
                        {t('mfa.verify.verifying')}
                      </>
                    ) : (
                      t('mfa.verify.verify')
                    )}
                  </Button>

                  {/* Toggle to backup code */}
                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => {
                        setUseBackupCode(true)
                        setError(null)
                      }}
                      disabled={isLoading}
                      className="text-slate-500"
                    >
                      <KeyRound className="h-4 w-4 me-2" />
                      {t('mfa.verify.useBackupCode')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Backup Code Input */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-[#0f172a] mb-2 text-center">
                        {t('mfa.backup.enterCode')}
                      </label>
                      <input
                        type="text"
                        value={backupCode}
                        onChange={(e) => {
                          setBackupCode(e.target.value.toUpperCase())
                          setError(null)
                        }}
                        placeholder="XXXX-XXXX"
                        className="w-full h-12 px-4 text-center font-mono text-lg tracking-wider rounded-xl border border-slate-200 bg-slate-50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                        maxLength={10}
                        disabled={isLoading}
                        autoComplete="off"
                        autoFocus
                      />
                    </div>

                    {/* Error Message */}
                    {error && (
                      <p className="text-sm text-destructive text-center" role="alert">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={handleBackupCodeVerify}
                    disabled={isLoading || backupCode.replace(/[\s-]/g, '').length < 8}
                    className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin me-2" />
                        {t('mfa.verify.verifying')}
                      </>
                    ) : (
                      t('mfa.verify.verify')
                    )}
                  </Button>

                  {/* Back to TOTP */}
                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => {
                        setUseBackupCode(false)
                        setBackupCode('')
                        setError(null)
                      }}
                      disabled={isLoading}
                      className="text-slate-500"
                    >
                      <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
                      {t('mfa.verify.useAuthenticator')}
                    </Button>
                  </div>
                </>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
              </div>

              {/* Cancel Button */}
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full h-12 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 me-2 rtl:rotate-180" />
                {t('mfa.challenge.signInDifferent')}
              </Button>
            </div>
          </div>

          {/* Security Note */}
          <p className="text-center text-slate-400 text-sm mt-6">
            {t('mfa.challenge.securityNote')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default MFAChallenge
