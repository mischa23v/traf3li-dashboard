/**
 * User Authentication Form (Sign In)
 * Connects to Traf3li backend for authentication
 * Includes client-side rate limiting (NCA ECC 2-1-2 compliant)
 */

import { HTMLAttributes, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconBrandGoogle, IconAlertTriangle, IconClock } from '@tabler/icons-react'
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
import {
  checkLoginAllowed,
  recordFailedAttempt,
  recordSuccessfulLogin,
  formatLockoutTime,
} from '@/lib/login-throttle'

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
  const { t } = useTranslation()
  const login = useAuthStore((state) => state.login)
  const authError = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const [isLoading, setIsLoading] = useState(false)

  // Rate limiting state
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  const [waitTime, setWaitTime] = useState<number>(0)
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)

  const formSchema = useMemo(() => createFormSchema(t), [t])

  const defaultValues = useMemo(() => ({
    username: '',
    password: '',
  }), [])

  // Countdown timer for rate limiting
  useEffect(() => {
    if (waitTime <= 0) return

    const timer = setInterval(() => {
      setWaitTime((prev) => {
        const newTime = prev - 1
        if (newTime <= 0) {
          setRateLimitError(null)
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [waitTime])

  // Get login identifier (username or email)
  const getLoginIdentifier = useCallback((username: string): string => {
    return username.toLowerCase().trim()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  })

  /**
   * Handle form submission with rate limiting
   */
  async function onSubmit(data: z.infer<typeof formSchema>) {
    const identifier = getLoginIdentifier(data.username)

    // Check client-side rate limiting BEFORE making API call
    const throttleCheck = checkLoginAllowed(identifier)
    if (!throttleCheck.allowed) {
      setRateLimitError(
        throttleCheck.lockedUntil
          ? t('auth.signIn.accountLocked', { time: formatLockoutTime(throttleCheck.waitTime || 0) })
          : t('auth.signIn.tooManyAttempts', { time: formatLockoutTime(throttleCheck.waitTime || 0) })
      )
      setWaitTime(throttleCheck.waitTime || 0)
      setAttemptsRemaining(throttleCheck.attemptsRemaining || 0)
      return
    }

    setIsLoading(true)
    clearError()
    setRateLimitError(null)

    try {
      await login(data)

      // Record successful login - clears throttle data
      recordSuccessfulLogin(identifier)

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

      // Handle server-side 429 rate limit - DON'T count as failed attempt
      // 429 means "slow down", not "wrong password"
      if (status === 429) {
        const serverWaitTime = error.retryAfter || error?.response?.data?.retryAfter || 60
        setRateLimitError(t('auth.signIn.serverRateLimited', { time: formatLockoutTime(serverWaitTime) }))
        setWaitTime(serverWaitTime)
        return
      }

      // Only record failed attempt for actual auth failures (401, 400 with wrong credentials)
      // NOT for network errors, server errors, or rate limits
      const isAuthFailure = status === 401 || status === 400
      if (isAuthFailure) {
        const failedResult = recordFailedAttempt(identifier)
        setAttemptsRemaining(failedResult.attemptsRemaining)

        // Handle client-side lockout from failed attempts
        if (failedResult.locked) {
          setRateLimitError(
            t('auth.signIn.accountLocked', { time: formatLockoutTime(failedResult.waitTime || 0) })
          )
          setWaitTime(failedResult.waitTime || 0)
        }
      }
      // For other errors (network, 500s), just let the error display without counting
    } finally {
      setIsLoading(false)
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
                      onClick={() => navigate({ to: '/forgot-password' })}
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

            {/* Display Rate Limit Error */}
            {rateLimitError && (
              <div className='rounded-md bg-amber-500/15 p-3 text-sm text-amber-700 dark:text-amber-400'>
                <div className='flex items-start gap-2'>
                  <IconAlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
                  <div className='flex-1'>
                    <p>{rateLimitError}</p>
                    {waitTime > 0 && (
                      <p className='mt-1 flex items-center gap-1 text-xs'>
                        <IconClock className='h-3 w-3' />
                        {t('auth.signIn.waitingTime', { time: formatLockoutTime(waitTime) })}
                      </p>
                    )}
                    {attemptsRemaining !== null && attemptsRemaining > 0 && !waitTime && (
                      <p className='mt-1 text-xs'>
                        {t('auth.signIn.attemptsRemaining', { count: attemptsRemaining })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Display API Error */}
            {authError && !rateLimitError && (
              <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                {authError}
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className='mt-1 text-xs opacity-80'>
                    {t('auth.signIn.attemptsRemaining', { count: attemptsRemaining })}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <Button type='submit' className='mt-2' disabled={isLoading || waitTime > 0}>
              {isLoading
                ? t('auth.signIn.signingIn')
                : waitTime > 0
                  ? `${t('auth.signIn.waitToRetry')} (${formatLockoutTime(waitTime)})`
                  : t('auth.signIn.signInButton')}
            </Button>

            {/* Divider */}
            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  {t('auth.signIn.orContinueWith')}
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <Button
              variant='outline'
              className='w-full'
              type='button'
              disabled={isLoading}
            >
              <IconBrandGoogle className='me-2 h-4 w-4' />
              {t('auth.signIn.google')}
            </Button>
          </div>
        </form>
      </Form>

      {/* Sign Up Link */}
      <p className='text-center text-sm text-muted-foreground'>
        {t('auth.signIn.noAccount')}{' '}
        <Button
          variant='link'
          className='h-auto p-0 font-semibold underline-offset-4 hover:underline'
          onClick={() => navigate({ to: '/sign-up' })}
          type='button'
        >
          {t('auth.signIn.registerNow')}
        </Button>
      </p>
    </div>
  )
}