import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create DOMPurify instance for server-side usage
const window = new JSDOM("").window;
// @ts-ignore - DOMPurify types don't fully align with JSDOM
const purify = DOMPurify(window);

// Configure DOMPurify with strict settings
purify.setConfig({
  ALLOWED_TAGS: [], // No HTML tags allowed for plain text fields
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true, // Keep text content but strip tags
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
});

export const sanitizationUtils = {
  /**
   * Sanitize plain text input (removes all HTML/script tags)
   */
  sanitizeText(input: string | null | undefined): string | null {
    if (!input) return null;

    // Remove any HTML/script tags but keep text content
    const sanitized = purify.sanitize(input.toString(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    // Additional cleanup: trim whitespace and normalize line breaks
    return sanitized.trim().replace(/\r\n/g, '\n');
  },

  /**
   * Sanitize rich text input (allows basic formatting tags)
   */
  sanitizeRichText(input: string | null | undefined): string | null {
    if (!input) return null;

    // Allow basic formatting but no scripts or dangerous tags
    const sanitized = purify.sanitize(input.toString(), {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });

    return sanitized.trim();
  },

  /**
   * Sanitize email input
   */
  sanitizeEmail(input: string | null | undefined): string | null {
    if (!input) return null;

    // Remove any HTML and validate email format
    const sanitized = this.sanitizeText(input);
    if (!sanitized) return null;

    // Convert to lowercase and validate basic email pattern
    const email = sanitized.toLowerCase();
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    return emailRegex.test(email) ? email : null;
  },

  /**
   * Sanitize phone number
   */
  sanitizePhone(input: string | null | undefined): string | null {
    if (!input) return null;

    // Remove any HTML and keep only digits, spaces, +, -, (, )
    const sanitized = this.sanitizeText(input);
    if (!sanitized) return null;

    // Keep only valid phone characters
    return sanitized.replace(/[^0-9+\-() ]/g, '');
  },

  /**
   * Sanitize URL input
   */
  sanitizeUrl(input: string | null | undefined): string | null {
    if (!input) return null;

    const sanitized = this.sanitizeText(input);
    if (!sanitized) return null;

    try {
      // Validate URL format
      const url = new URL(sanitized);
      // Only allow http(s) protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return null;
      }
      return url.toString();
    } catch {
      // If not a valid URL, return null
      return null;
    }
  },

  /**
   * Sanitize number input
   */
  sanitizeNumber(input: string | number | null | undefined): number | null {
    if (input === null || input === undefined || input === '') return null;

    const num = typeof input === 'string' ? parseFloat(input) : input;
    return isNaN(num) ? null : num;
  },

  /**
   * Sanitize JSON value (for complex form data)
   */
  sanitizeJson(input: any): any {
    if (!input) return null;

    if (typeof input === 'string') {
      return this.sanitizeText(input);
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeJson(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, value] of Object.entries(input)) {
        // Sanitize both keys and values
        const sanitizedKey = this.sanitizeText(key);
        if (sanitizedKey) {
          sanitized[sanitizedKey] = this.sanitizeJson(value);
        }
      }
      return sanitized;
    }

    // For numbers, booleans, etc., return as is
    return input;
  },

  /**
   * Sanitize file metadata (not the file content itself)
   */
  sanitizeFileMetadata(metadata: {
    fileName?: string;
    originalName?: string;
    mimeType?: string;
    filePath?: string;
  }) {
    return {
      fileName: metadata.fileName ? this.sanitizeText(metadata.fileName) : null,
      originalName: metadata.originalName ? this.sanitizeText(metadata.originalName) : null,
      mimeType: metadata.mimeType ? this.sanitizeText(metadata.mimeType) : null,
      filePath: metadata.filePath ? this.sanitizeText(metadata.filePath) : null,
    };
  },

  /**
   * Validate and sanitize company name
   */
  sanitizeCompanyName(input: string | null | undefined): string | null {
    const sanitized = this.sanitizeText(input);
    if (!sanitized) return null;

    // Company names should be 2-100 characters
    if (sanitized.length < 2 || sanitized.length > 100) {
      return null;
    }

    return sanitized;
  },
};