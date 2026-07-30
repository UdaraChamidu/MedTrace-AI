import type { CandidateFinding, Medication } from "../domain.js";
import { parseISODate } from "../dates.js";
import { canonicalIngredient, medicationEvidence, pairKey } from "./shared.js";

function isPotentiallyActive(medication: Medication): boolean {
  return medication.status !== "stopped" && medication.status !== "historical";
}

function intervalsMayOverlap(left: Medication, right: Medication): boolean {
  const leftStart = parseISODate(left.startDate ?? left.prescribedDate);
  const rightStart = parseISODate(right.startDate ?? right.prescribedDate);
  const leftEnd = parseISODate(left.endDate);
  const rightEnd = parseISODate(right.endDate);

  if (leftStart !== null && rightEnd !== null && leftStart > rightEnd) return false;
  if (rightStart !== null && leftEnd !== null && rightStart > leftEnd) return false;
  return true;
}

function isExplicitReplacement(left: Medication, right: Medication): boolean {
  return (
    left.explicitReplacementForId === right.id || right.explicitReplacementForId === left.id
  );
}

export function detectDuplicateMedications(
  medications: readonly Medication[]
): readonly CandidateFinding[] {
  const findings: CandidateFinding[] = [];

  for (let leftIndex = 0; leftIndex < medications.length; leftIndex += 1) {
    const left = medications[leftIndex];
    if (!left || !isPotentiallyActive(left)) continue;
    const leftIngredient = canonicalIngredient(left);
    if (leftIngredient === null) continue;

    for (let rightIndex = leftIndex + 1; rightIndex < medications.length; rightIndex += 1) {
      const right = medications[rightIndex];
      if (!right || right.patientId !== left.patientId || !isPotentiallyActive(right)) continue;
      const rightIngredient = canonicalIngredient(right);
      if (
        rightIngredient === null ||
        rightIngredient !== leftIngredient ||
        isExplicitReplacement(left, right) ||
        !intervalsMayOverlap(left, right)
      ) {
        continue;
      }

      const pair = pairKey(left.id, right.id);
      findings.push({
        id: `duplicate_medication:${pair}`,
        patientId: left.patientId,
        type: "duplicate_medication",
        severity: "medium",
        title: `Possible duplicate ${leftIngredient} records`,
        explanation:
          "Two potentially active medication records have the same normalized ingredient and overlapping or unclear dates, without explicit stop or replacement evidence.",
        evidence: [medicationEvidence(left), medicationEvidence(right)],
        ruleId: "duplicate-medication/v1",
        requiresEvidenceVerification: true,
        metadata: { normalizedIngredient: leftIngredient }
      });
    }
  }

  return findings;
}
