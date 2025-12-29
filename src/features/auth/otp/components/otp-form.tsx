import { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { apiClientNoVersion } from '@/lib/api'
import type { OtpPurpose } from '@/services/otpService'

// Auth routes are NOT versioned - /api/auth/*, not /api/v1/auth/*
const authApi = apiClientNoVersion

const formSchema = z.object({
  otp: z
    .string()
    .min(6, 'يرجى إدخال الرمز المكون من 6 أرقام')
    .max(6, 'يرجى إدخال الرمز المكون من 6 أرقام'),
})

interface OtpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  email?: string
  /** Purpose of the OTP verification (login, registration, password_reset, email_verification) */
  purpose?: OtpPurpose
  onResendOtp?: () => Promise<void>
  /** Callback when OTP is verified successfully */
  onSuccess?: () => void
}

// Cooldown duration in seconds (OTP endpoints are rate-limited to 3/hour)
const RESEND_COOLDOWN = 60

export function OtpForm({ className, email, purpose = 'login', onResendOtp, onSuccess, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)

  const defaultValues = useMemo(() => ({ otp: '' }), [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const otp = form.watch('otp')

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const handleResendOtp = useCallback(async () => {
    if (cooldown > 0 || isResending) return

    setIsResending(true)
    setErrorMessage(null)
    setAttemptsLeft(null)

    try {
      if (onResendOtp) {
        await onResendOtp()
      } else if (email) {
        await authApi.post('/auth/send-otp', { email, purpose })
      }
      toast.success(isRTL ? 'تم إرسال رمز التحقق بنجاح' : 'Verification code sent successfully')
      setCooldown(RESEND_COOLDOWN)
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limited - extract wait time
        const waitMinutes = Math.ceil((error.retryAfter || 3600) / 60)
        setErrorMessage(
          isRTL
            ? `يرجى الانتظار ${waitMinutes} دقيقة قبل طلب رمز جديد`
            : `Please wait ${waitMinutes} minutes before requesting a new code`
        )
        setCooldown(error.retryAfter || 3600)
      } else {
        setErrorMessage(error.message || (isRTL ? 'فشل إرسال رمز التحقق' : 'Failed to send verification code'))
        setRequestId(error.requestId)
      }
    } finally {
      setIsResending(false)
    }
  }, [cooldown, isResending, email, purpose, onResendOtp, isRTL])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setErrorMessage(null)
    setAttemptsLeft(null)

    try {
      // In production, this would call the actual API
      if (email) {
        // Include purpose in the verification request
        await authApi.post('/auth/verify-otp', { email, otp: data.otp, purpose })
        toast.success(isRTL ? 'تم التحقق بنجاح' : 'Verification successful')
        if (onSuccess) {
          onSuccess()
        } else {
          navigate({ to: '/' })
        }
      } else {
        // Fallback for demo
        showSubmittedData(data)
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            navigate({ to: '/' })
          }
        }, 1000)
      }
    } catch (error: any) {
      // Clear the OTP input on error
      form.setValue('otp', '')

      if (error.status === 429) {
        setErrorMessage(
          isRTL
            ? 'محاولات كثيرة جداً. يرجى الانتظار والمحاولة لاحقاً.'
            : 'Too many attempts. Please wait and try again later.'
        )
      } else if (error?.response?.data?.attemptsLeft !== undefined) {
        // Wrong OTP with attempts remaining
        const remaining = error.response.data.attemptsLeft
        setAttemptsLeft(remaining)
        const errorMsg = isRTL
          ? `رمز التحقق غير صحيح. المحاولات المتبقية: ${remaining}`
          : `Invalid verification code. Attempts remaining: ${remaining}`
        setErrorMessage(errorMsg)
        form.setError('otp', { message: errorMsg })
      } else if (error?.response?.data?.code === 'OTP_EXPIRED') {
        setErrorMessage(
          isRTL
            ? 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.'
            : 'Verification code has expired. Please request a new code.'
        )
      } else if (error?.response?.data?.code === 'OTP_NOT_FOUND') {
        setErrorMessage(
          isRTL
            ? 'رمز التحقق غير موجود. يرجى طلب رمز جديد.'
            : 'Verification code not found. Please request a new code.'
        )
      } else {
        const defaultMsg = isRTL ? 'رمز التحقق غير صحيح' : 'Invalid verification code'
        setErrorMessage(error?.response?.data?.error || error.message || defaultMsg)
        setRequestId(error.requestId || error?.response?.data?.requestId)
        form.setError('otp', { message: error.message || defaultMsg })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs}s`
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-4', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='otp'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='sr-only'>رمز التحقق</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  {...field}
                  containerClassName='justify-between sm:[&>[data-slot="input-otp-group"]>div]:w-12'
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Error message with attempts remaining */}
        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg space-y-1">
            <p>{errorMessage}</p>
            {attemptsLeft !== null && attemptsLeft > 0 && (
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {isRTL ? '⚠️ تحذير: سيتم قفل حسابك بعد استنفاد المحاولات' : '⚠️ Warning: Your account will be locked after all attempts are used'}
              </p>
            )}
            {attemptsLeft === 0 && (
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                {isRTL ? '🔒 تم استنفاد المحاولات. يرجى طلب رمز جديد.' : '🔒 All attempts used. Please request a new code.'}
              </p>
            )}
            {requestId && (
              <p className="text-xs text-slate-500 mt-1">
                {isRTL ? 'المرجع:' : 'Reference:'} {requestId}
              </p>
            )}
          </div>
        )}

        <Button className='mt-2' disabled={otp.length < 6 || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin me-2" />
              {isRTL ? 'جاري التحقق...' : 'Verifying...'}
            </>
          ) : (
            isRTL ? 'تحقق' : 'Verify'
          )}
        </Button>

        {/* Resend OTP button with cooldown */}
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={cooldown > 0 || isResending}
            onClick={handleResendOtp}
            className="text-sm text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin me-2" />
                {isRTL ? 'جاري الإرسال...' : 'Sending...'}
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? `إعادة الإرسال (${formatCooldown(cooldown)})` : `Resend (${formatCooldown(cooldown)})`}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 me-2" />
                {isRTL ? 'إعادة إرسال الرمز' : 'Resend code'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
