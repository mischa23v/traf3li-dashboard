/**
 * CAPTCHA Configuration
 *
 * IMPORTANT: CAPTCHA is controlled entirely by the BACKEND via /auth/captcha/settings
 * The frontend fetches settings from backend and renders accordingly.
 * No frontend environment variables are used for CAPTCHA configuration.
 *
 * Supports: Cloudflare Turnstile, reCAPTCHA v2/v3, hCaptcha
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
 * Default CAPTCHA configuration (DISABLED by default)
 *
 * This is used as a fallback when backend settings are unavailable.
 * The backend controls whether CAPTCHA is enabled and provides site keys.
 */
export const defaultCaptchaConfig: CaptchaConfig = {
  provider: 'none',
  mode: 'invisible',
  siteKey: '',
  threshold: 0.5,
  enabled: false, // DISABLED by default - backend enables if configured
  requireAfterFailedAttempts: 3,
  alwaysForNewDevices: false,
  riskScoreThreshold: 50,
}

/**
 * Get CAPTCHA site key based on provider from backend settings
 *
 * @param provider - The CAPTCHA provider type
 * @param settings - Backend CAPTCHA settings (required)
 * @returns The site key for the provider, or empty string if not configured
 */
export function getCaptchaSiteKey(
  provider: CaptchaProvider,
  settings?: CaptchaSettings
): string {
  if (!settings) {
    return ''
  }

  switch (provider) {
    case 'recaptcha-v2':
      return settings.recaptchaV2SiteKey || ''
    case 'recaptcha-v3':
      return settings.recaptchaV3SiteKey || ''
    case 'hcaptcha':
      return settings.hcaptchaSiteKey || ''
    case 'turnstile':
      return settings.turnstileSiteKey || ''
    case 'none':
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
    case 'none':
    default:
      return ''
  }
}

/**
 * CAPTCHA provider display names
 */
export const CAPTCHA_PROVIDER_LABELS: Record<CaptchaProvider, string> = {
  'recaptcha-v2': 'reCAPTCHA v2',
  'recaptcha-v3': 'reCAPTCHA v3',
  hcaptcha: 'hCaptcha',
  turnstile: 'Cloudflare Turnstile',
  none: 'None',
}

/**
 * CAPTCHA mode display names
 */
export const CAPTCHA_MODE_LABELS: Record<CaptchaMode, string> = {
  checkbox: 'Checkbox',
  invisible: 'Invisible',
}
