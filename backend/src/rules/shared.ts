import type { FindingEvidence, Medication } from "../domain.js";
import { normalizeClinicalText } from "../normalization.js";

export function canonicalIngredient(medication: Medication): string | null {
  return normalizeClinicalText(medication.normalizedIngredient ?? medication.normalizedName);
}

export function medicationEvidence(medication: Medication): FindingEvidence {
  return {
    entityType: "medication",
    entityId: medication.id,
    provenance: medication.provenance
  };
}

export function pairKey(leftId: string, rightId: string): string {
  return [leftId, rightId].sort((a, b) => a.localeCompare(b)).join(":");
}

export function groupByPatient<T extends { patientId: string }>(
  values: readonly T[]
): ReadonlyMap<string, readonly T[]> {
  const grouped = new Map<string, T[]>();
  for (const value of values) {
    const existing = grouped.get(value.patientId) ?? [];
    existing.push(value);
    grouped.set(value.patientId, existing);
  }
  return grouped;
}
