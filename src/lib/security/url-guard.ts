import crypto from "crypto";

const DISALLOWED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "zaplink.app",
  "api.zaplink.app",
  "metadata.google.internal",
  "169.254.169.254", // AWS/Cloud metadata service
]);

const SUSPICIOUS_DOMAIN_PATTERNS = [
  /evil-phishing/i,
  /free-crypto-giveaway/i,
  /account-verification-login/i,
  /secure-paypal-update/i,
  /apple-id-verify/i,
  /bank-login-secure/i,
];

/**
 * Validates a destination URL against SSRF, dangerous protocols, and malicious patterns.
 */
export function validateDestinationUrl(urlStr: string): { isValid: boolean; error?: string; cleanUrl?: string } {
  if (!urlStr || typeof urlStr !== "string") {
    return { isValid: false, error: "URL is required" };
  }

  const trimmed = urlStr.trim();
  if (trimmed.length > 2048) {
    return { isValid: false, error: "URL exceeds maximum allowed length of 2048 characters" };
  }

  // Explicitly reject dangerous or non-http URI schemes
  if (/^(javascript|data|file|vbscript|about|blob|ftp):/i.test(trimmed)) {
    return { isValid: false, error: "Only HTTP and HTTPS protocols are allowed" };
  }

  // Prepend https:// if missing protocol
  let normalized = trimmed;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { isValid: false, error: "Invalid URL format" };
  }

  // Protocol check: only http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { isValid: false, error: "Only HTTP and HTTPS protocols are allowed" };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Disallow localhost and known cloud metadata endpoints
  if (DISALLOWED_HOSTNAMES.has(hostname)) {
    return { isValid: false, error: "URLs pointing to internal or localhost addresses are not permitted" };
  }

  // Check for private IPv4 ranges (10.x, 192.168.x, 172.16-31.x, 127.x, 169.254.x)
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const ipMatch = hostname.match(ipv4Regex);
  if (ipMatch) {
    const [, o1, o2] = ipMatch.map(Number);
    if (
      o1 === 10 ||
      o1 === 127 ||
      o1 === 0 ||
      (o1 === 192 && o2 === 168) ||
      (o1 === 172 && o2 >= 16 && o2 <= 31) ||
      (o1 === 169 && o2 === 254)
    ) {
      return { isValid: false, error: "Private or internal IP addresses are prohibited" };
    }
  }

  // Check against suspicious domain patterns
  for (const pattern of SUSPICIOUS_DOMAIN_PATTERNS) {
    if (pattern.test(hostname)) {
      return { isValid: false, error: "The provided URL appears to be flagged as potentially unsafe" };
    }
  }

  return { isValid: true, cleanUrl: parsed.toString() };
}

/**
 * Anonymously hash an IP address using SHA-256 with a salt to respect user privacy.
 */
export function hashIpAddress(ip: string | null | undefined): string {
  if (!ip) return "anonymous";
  const salt = process.env.IP_SALT || "zaplink_default_privacy_salt";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex").substring(0, 16);
}

/**
 * Sanitize plain string input against XSS.
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
