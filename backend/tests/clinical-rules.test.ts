import { describe, expect, it } from "vitest";
import {
  syntheticDemoAllergies,
  syntheticDemoMedications
} from "../src/demo.js";
import type { Medication } from "../src/domain.js";
import { detectAllergyContradictions } from "../src/rules/allergies.js";
import { detectDosageConflicts } from "../src/rules/dosage-conflicts.js";
import { detectDuplicateMedications } from "../src/rules/duplicates.js";
import { runClinicalRules } from "../src/rules/engine.js";
import { detectCuratedInteractions } from "../src/rules/interactions.js";

describe("deterministic clinical rules", () => {
  it("detects duplicate, dosage, allergy, and curated interaction candidates", () => {
    const findings = runClinicalRules({
      medications: syntheticDemoMedications,
      allergies: syntheticDemoAllergies
    });
    expect(findings.map((finding) => finding.type)).toEqual(
      expect.arrayContaining([
        "duplicate_medication",
        "dosage_conflict",
        "allergy_contradiction",
        "drug_interaction"
      ])
    );
    expect(findings.every((finding) => finding.requiresEvidenceVerification)).toBe(true);
  });

  it("does not flag an explicit stop/replacement as a duplicate or conflict", () => {
    const [first, second] = syntheticDemoMedications;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (!first || !second) return;
    const stopped: Medication = { ...first, status: "stopped", endDate: "2026-01-11" };
    const replacement: Medication = { ...second, explicitReplacementForId: stopped.id };
    expect(detectDuplicateMedications([stopped, replacement])).toHaveLength(0);
    expect(detectDosageConflicts([stopped, replacement])).toHaveLength(0);
  });

  it("does not flag a medication prescribed before a known allergy", () => {
    const medication = syntheticDemoMedications[3];
    const allergy = syntheticDemoAllergies[0];
    expect(medication).toBeDefined();
    expect(allergy).toBeDefined();
    if (!medication || !allergy) return;
    expect(
      detectAllergyContradictions(
        [{ ...medication, prescribedDate: "2025-01-01", startDate: "2025-01-01" }],
        [allergy]
      )
    ).toHaveLength(0);
  });

  it("does not imply comprehensive interaction coverage", () => {
    const findings = detectCuratedInteractions(syntheticDemoMedications);
    expect(findings.length).toBeGreaterThan(0);
    expect(
      findings.every((finding) => finding.metadata.coverage === "curated-demo-only")
    ).toBe(true);
  });
});
