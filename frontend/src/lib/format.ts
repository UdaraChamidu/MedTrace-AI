import type { ConfidenceBand, RiskLevel } from "../types";

export function confidenceBand(score: number): ConfidenceBand {
  if (score >= 0.85) return "High";
  if (score >= 0.65) return "Moderate";
  return "Low";
}

export function confidencePercent(score: number) {
  return `${Math.round(score * 100)}%`;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function riskLabel(risk: RiskLevel) {
  if (risk === "high") return "High risk";
  if (risk === "moderate") return "Review";
  return "Informational";
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
