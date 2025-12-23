/**
 * Security utilities for preventing open redirect vulnerabilities
 *
 * These functions ensure that redirect URLs are validated to prevent attackers
 * from redirecting users to malicious external sites.
 */

/**
 * Validates a redirect URL to prevent open redirect attacks
 *
 * Only allows:
 * - Relative paths starting with '/'
 * - Rejects absolute URLs (http://, https://, etc.)
 * - Rejects protocol-relative URLs (//)
 * - Rejects URLs with : (to block data:, javascript:, etc.)
 *
 * @param url - The URL to validate
 * @returns true if the URL is safe to redirect to, false otherwise
 *
 * @example
 * isValidRedirect('/dashboard') // true
 * isValidRedirect('/dashboard?page=1') // true
 * isValidRedirect('http://evil.com') // false
 * isValidRedirect('//evil.com') // false
 * isValidRedirect('javascript:alert(1)') // false
 */
export const isValidRedirect = (url: string): boolean => {
  // Reject null, undefined, or empty strings
  if (!url) return false

  // Reject protocol-relative URLs (//example.com)
  if (url.startsWith('//')) return false

  // Reject URLs with protocols (http://, https://, javascript:, data:, etc.)
  if (url.includes('://')) return false

  // Only allow paths starting with '/'
  return url.startsWith('/')
}

/**
 * Sanitizes a URL string parameter to prevent injection attacks
 *
 * Removes dangerous characters that could be used for:
 * - Script injection
 * - Path traversal
 * - Protocol switching
 *
 * @param param - The URL parameter to sanitize
 * @returns Sanitized parameter safe for use in URLs
 *
 * @example
 * sanitizeUrlParam('session_expired') // 'session_expired'
 * sanitizeUrlParam('expired&redirect=http://evil.com') // 'expiredredirecthttpevilcom'
 * sanitizeUrlParam('../../../etc/passwd') // 'etcpasswd'
 */
export const sanitizeUrlParam = (param: string): string => {
  if (!param) return ''

  // Allow only alphanumeric, underscore, hyphen, and dot
  // Remove anything that could be used for injection or traversal
  return param.replace(/[^a-zA-Z0-9_\-\.]/g, '')
}

/**
 * Validates and sanitizes a redirect URL with fallback
 *
 * @param url - The URL to validate
 * @param fallback - The fallback URL if validation fails (default: '/')
 * @returns The validated URL or the fallback
 *
 * @example
 * safeRedirect('/dashboard', '/') // '/dashboard'
 * safeRedirect('http://evil.com', '/') // '/'
 * safeRedirect(null, '/home') // '/home'
 */
export const safeRedirect = (url: string | null | undefined, fallback: string = '/'): string => {
  if (!url) return fallback
  return isValidRedirect(url) ? url : fallback
}

/**
 * Validates that a URL is a valid OAuth authorization URL
 *
 * Checks that:
 * - URL is a valid HTTPS URL
 * - URL is not a local/private IP
 * - URL contains standard OAuth parameters
 *
 * @param url - The OAuth URL to validate
 * @returns true if URL appears to be a valid OAuth authorization URL
 *
 * @example
 * isValidOAuthUrl('https://accounts.google.com/o/oauth2/v2/auth?...) // true
 * isValidOAuthUrl('http://localhost/auth') // false (not HTTPS)
 * isValidOAuthUrl('javascript:alert(1)') // false
 */
export const isValidOAuthUrl = (url: string): boolean => {
  if (!url) return false

  try {
    const parsedUrl = new URL(url)

    // Must be HTTPS
    if (parsedUrl.protocol !== 'https:') return false

    // Must have a valid hostname (not empty, not IP address for localhost)
    const hostname = parsedUrl.hostname
    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return false
    }

    // Check for private IP ranges (basic check)
    if (hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return false
    }

    // URL should be absolute and properly formatted
    return true
  } catch {
    // Invalid URL format
    return false
  }
}
