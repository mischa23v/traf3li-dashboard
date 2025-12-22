/**
 * CAPTCHA Challenge Component
 * Wrapper for CAPTCHA providers (reCAPTCHA v2/v3, hCaptcha)
 * Supports both visible (checkbox) and invisible modes
 * RTL layout support for Arabic
 */

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
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

    const captcha = useCaptcha({
      provider,
      siteKey,
      mode,
      action,
      onSuccess,
      onError,
      onExpired,
    })

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      execute: captcha.execute,
      reset: captcha.reset,
    }))

    // Auto-execute invisible CAPTCHA if requested
    useEffect(() => {
      if (
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
    }, [autoExecute, captcha.isReady, mode, captcha.execute])

    // Don't render anything for v3 or invisible mode
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
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <Shield className='h-3 w-3' />
              <span>
                {isRtl
                  ? 'محمي بواسطة ' + getProviderName(provider)
                  : 'Protected by ' + getProviderName(provider)}
              </span>
            </div>

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
