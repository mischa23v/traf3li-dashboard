import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Mail, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { apiClientNoVersion } from '@/lib/api'

// Auth routes are NOT versioned - they're at /api/auth/*, not /api/v1/auth/*
const authApi = apiClientNoVersion
import { toast } from 'sonner'

interface OtpInputProps {
  email: string
  onVerify: (data: any) => void
  onResend?: () => void
  className?: string
}

export function OtpInput({ email, onVerify, onResend, className }: OtpInputProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  // OTP State
  const [otp, setOtp] = React.useState<string[]>(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  const [error, setError] = React.useState<string>('')

  // Timer State
  const [cooldownTime, setCooldownTime] = React.useState(0)
  const [rateLimitTime, setRateLimitTime] = React.useState(0)

  // Refs for input elements
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Cooldown timer effect
  React.useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownTime])

  // Rate limit timer effect
  React.useEffect(() => {
    if (rateLimitTime > 0) {
      const timer = setTimeout(() => {
        setRateLimitTime(rateLimitTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [rateLimitTime])

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && value) {
      handleVerifyOtp(newOtp.join(''))
    }
  }

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current input
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()

    // Only accept 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      setError('')

      // Focus last input
      inputRefs.current[5]?.focus()

      // Auto-verify
      handleVerifyOtp(pastedData)
    }
  }

  // Send OTP
  const handleSendOtp = async () => {
    if (cooldownTime > 0 || rateLimitTime > 0) {
      return
    }

    setIsSending(true)
    setError('')

    try {
      await authApi.post('/auth/send-otp', { email })

      toast.success(
        isRTL ? 'تم إرسال رمز التحقق' : 'OTP sent successfully',
        {
          description: isRTL
            ? `تم إرسال رمز التحقق إلى ${email}`
            : `Verification code sent to ${email}`,
        }
      )

      // Start cooldown
      setCooldownTime(60)

      // Call onResend callback
      if (onResend) {
        onResend()
      }
    } catch (err: any) {
      // Handle rate limiting (429)
      if (err.status === 429) {
        const retryAfter = err.retryAfter || 3600 // Default to 1 hour
        setRateLimitTime(retryAfter)

        const message = isRTL
          ? 'طلبات كثيرة جداً. يرجى الانتظار ساعة واحدة.'
          : 'Too many requests. Please wait 1 hour.'

        setError(message)
        toast.error(message)
      } else {
        const message = err.message || (isRTL
          ? 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى.'
          : 'Failed to send OTP. Please try again.')

        setError(message)
        toast.error(message)
      }
    } finally {
      setIsSending(false)
    }
  }

  // Verify OTP
  const handleVerifyOtp = async (otpCode?: string) => {
    const code = otpCode || otp.join('')

    if (code.length !== 6) {
      setError(isRTL ? 'الرجاء إدخال رمز التحقق المكون من 6 أرقام' : 'Please enter a 6-digit OTP')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const response = await authApi.post('/auth/verify-otp', {
        email,
        otp: code,
      })

      toast.success(
        isRTL ? 'تم التحقق بنجاح' : 'Verified successfully',
        {
          description: isRTL ? 'تم التحقق من رمز التحقق بنجاح' : 'OTP verified successfully',
        }
      )

      // Call onVerify callback with response data
      onVerify(response.data)
    } catch (err: any) {
      const message = err.message || (isRTL
        ? 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.'
        : 'Invalid OTP. Please try again.')

      setError(message)

      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsVerifying(false)
    }
  }

  // Format time display
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return isRTL ? `${seconds} ثانية` : `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (minutes < 60) {
      return isRTL
        ? `${minutes} دقيقة ${secs > 0 ? `و ${secs} ثانية` : ''}`
        : `${minutes}m ${secs}s`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return isRTL
      ? `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ''}`
      : `${hours}h ${mins}m`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">
          {t('auth.otp.title')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('auth.otp.description')} <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {/* OTP Input Boxes */}
      <div
        className={cn(
          'flex gap-2 justify-center',
          isRTL ? 'flex-row-reverse' : 'flex-row'
        )}
        dir="ltr"
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={isVerifying || isSending}
            className={cn(
              'w-12 h-14 text-center text-2xl font-semibold',
              'border-2 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              digit ? 'border-primary bg-primary/5' : 'border-input',
              error && 'border-red-500 focus:ring-red-500'
            )}
            aria-label={`${t('auth.otp.digit')} ${index + 1}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div
          role="alert"
          className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg p-3"
        >
          {error}
        </div>
      )}

      {/* Verify Button */}
      <Button
        onClick={() => handleVerifyOtp()}
        disabled={otp.some(digit => !digit) || isVerifying || isSending}
        className="w-full h-11"
        size="lg"
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('auth.otp.verifying')}</span>
          </>
        ) : (
          <span>{t('auth.otp.verify')}</span>
        )}
      </Button>

      {/* Resend Section */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          {t('auth.otp.didntReceive')}
        </p>

        {/* Rate Limit Warning */}
        {rateLimitTime > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <Clock className="h-4 w-4" />
            <span>
              {isRTL
                ? `يرجى الانتظار ${formatTime(rateLimitTime)} قبل إعادة المحاولة`
                : `Please wait ${formatTime(rateLimitTime)} before retrying`}
            </span>
          </div>
        ) : cooldownTime > 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {isRTL
                ? `إعادة الإرسال متاحة خلال ${formatTime(cooldownTime)}`
                : `Resend available in ${formatTime(cooldownTime)}`}
            </span>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={handleSendOtp}
            disabled={isSending || isVerifying}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('auth.otp.sending')}</span>
              </>
            ) : (
              <span>{t('auth.otp.resend')}</span>
            )}
          </Button>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-center text-muted-foreground">
        {t('auth.otp.helpText')}
      </p>
    </div>
  )
}
