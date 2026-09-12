import { describe, it, expect } from "vitest";
import { validateDestinationUrl, hashIpAddress, sanitizeString } from "@/lib/security/url-guard";

describe("Security & Threat Mitigation", () => {
  it("should accept valid public HTTPS URLs", () => {
    const res = validateDestinationUrl("https://example.com/products/item-123");
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe("https://example.com/products/item-123");
  });

  it("should normalize and prepend https to bare domains", () => {
    const res = validateDestinationUrl("github.com/trending");
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe("https://github.com/trending");
  });

  it("should reject localhost and loopback addresses (SSRF defense)", () => {
    expect(validateDestinationUrl("http://localhost:3000/secret").isValid).toBe(false);
    expect(validateDestinationUrl("http://127.0.0.1/admin").isValid).toBe(false);
    expect(validateDestinationUrl("http://0.0.0.0").isValid).toBe(false);
    expect(validateDestinationUrl("http://169.254.169.254/latest/meta-data").isValid).toBe(false);
  });

  it("should reject private internal IPv4 ranges", () => {
    expect(validateDestinationUrl("http://10.0.0.1/dashboard").isValid).toBe(false);
    expect(validateDestinationUrl("http://192.168.1.1/router").isValid).toBe(false);
    expect(validateDestinationUrl("http://172.20.0.5/api").isValid).toBe(false);
  });

  it("should reject dangerous non-http protocols", () => {
    expect(validateDestinationUrl("javascript:alert(1)").isValid).toBe(false);
    expect(validateDestinationUrl("data:text/html,<html>").isValid).toBe(false);
    expect(validateDestinationUrl("file:///etc/passwd").isValid).toBe(false);
  });

  it("should anonymously hash IP addresses deterministically with salt", () => {
    const hash1 = hashIpAddress("192.0.2.1");
    const hash2 = hashIpAddress("192.0.2.1");
    const hashOther = hashIpAddress("198.51.100.2");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashOther);
    expect(hash1).toHaveLength(16);
  });

  it("should sanitize strings against XSS injection", () => {
    const sanitized = sanitizeString("<script>alert('xss')</script>");
    expect(sanitized).not.toContain("<script>");
    expect(sanitized).toContain("&lt;script&gt;");
  });
});
