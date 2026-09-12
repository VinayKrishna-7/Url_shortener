import { describe, it, expect } from "vitest";
import { generateShortCode, validateCustomAlias, RESERVED_WORDS } from "@/lib/shortcode/generator";

describe("Shortcode Generator & Alias Validation", () => {
  it("should generate random alphanumeric codes with specified length", () => {
    const code6 = generateShortCode(6);
    const code8 = generateShortCode(8);

    expect(code6).toHaveLength(6);
    expect(code8).toHaveLength(8);
    expect(/^[0-9a-zA-Z]+$/.test(code6)).toBe(true);
    expect(/^[0-9a-zA-Z]+$/.test(code8)).toBe(true);
  });

  it("should validate custom aliases correctly", () => {
    const valid = validateCustomAlias("summer-sale-2026");
    expect(valid.isValid).toBe(true);

    const tooShort = validateCustomAlias("ab");
    expect(tooShort.isValid).toBe(false);

    const invalidChars = validateCustomAlias("my link with spaces!");
    expect(invalidChars.isValid).toBe(false);
  });

  it("should reject reserved system words as aliases", () => {
    const reservedWords = Array.from(RESERVED_WORDS);
    for (const word of reservedWords.slice(0, 10)) {
      const result = validateCustomAlias(word);
      expect(result.isValid).toBe(false);
    }
  });
});
