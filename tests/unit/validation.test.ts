import { describe, it, expect } from "vitest";
import {
  createLinkSchema,
  signUpSchema,
  createApiKeySchema,
  createReportSchema,
} from "@/lib/validation/schemas";

describe("Zod Validation Schemas", () => {
  it("should validate valid link creation payload", () => {
    const valid = createLinkSchema.safeParse({
      destinationUrl: "https://example.com/blog",
      customAlias: "blog-post",
      title: "My Blog",
      utmSource: "twitter",
    });
    expect(valid.success).toBe(true);
  });

  it("should reject invalid link creation when URL is missing", () => {
    const invalid = createLinkSchema.safeParse({
      customAlias: "my-alias",
    });
    expect(invalid.success).toBe(false);
  });

  it("should validate strong password requirements on sign up", () => {
    const valid = signUpSchema.safeParse({
      name: "Alex Vance",
      email: "alex@example.com",
      password: "Password123!",
      confirmPassword: "Password123!",
    });
    expect(valid.success).toBe(true);

    const mismatched = signUpSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "Password123!",
      confirmPassword: "DifferentPassword!",
    });
    expect(mismatched.success).toBe(false);

    const weak = signUpSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "weak",
      confirmPassword: "weak",
    });
    expect(weak.success).toBe(false);
  });

  it("should validate API key creation payload", () => {
    const valid = createApiKeySchema.safeParse({ name: "Production CLI" });
    expect(valid.success).toBe(true);

    const invalid = createApiKeySchema.safeParse({ name: "a" });
    expect(invalid.success).toBe(false);
  });

  it("should validate abuse report submissions", () => {
    const valid = createReportSchema.safeParse({
      shortUrl: "https://zaplink.app/xyz",
      reason: "phishing",
      description: "Phishing login attempt",
      reporterEmail: "victim@example.com",
    });
    expect(valid.success).toBe(true);
  });
});
