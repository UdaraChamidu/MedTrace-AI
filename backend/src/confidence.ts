import type { ConfidenceBand, ConfidenceInputs, ConfidenceResult } from "./domain.js";

const WEIGHTS: Readonly<Record<keyof ConfidenceInputs, number>> = Object.freeze({
  extractionQuality: 0.3,
  evidenceCompleteness: 0.25,
  crossDocumentConsistency: 0.2,
  normalizationCertainty: 0.15,
  verifierAgreement: 0.1
});

function assertUnitInterval(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be a finite number between 0 and 1`);
  }
}

export function confidenceBand(score: number): ConfidenceBand {
  assertUnitInterval("score", score);
  if (score >= 0.85) return "high";
  if (score >= 0.65) return "moderate";
  return "low";
}

export function calculateConfidence(inputs: ConfidenceInputs): ConfidenceResult {
  (Object.keys(WEIGHTS) as Array<keyof ConfidenceInputs>).forEach((key) =>
    assertUnitInterval(key, inputs[key])
  );

  const score = (Object.keys(WEIGHTS) as Array<keyof ConfidenceInputs>).reduce(
    (sum, key) => sum + inputs[key] * WEIGHTS[key],
    0
  );
  const roundedScore = Math.round(score * 10_000) / 10_000;
  const band = confidenceBand(roundedScore);
  const explanation =
    band === "high"
      ? "The uploaded evidence is strong and consistently supported."
      : band === "moderate"
        ? "The result is supported, but one or more evidence factors need review."
        : "The evidence is incomplete or uncertain and requires professional verification.";

  return { score: roundedScore, band, explanation };
}

export { WEIGHTS as CONFIDENCE_WEIGHTS };
