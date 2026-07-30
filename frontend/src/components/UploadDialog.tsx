import {
  AlertTriangle,
  BadgeCheck,
  BrainCircuit,
  Check,
  FileImage,
  FileText,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatFileSize } from "../lib/format";
import type { UploadItem } from "../types";

function statusLabel(item: UploadItem) {
  if (item.status === "queued") return "Waiting";
  if (item.status === "uploading") return "Uploading securely";
  if (item.status === "analyzing") return "Extracting page evidence";
  if (item.status === "complete") return "Ready";
  return "Needs attention";
}

export function UploadDialog({
  open,
  onClose,
  mode = "upload",
}: {
  open: boolean;
  onClose: () => void;
  mode?: "upload" | "reprocess";
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setItems([]);
      return;
    }
    if (mode === "reprocess") {
      setItems([
        {
          id: "cached-records",
          name: "12 cached source documents",
          size: 18_200_000,
          progress: 6,
          status: "uploading",
        },
      ]);
    }
  }, [mode, open]);

  useEffect(() => {
    if (!open || !items.some((item) => item.status !== "complete")) return;
    const timer = window.setInterval(() => {
      setItems((current) =>
        current.map((item, index) => {
          if (item.status === "complete" || item.status === "error") return item;
          const increment = 5 + ((index * 3 + item.name.length) % 7);
          const next = Math.min(100, item.progress + increment);
          return {
            ...item,
            progress: next,
            status: next >= 100 ? "complete" : next >= 55 ? "analyzing" : "uploading",
          };
        }),
      );
    }, 380);
    return () => window.clearInterval(timer);
  }, [items, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const allComplete = items.length > 0 && items.every((item) => item.status === "complete");

  const addFiles = (files: FileList | File[]) => {
    const accepted = Array.from(files).filter((file) =>
      ["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(file.type),
    );
    setItems((current) => [
      ...current,
      ...accepted.map((file, index) => ({
        id: `${file.name}-${file.size}-${index}`,
        name: file.name,
        size: file.size,
        progress: 2,
        status: "uploading" as const,
      })),
    ]);
  };

  return (
    <>
      <button type="button" className="modal-scrim" onClick={onClose} aria-label="Close upload dialog" />
      <section className="upload-dialog" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <header className="upload-header">
          <div>
            <span className="upload-header-icon">
              {mode === "reprocess" ? <RefreshCw /> : <UploadCloud />}
            </span>
            <div>
              <p className="eyebrow">{mode === "reprocess" ? "Fresh workflow run" : "Secure intake"}</p>
              <h2 id="upload-title">
                {mode === "reprocess" ? "Reprocess patient record" : "Add medical documents"}
              </h2>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close upload dialog">
            <X size={19} />
          </button>
        </header>

        {mode === "upload" ? (
          <button type="button"
            className={`drop-zone ${isDragging ? "dragging" : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <span className="drop-icon">
              <UploadCloud />
            </span>
            <strong>Drop PDFs or images here</strong>
            <p>or choose multiple files from your device</p>
            <small>PDF, PNG, JPG or WebP · up to 20 MB each</small>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(event) => event.target.files && addFiles(event.target.files)}
              tabIndex={-1}
              aria-hidden="true"
            />
          </button>
        ) : (
          <div className="reprocess-note">
            <BrainCircuit size={21} />
            <div>
              <strong>Running the full evidence pipeline</strong>
              <p>Classify → extract → normalize → check → verify → index</p>
            </div>
          </div>
        )}

        {items.length ? (
          <div className="upload-list" aria-live="polite">
            <div className="upload-list-head">
              <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
              <span>{allComplete ? "Processing complete" : "Processing in background"}</span>
            </div>
            {items.map((item) => {
              const isImage = /\.(png|jpe?g|webp)$/i.test(item.name);
              return (
                <div className="upload-item" key={item.id}>
                  <span className="upload-file-icon">
                    {isImage ? <FileImage size={19} /> : <FileText size={19} />}
                  </span>
                  <div className="upload-file-info">
                    <div>
                      <strong>{item.name}</strong>
                      <small>{formatFileSize(item.size)}</small>
                    </div>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={`${item.progress}% complete`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={item.progress}
                    >
                      <span style={{ width: `${item.progress}%` }} />
                    </div>
                    <p>
                      {item.status === "complete" ? (
                        <Check size={13} />
                      ) : (
                        <LoaderCircle className="spin" size={13} />
                      )}
                      {statusLabel(item)} · {item.progress}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="upload-empty-tip">
            <AlertTriangle size={16} />
            <span>Scans and handwritten pages may be marked for human review.</span>
          </div>
        )}

        {allComplete ? (
          <div className="processing-complete" role="status">
            <BadgeCheck size={20} />
            <div>
              <strong>{mode === "reprocess" ? "Fresh verification complete" : "Files are ready"}</strong>
              <p>
                {mode === "reprocess"
                  ? "Cached results were refreshed deterministically for this demo."
                  : "Upload simulation is complete. Connect Supabase and n8n to extract real files."}
              </p>
            </div>
          </div>
        ) : null}

        <footer className="upload-footer">
          <span>
            <LockKeyhole size={14} /> Files are private in connected mode
          </span>
          <button type="button" className="button button-primary" onClick={onClose} disabled={!items.length}>
            {allComplete ? "View record" : "Continue in background"}
          </button>
        </footer>
      </section>
    </>
  );
}
