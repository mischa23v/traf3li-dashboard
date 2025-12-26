/**
 * Forgot Password Form
 * CAPTCHA is ALWAYS required for this endpoint (prevents email enumeration)
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import {
  CaptchaChallenge,
  type CaptchaChallengeRef,
} from '@/components/auth/captcha-challenge'
import { getCaptchaConfig } from '@/services/captchaService'
import type { CaptchaConfig } from '@/components/auth/captcha-config'
import passwordService from '@/services/passwordService'

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // CAPTCHA state - always shown for forgot password
  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string>('')
  const captchaRef = useRef<CaptchaChallengeRef>(null)

  const formSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, { message: isArabic ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email' })
          .email({ message: isArabic ? 'بريد إلكتروني غير صالح' : 'Invalid email address' }),
      }),
    [isArabic]
  )

  const defaultValues = useMemo(() => ({ email: '' }), [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  })

  // Load CAPTCHA configuration on mount
  useEffect(() => {
    getCaptchaConfig()
      .then((config) => {
        setCaptchaConfig(config)
      })
      .catch((err) => {
        console.error('Failed to load CAPTCHA config:', err)
      })
  }, [])

  // Handle CAPTCHA success
  const handleCaptchaSuccess = useCallback((token: string) => {
    setCaptchaToken(token)
  }, [])

  // Handle CAPTCHA error
  const handleCaptchaError = useCallback(
    (error: Error) => {
      console.error('CAPTCHA error:', error)
      toast({
        title: isArabic ? 'خطأ في التحقق' : 'Verification Error',
        description: isArabic
          ? 'فشل التحقق. يرجى المحاولة مرة أخرى.'
          : 'Verification failed. Please try again.',
        variant: 'destructive',
      })
    },
    [isArabic]
  )

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // CAPTCHA is always required for forgot password
    if (!captchaToken && captchaConfig?.siteKey) {
      // Try to execute CAPTCHA
      try {
        const token = await captchaRef.current?.execute()
        if (!token) {
          toast({
            title: isArabic ? 'التحقق مطلوب' : 'Verification Required',
            description: isArabic
              ? 'يرجى إكمال التحقق للمتابعة.'
              : 'Please complete the verification to continue.',
            variant: 'destructive',
          })
          return
        }
        setCaptchaToken(token)
      } catch (err) {
        console.error('CAPTCHA execution failed:', err)
        return
      }
    }

    setIsLoading(true)

    try {
      await passwordService.forgotPassword({
        email: data.email,
        captchaToken: captchaToken,
        captchaProvider: captchaConfig?.provider || 'turnstile',
      })

      setEmailSent(true)
      toast({
        title: isArabic ? 'تم إرسال البريد الإلكتروني' : 'Email Sent',
        description: isArabic
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.'
          : 'A password reset link has been sent to your email.',
      })

      // Navigate to OTP page or show success
      navigate({ to: '/otp' })
    } catch (error: any) {
      const errorCode = error?.response?.data?.code || error?.code

      // Reset CAPTCHA on failure
      setCaptchaToken('')
      captchaRef.current?.reset()

      if (errorCode === 'CAPTCHA_VERIFICATION_FAILED') {
        toast({
          title: isArabic ? 'فشل التحقق' : 'Verification Failed',
          description: isArabic
            ? 'فشل التحقق الأمني. يرجى المحاولة مرة أخرى.'
            : 'Security verification failed. Please try again.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description:
          error?.response?.data?.message ||
          error?.message ||
          (isArabic ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className={cn('text-center', className)}>
        <h3 className='text-lg font-semibold'>
          {isArabic ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
        </h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          {isArabic
            ? 'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فسنرسل لك تعليمات إعادة تعيين كلمة المرور.'
            : "If an account exists with that email, we've sent password reset instructions."}
        </p>
        <Button
          variant='link'
          className='mt-4'
          onClick={() => navigate({ to: '/sign-in' })}
        >
          {isArabic ? 'العودة إلى تسجيل الدخول' : 'Back to login'}
        </Button>
      </div>
    )
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                  type='email'
                  dir='auto'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CAPTCHA - Always shown for forgot password */}
        {captchaConfig && captchaConfig.siteKey && (
          <CaptchaChallenge
            ref={captchaRef}
            provider={captchaConfig.provider}
            siteKey={captchaConfig.siteKey}
            mode={captchaConfig.mode}
            action='forgot-password'
            onSuccess={handleCaptchaSuccess}
            onError={handleCaptchaError}
            className='my-2'
          />
        )}

        <Button
          type='submit'
          className='mt-2'
          disabled={isLoading || (captchaConfig?.siteKey && !captchaToken)}
        >
          {isLoading ? (
            <>
              <Loader2 className='me-2 h-4 w-4 animate-spin' />
              {isArabic ? 'جاري الإرسال...' : 'Sending...'}
            </>
          ) : (
            <>
              {isArabic ? 'متابعة' : 'Continue'}
              <ArrowRight className='ms-2 h-4 w-4' />
            </>
          )}
        </Button>

        <Button
          type='button'
          variant='link'
          className='text-sm'
          onClick={() => navigate({ to: '/sign-in' })}
        >
          {isArabic ? 'العودة إلى تسجيل الدخول' : 'Back to login'}
        </Button>
      </form>
    </Form>
  )
}
