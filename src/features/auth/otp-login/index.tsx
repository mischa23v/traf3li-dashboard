import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth-store'
import otpService, { OtpPurpose } from '@/services/otpService'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'

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
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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
}

type OtpLoginStep = 'email' | 'otp'

interface OtpLoginProps {
  purpose?: OtpPurpose
}

export function OtpLogin({ purpose = 'login' }: OtpLoginProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const { setUser } = useAuthStore()
  const search = useSearch({ from: '/(auth)/otp-login' })

  // State
  const [step, setStep] = useState<OtpLoginStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)

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

  // Handle send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError(t('otpLogin.errors.emailRequired', 'البريد الإلكتروني مطلوب'))
      return
    }

    if (!validateEmail(email)) {
      setError(t('otpLogin.errors.invalidEmail', 'البريد الإلكتروني غير صالح'))
      return
    }

    setIsLoading(true)

    try {
      const response = await otpService.sendOtp({ email, purpose })
      setSuccess(t('otpLogin.otpSent', 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'))
      setStep('otp')
      setCountdown(60) // 60 seconds before resend
    } catch (err: any) {
      if (err.isRateLimited) {
        setError(t('otpLogin.errors.rateLimited', `يرجى الانتظار ${err.waitTime} ثانية`))
        setCountdown(err.waitTime)
      } else {
        setError(err.message || t('otpLogin.errors.sendFailed', 'فشل في إرسال رمز التحقق'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle verify OTP
  const handleVerifyOtp = async () => {
    setError('')
    setSuccess('')

    if (otp.length !== 6) {
      setError(t('otpLogin.errors.otpRequired', 'يرجى إدخال رمز التحقق المكون من 6 أرقام'))
      return
    }

    setIsLoading(true)

    try {
      const response = await otpService.verifyOtp({ email, otp, purpose })

      if (response.success && response.user) {
        setUser(response.user as any)
        setSuccess(t('otpLogin.success', 'تم تسجيل الدخول بنجاح'))

        // Navigate after short delay
        setTimeout(() => {
          const redirectTo = (search as any)?.redirect || '/'
          navigate({ to: redirectTo })
        }, 500)
      }
    } catch (err: any) {
      if (err.isInvalidOtp) {
        setAttemptsLeft(err.attemptsLeft)
        if (err.attemptsLeft === 0) {
          setError(t('otpLogin.errors.noAttemptsLeft', 'انتهت المحاولات. يرجى طلب رمز جديد'))
          setOtp('')
        } else {
          setError(t('otpLogin.errors.invalidOtp', `رمز التحقق غير صحيح. المحاولات المتبقية: ${err.attemptsLeft}`))
        }
      } else {
        setError(err.message || t('otpLogin.errors.verifyFailed', 'فشل في التحقق من الرمز'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return

    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      await otpService.resendOtp({ email, purpose })
      setSuccess(t('otpLogin.otpResent', 'تم إعادة إرسال رمز التحقق'))
      setOtp('')
      setAttemptsLeft(null)
      setCountdown(60)
    } catch (err: any) {
      if (err.isRateLimited) {
        setError(t('otpLogin.errors.rateLimited', `يرجى الانتظار ${err.waitTime} ثانية`))
        setCountdown(err.waitTime)
      } else {
        setError(err.message || t('otpLogin.errors.resendFailed', 'فشل في إعادة إرسال الرمز'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleVerifyOtp()
    }
  }, [otp])

  // Go back to email step
  const handleBackToEmail = () => {
    setStep('email')
    setOtp('')
    setError('')
    setSuccess('')
    setAttemptsLeft(null)
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
                ? t('otpLogin.title', 'تسجيل الدخول')
                : t('otpLogin.verifyTitle', 'التحقق من البريد')}
            </h1>
            <p className="text-slate-500 text-lg">
              {step === 'email'
                ? t('otpLogin.subtitle', 'أدخل بريدك الإلكتروني لتلقي رمز التحقق')
                : t('otpLogin.verifySubtitle', 'أدخل الرمز المرسل إلى {{email}}', { email })}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {step === 'email' ? (
              // Email Step
              <form onSubmit={handleSendOtp} className="p-6 space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <Icons.XCircle />
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                    <Icons.CheckCircle />
                    {success}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    {t('otpLogin.email', 'البريد الإلكتروني')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" dir="ltr">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <Icons.Mail />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      className="w-full h-12 ps-11 pe-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0f172a] outline-none transition-all focus:border-[#0f172a] text-left"
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
                  disabled={isLoading || countdown > 0}
                  className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Icons.Spinner />
                      {t('otpLogin.sending', 'جاري الإرسال...')}
                    </>
                  ) : countdown > 0 ? (
                    t('otpLogin.waitSeconds', 'انتظر {{seconds}} ثانية', { seconds: countdown })
                  ) : (
                    t('otpLogin.sendOtp', 'إرسال رمز التحقق')
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-500">{t('otpLogin.or', 'أو')}</span>
                  </div>
                </div>

                {/* Password Login Link */}
                <Link
                  to="/sign-in"
                  className="w-full h-12 rounded-xl border-2 border-slate-200 bg-white text-[#0f172a] font-medium hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                >
                  {t('otpLogin.usePassword', 'تسجيل الدخول بكلمة المرور')}
                </Link>
              </form>
            ) : (
              // OTP Verification Step
              <div className="p-6 space-y-5">
                {/* Back Button */}
                <button
                  onClick={handleBackToEmail}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Icons.ArrowLeft />
                  {t('otpLogin.changeEmail', 'تغيير البريد الإلكتروني')}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <Icons.XCircle />
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                    <Icons.CheckCircle />
                    {success}
                  </div>
                )}

                {/* OTP Input */}
                <div className="flex flex-col items-center">
                  <label className="block text-sm font-medium text-[#0f172a] mb-4 text-center">
                    {t('otpLogin.enterOtp', 'أدخل رمز التحقق')}
                  </label>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                    containerClassName="justify-center gap-2 sm:gap-3 [&>[data-slot=input-otp-group]>div]:w-10 sm:[&>[data-slot=input-otp-group]>div]:w-12"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>

                  {/* Attempts left indicator */}
                  {attemptsLeft !== null && attemptsLeft > 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      {t('otpLogin.attemptsLeft', 'المحاولات المتبقية: {{count}}', { count: attemptsLeft })}
                    </p>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-12 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Icons.Spinner />
                      {t('otpLogin.verifying', 'جاري التحقق...')}
                    </>
                  ) : (
                    t('otpLogin.verify', 'تحقق')
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-2">
                    {t('otpLogin.didntReceive', 'لم يصلك الرمز؟')}
                  </p>
                  <button
                    onClick={handleResendOtp}
                    disabled={countdown > 0 || isLoading}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? t('otpLogin.resendIn', 'إعادة الإرسال خلال {{seconds}} ثانية', { seconds: countdown })
                      : t('otpLogin.resend', 'إعادة إرسال الرمز')}
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
              <p className="text-center text-sm text-slate-500">
                {t('otpLogin.termsPrefix', 'بتسجيل الدخول، أنت توافق على')}{' '}
                <Link to="/terms" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {t('otpLogin.terms', 'الشروط والأحكام')}
                </Link>{' '}
                {t('otpLogin.and', 'و')}{' '}
                <Link to="/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  {t('otpLogin.privacy', 'سياسة الخصوصية')}
                </Link>
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-slate-500 mt-6">
            {t('otpLogin.noAccount', 'ليس لديك حساب؟')}{' '}
            <Link to="/sign-up" className="text-emerald-600 hover:text-emerald-700 font-bold">
              {t('otpLogin.signUp', 'إنشاء حساب جديد')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OtpLogin
