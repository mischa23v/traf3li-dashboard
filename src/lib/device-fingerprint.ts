/**
 * Device Fingerprinting for Session Binding
 * NCA ECC 2-1-4 Compliant - Session/Device Binding
 */

interface DeviceInfo {
  userAgent: string
  language: string
  languages: string[]
  platform: string
  screenResolution: string
  colorDepth: number
  timezone: string
  timezoneOffset: number
  cookiesEnabled: boolean
  doNotTrack: string | null
  hardwareConcurrency: number
  deviceMemory: number | undefined
  touchSupport: boolean
  webglVendor: string
  webglRenderer: string
  canvasFingerprint: string
}

/**
 * Collect device information for fingerprinting
 */
function collectDeviceInfo(): DeviceInfo {
  const nav = navigator
  const screen = window.screen

  // Canvas fingerprint
  let canvasFingerprint = ''
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.textBaseline = 'top'
      ctx.font = '14px Arial'
      ctx.fillStyle = '#f60'
      ctx.fillRect(125, 1, 62, 20)
      ctx.fillStyle = '#069'
      ctx.fillText('Traf3li', 2, 15)
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
      ctx.fillText('Security', 4, 17)
      canvasFingerprint = canvas.toDataURL()
    }
  } catch {
    canvasFingerprint = 'unavailable'
  }

  // WebGL info
  let webglVendor = ''
  let webglRenderer = ''
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ''
        webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
      }
    }
  } catch {
    webglVendor = 'unavailable'
    webglRenderer = 'unavailable'
  }

  return {
    userAgent: nav.userAgent,
    language: nav.language,
    languages: Array.from(nav.languages || []),
    platform: nav.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    cookiesEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: (nav as any).deviceMemory,
    touchSupport: 'ontouchstart' in window || nav.maxTouchPoints > 0,
    webglVendor,
    webglRenderer,
    canvasFingerprint,
  }
}

/**
 * Generate a hash from a string using a simple but consistent algorithm
 */
async function generateHash(str: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // Fallback for environments without crypto.subtle
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(16, '0')
  }
}

/**
 * Generate device fingerprint
 * Returns a consistent hash for the same device
 */
export async function generateDeviceFingerprint(): Promise<string> {
  const info = collectDeviceInfo()

  // Create a stable string representation
  const fingerprintData = [
    info.userAgent,
    info.language,
    info.platform,
    info.screenResolution,
    info.colorDepth.toString(),
    info.timezone,
    info.timezoneOffset.toString(),
    info.hardwareConcurrency.toString(),
    info.deviceMemory?.toString() || 'unknown',
    info.touchSupport.toString(),
    info.webglVendor,
    info.webglRenderer,
    // Canvas fingerprint is highly unique
    info.canvasFingerprint.slice(0, 100),
  ].join('|')

  return generateHash(fingerprintData)
}

/**
 * Get a shortened fingerprint (first 16 chars)
 */
export async function getShortFingerprint(): Promise<string> {
  const full = await generateDeviceFingerprint()
  return full.substring(0, 16)
}

/**
 * Store the device fingerprint for session validation
 */
const FINGERPRINT_KEY = 'device_fp'
const SESSION_FINGERPRINT_KEY = 'session_fp'

export async function storeDeviceFingerprint(): Promise<string> {
  const fingerprint = await generateDeviceFingerprint()

  try {
    // Store in sessionStorage for current session
    sessionStorage.setItem(SESSION_FINGERPRINT_KEY, fingerprint)

    // Also store in localStorage for device recognition
    localStorage.setItem(FINGERPRINT_KEY, fingerprint)
  } catch {
    // Storage unavailable
  }

  return fingerprint
}

/**
 * Get stored device fingerprint
 */
export function getStoredFingerprint(): string | null {
  try {
    return sessionStorage.getItem(SESSION_FINGERPRINT_KEY) ||
           localStorage.getItem(FINGERPRINT_KEY)
  } catch {
    return null
  }
}

/**
 * Validate that current device matches stored fingerprint
 * Allows for minor variations (browser updates, etc.)
 */
export async function validateDeviceFingerprint(
  storedFingerprint: string,
  toleranceLevel: 'strict' | 'moderate' | 'lenient' = 'moderate'
): Promise<{ valid: boolean; similarity: number; newFingerprint: string }> {
  const currentFingerprint = await generateDeviceFingerprint()

  // Exact match
  if (currentFingerprint === storedFingerprint) {
    return { valid: true, similarity: 100, newFingerprint: currentFingerprint }
  }

  // For non-exact matches, compare device info components
  const currentInfo = collectDeviceInfo()
  const stableComponents = [
    currentInfo.platform,
    currentInfo.screenResolution,
    currentInfo.timezone,
    currentInfo.hardwareConcurrency.toString(),
    currentInfo.webglRenderer,
  ]

  // Generate hash of stable components only
  const stableHash = await generateHash(stableComponents.join('|'))

  // Compare first N characters based on tolerance
  const compareLength = toleranceLevel === 'strict' ? 32 :
                        toleranceLevel === 'moderate' ? 16 : 8

  const similarity = calculateSimilarity(
    storedFingerprint.substring(0, compareLength),
    currentFingerprint.substring(0, compareLength)
  )

  const thresholds = {
    strict: 90,
    moderate: 70,
    lenient: 50,
  }

  return {
    valid: similarity >= thresholds[toleranceLevel],
    similarity,
    newFingerprint: currentFingerprint,
  }
}

/**
 * Calculate string similarity percentage
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100
  if (str1.length === 0 || str2.length === 0) return 0

  let matches = 0
  const len = Math.min(str1.length, str2.length)

  for (let i = 0; i < len; i++) {
    if (str1[i] === str2[i]) matches++
  }

  return Math.round((matches / len) * 100)
}

/**
 * Clear stored fingerprint (on logout)
 */
export function clearStoredFingerprint(): void {
  try {
    sessionStorage.removeItem(SESSION_FINGERPRINT_KEY)
    // Keep localStorage fingerprint for device recognition on re-login
  } catch {
    // Ignore errors
  }
}

/**
 * Get device info summary (for audit logging)
 */
export function getDeviceInfoSummary(): {
  browser: string
  os: string
  device: string
  timezone: string
} {
  const info = collectDeviceInfo()

  // Parse user agent for browser/OS
  const ua = info.userAgent
  let browser = 'Unknown'
  let os = 'Unknown'
  let device = info.touchSupport ? 'Mobile/Tablet' : 'Desktop'

  // Browser detection
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Edge')) browser = 'Edge'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'

  // OS detection
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) { os = 'Android'; device = 'Mobile' }
  else if (ua.includes('iPhone') || ua.includes('iPad')) { os = 'iOS'; device = 'Mobile' }

  return {
    browser,
    os,
    device,
    timezone: info.timezone,
  }
}

export default {
  generateDeviceFingerprint,
  getShortFingerprint,
  storeDeviceFingerprint,
  getStoredFingerprint,
  validateDeviceFingerprint,
  clearStoredFingerprint,
  getDeviceInfoSummary,
}
