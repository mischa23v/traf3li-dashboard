/**
 * Cookie Utilities
 * NCA ECC 2-2-3 Compliant - Secure Cookie Handling
 */

const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:'

/**
 * Secure cookie options for NCA/CITC compliance
 */
export interface SecureCookieOptions {
  expires?: Date | number // Date or days
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
  httpOnly?: boolean // Note: Can't be set from JS, backend only
}

/**
 * Default secure cookie options (NCA ECC 2-2-3 compliant)
 */
const DEFAULT_SECURE_OPTIONS: SecureCookieOptions = {
  path: '/',
  secure: isProduction,
  sameSite: 'Strict',
}

/**
 * Set a cookie with secure defaults
 * @param name Cookie name
 * @param value Cookie value
 * @param options Cookie options (secure defaults applied)
 */
export function setCookie(
  name: string,
  value: string,
  options: SecureCookieOptions = {}
): void {
  const opts = { ...DEFAULT_SECURE_OPTIONS, ...options }

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (opts.expires) {
    const expiresDate = opts.expires instanceof Date
      ? opts.expires
      : new Date(Date.now() + opts.expires * 24 * 60 * 60 * 1000)
    cookieString += `; expires=${expiresDate.toUTCString()}`
  }

  if (opts.path) {
    cookieString += `; path=${opts.path}`
  }

  if (opts.domain) {
    cookieString += `; domain=${opts.domain}`
  }

  // NCA ECC 2-2-3: Always set Secure in production
  if (opts.secure) {
    cookieString += '; Secure'
  }

  // NCA ECC 2-2-3: Always set SameSite=Strict for CSRF protection
  if (opts.sameSite) {
    cookieString += `; SameSite=${opts.sameSite}`
  }

  document.cookie = cookieString
}

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '='
  const cookies = document.cookie.split(';')

  for (let cookie of cookies) {
    cookie = cookie.trim()
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length))
    }
  }

  return null
}

/**
 * Delete a cookie
 * @param name Cookie name
 * @param options Cookie options (path and domain must match original)
 */
export function deleteCookie(name: string, options: Pick<SecureCookieOptions, 'path' | 'domain'> = {}): void {
  setCookie(name, '', {
    ...options,
    expires: new Date(0),
  })
}

/**
 * Check if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  try {
    setCookie('__cookie_test__', 'test', { expires: 1 })
    const enabled = getCookie('__cookie_test__') === 'test'
    deleteCookie('__cookie_test__')
    return enabled
  } catch {
    return false
  }
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {}

  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=')
    if (name) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value || '')
    }
  })

  return cookies
}

/**
 * Validate cookie security (for audit purposes)
 * Returns issues found with current cookies
 */
export function validateCookieSecurity(): string[] {
  const issues: string[] = []

  if (!isProduction) {
    issues.push('Running in non-HTTPS mode - Secure flag not enforced')
  }

  // Check if any sensitive cookies are accessible (they shouldn't be if HttpOnly)
  const sensitiveCookies = ['session', 'token', 'auth', 'csrf']
  const cookies = getAllCookies()

  for (const [name] of Object.entries(cookies)) {
    const lowerName = name.toLowerCase()
    if (sensitiveCookies.some(s => lowerName.includes(s))) {
      // If we can read it, it's not HttpOnly (which is a concern for session tokens)
      if (lowerName.includes('session') || lowerName.includes('token')) {
        issues.push(`Warning: ${name} is accessible from JavaScript (should be HttpOnly)`)
      }
    }
  }

  return issues
}

export default {
  setCookie,
  getCookie,
  deleteCookie,
  areCookiesEnabled,
  getAllCookies,
  validateCookieSecurity,
}
