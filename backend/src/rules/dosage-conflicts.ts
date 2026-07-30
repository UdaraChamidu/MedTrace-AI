import type {
  CandidateFinding,
  Medication,
  MedicationInstruction
} from "../domain.js";
import { normalizeClinicalText, normalizeFrequency } from "../normalization.js";
import { canonicalIngredient, medicationEvidence, pairKey } from "./shared.js";

type InstructionField = keyof MedicationInstruction;

const COMPARATORS: Readonly<Record<InstructionField, (value: string | null) => string | null>> =
  Object.freeze({
    strength: normalizeClinicalText,
    dose: normalizeClinicalText,
    frequency: normalizeFrequency,
    route: normalizeClinicalText,
    timing: normalizeClinicalText
  });

function differingExplicitFields(
  left: MedicationInstruction,
  right: MedicationInstruction
): readonly InstructionField[] {
  return (Object.keys(COMPARATORS) as InstructionField[]).filter((field) => {
    const normalize = COMPARATORS[field];
    const leftValue = normalize(left[field]);
    const rightValue = normalize(right[field]);
    return leftValue !== null && rightValue !== null && leftValue !== rightValue;
  });
}

function intentionalChange(left: Medication, right: Medication): boolean {
  if (left.explicitReplacementForId === right.id || right.explicitReplacementForId === left.id) {
    return true;
  }
  return left.status === "stopped" || right.status === "stopped";
}

export function detectDosageConflicts(
  medications: readonly Medication[]
): readonly CandidateFinding[] {
  const findings: CandidateFinding[] = [];

  for (let leftIndex = 0; leftIndex < medications.length; leftIndex += 1) {
    const left = medications[leftIndex];
    if (!left || left.status === "historical") continue;
    const ingredient = canonicalIngredient(left);
    if (ingredient === null) continue;

    for (let rightIndex = leftIndex + 1; rightIndex < medications.length; rightIndex += 1) {
      const right = medications[rightIndex];
      if (
        !right ||
        right.patientId !== left.patientId ||
        right.status === "historical" ||
        canonicalIngredient(right) !== ingredient ||
        intentionalChange(left, right)
      ) {
        continue;
      }

      const fields = differingExplicitFields(left.instruction, right.instruction);
      if (fields.length === 0) continue;

      const pair = pairKey(left.id, right.id);
      findings.push({
        id: `dosage_conflict:${pair}`,
        patientId: left.patientId,
        type: "dosage_conflict",
        severity: "high",
        title: `Conflicting ${ingredient} instructions`,
        explanation:
          "Two explicit instructions for the same normalized ingredient differ and are not documented as an intentional replacement or stop.",
        evidence: [medicationEvidence(left), medicationEvidence(right)],
        ruleId: "dosage-conflict/v1",
        requiresEvidenceVerification: true,
        metadata: { normalizedIngredient: ingredient, differingFields: fields.join(",") }
      });
    }
  }

  return findings;
}
