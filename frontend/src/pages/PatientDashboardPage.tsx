import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Beaker,
  BookOpenText,
  CalendarClock,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  MessageSquareText,
  MoreHorizontal,
  Pill,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "../lib/router";
import { AppShell } from "../components/AppShell";
import {
  AskView,
  FindingsView,
  LabsView,
  MedicationsView,
  OverviewView,
  TimelineView,
} from "../components/DashboardViews";
import { EvidenceDrawer } from "../components/EvidenceDrawer";
import { ErrorState, LoadingState } from "../components/Ui";
import { UploadDialog } from "../components/UploadDialog";
import { dataAdapter } from "../lib/data-adapter";
import type { Citation } from "../types";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "timeline", label: "Timeline", icon: CalendarClock },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "labs", label: "Labs", icon: Beaker },
  { id: "findings", label: "Findings", icon: ShieldAlert },
  { id: "ask", label: "Ask", icon: MessageSquareText },
];

export function PatientDashboardPage() {
  const { patientId = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") ?? "overview";
  const [evidence, setEvidence] = useState<Citation | null>(null);
  const [uploadOpen, setUploadOpen] = useState(searchParams.get("upload") === "1");
  const [uploadMode, setUploadMode] = useState<"upload" | "reprocess">("upload");

  const record = useQuery({
    queryKey: ["patient-record", patientId],
    queryFn: () => dataAdapter.getPatientRecord(patientId),
    enabled: Boolean(patientId),
  });

  useEffect(() => {
    if (searchParams.get("upload") === "1") {
      const next = new URLSearchParams(searchParams);
      next.delete("upload");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openTab = useCallback(
    (tab: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("tab", tab);
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const openEvidence = useCallback(
    (citationId: string) => {
      const found = record.data?.citations.find((item) => item.id === citationId) ?? null;
      setEvidence(found);
    },
    [record.data?.citations],
  );

  const navItems = useMemo(
    () => [
      { to: "/patients", label: "All patients", icon: <Users size={18} /> },
      { to: `/patients/${patientId}`, label: "Record overview", icon: <LayoutDashboard size={18} /> },
      {
        to: `/patients/${patientId}?tab=findings`,
        label: "Review findings",
        icon: <ClipboardList size={18} />,
      },
      { to: `/patients/${patientId}?tab=ask`, label: "Ask the record", icon: <Sparkles size={18} /> },
      { to: "/patients/new", label: "New workspace", icon: <FilePlus2 size={18} /> },
    ],
    [patientId],
  );

  if (record.isPending) {
    return (
      <AppShell navItems={navItems}>
        <LoadingState label="Opening evidence-linked record…" />
      </AppShell>
    );
  }

  if (record.isError || !record.data) {
    return (
      <AppShell navItems={navItems}>
        <div className="page-container">
          <Link className="back-link" to="/patients">
            <ArrowLeft size={16} /> Back to patient workspaces
          </Link>
          <ErrorState
            title={record.data === null ? "Patient workspace not found" : undefined}
            onRetry={() => void record.refetch()}
          />
        </div>
      </AppShell>
    );
  }

  const patientRecord = record.data;
  const activeTab = tabs.some((tab) => tab.id === currentTab) ? currentTab : "overview";

  return (
    <AppShell navItems={navItems} patientName={patientRecord.patient.name}>
      <div className="patient-page">
        <header className="patient-header">
          <div className="patient-title">
            <span className="patient-avatar patient-avatar-large">{patientRecord.patient.initials}</span>
            <div>
              <div className="patient-title-line">
                <h1>{patientRecord.patient.name}</h1>
                {patientRecord.patient.isDemo ? (
                  <span className="badge badge-synthetic">Synthetic walkthrough</span>
                ) : null}
              </div>
              <p>
                Born {patientRecord.patient.birthYear}
                <span>·</span>
                {patientRecord.patient.documentCount} documents
                <span>·</span>
                Updated {patientRecord.patient.lastUpdated}
              </p>
            </div>
          </div>
          <div className="patient-actions">
            <button type="button"
              className="button button-secondary"
              onClick={() => {
                setUploadMode("reprocess");
                setUploadOpen(true);
              }}
            >
              <RefreshCw size={16} /> Reprocess
            </button>
            <button type="button"
              className="button button-primary"
              onClick={() => {
                setUploadMode("upload");
                setUploadOpen(true);
              }}
            >
              <UploadCloud size={17} /> Add documents
            </button>
            <button type="button" className="icon-button" aria-label="More patient actions">
              <MoreHorizontal size={19} />
            </button>
          </div>
        </header>

        {patientRecord.patient.isDemo ? (
          <div className="synthetic-disclosure">
            <BookOpenText size={17} />
            <p>
              <strong>Synthetic clinical fixture:</strong> allergy and lab-trend examples on this
              page were created for the walkthrough and are not claims about the supplied YGC image
              set.
            </p>
          </div>
        ) : null}

        <nav className="record-tabs" aria-label="Patient record sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button type="button"
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => openTab(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <Icon size={16} />
                {tab.label}
                {tab.id === "findings" && patientRecord.findings.length ? (
                  <span>{patientRecord.findings.length}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="record-content">
          {activeTab === "overview" ? (
            <OverviewView record={patientRecord} openEvidence={openEvidence} openTab={openTab} />
          ) : null}
          {activeTab === "timeline" ? (
            <TimelineView events={patientRecord.events} openEvidence={openEvidence} />
          ) : null}
          {activeTab === "medications" ? (
            <MedicationsView
              medications={patientRecord.medications}
              findings={patientRecord.findings}
              openEvidence={openEvidence}
            />
          ) : null}
          {activeTab === "labs" ? (
            <LabsView labs={patientRecord.labs} openEvidence={openEvidence} />
          ) : null}
          {activeTab === "findings" ? (
            <FindingsView
              findings={patientRecord.findings}
              citations={patientRecord.citations}
              openEvidence={openEvidence}
            />
          ) : null}
          {activeTab === "ask" ? (
            <AskView citations={patientRecord.citations} openEvidence={openEvidence} />
          ) : null}
        </div>
      </div>

      <EvidenceDrawer citation={evidence} onClose={() => setEvidence(null)} />
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} mode={uploadMode} />
    </AppShell>
  );
}
