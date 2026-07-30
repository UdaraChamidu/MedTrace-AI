import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, FilePlus2, ShieldCheck, UserRound, Users } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "../lib/router";
import { AppShell } from "../components/AppShell";
import { dataAdapter } from "../lib/data-adapter";

const navItems = [
  { to: "/patients", label: "Patients", icon: <Users size={18} /> },
  { to: "/patients/new", label: "New workspace", icon: <FilePlus2 size={18} /> },
];

export function CreatePatientPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [label, setLabel] = useState("");

  const create = useMutation({
    mutationFn: () =>
      dataAdapter.createPatient({
        name: name.trim(),
        birthYear: Number(birthYear),
      }),
    onSuccess: async (patient) => {
      await queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate(`/patients/${patient.id}?upload=1`);
    },
  });

  return (
    <AppShell navItems={navItems}>
      <div className="page-container narrow-page">
        <Link className="back-link" to="/patients">
          <ArrowLeft size={16} /> Back to patient workspaces
        </Link>
        <div className="create-heading">
          <p className="eyebrow">New workspace</p>
          <h1>Create a patient record</h1>
          <p>Use a display label that is easy to recognize. Documents can be added next.</p>
        </div>

        <div className="create-layout">
          <form
            className="form-card"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <div className="form-section-head">
              <span>
                <UserRound size={19} />
              </span>
              <div>
                <h2>Basic information</h2>
                <p>Only the name and birth year are required for this prototype.</p>
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="patient-name">Patient display name</label>
              <input
                id="patient-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Maya Fernando"
                required
              />
              <small>Use an alias when testing with sensitive records.</small>
            </div>

            <div className="form-row">
              <div className="field-group">
                <label htmlFor="birth-year">Birth year</label>
                <div className="input-with-icon">
                  <CalendarDays size={17} />
                  <input
                    id="birth-year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={birthYear}
                    onChange={(event) => setBirthYear(event.target.value)}
                    placeholder="1988"
                    required
                  />
                </div>
              </div>
              <div className="field-group">
                <label htmlFor="record-label">Workspace note <span>(optional)</span></label>
                <input
                  id="record-label"
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="e.g. Cardiology records"
                />
              </div>
            </div>

            {create.isError ? (
              <p className="inline-error" role="alert">
                The workspace could not be created. Please try again.
              </p>
            ) : null}

            <div className="form-actions">
              <Link className="button button-secondary" to="/patients">
                Cancel
              </Link>
              <button
                className="button button-primary"
                type="submit"
                disabled={create.isPending || !name.trim() || !birthYear}
              >
                {create.isPending ? "Creating…" : "Create and add documents"}
                <FilePlus2 size={17} />
              </button>
            </div>
          </form>

          <aside className="create-aside">
            <span className="create-aside-icon">
              <ShieldCheck />
            </span>
            <h2>A workspace is a privacy boundary</h2>
            <p>
              Documents, extracted facts, findings, and questions remain linked to this patient
              only.
            </p>
            <ul>
              <li>Private upload paths in connected mode</li>
              <li>Patient-scoped citations and Q&A</li>
              <li>Clear provenance for extracted facts</li>
            </ul>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
