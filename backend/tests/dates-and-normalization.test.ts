import { describe, expect, it } from "vitest";
import { parseISODate } from "../src/dates.js";
import {
  normalizeClinicalText,
  normalizeFrequency,
  sameNormalizedValue
} from "../src/normalization.js";

describe("date parsing", () => {
  it("parses real ISO calendar dates and rejects rollover dates", () => {
    expect(parseISODate("2024-02-29")).toBe(Date.UTC(2024, 1, 29));
    expect(parseISODate("2025-02-29")).toBeNull();
    expect(parseISODate("2026-13-01")).toBeNull();
  });
});

describe("clinical text normalization", () => {
  it("normalizes case, spacing, and common frequencies", () => {
    expect(normalizeClinicalText("  WARFARIN   5 mg ")).toBe("warfarin 5 mg");
    expect(normalizeFrequency("BID")).toBe("twice daily");
    expect(sameNormalizedValue("Oral", " oral ")).toBe(true);
  });
});
