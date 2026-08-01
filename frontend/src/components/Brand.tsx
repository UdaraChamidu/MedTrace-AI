import { Anchor } from "lucide-react";
import { Link } from "../lib/router";
import { cx } from "../lib/format";

export function Brand({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cx("brand", inverse && "brand-inverse")}
      aria-label="MediTrace AI home"
    >
      <span className="brand-mark" aria-hidden="true">
        <Anchor size={compact ? 17 : 20} strokeWidth={2.2} />
      </span>
      <span className={compact ? "text-base" : "text-lg"}>
        MediTrace <span>AI</span>
      </span>
    </Link>
  );
}
