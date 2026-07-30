import type { Allergy, CandidateFinding, FindingEvidence, Medication } from "../domain.js";
import { parseISODate } from "../dates.js";
import { normalizeClinicalText } from "../normalization.js";
import { canonicalIngredient, medicationEvidence, pairKey } from "./shared.js";

function allergyEvidence(allergy: Allergy): FindingEvidence {
  return {
    entityType: "allergy",
    entityId: allergy.id,
    provenance: allergy.provenance
  };
}

function chronologyQualifies(medication: Medication, allergy: Allergy): boolean {
  const medicationTime = parseISODate(medication.prescribedDate ?? medication.startDate);
  const allergyTime = parseISODate(allergy.recordedDate);
  return medicationTime === null || allergyTime === null || medicationTime >= allergyTime;
}

export function detectAllergyContradictions(
  medications: readonly Medication[],
  allergies: readonly Allergy[]
): readonly CandidateFinding[] {
  const findings: CandidateFinding[] = [];

  for (const medication of medications) {
    if (medication.status === "stopped" || medication.status === "historical") continue;
    const ingredient = canonicalIngredient(medication);
    if (ingredient === null) continue;

    for (const allergy of allergies) {
      const substance = normalizeClinicalText(
        allergy.substanceNormalized ?? allergy.substanceOriginal
      );
      if (
        allergy.patientId !== medication.patientId ||
        allergy.status === "inactive" ||
        substance === null ||
        substance !== ingredient ||
        !chronologyQualifies(medication, allergy)
      ) {
        continue;
      }

      const pair = pairKey(medication.id, allergy.id);
      findings.push({
        id: `allergy_contradiction:${pair}`,
        patientId: medication.patientId,
        type: "allergy_contradiction",
        severity: "high",
        title: `Possible ${ingredient} allergy contradiction`,
        explanation:
          "A medication record matches a normalized allergy substance, and the prescription is later than the allergy record or the chronology is uncertain.",
        evidence: [allergyEvidence(allergy), medicationEvidence(medication)],
        ruleId: "allergy-contradiction/v1",
        requiresEvidenceVerification: true,
        metadata: {
          normalizedIngredient: ingredient,
          chronologyUncertain:
            parseISODate(medication.prescribedDate ?? medication.startDate) === null ||
            parseISODate(allergy.recordedDate) === null
        }
      });
    }
  }

  return findings;
}
