import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  FilePlus2,
  FolderHeart,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "../lib/router";
import { AppShell } from "../components/AppShell";
import { EmptyState, ErrorState, LoadingState, SectionHeading } from "../components/Ui";
import { dataAdapter } from "../lib/data-adapter";
import { cx } from "../lib/format";

const navItems = [
  { to: "/patients", label: "Patients", icon: <Users size={18} /> },
  { to: "/patients/new", label: "New workspace", icon: <FilePlus2 size={18} /> },
];

export function PatientListPage() {
  const navigate = useNavigate();
  const patients = useQuery({
    queryKey: ["patients"],
    queryFn: () => dataAdapter.listPatients(),
  });

  return (
    <AppShell navItems={navItems}>
      <div className="page-container">
        <div className="demo-mode-banner">
          <span className="demo-banner-icon">
            <Sparkles size={16} />
          </span>
          <div>
            <strong>Cached walkthrough is ready</strong>
            <p>
              The Maya Fernando record is synthetic and separate from the supplied competition
              images. It demonstrates the complete evidence workflow without cloud credentials.
            </p>
          </div>
          <Link className="button button-white button-small" to="/patients/competition-case">
            Open walkthrough <ArrowRight size={15} />
          </Link>
        </div>

        <SectionHeading
          eyebrow="Workspace"
          title="Patient records"
          description="Organize each person’s documents, chronology, and evidence in a separate workspace."
          action={
            <Link className="button button-primary" to="/patients/new">
              <Plus size={17} /> Create patient
            </Link>
          }
        />

        <div className="list-toolbar">
          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search patients</span>
            <input placeholder="Search patient workspaces…" />
          </label>
          <span className="privacy-caption">
            <ShieldCheck size={15} /> Workspaces are isolated by patient
          </span>
        </div>

        {patients.isPending ? <LoadingState label="Loading patient workspaces…" /> : null}
        {patients.isError ? <ErrorState onRetry={() => void patients.refetch()} /> : null}
        {patients.data?.length === 0 ? (
          <EmptyState
            icon={<FolderHeart />}
            title="Create your first patient workspace"
            description="Keep documents and findings isolated by person from the moment they are uploaded."
            action={
              <Link className="button button-primary" to="/patients/new">
                <Plus size={17} /> Create patient
              </Link>
            }
          />
        ) : null}

        {patients.data?.length ? (
          <div className="patient-grid">
            {patients.data.map((patient) => (
              <article
                key={patient.id}
                className={cx("patient-card", patient.isDemo && "patient-card-featured")}
              >
                {patient.isDemo ? <span className="patient-featured-label">Synthetic case</span> : null}
                <div className="patient-card-head">
                  <span className="patient-avatar">{patient.initials}</span>
                  <button type="button" className="icon-button" aria-label={`More options for ${patient.name}`}>
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <div className="patient-card-copy">
                  <h2>{patient.name}</h2>
                  <p>
                    Born {patient.birthYear} · {patient.recordLabel}
                  </p>
                </div>
                <div className="patient-card-stats">
                  <div>
                    <strong>{patient.documentCount}</strong>
                    <span>Documents</span>
                  </div>
                  <div>
                    <strong>{patient.findingCount}</strong>
                    <span>Review items</span>
                  </div>
                  <div>
                    <span className={cx("status-dot", patient.status.toLowerCase().replace(" ", "-"))} />
                    <span>{patient.status}</span>
                  </div>
                </div>
                <div className="patient-card-foot">
                  <small>Updated {patient.lastUpdated}</small>
                  <button type="button"
                    className="text-button"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    Open record <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
            <Link className="patient-card patient-card-new" to="/patients/new">
              <span className="new-patient-icon">
                <Plus />
              </span>
              <strong>New patient workspace</strong>
              <p>Start with an empty, isolated record.</p>
            </Link>
          </div>
        ) : null}

        <div className="workspace-explainer">
          <span>
            <LayoutDashboard size={19} />
          </span>
          <div>
            <strong>Why separate workspaces?</strong>
            <p>
              Every upload, answer, and citation stays linked to one patient. In connected mode,
              database policies enforce the same ownership boundary.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
