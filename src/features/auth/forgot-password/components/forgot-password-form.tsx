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
import { ROUTES } from '@/constants/routes'

export function ForgotPasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
          .min(1, { message: t('auth.forgotPassword.validation.emailRequired') })
          .email({ message: t('auth.forgotPassword.validation.emailInvalid') }),
      }),
    [t]
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
        title: t('auth.toast.verificationError.title'),
        description: t('auth.toast.verificationError.description'),
        variant: 'destructive',
      })
    },
    [t]
  )

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // CAPTCHA is always required for forgot password
    if (!captchaToken && captchaConfig?.siteKey) {
      // Try to execute CAPTCHA
      try {
        const token = await captchaRef.current?.execute()
        if (!token) {
          toast({
            title: t('auth.toast.verificationRequired.title'),
            description: t('auth.toast.verificationRequired.description'),
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
        title: t('auth.forgotPassword.emailSent'),
        description: t('auth.forgotPassword.emailSentDescription'),
      })
      // NOTE: Do NOT navigate to OTP page. Forgot password sends an email LINK (24-hour UUID token),
      // not an OTP code. The emailSent state will show the success UI automatically.
    } catch (error: any) {
      const errorCode = error?.response?.data?.code || error?.code

      // Reset CAPTCHA on failure
      setCaptchaToken('')
      captchaRef.current?.reset()

      if (errorCode === 'CAPTCHA_VERIFICATION_FAILED') {
        toast({
          title: t('auth.forgotPassword.verificationFailed'),
          description: t('auth.forgotPassword.verificationFailedDescription'),
          variant: 'destructive',
        })
        return
      }

      toast({
        title: t('auth.forgotPassword.error'),
        description:
          error?.response?.data?.message ||
          error?.message ||
          t('auth.forgotPassword.errorDescription'),
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
          {t('auth.forgotPassword.checkEmail')}
        </h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          {t('auth.forgotPassword.checkEmailDescription')}
        </p>
        <Button
          variant='link'
          className='mt-4'
          onClick={() => navigate({ to: ROUTES.auth.signIn })}
        >
          {t('auth.forgotPassword.backToLogin')}
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
                {t('auth.forgotPassword.emailLabel')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('auth.forgotPassword.emailPlaceholder')}
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
              {t('auth.forgotPassword.sending')}
            </>
          ) : (
            <>
              {t('auth.forgotPassword.continue')}
              <ArrowRight className='ms-2 h-4 w-4' />
            </>
          )}
        </Button>

        <Button
          type='button'
          variant='link'
          className='text-sm'
          onClick={() => navigate({ to: ROUTES.auth.signIn })}
        >
          {t('auth.forgotPassword.backToLogin')}
        </Button>
      </form>
    </Form>
  )
}
