import type { Allergy, CandidateFinding, InteractionRule, Medication } from "../domain.js";
import { detectAllergyContradictions } from "./allergies.js";
import { detectDosageConflicts } from "./dosage-conflicts.js";
import { detectDuplicateMedications } from "./duplicates.js";
import {
  CURATED_INTERACTION_RULES,
  detectCuratedInteractions
} from "./interactions.js";

export interface ClinicalRuleInput {
  medications: readonly Medication[];
  allergies: readonly Allergy[];
  interactionRules?: readonly InteractionRule[];
}

export function runClinicalRules(input: ClinicalRuleInput): readonly CandidateFinding[] {
  return [
    ...detectDuplicateMedications(input.medications),
    ...detectDosageConflicts(input.medications),
    ...detectAllergyContradictions(input.medications, input.allergies),
    ...detectCuratedInteractions(
      input.medications,
      input.interactionRules ?? CURATED_INTERACTION_RULES
    )
  ].sort((left, right) => left.id.localeCompare(right.id));
}
