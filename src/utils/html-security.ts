import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'class', 'data-user-id'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitizes HTML for rich text content (more permissive)
 */
export const sanitizeRichHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'class', 'data-user-id', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Escapes HTML entities to prevent XSS
 */
export const escapeHtml = (str: string): string => {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
};

/**
 * Creates safe HTML for mentions
 */
export const createSafeMention = (username: string, userId: string): string => {
  return `<span class="mention" data-user-id="${escapeHtml(userId)}">@${escapeHtml(username)}</span>`;
};
