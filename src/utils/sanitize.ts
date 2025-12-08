import { useMemo } from 'react';

/**
 * Escapes HTML entities to prevent XSS attacks
 * Converts: < > & " '
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
 * Removes dangerous HTML tags and attributes to prevent XSS
 * - Removes all <script> tags and their content
 * - Removes event handler attributes (onclick, onerror, etc.)
 * - Removes dangerous tags (iframe, object, embed, etc.)
 * @param input - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove dangerous tags
  const dangerousTags = [
    'script',
    'iframe',
    'object',
    'embed',
    'link',
    'style',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'meta',
    'base',
  ];

  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing versions
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  // Remove event handler attributes
  const eventHandlers = [
    'onabort',
    'onblur',
    'onchange',
    'onclick',
    'oncontextmenu',
    'ondblclick',
    'ondrag',
    'ondragend',
    'ondragenter',
    'ondragleave',
    'ondragover',
    'ondragstart',
    'ondrop',
    'onerror',
    'onfocus',
    'oninput',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onload',
    'onmousedown',
    'onmouseenter',
    'onmouseleave',
    'onmousemove',
    'onmouseout',
    'onmouseover',
    'onmouseup',
    'onpaste',
    'onreset',
    'onresize',
    'onscroll',
    'onsearch',
    'onselect',
    'onsubmit',
    'ontouchcancel',
    'ontouchend',
    'ontouchmove',
    'ontouchstart',
    'onwheel',
  ];

  eventHandlers.forEach((handler) => {
    const regex = new RegExp(`\\s*${handler}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
    const unquotedRegex = new RegExp(`\\s*${handler}\\s*=\\s*[^\\s>]*`, 'gi');
    sanitized = sanitized.replace(unquotedRegex, '');
  });

  // Remove javascript: protocol from href and src attributes
  sanitized = sanitized.replace(
    /(href|src)\s*=\s*["']?\s*javascript:/gi,
    '$1=""'
  );

  // Remove data: protocol from src attributes (can be used for XSS)
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*data:/gi, 'src=""');

  // Remove style attributes that could contain expressions
  sanitized = sanitized.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');

  return sanitized;
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
    decodedUrl = decodeURIComponent(trimmedUrl);
  } catch (e) {
    // If decoding fails, use original
    decodedUrl = trimmedUrl;
  }

  // Check for dangerous protocols (case-insensitive)
  const dangerousProtocolRegex =
    /^[\s]*(?:javascript|data|vbscript|file|about):/i;
  if (dangerousProtocolRegex.test(decodedUrl)) {
    return '';
  }

  // Allow safe protocols
  const safeProtocolRegex = /^(?:https?|mailto|tel|sms|ftp):/i;
  const isRelativeUrl = /^[./]/.test(trimmedUrl) || !/^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl);

  if (safeProtocolRegex.test(trimmedUrl) || isRelativeUrl) {
    return trimmedUrl;
  }

  // If no protocol is specified and it's not relative, assume https
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  // Unknown protocol - reject
  return '';
}

/**
 * Recursively sanitizes all string values in an object
 * - Sanitizes HTML in string values
 * - Processes nested objects and arrays
 * @param obj - The object to sanitize
 * @returns New object with sanitized values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'string') {
        return sanitizeHtml(item);
      }
      if (typeof item === 'object' && item !== null) {
        return sanitizeObject(item);
      }
      return item;
    }) as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
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
export function useSanitizedObject<T extends Record<string, any>>(obj: T): T {
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
 * @param input - The string to check
 * @returns true if content appears safe, false if dangerous patterns detected
 */
export function isContentSafe(input: string): boolean {
  if (typeof input !== 'string') {
    return true;
  }

  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /onload\s*=/i,
    /<iframe/i,
    /data:text\/html/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
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

export default {
  escapeHtml,
  sanitizeHtml,
  sanitizeUrl,
  sanitizeObject,
  sanitizeAttribute,
  isContentSafe,
  useSanitizedValue,
  useSanitizedObject,
};
