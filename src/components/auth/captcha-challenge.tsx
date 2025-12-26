/**
 * CAPTCHA Challenge Component
 * Wrapper for CAPTCHA providers (reCAPTCHA v2/v3, hCaptcha, Cloudflare Turnstile)
 * Supports both visible (checkbox) and invisible modes
 * RTL layout support for Arabic
 */

import { useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useCaptcha } from '@/hooks/useCaptcha'
import { CaptchaProvider } from './captcha-config'
import { cn } from '@/lib/utils'
import { AlertCircle, Shield, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface CaptchaChallengeProps {
  provider: CaptchaProvider
  siteKey: string
  mode?: 'checkbox' | 'invisible'
  action?: string // For reCAPTCHA v3
  onSuccess: (token: string) => void
  onError?: (error: Error) => void
  onExpired?: () => void
  className?: string
  autoExecute?: boolean // Auto-execute invisible CAPTCHA on mount
}

export interface CaptchaChallengeRef {
  execute: () => Promise<string>
  reset: () => void
}

/**
 * CAPTCHA Challenge Component
 */
export const CaptchaChallenge = forwardRef<CaptchaChallengeRef, CaptchaChallengeProps>(
  (
    {
      provider,
      siteKey,
      mode = 'invisible',
      action = 'login',
      onSuccess,
      onError,
      onExpired,
      className,
      autoExecute = false,
    },
    ref
  ) => {
    const { i18n } = useTranslation()
    const isRtl = i18n.language === 'ar'
    const containerRef = useRef<HTMLDivElement>(null)
    const hasAutoExecuted = useRef(false)

    // Turnstile-specific refs and state
    const turnstileRef = useRef<TurnstileInstance>(null)
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [turnstileReady, setTurnstileReady] = useState(false)
    const [turnstileError, setTurnstileError] = useState<Error | null>(null)

    // Use useCaptcha hook for non-Turnstile providers
    const captcha = useCaptcha({
      provider: provider === 'turnstile' ? 'none' : provider,
      siteKey: provider === 'turnstile' ? '' : siteKey,
      mode,
      action,
      onSuccess,
      onError,
      onExpired,
    })

    // Turnstile handlers
    const handleTurnstileSuccess = useCallback((token: string) => {
      setTurnstileToken(token)
      setTurnstileReady(true)
      onSuccess?.(token)
    }, [onSuccess])

    const handleTurnstileError = useCallback(() => {
      const err = new Error('Turnstile verification failed')
      setTurnstileError(err)
      onError?.(err)
    }, [onError])

    const handleTurnstileExpire = useCallback(() => {
      setTurnstileToken('')
      onExpired?.()
    }, [onExpired])

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      execute: async () => {
        if (provider === 'turnstile') {
          // Turnstile auto-executes, just return the token if available
          if (turnstileToken) {
            return turnstileToken
          }
          // If no token yet, try to get one
          const token = turnstileRef.current?.getResponse()
          if (token) {
            setTurnstileToken(token)
            return token
          }
          throw new Error('Turnstile token not available')
        }
        return captcha.execute()
      },
      reset: () => {
        if (provider === 'turnstile') {
          turnstileRef.current?.reset()
          setTurnstileToken('')
          setTurnstileError(null)
        } else {
          captcha.reset()
        }
      },
    }))

    // Auto-execute invisible CAPTCHA if requested (non-Turnstile)
    useEffect(() => {
      if (
        provider !== 'turnstile' &&
        autoExecute &&
        !hasAutoExecuted.current &&
        captcha.isReady &&
        mode === 'invisible'
      ) {
        hasAutoExecuted.current = true
        captcha.execute().catch((err) => {
          console.error('Auto-execute CAPTCHA failed:', err)
        })
      }
    }, [provider, autoExecute, captcha.isReady, mode, captcha.execute])

    // Render Turnstile widget
    if (provider === 'turnstile') {
      return (
        <div
          className={cn(
            'captcha-challenge-container',
            isRtl ? 'rtl' : 'ltr',
            className
          )}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Error State */}
          {turnstileError && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                {isRtl
                  ? 'فشل التحقق. يرجى المحاولة مرة أخرى.'
                  : 'Verification failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <div className='flex flex-col items-center gap-2'>
            {/* Turnstile Widget */}
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={handleTurnstileSuccess}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              options={{
                theme: 'auto',
                size: mode === 'invisible' ? 'invisible' : 'normal',
                language: isRtl ? 'ar' : 'en',
                action,
              }}
            />

            {mode !== 'invisible' && !turnstileToken && (
              <p className='text-xs text-muted-foreground'>
                {isRtl
                  ? 'يرجى إكمال التحقق للمتابعة'
                  : 'Please complete verification to continue'}
              </p>
            )}
          </div>
        </div>
      )
    }

    // Don't render anything for v3 or invisible mode (non-Turnstile)
    if (provider === 'recaptcha-v3' || mode === 'invisible') {
      return null
    }

    return (
      <div
        className={cn(
          'captcha-challenge-container',
          isRtl ? 'rtl' : 'ltr',
          className
        )}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Loading State */}
        {captcha.isLoading && (
          <div className='flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 p-4'>
            <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              {isRtl ? 'جاري تحميل التحقق...' : 'Loading verification...'}
            </span>
          </div>
        )}

        {/* Error State */}
        {captcha.error && (
          <Alert variant='destructive' className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              {isRtl
                ? 'فشل تحميل التحقق. يرجى تحديث الصفحة والمحاولة مرة أخرى.'
                : 'Failed to load verification. Please refresh and try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* CAPTCHA Container */}
        {captcha.isReady && !captcha.error && (
          <div className='flex flex-col items-center gap-2'>
            {/* CAPTCHA Widget Container */}
            <div
              ref={containerRef}
              className={cn(
                'captcha-widget-container',
                'flex items-center justify-center',
                isRtl && 'direction-rtl'
              )}
              style={{
                transform: isRtl ? 'scaleX(-1)' : undefined,
              }}
            />

            <p className='text-xs text-muted-foreground'>
              {isRtl
                ? 'يرجى إكمال التحقق أعلاه للمتابعة'
                : 'Please complete the verification above to continue'}
            </p>
          </div>
        )}
      </div>
    )
  }
)

CaptchaChallenge.displayName = 'CaptchaChallenge'

/**
 * Get provider display name
 */
function getProviderName(provider: CaptchaProvider): string {
  switch (provider) {
    case 'recaptcha-v2':
      return 'reCAPTCHA'
    case 'recaptcha-v3':
      return 'reCAPTCHA'
    case 'hcaptcha':
      return 'hCaptcha'
    case 'turnstile':
      return 'Cloudflare'
    default:
      return ''
  }
}

/**
 * Invisible CAPTCHA Wrapper
 * For use with forms - automatically executes on mount
 */
export interface InvisibleCaptchaProps extends Omit<CaptchaChallengeProps, 'mode'> {
  children?: React.ReactNode
}

export const InvisibleCaptcha = forwardRef<CaptchaChallengeRef, InvisibleCaptchaProps>(
  ({ children, ...props }, ref) => {
    return (
      <>
        <CaptchaChallenge {...props} mode='invisible' ref={ref} />
        {children}
      </>
    )
  }
)

InvisibleCaptcha.displayName = 'InvisibleCaptcha'

/**
 * Checkbox CAPTCHA Wrapper
 * For use with forms - shows visible checkbox
 */
export interface CheckboxCaptchaProps extends Omit<CaptchaChallengeProps, 'mode'> {}

export const CheckboxCaptcha = forwardRef<CaptchaChallengeRef, CheckboxCaptchaProps>(
  (props, ref) => {
    return <CaptchaChallenge {...props} mode='checkbox' ref={ref} />
  }
)

CheckboxCaptcha.displayName = 'CheckboxCaptcha'

export default CaptchaChallenge
