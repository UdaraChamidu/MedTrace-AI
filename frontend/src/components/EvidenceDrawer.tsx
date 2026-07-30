import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  FileText,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Citation } from "../types";

export function EvidenceDrawer({
  citation,
  onClose,
}: {
  citation: Citation | null;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!citation) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [citation, onClose]);

  if (!citation) return null;

  return (
    <>
      <button type="button" className="drawer-scrim" onClick={onClose} aria-label="Close evidence drawer" />
      <aside className="evidence-drawer" role="dialog" aria-modal="true" aria-labelledby="evidence-title">
        <header className="drawer-header">
          <div>
            <p className="eyebrow">Source evidence</p>
            <h2 id="evidence-title">{citation.documentName}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close evidence drawer">
            <X size={19} />
          </button>
        </header>

        <div className="evidence-meta">
          <span>
            <FileText size={14} /> Page {citation.page}
          </span>
          <span>{citation.date}</span>
          <span className="verified-source">
            <BadgeCheck size={14} /> Citation verified
          </span>
        </div>

        <div className="viewer-toolbar">
          <div>
            <button type="button" className="icon-button" aria-label="Previous page" disabled>
              <ArrowLeft size={17} />
            </button>
            <span>
              Page {citation.page} of {citation.page}
            </span>
            <button type="button" className="icon-button" aria-label="Next page" disabled>
              <ArrowRight size={17} />
            </button>
          </div>
          <div>
            <button type="button"
              className="icon-button"
              onClick={() => setZoom((value) => Math.max(80, value - 10))}
              aria-label="Zoom out"
            >
              <ZoomOut size={17} />
            </button>
            <span>{zoom}%</span>
            <button type="button"
              className="icon-button"
              onClick={() => setZoom((value) => Math.min(130, value + 10))}
              aria-label="Zoom in"
            >
              <ZoomIn size={17} />
            </button>
            <button type="button" className="icon-button" aria-label="Fit page">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        <div className="document-stage">
          <article
            className="source-page"
            style={{ transform: `scale(${zoom / 100})` }}
            aria-label={`Styled preview of ${citation.documentName}, page ${citation.page}`}
          >
            <div className="source-letterhead">
              <span className="source-symbol">CH</span>
              <div>
                <strong>Clinical record extract</strong>
                <small>Source-preserving preview</small>
              </div>
              <span className="source-page-number">Page {citation.page}</span>
            </div>
            <div className="source-rule" />
            {citation.pageContent.map((line, index) => {
              const highlighted = line.includes(citation.highlightedText);
              return (
                <p key={`${line}-${index}`} className={highlighted ? "source-highlight" : undefined}>
                  {line}
                </p>
              );
            })}
            <footer>
              Styled text view for the cached walkthrough. Connected mode opens the original private
              source page.
            </footer>
          </article>
        </div>

        <div className="evidence-excerpt">
          <div className="evidence-excerpt-head">
            <span>Anchored excerpt</span>
            <BadgeCheck size={15} />
          </div>
          <blockquote>“{citation.snippet}”</blockquote>
          <p>
            The central claim is linked to this page. Text matching and patient ownership are
            validated before display.
          </p>
        </div>

        <footer className="drawer-footer">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="button button-primary">
            Open full document <ExternalLink size={15} />
          </button>
        </footer>
      </aside>
    </>
  );
}
