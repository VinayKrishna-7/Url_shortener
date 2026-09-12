import crypto from "crypto";

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Reserved route names that cannot be used as custom aliases or short codes
export const RESERVED_WORDS = new Set([
  "api",
  "admin",
  "dashboard",
  "docs",
  "auth",
  "report",
  "sign-in",
  "sign-up",
  "forgot-password",
  "reset-password",
  "verify-email",
  "health",
  "status",
  "login",
  "logout",
  "register",
  "settings",
  "links",
  "analytics",
  "qr",
  "pricing",
  "terms",
  "privacy",
  "help",
  "about",
  "contact",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "_next",
  "static",
  "assets",
  "public",
]);

/**
 * Generates a collision-resistant random short code of specified length (default 6 chars).
 */
export function generateShortCode(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_ALPHABET[bytes[i] % BASE62_ALPHABET.length];
  }
  return result;
}

/**
 * Validates a custom alias for length, allowed characters, and reserved system words.
 */
export function validateCustomAlias(alias: string): { isValid: boolean; error?: string } {
  if (!alias || typeof alias !== "string") {
    return { isValid: false, error: "Alias is required" };
  }

  const trimmed = alias.trim().toLowerCase();

  if (trimmed.length < 3) {
    return { isValid: false, error: "Custom alias must be at least 3 characters long" };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: "Custom alias cannot exceed 50 characters" };
  }

  // Only alphanumeric, hyphens, and underscores allowed
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: "Custom alias can only contain letters, numbers, hyphens, and underscores" };
  }

  if (RESERVED_WORDS.has(trimmed)) {
    return { isValid: false, error: `"${alias}" is a reserved system keyword and cannot be used as an alias` };
  }

  return { isValid: true };
}
