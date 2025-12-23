/**
 * CAPTCHA Service
 * Handles CAPTCHA token verification and settings management
 */

import api from './api'
import {
  CaptchaConfig,
  CaptchaProvider,
  CaptchaSettings,
  defaultCaptchaConfig,
  getCaptchaSiteKey,
} from '@/components/auth/captcha-config'

const CAPTCHA_SETTINGS_KEY = 'captcha_settings'

export interface VerifyCaptchaRequest {
  token: string
  provider: CaptchaProvider
  action?: string // For reCAPTCHA v3
}

export interface VerifyCaptchaResponse {
  success: boolean
  score?: number // For reCAPTCHA v3
  action?: string
  challenge_ts?: string
  hostname?: string
  errorCodes?: string[]
}

export interface CaptchaRequirementCheck {
  required: boolean
  reason?: 'failed_attempts' | 'new_device' | 'high_risk' | 'always'
  failedAttempts?: number
  riskScore?: number
}

/**
 * Verify CAPTCHA token with backend
 */
export async function verifyCaptchaToken(
  request: VerifyCaptchaRequest
): Promise<VerifyCaptchaResponse> {
  try {
    const response = await api.post<VerifyCaptchaResponse>(
      '/auth/captcha/verify',
      request
    )
    return response.data
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('CAPTCHA verification failed:', error)
    }
    throw new Error(
      error?.response?.data?.message || 'Failed to verify CAPTCHA'
    )
  }
}

/**
 * Get CAPTCHA settings from backend
 */
export async function getCaptchaSettings(): Promise<CaptchaSettings> {
  try {
    const response = await api.get<CaptchaSettings>('/auth/captcha/settings')

    // Cache settings in localStorage
    localStorage.setItem(CAPTCHA_SETTINGS_KEY, JSON.stringify(response.data))

    return response.data
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.warn('Failed to fetch CAPTCHA settings, using cached or default:', error)
    }

    // Try to get cached settings
    const cached = localStorage.getItem(CAPTCHA_SETTINGS_KEY)
    if (cached) {
      return JSON.parse(cached)
    }

    // Return default settings
    return {
      provider: defaultCaptchaConfig.provider,
      mode: defaultCaptchaConfig.mode,
      threshold: defaultCaptchaConfig.threshold,
      enabled: defaultCaptchaConfig.enabled,
      requireAfterFailedAttempts: defaultCaptchaConfig.requireAfterFailedAttempts,
      alwaysForNewDevices: defaultCaptchaConfig.alwaysForNewDevices,
      riskScoreThreshold: defaultCaptchaConfig.riskScoreThreshold,
    }
  }
}

/**
 * Update CAPTCHA settings (admin only)
 */
export async function updateCaptchaSettings(
  settings: Partial<CaptchaSettings>
): Promise<CaptchaSettings> {
  try {
    const response = await api.put<CaptchaSettings>(
      '/auth/captcha/settings',
      settings
    )

    // Update cache
    localStorage.setItem(CAPTCHA_SETTINGS_KEY, JSON.stringify(response.data))

    return response.data
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('Failed to update CAPTCHA settings:', error)
    }
    throw new Error(
      error?.response?.data?.message || 'Failed to update CAPTCHA settings'
    )
  }
}

/**
 * Check if CAPTCHA is required for the current login attempt
 */
export async function checkCaptchaRequired(
  identifier: string
): Promise<CaptchaRequirementCheck> {
  try {
    const response = await api.post<CaptchaRequirementCheck>(
      '/auth/captcha/check-required',
      { identifier }
    )
    return response.data
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.warn('Failed to check CAPTCHA requirement:', error)
    }

    // Default to not required on error
    return { required: false }
  }
}

/**
 * Get device fingerprint for new device detection
 * This is a simple implementation - in production, use a library like FingerprintJS
 */
export function getDeviceFingerprint(): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return 'unknown'

  ctx.textBaseline = 'top'
  ctx.font = '14px Arial'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#f60'
  ctx.fillRect(125, 1, 62, 20)
  ctx.fillStyle = '#069'
  ctx.fillText('fingerprint', 2, 15)
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
  ctx.fillText('fingerprint', 4, 17)

  const canvasData = canvas.toDataURL()

  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasData.slice(-50), // Last 50 chars of canvas fingerprint
  }

  // Simple hash function
  const str = JSON.stringify(fingerprint)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  return hash.toString(36)
}

/**
 * Check if device is recognized
 */
export function isDeviceRecognized(): boolean {
  const fingerprint = getDeviceFingerprint()
  const knownDevices = localStorage.getItem('known_devices')

  if (!knownDevices) return false

  try {
    const devices = JSON.parse(knownDevices) as string[]
    return devices.includes(fingerprint)
  } catch {
    return false
  }
}

/**
 * Mark current device as recognized
 */
export function markDeviceAsRecognized(): void {
  const fingerprint = getDeviceFingerprint()
  const knownDevices = localStorage.getItem('known_devices')

  let devices: string[] = []
  if (knownDevices) {
    try {
      devices = JSON.parse(knownDevices)
    } catch {
      devices = []
    }
  }

  if (!devices.includes(fingerprint)) {
    devices.push(fingerprint)
    localStorage.setItem('known_devices', JSON.stringify(devices))
  }
}

/**
 * Get CAPTCHA configuration with settings
 */
export async function getCaptchaConfig(): Promise<CaptchaConfig> {
  const settings = await getCaptchaSettings()

  return {
    provider: settings.provider,
    mode: settings.mode,
    siteKey: getCaptchaSiteKey(settings.provider, settings),
    threshold: settings.threshold,
    enabled: settings.enabled,
    requireAfterFailedAttempts: settings.requireAfterFailedAttempts,
    alwaysForNewDevices: settings.alwaysForNewDevices,
    riskScoreThreshold: settings.riskScoreThreshold,
  }
}

/**
 * Calculate risk score based on various factors
 * Returns a score from 0 (low risk) to 100 (high risk)
 */
export function calculateRiskScore(params: {
  failedAttempts: number
  isNewDevice: boolean
  rapidAttempts: boolean
  suspiciousActivity: boolean
}): number {
  let score = 0

  // Failed attempts contribute heavily
  score += Math.min(params.failedAttempts * 20, 50)

  // New device adds risk
  if (params.isNewDevice) score += 20

  // Rapid attempts indicate automation
  if (params.rapidAttempts) score += 20

  // Other suspicious activity
  if (params.suspiciousActivity) score += 10

  return Math.min(score, 100)
}

export default {
  verifyCaptchaToken,
  getCaptchaSettings,
  updateCaptchaSettings,
  checkCaptchaRequired,
  getDeviceFingerprint,
  isDeviceRecognized,
  markDeviceAsRecognized,
  getCaptchaConfig,
  calculateRiskScore,
}
