/**
 * CAPTCHA Configuration
 * Supports reCAPTCHA v2/v3 and hCaptcha
 * Site keys should be configured in environment variables
 */

export type CaptchaProvider = 'recaptcha-v2' | 'recaptcha-v3' | 'hcaptcha' | 'turnstile' | 'none'
export type CaptchaMode = 'checkbox' | 'invisible'

export interface CaptchaConfig {
  provider: CaptchaProvider
  mode: CaptchaMode
  siteKey: string
  threshold: number // For reCAPTCHA v3 (0.0 - 1.0)
  enabled: boolean
  requireAfterFailedAttempts: number // Show CAPTCHA after X failed attempts
  alwaysForNewDevices: boolean // Always show for unrecognized devices
  riskScoreThreshold: number // Require CAPTCHA if risk score above this (0-100)
}

export interface CaptchaSettings {
  recaptchaV2SiteKey?: string
  recaptchaV3SiteKey?: string
  hcaptchaSiteKey?: string
  turnstileSiteKey?: string
  provider: CaptchaProvider
  mode: CaptchaMode
  threshold: number
  enabled: boolean
  requireAfterFailedAttempts: number
  alwaysForNewDevices: boolean
  riskScoreThreshold: number
}

/**
 * Get the site key for the configured provider from environment
 */
function getDefaultSiteKey(): string {
  const provider = (import.meta.env.VITE_CAPTCHA_PROVIDER as CaptchaProvider) || 'turnstile'
  switch (provider) {
    case 'turnstile':
      return import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
    case 'recaptcha-v2':
      return import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || ''
    case 'recaptcha-v3':
      return import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY || ''
    case 'hcaptcha':
      return import.meta.env.VITE_HCAPTCHA_SITE_KEY || ''
    default:
      return ''
  }
}

/**
 * Default CAPTCHA configuration
 * Can be overridden by settings from backend or local storage
 *
 * SAFETY: CAPTCHA is automatically disabled if no site key is configured
 * to prevent "Security verification failed" errors
 */
export const defaultCaptchaConfig: CaptchaConfig = (() => {
  const provider = (import.meta.env.VITE_CAPTCHA_PROVIDER as CaptchaProvider) || 'turnstile'
  const siteKey = getDefaultSiteKey()
  const envEnabled = import.meta.env.VITE_CAPTCHA_ENABLED === 'true'

  // SAFETY: Disable CAPTCHA if enabled but no site key is configured
  // This prevents "Security verification failed" errors
  const enabled = envEnabled && siteKey.length > 0

  if (envEnabled && !siteKey) {
    console.warn('[CAPTCHA] VITE_CAPTCHA_ENABLED=true but no site key configured. CAPTCHA disabled.')
  }

  return {
    provider,
    mode: (import.meta.env.VITE_CAPTCHA_MODE as CaptchaMode) || 'invisible',
    siteKey,
    threshold: parseFloat(import.meta.env.VITE_RECAPTCHA_THRESHOLD || '0.5'),
    enabled,
    requireAfterFailedAttempts: parseInt(
      import.meta.env.VITE_CAPTCHA_FAILED_ATTEMPTS_THRESHOLD || '3',
      10
    ),
    alwaysForNewDevices: import.meta.env.VITE_CAPTCHA_NEW_DEVICES === 'true',
    riskScoreThreshold: parseInt(import.meta.env.VITE_CAPTCHA_RISK_THRESHOLD || '50', 10),
  }
})()

/**
 * Get CAPTCHA site key based on provider
 */
export function getCaptchaSiteKey(
  provider: CaptchaProvider,
  settings?: CaptchaSettings
): string {
  if (settings) {
    switch (provider) {
      case 'recaptcha-v2':
        return settings.recaptchaV2SiteKey || ''
      case 'recaptcha-v3':
        return settings.recaptchaV3SiteKey || ''
      case 'hcaptcha':
        return settings.hcaptchaSiteKey || ''
      case 'turnstile':
        return settings.turnstileSiteKey || ''
      default:
        return ''
    }
  }

  // Fallback to environment variables
  switch (provider) {
    case 'recaptcha-v2':
      return import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || ''
    case 'recaptcha-v3':
      return import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY || ''
    case 'hcaptcha':
      return import.meta.env.VITE_HCAPTCHA_SITE_KEY || ''
    case 'turnstile':
      return import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
    default:
      return ''
  }
}

/**
 * Get CAPTCHA script URL based on provider
 */
export function getCaptchaScriptUrl(provider: CaptchaProvider, siteKey: string): string {
  switch (provider) {
    case 'recaptcha-v2':
    case 'recaptcha-v3':
      return `https://www.google.com/recaptcha/api.js?render=${provider === 'recaptcha-v3' ? siteKey : 'explicit'}`
    case 'hcaptcha':
      return 'https://js.hcaptcha.com/1/api.js'
    case 'turnstile':
      return 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    default:
      return ''
  }
}

/**
 * CAPTCHA provider display names (i18n keys)
 */
export const CAPTCHA_PROVIDER_LABELS: Record<CaptchaProvider, string> = {
  'recaptcha-v2': 'reCAPTCHA v2',
  'recaptcha-v3': 'reCAPTCHA v3',
  hcaptcha: 'hCaptcha',
  turnstile: 'Cloudflare Turnstile',
  none: 'None',
}

/**
 * CAPTCHA mode display names (i18n keys)
 */
export const CAPTCHA_MODE_LABELS: Record<CaptchaMode, string> = {
  checkbox: 'Checkbox',
  invisible: 'Invisible',
}
