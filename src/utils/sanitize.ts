/**
 * HTML Sanitization Utilities
 *
 * SECURITY: Uses DOMPurify for proper XSS protection
 * Previously used regex-based sanitization which is fundamentally flawed
 * (you cannot reliably parse/sanitize HTML with regex)
 *
 * @see https://github.com/cure53/DOMPurify
 */

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

// Configure DOMPurify with secure defaults
const createDOMPurifyConfig = (options?: SanitizeOptions): DOMPurify.Config => {
  const config: DOMPurify.Config = {
    // Remove dangerous tags
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select'],
    // Remove dangerous attributes
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
    // Allow safe URI schemes only
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    // Prevent DOM clobbering
    SANITIZE_DOM: true,
    // Return string, not DOM node
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  };

  // Allow custom tags if specified
  if (options?.allowedTags) {
    config.ALLOWED_TAGS = options.allowedTags;
  }

  // Allow custom attributes if specified
  if (options?.allowedAttributes) {
    config.ALLOWED_ATTR = options.allowedAttributes;
  }

  return config;
};

/**
 * Escapes HTML entities to prevent XSS attacks
 * Converts: < > & " '
 * Use this when you want to display text that might contain HTML
 * @param input - The string to escape
 * @returns Escaped string safe for HTML display
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => escapeMap[char] || char);
}

/**
 * Sanitizes HTML using DOMPurify
 * SECURITY: This is the correct way to sanitize HTML - NOT with regex
 *
 * @param input - The HTML string to sanitize
 * @param options - Optional configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(input: string, options?: SanitizeOptions): string {
  if (typeof input !== 'string') {
    return '';
  }

  if (!input.trim()) {
    return '';
  }

  const config = createDOMPurifyConfig(options);
  return DOMPurify.sanitize(input, config);
}

/**
 * Sanitizes HTML and strips ALL tags - returns plain text
 * Use this when you want to extract text content only
 * @param input - The HTML string to strip
 * @returns Plain text with no HTML
 */
export function stripHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Validates and sanitizes URLs to prevent XSS attacks
 * - Blocks javascript: and data: protocols
 * - Only allows http:, https:, mailto:, tel:, and relative URLs
 * @param url - The URL to sanitize
 * @returns Sanitized URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') {
    return '';
  }

  const trimmedUrl = url.trim();

  // Empty or whitespace-only URLs
  if (!trimmedUrl) {
    return '';
  }

  // Decode URL to catch encoded javascript: protocols
  let decodedUrl = trimmedUrl;
  try {
    // Multiple decode passes to catch double-encoding attacks
    let previousUrl = '';
    let currentUrl = trimmedUrl;
    let iterations = 0;
    const maxIterations = 5; // Prevent infinite loops

    while (previousUrl !== currentUrl && iterations < maxIterations) {
      previousUrl = currentUrl;
      currentUrl = decodeURIComponent(currentUrl);
      iterations++;
    }
    decodedUrl = currentUrl;
  } catch {
    // If decoding fails, use original
    decodedUrl = trimmedUrl;
  }

  // Normalize whitespace that could be used to bypass checks
  const normalizedUrl = decodedUrl.replace(/[\s\x00-\x1f]/g, '');

  // Check for dangerous protocols (case-insensitive)
  const dangerousProtocolRegex = /^(?:javascript|data|vbscript|file|about|blob):/i;
  if (dangerousProtocolRegex.test(normalizedUrl)) {
    return '';
  }

  // Allow safe protocols
  const safeProtocolRegex = /^(?:https?|mailto|tel|sms|ftp):/i;
  const isRelativeUrl = /^[./]/.test(trimmedUrl) || !/^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl);

  if (safeProtocolRegex.test(trimmedUrl) || isRelativeUrl) {
    return trimmedUrl;
  }

  // If no protocol is specified and it's not relative, it might be a domain
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Unknown protocol - reject
  return '';
}

/**
 * Recursively sanitizes all string values in an object
 * - Sanitizes HTML in string values using DOMPurify
 * - Processes nested objects and arrays
 * @param obj - The object to sanitize
 * @returns New object with sanitized values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'string') {
        return sanitizeHtml(item);
      }
      if (typeof item === 'object' && item !== null) {
        return sanitizeObject(item as Record<string, unknown>);
      }
      return item;
    }) as unknown as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as unknown as Record<string, unknown>);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * React hook that returns a sanitized version of a string value
 * Uses useMemo to avoid re-sanitizing on every render
 * @param value - The value to sanitize
 * @param type - Type of sanitization: 'html' (default) or 'url'
 * @returns Sanitized value
 */
export function useSanitizedValue(
  value: string,
  type: 'html' | 'url' = 'html'
): string {
  return useMemo(() => {
    if (type === 'url') {
      return sanitizeUrl(value);
    }
    return sanitizeHtml(value);
  }, [value, type]);
}

/**
 * React hook that returns a sanitized version of an object
 * Uses useMemo to avoid re-sanitizing on every render
 * @param obj - The object to sanitize
 * @returns Sanitized object
 */
export function useSanitizedObject<T extends Record<string, unknown>>(obj: T): T {
  return useMemo(() => sanitizeObject(obj), [obj]);
}

// Type definitions for better TypeScript support
export type SanitizationType = 'html' | 'url';

export interface SanitizeOptions {
  type?: SanitizationType;
  allowedTags?: string[];
  allowedAttributes?: string[];
}

/**
 * Validates if a string contains potentially dangerous content
 * Uses DOMPurify's internal checks
 * @param input - The string to check
 * @returns true if content appears safe, false if dangerous patterns detected
 */
export function isContentSafe(input: string): boolean {
  if (typeof input !== 'string') {
    return true;
  }

  // Compare original with sanitized - if different, it contained dangerous content
  const sanitized = DOMPurify.sanitize(input);
  return input === sanitized;
}

/**
 * Sanitizes a string for use in HTML attributes
 * More strict than regular HTML sanitization
 * @param input - The string to sanitize
 * @returns Sanitized string safe for HTML attributes
 */
export function sanitizeAttribute(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // First escape HTML entities
  let sanitized = escapeHtml(input);

  // Remove any remaining quotes that could break out of attribute context
  sanitized = sanitized.replace(/["`]/g, '');

  return sanitized;
}

/**
 * Creates a sanitizer instance with custom configuration
 * Useful for components that need specific sanitization rules
 */
export function createSanitizer(options: SanitizeOptions) {
  const config = createDOMPurifyConfig(options);

  return {
    sanitize: (input: string) => DOMPurify.sanitize(input, config),
    isRemoved: DOMPurify.isSupported ? DOMPurify.removed : [],
  };
}

/**
 * Hook to add custom hooks to DOMPurify
 * Useful for advanced use cases like adding custom attributes
 */
export function addDOMPurifyHook(
  hookName: 'beforeSanitizeElements' | 'afterSanitizeElements' | 'beforeSanitizeAttributes' | 'afterSanitizeAttributes',
  callback: (node: Element, data: DOMPurify.HookEvent, config: DOMPurify.Config) => void
) {
  DOMPurify.addHook(hookName, callback as Parameters<typeof DOMPurify.addHook>[1]);
}

/**
 * Remove all DOMPurify hooks (useful for testing)
 */
export function removeAllDOMPurifyHooks() {
  DOMPurify.removeAllHooks();
}

export default {
  escapeHtml,
  sanitizeHtml,
  stripHtml,
  sanitizeUrl,
  sanitizeObject,
  sanitizeAttribute,
  isContentSafe,
  useSanitizedValue,
  useSanitizedObject,
  createSanitizer,
  addDOMPurifyHook,
  removeAllDOMPurifyHooks,
};
