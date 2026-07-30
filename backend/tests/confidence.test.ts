import { describe, expect, it } from "vitest";
import { calculateConfidence, confidenceBand } from "../src/confidence.js";

describe("confidence calculation", () => {
  it("applies the published weighted formula", () => {
    const result = calculateConfidence({
      extractionQuality: 0.9,
      evidenceCompleteness: 0.8,
      crossDocumentConsistency: 0.7,
      normalizationCertainty: 1,
      verifierAgreement: 0.5
    });
    expect(result.score).toBe(0.81);
    expect(result.band).toBe("moderate");
  });

  it.each([
    [0.8499, "moderate"],
    [0.85, "high"],
    [0.65, "moderate"],
    [0.6499, "low"]
  ] as const)("maps %s to %s", (score, band) => {
    expect(confidenceBand(score)).toBe(band);
  });

  it("rejects values outside zero to one", () => {
    expect(() =>
      calculateConfidence({
        extractionQuality: 1.1,
        evidenceCompleteness: 1,
        crossDocumentConsistency: 1,
        normalizationCertainty: 1,
        verifierAgreement: 1
      })
    ).toThrow(RangeError);
  });
});
