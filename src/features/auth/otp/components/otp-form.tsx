import { useState, useEffect, useCallback, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
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
  onResendOtp?: () => Promise<void>
}

// Cooldown duration in seconds (OTP endpoints are rate-limited to 3/hour)
const RESEND_COOLDOWN = 60

export function OtpForm({ className, email, onResendOtp, ...props }: OtpFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
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

    try {
      if (onResendOtp) {
        await onResendOtp()
      } else if (email) {
        await authApi.post('/auth/send-otp', { email })
      }
      toast.success('تم إرسال رمز التحقق بنجاح')
      setCooldown(RESEND_COOLDOWN)
    } catch (error: any) {
      if (error.status === 429) {
        // Rate limited - extract wait time
        const waitMinutes = Math.ceil((error.retryAfter || 3600) / 60)
        setErrorMessage(`يرجى الانتظار ${waitMinutes} دقيقة قبل طلب رمز جديد`)
        setCooldown(error.retryAfter || 3600)
      } else {
        setErrorMessage(error.message || 'فشل إرسال رمز التحقق')
        setRequestId(error.requestId)
      }
    } finally {
      setIsResending(false)
    }
  }, [cooldown, isResending, email, onResendOtp])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      // In production, this would call the actual API
      if (email) {
        await authApi.post('/auth/verify-otp', { email, otp: data.otp })
        toast.success('تم التحقق بنجاح')
        navigate({ to: '/' })
      } else {
        // Fallback for demo
        showSubmittedData(data)
        setTimeout(() => {
          navigate({ to: '/' })
        }, 1000)
      }
    } catch (error: any) {
      if (error.status === 429) {
        setErrorMessage('محاولات كثيرة جداً. يرجى الانتظار والمحاولة لاحقاً.')
      } else {
        setErrorMessage(error.message || 'رمز التحقق غير صحيح')
        setRequestId(error.requestId)
      }
      form.setError('otp', { message: error.message || 'رمز التحقق غير صحيح' })
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

        {/* Error message with requestId for support */}
        {errorMessage && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <p>{errorMessage}</p>
            {requestId && (
              <p className="text-xs text-slate-500 mt-1">
                Reference: {requestId}
              </p>
            )}
          </div>
        )}

        <Button className='mt-2' disabled={otp.length < 6 || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin me-2" />
              جاري التحقق...
            </>
          ) : (
            'تحقق'
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
            className="text-sm text-slate-600 hover:text-emerald-600"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin me-2" />
                جاري الإرسال...
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="h-4 w-4 me-2" />
                إعادة الإرسال ({formatCooldown(cooldown)})
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 me-2" />
                إعادة إرسال الرمز
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
