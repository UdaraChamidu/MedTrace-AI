import type { ISODate, UUID } from "./domain.js";
import { parseISODate } from "./dates.js";
import { normalizeClinicalText } from "./normalization.js";

export interface ExplicitPatientIdentity {
  documentId: UUID;
  fullName: string | null;
  externalPatientId: string | null;
  dateOfBirth: ISODate | null;
  sex: string | null;
  ageYears: number | null;
  documentDate: ISODate | null;
}

export type IdentityReviewStatus = "consistent" | "conflicting" | "insufficient";

export interface IdentityConsistencyResult {
  status: IdentityReviewStatus;
  quarantine: boolean;
  conflictingFields: readonly (
    | "fullName"
    | "externalPatientId"
    | "dateOfBirth"
    | "sex"
    | "ageYears"
  )[];
  explanation: string;
}

function explicitMismatch(left: string | null, right: string | null): boolean {
  const a = normalizeClinicalText(left);
  const b = normalizeClinicalText(right);
  return a !== null && b !== null && a !== b;
}

function agesConflict(left: ExplicitPatientIdentity, right: ExplicitPatientIdentity): boolean {
  if (left.ageYears === null || right.ageYears === null) return false;
  if (
    !Number.isInteger(left.ageYears) ||
    !Number.isInteger(right.ageYears) ||
    left.ageYears < 0 ||
    right.ageYears < 0
  ) {
    return true;
  }
  const leftDate = parseISODate(left.documentDate);
  const rightDate = parseISODate(right.documentDate);
  if (leftDate === null || rightDate === null) {
    return Math.abs(left.ageYears - right.ageYears) > 1;
  }
  const elapsedYears = (rightDate - leftDate) / (365.2425 * 24 * 60 * 60 * 1000);
  const expectedRightAge = left.ageYears + elapsedYears;
  return Math.abs(right.ageYears - expectedRightAge) > 1.5;
}

export function checkIdentityConsistency(
  left: ExplicitPatientIdentity,
  right: ExplicitPatientIdentity
): IdentityConsistencyResult {
  const conflictingFields: IdentityConsistencyResult["conflictingFields"][number][] = [];

  if (explicitMismatch(left.fullName, right.fullName)) conflictingFields.push("fullName");
  if (explicitMismatch(left.externalPatientId, right.externalPatientId)) {
    conflictingFields.push("externalPatientId");
  }
  if (
    left.dateOfBirth !== null &&
    right.dateOfBirth !== null &&
    left.dateOfBirth !== right.dateOfBirth
  ) {
    conflictingFields.push("dateOfBirth");
  }
  if (explicitMismatch(left.sex, right.sex)) conflictingFields.push("sex");
  if (agesConflict(left, right)) conflictingFields.push("ageYears");

  if (conflictingFields.length > 0) {
    return {
      status: "conflicting",
      quarantine: true,
      conflictingFields,
      explanation:
        "Explicit patient identifiers conflict. Keep this document in needs_review and do not merge its clinical facts."
    };
  }

  const comparableValues = [
    left.fullName !== null && right.fullName !== null,
    left.externalPatientId !== null && right.externalPatientId !== null,
    left.dateOfBirth !== null && right.dateOfBirth !== null,
    left.sex !== null && right.sex !== null,
    left.ageYears !== null && right.ageYears !== null
  ];
  if (!comparableValues.some(Boolean)) {
    return {
      status: "insufficient",
      quarantine: true,
      conflictingFields: [],
      explanation:
        "The documents do not share enough explicit identity evidence to merge automatically."
    };
  }

  return {
    status: "consistent",
    quarantine: false,
    conflictingFields: [],
    explanation: "The available explicit patient identity fields are consistent."
  };
}
