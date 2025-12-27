/**
 * User Authentication Form (Sign In)
 * Connects to Traf3li backend for authentication
 * Includes client-side rate limiting (NCA ECC 2-1-2 compliant)
 * CAPTCHA integration for enhanced security
 */

import { HTMLAttributes, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/password-input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useRateLimit } from '@/hooks/useRateLimit'
import { AccountLockoutWarning } from '@/components/auth/account-lockout-warning'
import { ProgressiveDelay } from '@/components/auth/progressive-delay'
import { toast } from '@/hooks/use-toast'
import { SSOLoginButtons } from '@/components/auth/sso-login-buttons'
import { LDAPLoginButton } from '@/components/auth/ldap-login-button'
import ldapService from '@/services/ldapService'
import {
  CaptchaChallenge,
  type CaptchaChallengeRef,
} from '@/components/auth/captcha-challenge'
import {
  getCaptchaConfig,
  isDeviceRecognized,
  markDeviceAsRecognized,
  calculateRiskScore,
} from '@/services/captchaService'
import type { CaptchaConfig } from '@/components/auth/captcha-config'
import { ROUTES } from '@/constants/routes'

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Form validation schema factory
 * We'll create this dynamically to support i18n messages
 */
const createFormSchema = (t: any) =>
  z.object({
    username: z
      .string()
      .min(1, { message: t('auth.signIn.validation.usernameOrEmailRequired') }),
    password: z
      .string()
      .min(1, { message: t('auth.signIn.validation.passwordRequired') })
      .min(6, { message: t('auth.signIn.validation.passwordMinLength') }),
  })

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const login = useAuthStore((state) => state.login)
  const authError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const setUser = useAuthStore((state) => state.setUser)
  const [isLoading, setIsLoading] = useState(false)
  const [isLDAPLoading, setIsLDAPLoading] = useState(false)

  const formSchema = useMemo(() => createFormSchema(t), [t])

  const defaultValues = useMemo(() => ({
    username: '',
    password: '',
  }), [])

  // Get login identifier (username or email)
  const getLoginIdentifier = useCallback((username: string): string => {
    return username.toLowerCase().trim()
  }, [])

  // Rate limiting hook
  const [currentIdentifier, setCurrentIdentifier] = useState('')
  const rateLimit = useRateLimit({
    identifier: currentIdentifier,
    onLockout: (status) => {
      toast({
        title: t('auth.toast.accountLocked.title'),
        description: t('auth.toast.accountLocked.description', { minutes: Math.ceil(status.waitTime / 60) }),
        variant: 'destructive',
      })
    },
    onUnlock: () => {
      toast({
        title: t('auth.toast.accountUnlocked.title'),
        description: t('auth.toast.accountUnlocked.description'),
      })
    },
  })

  const [attemptNumber, setAttemptNumber] = useState(0)

  // CAPTCHA state
  const [captchaConfig, setCaptchaConfig] = useState<CaptchaConfig | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string>('')
  const [showCaptcha, setShowCaptcha] = useState(false)
  const captchaRef = useRef<CaptchaChallengeRef>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  })

  // Load CAPTCHA configuration on mount
  useEffect(() => {
    getCaptchaConfig()
      .then((config) => {
        setCaptchaConfig(config)

        // Check if CAPTCHA should be shown for new devices
        if (config.enabled && config.alwaysForNewDevices && !isDeviceRecognized()) {
          setShowCaptcha(true)
        }
      })
      .catch((err) => {
        console.error('Failed to load CAPTCHA config:', err)
      })
  }, [])

  // Check if CAPTCHA should be shown based on failed attempts
  const checkCaptchaRequired = useCallback(() => {
    if (!captchaConfig || !captchaConfig.enabled) {
      return false
    }

    // Always show for new devices
    if (captchaConfig.alwaysForNewDevices && !isDeviceRecognized()) {
      return true
    }

    // Show after X failed attempts
    if (attemptNumber >= captchaConfig.requireAfterFailedAttempts) {
      return true
    }

    // Calculate risk score
    const riskScore = calculateRiskScore({
      failedAttempts: attemptNumber,
      isNewDevice: !isDeviceRecognized(),
      rapidAttempts: rateLimit.progressiveDelay > 0,
      suspiciousActivity: false,
    })

    // Show if risk score is high
    if (riskScore >= captchaConfig.riskScoreThreshold) {
      return true
    }

    return false
  }, [captchaConfig, attemptNumber, rateLimit.progressiveDelay])

  // Update CAPTCHA visibility when failed attempts change
  useEffect(() => {
    if (checkCaptchaRequired()) {
      setShowCaptcha(true)
    }
  }, [checkCaptchaRequired])

  /**
   * Handle CAPTCHA success
   */
  const handleCaptchaSuccess = useCallback((token: string) => {
    setCaptchaToken(token)
  }, [])

  /**
   * Handle CAPTCHA error
   */
  const handleCaptchaError = useCallback((error: Error) => {
    console.error('CAPTCHA error:', error)
    toast({
      title: t('auth.toast.verificationError.title'),
      description: t('auth.toast.verificationError.description'),
      variant: 'destructive',
    })
  }, [t])

  /**
   * Handle form submission with rate limiting and CAPTCHA
   */
  async function onSubmit(data: z.infer<typeof formSchema>) {
    const identifier = getLoginIdentifier(data.username)
    setCurrentIdentifier(identifier)

    // Check client-side rate limiting BEFORE making API call
    const status = rateLimit.checkAllowed()
    if (!status.allowed) {
      // Rate limit UI components will show the error
      return
    }

    // Check if CAPTCHA is required and get token
    if (showCaptcha && captchaConfig?.enabled) {
      if (!captchaToken) {
        // Try to execute CAPTCHA
        try {
          const token = await captchaRef.current?.execute()
          if (token) {
            setCaptchaToken(token)
          } else {
            toast({
              title: t('auth.toast.verificationRequired.title'),
              description: t('auth.toast.verificationRequired.description'),
              variant: 'destructive',
            })
            return
          }
        } catch (err) {
          console.error('CAPTCHA execution failed:', err)
          return
        }
      }
    }

    setIsLoading(true)
    clearError()

    try {
      // Include CAPTCHA token in login data if available
      const loginData = captchaToken
        ? { ...data, captchaToken, captchaProvider: captchaConfig?.provider }
        : data

      await login(loginData)

      // Record successful login - clears rate limit data
      rateLimit.recordSuccess()

      // Mark device as recognized
      markDeviceAsRecognized()

      // Get user from store to determine redirect
      const user = useAuthStore.getState().user

      if (!user) {
        throw new Error(t('auth.signIn.error'))
      }

      // Redirect based on role
      // No firm check needed - lawyers without firm are treated as solo lawyers
      if (user.role === 'admin') {
        navigate({ to: '/users' })
      } else if (user.role === 'lawyer') {
        navigate({ to: '/' }) // Dashboard home
      } else {
        navigate({ to: '/' }) // Client dashboard
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status
      const errorCode = error?.response?.data?.code || error?.code

      // Handle CAPTCHA_REQUIRED response from backend
      if (errorCode === 'CAPTCHA_REQUIRED') {
        setShowCaptcha(true)
        toast({
          title: t('auth.toast.verificationRequired.title'),
          description: t('auth.toast.verificationRequired.description'),
          variant: 'default',
        })
        return
      }

      // Handle server-side 429 rate limit - DON'T count as failed attempt
      // 429 means "slow down", not "wrong password"
      const rateLimitInfo = rateLimit.handle429(error)
      if (rateLimitInfo.isRateLimited) {
        toast({
          title: t('auth.toast.rateLimitExceeded.title'),
          description: t('auth.toast.rateLimitExceeded.description', { seconds: rateLimitInfo.retryAfter }),
          variant: 'destructive',
        })
        return
      }

      // Only record failed attempt for actual auth failures (401, 400 with wrong credentials)
      // NOT for network errors, server errors, or rate limits
      const isAuthFailure = status === 401 || status === 400
      if (isAuthFailure) {
        const failedStatus = await rateLimit.recordFailed()
        setAttemptNumber((prev) => prev + 1)

        // Reset CAPTCHA token on failed attempt
        setCaptchaToken('')
        captchaRef.current?.reset()

        // Show progressive delay or lockout warning via components
        if (!failedStatus.isLocked && failedStatus.progressiveDelay > 0) {
          // Progressive delay will be shown by ProgressiveDelay component
        }
      }
      // For other errors (network, 500s), just let the error display without counting
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle LDAP login
   * Uses the same form fields but authenticates via LDAP
   */
  const handleLDAPLogin = async () => {
    // Get current form values
    const values = form.getValues()

    // Validate form before attempting LDAP login
    const isValid = await form.trigger()
    if (!isValid) {
      return
    }

    const identifier = getLoginIdentifier(values.username)
    setCurrentIdentifier(identifier)

    // Check client-side rate limiting
    const status = rateLimit.checkAllowed()
    if (!status.allowed) {
      return
    }

    setIsLDAPLoading(true)
    clearError()

    try {
      // Call LDAP login service
      const user = await ldapService.login({
        username: values.username,
        password: values.password,
      })

      // Record successful login - clears rate limit data
      rateLimit.recordSuccess()

      // Mark device as recognized
      markDeviceAsRecognized()

      // Update auth store with user from LDAP
      setUser(user)

      // Show success message
      toast({
        title: t('auth.toast.ldapLoginSuccess.title'),
        description: t('auth.toast.ldapLoginSuccess.description'),
      })

      // Redirect based on role
      if (user.role === 'admin') {
        navigate({ to: '/users' })
      } else if (user.role === 'lawyer') {
        navigate({ to: '/' }) // Dashboard home
      } else {
        navigate({ to: '/' }) // Client dashboard
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status

      // Handle server-side 429 rate limit
      const rateLimitInfo = rateLimit.handle429(error)
      if (rateLimitInfo.isRateLimited) {
        toast({
          title: t('auth.toast.rateLimitExceeded.title'),
          description: t('auth.toast.rateLimitExceeded.description', { seconds: rateLimitInfo.retryAfter }),
          variant: 'destructive',
        })
        return
      }

      // Record failed attempt for auth failures
      const isAuthFailure = status === 401 || status === 400
      if (isAuthFailure) {
        await rateLimit.recordFailed()
        setAttemptNumber((prev) => prev + 1)
      }

      // Show error message
      toast({
        title: t('auth.toast.ldapLoginFailed.title'),
        description: error.message || t('auth.toast.ldapLoginFailed.description'),
        variant: 'destructive',
      })
    } finally {
      setIsLDAPLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-4'>
            {/* Username/Email Field */}
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>{t('auth.signIn.usernameOrEmail')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('auth.signIn.usernameOrEmailPlaceholder')}
                      dir='auto'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <FormLabel>{t('auth.signIn.password')}</FormLabel>
                    <Button
                      variant='link'
                      className='h-auto p-0 text-sm font-normal'
                      onClick={() => navigate({ to: ROUTES.auth.forgotPassword })}
                      type='button'
                    >
                      {t('auth.signIn.forgotPassword')}
                    </Button>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder={t('auth.signIn.passwordPlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Lockout Warning */}
            <AccountLockoutWarning
              isLocked={rateLimit.isLocked}
              remainingSeconds={rateLimit.remainingTime}
              attemptsRemaining={rateLimit.attemptsRemaining}
              onUnlock={() => rateLimit.refreshStatus()}
            />

            {/* Progressive Delay */}
            {!rateLimit.isLocked && rateLimit.progressiveDelay > 0 && (
              <ProgressiveDelay
                delaySeconds={rateLimit.progressiveDelay}
                attemptNumber={attemptNumber}
                onDelayComplete={() => rateLimit.refreshStatus()}
              />
            )}

            {/* Display API Error */}
            {authError && !rateLimit.isLocked && (
              <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                {authError}
                {rateLimit.attemptsRemaining > 0 && rateLimit.attemptsRemaining <= 2 && (
                  <p className='mt-1 text-xs opacity-80'>
                    {t('auth.signIn.attemptsRemaining', { count: rateLimit.attemptsRemaining })}
                  </p>
                )}
              </div>
            )}

            {/* CAPTCHA Challenge - shows when backend requires it or after failed attempts */}
            {showCaptcha && captchaConfig && captchaConfig.siteKey && (
              <CaptchaChallenge
                ref={captchaRef}
                provider={captchaConfig.provider}
                siteKey={captchaConfig.siteKey}
                mode={captchaConfig.mode}
                action='login'
                onSuccess={handleCaptchaSuccess}
                onError={handleCaptchaError}
                className='my-4'
              />
            )}

            {/* Submit Button */}
            <Button type='submit' className='mt-2' disabled={isLoading || isLDAPLoading || !rateLimit.isAllowed}>
              {isLoading
                ? t('auth.signIn.signingIn')
                : !rateLimit.isAllowed
                  ? t('auth.signIn.waitToRetry')
                  : t('auth.signIn.signInButton')}
            </Button>

            {/* SSO Login Buttons */}
            <SSOLoginButtons disabled={isLoading || isLDAPLoading || !rateLimit.isAllowed} />
          </div>
        </form>
      </Form>

      {/* LDAP Login Button */}
      <LDAPLoginButton
        disabled={isLoading || isLDAPLoading || !rateLimit.isAllowed}
        isLoading={isLDAPLoading}
        onLDAPLogin={handleLDAPLogin}
      />

      {/* Sign Up Link */}
      <p className='text-center text-sm text-muted-foreground'>
        {t('auth.signIn.noAccount')}{' '}
        <Button
          variant='link'
          className='h-auto p-0 font-semibold underline-offset-4 hover:underline'
          onClick={() => navigate({ to: ROUTES.auth.signUp })}
          type='button'
        >
          {t('auth.signIn.registerNow')}
        </Button>
      </p>
    </div>
  )
}