/**
 * Validates redirect URLs to prevent open redirect attacks
 */
export const isValidRedirect = (url: string | null | undefined): boolean => {
  if (!url) return false;
  // Block protocol-relative URLs
  if (url.startsWith('//')) return false;
  // Block absolute URLs with protocols
  if (url.includes('://')) return false;
  // Block javascript: URLs
  if (url.toLowerCase().startsWith('javascript:')) return false;
  // Block data: URLs
  if (url.toLowerCase().startsWith('data:')) return false;
  // Only allow paths starting with /
  return url.startsWith('/');
};

/**
 * Sanitizes a redirect URL, returning fallback if invalid
 */
export const sanitizeRedirect = (url: string | null | undefined, fallback = '/'): string => {
  return isValidRedirect(url) ? url! : fallback;
};

/**
 * Validates external URLs (must be HTTPS)
 */
export const isValidExternalUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
