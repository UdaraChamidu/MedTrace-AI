import {
  AlertCircle,
  BadgeCheck,
  CircleAlert,
  CircleHelp,
  Info,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import type { ReactNode } from "react";
import { confidenceBand, confidencePercent, cx, riskLabel } from "../lib/format";
import type { RiskLevel } from "../types";

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const Icon = risk === "high" ? ShieldAlert : risk === "moderate" ? CircleAlert : Info;
  return (
    <span className={cx("badge", `badge-risk-${risk}`)}>
      <Icon size={13} aria-hidden="true" />
      {riskLabel(risk)}
    </span>
  );
}

export function ConfidenceBadge({ score }: { score: number }) {
  const band = confidenceBand(score);
  const Icon = band === "High" ? BadgeCheck : band === "Moderate" ? CircleHelp : AlertCircle;
  return (
    <span className={cx("badge", `badge-confidence-${band.toLowerCase()}`)}>
      <Icon size={13} aria-hidden="true" />
      {band} confidence · {confidencePercent(score)}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        {icon ?? <CircleHelp />}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function LoadingState({ label = "Loading secure workspace…" }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = "We couldn’t load this workspace",
  onRetry,
}: {
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>Your cached demo data is still safe. Check your connection and try again.</p>
        {onRetry ? (
          <button type="button" className="button button-secondary button-small" onClick={onRetry}>
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
}
