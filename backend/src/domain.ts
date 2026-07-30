export type UUID = string;
export type ISODate = `${number}-${number}-${number}`;

export type ConfidenceBand = "low" | "moderate" | "high";
export type RiskSeverity = "informational" | "low" | "medium" | "high" | "critical";
export type FindingType =
  | "duplicate_medication"
  | "dosage_conflict"
  | "allergy_contradiction"
  | "drug_interaction";

export interface Provenance {
  documentId: UUID;
  page: number;
  sourceText: string;
  extractionConfidence: number;
}

export interface MedicationInstruction {
  strength: string | null;
  dose: string | null;
  frequency: string | null;
  route: string | null;
  timing: string | null;
}

export type MedicationStatus =
  | "prescribed"
  | "continued"
  | "changed"
  | "stopped"
  | "historical"
  | "unknown";

export interface Medication {
  id: UUID;
  patientId: UUID;
  originalName: string;
  normalizedName: string | null;
  normalizedIngredient: string | null;
  rxcui: string | null;
  normalizationConfidence: number;
  instruction: MedicationInstruction;
  status: MedicationStatus;
  prescribedDate: ISODate | null;
  startDate: ISODate | null;
  endDate: ISODate | null;
  explicitReplacementForId: UUID | null;
  provenance: Provenance;
}

export interface Allergy {
  id: UUID;
  patientId: UUID;
  substanceOriginal: string;
  substanceNormalized: string | null;
  reaction: string | null;
  recordedDate: ISODate | null;
  status: "active" | "inactive" | "unknown";
  provenance: Provenance;
}

export interface InteractionRule {
  id: string;
  ingredients: readonly [string, string];
  severity: Exclude<RiskSeverity, "informational">;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  sourceVersion: string;
}

export interface FindingEvidence {
  entityType: "medication" | "allergy";
  entityId: UUID;
  provenance: Provenance;
}

export interface CandidateFinding {
  id: string;
  patientId: UUID;
  type: FindingType;
  severity: RiskSeverity;
  title: string;
  explanation: string;
  evidence: readonly FindingEvidence[];
  ruleId: string;
  requiresEvidenceVerification: true;
  metadata: Readonly<Record<string, string | number | boolean | null>>;
}

export interface ConfidenceInputs {
  extractionQuality: number;
  evidenceCompleteness: number;
  crossDocumentConsistency: number;
  normalizationCertainty: number;
  verifierAgreement: number;
}

export interface ConfidenceResult {
  score: number;
  band: ConfidenceBand;
  explanation: string;
}

export interface Citation {
  documentId: UUID;
  page: number;
  snippet: string;
}

export interface CitationDocument {
  id: UUID;
  patientId: UUID;
  pageCount: number;
}

export interface CitationPage {
  documentId: UUID;
  page: number;
  text: string;
}

export interface CitationValidationContext {
  patientId: UUID;
  documents: readonly CitationDocument[];
  pages: readonly CitationPage[];
}

export interface CitationValidationResult {
  valid: boolean;
  errors: readonly string[];
}

export const SAFETY_MESSAGES = Object.freeze({
  noDiagnosis: "This application does not provide a diagnosis.",
  noMedicationChange: "Do not start, stop, or change medication based on this result.",
  professionalReview:
    "Please verify high-risk or uncertain findings with a doctor or pharmacist."
});
