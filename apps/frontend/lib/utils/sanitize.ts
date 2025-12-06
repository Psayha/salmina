/**
 * @file sanitize.ts
 * @description HTML sanitization utilities for XSS protection
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses DOMPurify with safe defaults
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    // Allow safe HTML tags for content display
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'id', 'style',
    ],
    // Force all links to open in new tab with security attributes
    ADD_ATTR: ['target', 'rel'],
    // Prevent javascript: URLs
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
}

/**
 * Sanitize HTML and add security attributes to links
 */
export function sanitizeHtmlWithSecureLinks(dirty: string): string {
  const clean = sanitizeHtml(dirty);

  // Add rel="noopener noreferrer" and target="_blank" to all links
  return clean.replace(
    /<a\s+([^>]*?)href=/gi,
    '<a $1rel="noopener noreferrer" target="_blank" href='
  );
}
