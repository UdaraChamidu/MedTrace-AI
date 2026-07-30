export type RiskLevel = "high" | "moderate" | "informational";
export type ConfidenceBand = "High" | "Moderate" | "Low";
export type DocumentStatus = "verified" | "review" | "processing";

export interface Citation {
  id: string;
  documentId: string;
  documentName: string;
  page: number;
  date: string;
  label: string;
  snippet: string;
  highlightedText: string;
  pageContent: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  year: string;
  type: "visit" | "medication" | "laboratory" | "allergy";
  title: string;
  provider: string;
  summary: string;
  tags: string[];
  citationId: string;
}

export interface Medication {
  id: string;
  name: string;
  ingredient: string;
  instruction: string;
  status: "Active" | "Completed" | "Needs review";
  started: string;
  provider: string;
  confidence: number;
  citationId: string;
}

export interface LabPoint {
  date: string;
  label: string;
  value: number;
}

export interface LabSeries {
  id: string;
  name: string;
  unit: string;
  rangeLow: number;
  rangeHigh: number;
  direction: "Rising" | "Falling" | "Stable";
  explanation: string;
  points: LabPoint[];
  citationId: string;
}

export interface Finding {
  id: string;
  type: "Allergy contradiction" | "Potential interaction" | "Dosage conflict" | "Duplicate therapy";
  title: string;
  summary: string;
  risk: RiskLevel;
  confidence: number;
  confidenceReason: string;
  status: "Evidence verified" | "Needs review";
  citationIds: string[];
  recommendedAction: string;
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  birthYear: number;
  recordLabel: string;
  lastUpdated: string;
  documentCount: number;
  findingCount: number;
  status: "Ready" | "Processing" | "Needs review";
  isDemo?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  risk?: RiskLevel;
  confidence?: number;
  answerStatus?: "supported" | "partially_supported" | "insufficient";
}

export interface PatientRecord {
  patient: Patient;
  citations: Citation[];
  events: TimelineEvent[];
  medications: Medication[];
  labs: LabSeries[];
  findings: Finding[];
}

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "queued" | "uploading" | "analyzing" | "complete" | "error";
}
