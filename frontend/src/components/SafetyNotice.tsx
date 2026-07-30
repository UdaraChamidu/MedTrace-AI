import { ShieldCheck } from "lucide-react";

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "safety-notice safety-notice-compact" : "safety-notice"}>
      <ShieldCheck aria-hidden="true" />
      <div>
        <strong>This application does not provide a diagnosis.</strong>
        <p>
          Do not start, stop, or change medication based on this result. Please verify high-risk or
          uncertain findings with a doctor or pharmacist.
        </p>
      </div>
    </div>
  );
}
