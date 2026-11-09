import { describe, it, expect } from "vitest";
import { t, translations } from "../translations";

describe("t (translation helper)", () => {
  it("returns English string for known key", () => {
    expect(t("en", "correct")).toBe("Correct!");
  });

  it("returns Greek string for known key", () => {
    expect(t("el", "correct")).toBe("Σωστά!");
  });

  it("falls back to English for unknown language", () => {
    expect(t("fr", "correct")).toBe("Correct!");
  });

  it("returns the key itself for unknown key", () => {
    expect(t("en", "nonExistentKey")).toBe("nonExistentKey");
  });

  it("calls function keys with args for English", () => {
    const result = t("en", "incorrect", "Attica");
    expect(result).toBe("Incorrect! Try again to find Attica");
  });

  it("calls function keys with args for Greek", () => {
    const result = t("el", "incorrect", "Αττική");
    expect(result).toBe("Λάθος! Προσπαθήστε ξανά: Αττική");
  });

  it("formats progress string with all counts", () => {
    const result = t("en", "progress", 10, 2, 5);
    expect(result).toBe("10 identified, 2 skipped, 5 remaining");
  });

  it("formats foundCount string", () => {
    expect(t("en", "foundCount", 12, 55)).toBe("You found 12 of 55 regions.");
    expect(t("el", "foundCount", 12, 55)).toBe("Βρήκατε 12 από 55 περιοχές.");
  });

  it("defines the same keys in both languages", () => {
    expect(Object.keys(translations.el).sort()).toEqual(
      Object.keys(translations.en).sort()
    );
  });

  it("returns appTitle for both languages", () => {
    expect(t("en", "appTitle")).toBe("Greece Geography Quiz");
    expect(t("el", "appTitle")).toBe("Κουίζ Γεωγραφίας Ελλάδας");
  });
});
