import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Beaker,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CircleDot,
  Clock3,
  FileCheck2,
  FileSearch,
  FileText,
  FlaskConical,
  ListFilter,
  LoaderCircle,
  MessageSquareText,
  Pill,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { answerQuestion, initialMessages } from "../lib/demo-data";
import { confidenceBand, confidencePercent, cx } from "../lib/format";
import type {
  ChatMessage,
  Citation,
  Finding,
  LabSeries,
  Medication,
  PatientRecord,
  TimelineEvent,
} from "../types";
import { ConfidenceBadge, EmptyState, RiskBadge, SectionHeading } from "./Ui";
import { SafetyNotice } from "./SafetyNotice";

type OpenEvidence = (citationId: string) => void;

const eventIcon = {
  allergy: <ShieldAlert size={17} />,
  medication: <Pill size={17} />,
  laboratory: <FlaskConical size={17} />,
  visit: <CalendarDays size={17} />,
};

export function OverviewView({
  record,
  openEvidence,
  openTab,
}: {
  record: PatientRecord;
  openEvidence: OpenEvidence;
  openTab: (tab: string) => void;
}) {
  if (!record.events.length) {
    return (
      <EmptyState
        icon={<FileSearch />}
        title="No processed evidence yet"
        description="Add documents to build this patient’s timeline, medication list, trends, and evidence map."
      />
    );
  }

  const latestEvents = record.events.slice(-3).reverse();
  const highRisk = record.findings.filter((finding) => finding.risk === "high");

  return (
    <div className="dashboard-view">
      <SafetyNotice compact />
      <div className="metric-grid">
        <article className="metric-card">
          <span className="metric-icon metric-icon-teal">
            <FileText />
          </span>
          <div>
            <small>Source documents</small>
            <strong>{record.patient.documentCount}</strong>
            <p><BadgeCheck size={13} /> All pages indexed</p>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon metric-icon-blue">
            <CalendarDays />
          </span>
          <div>
            <small>Record events</small>
            <strong>{record.events.length}</strong>
            <p>Across {new Set(record.events.map((item) => item.year)).size} years</p>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon metric-icon-red">
            <ShieldAlert />
          </span>
          <div>
            <small>High-risk reviews</small>
            <strong>{highRisk.length}</strong>
            <p>Professional verification advised</p>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon metric-icon-amber">
            <CircleAlert />
          </span>
          <div>
            <small>Needs review</small>
            <strong>{record.findings.filter((item) => item.status === "Needs review").length}</strong>
            <p>Intent or dates are uncertain</p>
          </div>
        </article>
      </div>

      <div className="overview-grid">
        <section className="panel recent-record">
          <SectionHeading
            title="Recent record activity"
            description="The latest extracted events across all documents."
            action={
              <button type="button" className="text-button" onClick={() => openTab("timeline")}>
                Full timeline <ArrowRight size={14} />
              </button>
            }
          />
          <div className="mini-timeline">
            {latestEvents.map((event) => (
              <button type="button"
                className="mini-event"
                key={event.id}
                onClick={() => openEvidence(event.citationId)}
              >
                <span className={`event-icon event-icon-${event.type}`}>{eventIcon[event.type]}</span>
                <span className="mini-event-copy">
                  <small>{event.date} · {event.provider}</small>
                  <strong>{event.title}</strong>
                  <span>{event.summary}</span>
                </span>
                <ChevronRight size={17} />
              </button>
            ))}
          </div>
        </section>

        <section className="panel priority-panel">
          <SectionHeading
            title="Priority review"
            description="Potential importance and evidence confidence are shown separately."
          />
          {highRisk.slice(0, 2).map((finding) => (
            <article className="priority-finding" key={finding.id}>
              <div className="finding-badges">
                <RiskBadge risk={finding.risk} />
                <ConfidenceBadge score={finding.confidence} />
              </div>
              <h3>{finding.title}</h3>
              <p>{finding.summary}</p>
              <button type="button"
                className="text-button"
                onClick={() => openEvidence(finding.citationIds.at(-1) ?? "")}
              >
                Inspect supporting pages <ArrowRight size={14} />
              </button>
            </article>
          ))}
          <button type="button" className="button button-secondary button-full" onClick={() => openTab("findings")}>
            Review all {record.findings.length} findings
          </button>
        </section>
      </div>

      <section className="panel trace-panel">
        <div className="trace-heading">
          <span className="trace-icon">
            <BrainCircuit />
          </span>
          <div>
            <h2>Evidence pipeline</h2>
            <p>Bounded stages completed for the cached walkthrough.</p>
          </div>
          <span className="badge badge-complete">
            <Check size={13} /> Complete
          </span>
        </div>
        <div className="trace-steps">
          {[
            ["Classify", "12 documents", FileCheck2],
            ["Extract", "46 facts", FileSearch],
            ["Normalize", "8 entities", Sparkles],
            ["Safety checks", "4 candidates", ShieldAlert],
            ["Verify evidence", "100% cited", BadgeCheck],
          ].map(([label, detail, Icon], index) => {
            const TraceIcon = Icon as typeof FileCheck2;
            return (
              <div className="trace-step" key={label as string}>
                <span><TraceIcon size={16} /></span>
                <div>
                  <strong>{label as string}</strong>
                  <small>{detail as string}</small>
                </div>
                {index < 4 ? <i /> : null}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function TimelineView({
  events,
  openEvidence,
}: {
  events: TimelineEvent[];
  openEvidence: OpenEvidence;
}) {
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? events : events.filter((event) => event.type === filter);

  if (!events.length) {
    return (
      <EmptyState
        icon={<Clock3 />}
        title="The timeline will appear here"
        description="Processed dates are normalized while the original source date remains attached to each event."
      />
    );
  }

  return (
    <div className="dashboard-view">
      <SectionHeading
        eyebrow="Chronology"
        title="Patient timeline"
        description="Events are ordered from source dates. Ambiguous dates remain marked for review."
        action={
          <div className="filter-control">
            <ListFilter size={15} />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter timeline">
              <option value="all">All events</option>
              <option value="medication">Medications</option>
              <option value="laboratory">Laboratory</option>
              <option value="allergy">Allergies</option>
            </select>
          </div>
        }
      />
      <div className="timeline-layout">
        <aside className="timeline-years" aria-label="Timeline years">
          {[...new Set(events.map((event) => event.year))].map((year) => (
            <a href={`#year-${year}`} key={year}>{year}</a>
          ))}
        </aside>
        <div className="timeline-list">
          {visible.map((event, index) => {
            const showYear = index === 0 || visible[index - 1]?.year !== event.year;
            return (
              <div id={showYear ? `year-${event.year}` : undefined} className="timeline-row" key={event.id}>
                <div className="timeline-date">
                  {showYear ? <strong>{event.year}</strong> : null}
                  <span>{event.date.replace(event.year, "").replace(",", "").trim()}</span>
                </div>
                <div className="timeline-marker">
                  <span className={`event-icon event-icon-${event.type}`}>{eventIcon[event.type]}</span>
                </div>
                <article className="timeline-card">
                  <div>
                    <small>{event.provider}</small>
                    <h3>{event.title}</h3>
                    <p>{event.summary}</p>
                    <div className="timeline-tags">
                      {event.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                  </div>
                  <button type="button"
                    className="evidence-link"
                    onClick={() => openEvidence(event.citationId)}
                    aria-label={`Open source evidence for ${event.title}`}
                  >
                    <BookOpen size={16} /> Source
                  </button>
                </article>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MedicationsView({
  medications,
  findings,
  openEvidence,
}: {
  medications: Medication[];
  findings: Finding[];
  openEvidence: OpenEvidence;
}) {
  const [query, setQuery] = useState("");
  const visible = medications.filter((item) =>
    `${item.name} ${item.ingredient}`.toLowerCase().includes(query.toLowerCase()),
  );

  if (!medications.length) {
    return (
      <EmptyState
        icon={<Pill />}
        title="No medications extracted"
        description="Medication names, instructions, active dates, and source pages will appear after processing."
      />
    );
  }

  return (
    <div className="dashboard-view">
      <SectionHeading
        eyebrow="Reconciliation"
        title="Medications"
        description="Original instructions are preserved alongside normalized ingredients."
      />
      <div className="medication-summary">
        <div><Pill /><span><strong>{medications.length}</strong> extracted entries</span></div>
        <div><BadgeCheck /><span><strong>{new Set(medications.map((item) => item.ingredient)).size}</strong> normalized ingredients</span></div>
        <div><CircleAlert /><span><strong>{findings.filter((item) => item.type.includes("Dosage") || item.type.includes("Duplicate")).length}</strong> reconciliation reviews</span></div>
      </div>
      <label className="search-field medication-search">
        <Search size={17} />
        <span className="sr-only">Search medications</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search medication or ingredient…" />
      </label>
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Instruction</th>
              <th>Status</th>
              <th>Started</th>
              <th>Evidence confidence</th>
              <th><span className="sr-only">Source</span></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((medication) => (
              <tr key={medication.id}>
                <td>
                  <strong>{medication.name}</strong>
                  <small>Normalized: {medication.ingredient}</small>
                </td>
                <td>
                  {medication.instruction}
                  <small>{medication.provider}</small>
                </td>
                <td><span className={`med-status med-status-${medication.status.toLowerCase().replace(" ", "-")}`}>{medication.status}</span></td>
                <td>{medication.started}</td>
                <td>
                  <div className="table-confidence">
                    <span><i style={{ width: `${medication.confidence * 100}%` }} /></span>
                    <strong>{confidenceBand(medication.confidence)}</strong>
                    <small>{confidencePercent(medication.confidence)}</small>
                  </div>
                </td>
                <td>
                  <button type="button" className="icon-button" onClick={() => openEvidence(medication.citationId)} aria-label={`Open source for ${medication.name}`}>
                    <BookOpen size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SafetyNotice compact />
    </div>
  );
}

function LabChart({ lab }: { lab: LabSeries }) {
  return (
    <div className="lab-chart" role="img" aria-label={`${lab.name} trend chart`}>
      <ResponsiveContainer width="100%" height={255}>
        <LineChart data={lab.points} margin={{ top: 18, right: 18, left: -12, bottom: 4 }}>
          <CartesianGrid stroke="#e7eeef" strokeDasharray="3 3" vertical={false} />
          <ReferenceArea y1={lab.rangeLow} y2={lab.rangeHigh} fill="#dff3ef" fillOpacity={0.72} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#66777c", fontSize: 12 }} />
          <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} tick={{ fill: "#66777c", fontSize: 12 }} />
          <Tooltip
            contentStyle={{ border: "1px solid #dce6e7", borderRadius: 12, boxShadow: "0 8px 24px rgba(7,27,37,.1)" }}
            formatter={(value) => [`${String(value)} ${lab.unit}`, lab.name]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#168985"
            strokeWidth={3}
            dot={{ r: 5, fill: "#fff", stroke: "#168985", strokeWidth: 3 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LabsView({
  labs,
  openEvidence,
}: {
  labs: LabSeries[];
  openEvidence: OpenEvidence;
}) {
  const [selected, setSelected] = useState(labs[0]?.id ?? "");
  const lab = labs.find((item) => item.id === selected);
  if (!lab) {
    return (
      <EmptyState
        icon={<Beaker />}
        title="No compatible lab series"
        description="At least two values with compatible units are required before a direction is shown."
      />
    );
  }

  const latest = lab.points.at(-1);
  if (!latest) {
    return (
      <EmptyState
        icon={<Beaker />}
        title="No values in this lab series"
        description="A trend needs at least two measured values with compatible units."
      />
    );
  }
  return (
    <div className="dashboard-view">
      <SectionHeading
        eyebrow="Compatible-unit trends"
        title="Laboratory results"
        description="Reference ranges come from the source laboratory; a trend is never presented as a diagnosis."
      />
      <div className="lab-layout">
        <aside className="lab-selector">
          <label>
            <Search size={15} />
            <input placeholder="Find a result…" aria-label="Find a laboratory result" />
          </label>
          <p>Tracked results</p>
          {labs.map((item) => (
            <button type="button" key={item.id} className={cx(item.id === selected && "active")} onClick={() => setSelected(item.id)}>
              <span>
                <strong>{item.name}</strong>
                <small>{item.unit}</small>
              </span>
              <span className={item.direction === "Rising" ? "trend-up" : "trend-stable"}>
                {item.direction === "Rising" ? <TrendingUp size={14} /> : <Activity size={14} />}
                {item.direction}
              </span>
            </button>
          ))}
        </aside>

        <section className="panel lab-detail">
          <div className="lab-detail-head">
            <div>
              <p className="eyebrow">Latest result · {latest.label}</p>
              <h2>{lab.name}</h2>
              <p><strong>{latest.value}</strong> {lab.unit}</p>
            </div>
            <div className="lab-range">
              <span>Source range</span>
              <strong>{lab.rangeLow}–{lab.rangeHigh} {lab.unit}</strong>
              <small>{latest.value > lab.rangeHigh ? "Above listed range" : "Within listed range"}</small>
            </div>
          </div>
          <div className="chart-legend">
            <span><i className="legend-line" /> Recorded result</span>
            <span><i className="legend-range" /> Source reference range</span>
          </div>
          <LabChart lab={lab} />
          <div className="trend-explanation">
            <span><Sparkles size={18} /></span>
            <div>
              <p className="eyebrow">Plain-language record summary</p>
              <p>{lab.explanation}</p>
              <button type="button" className="text-button" onClick={() => openEvidence(lab.citationId)}>
                View latest source result <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>
      </div>
      <SafetyNotice compact />
    </div>
  );
}

export function FindingsView({
  findings,
  citations,
  openEvidence,
}: {
  findings: Finding[];
  citations: Citation[];
  openEvidence: OpenEvidence;
}) {
  const [selectedId, setSelectedId] = useState(findings[0]?.id ?? "");
  const [filter, setFilter] = useState("all");
  const visible = filter === "all" ? findings : findings.filter((item) => item.risk === filter);
  const selected = findings.find((item) => item.id === selectedId) ?? visible[0];
  if (!selected) {
    return (
      <EmptyState
        icon={<BadgeCheck />}
        title="No review findings"
        description="No verified cross-document conflicts have been found in the processed record."
      />
    );
  }

  return (
    <div className="dashboard-view">
      <SectionHeading
        eyebrow="Evidence-verified candidates"
        title="Findings for review"
        description="These are record cross-checks—not diagnoses or treatment recommendations."
        action={
          <div className="segmented">
            {["all", "high", "moderate"].map((value) => (
              <button type="button" key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
                {value === "all" ? "All" : value === "moderate" ? "Review" : "High risk"}
              </button>
            ))}
          </div>
        }
      />
      <div className="findings-layout">
        <div className="findings-list">
          {visible.map((finding) => (
            <button type="button" key={finding.id} className={cx("finding-row", selected.id === finding.id && "active")} onClick={() => setSelectedId(finding.id)}>
              <span className={`finding-row-icon finding-row-icon-${finding.risk}`}>
                {finding.risk === "high" ? <ShieldAlert /> : finding.risk === "moderate" ? <CircleAlert /> : <CircleDot />}
              </span>
              <span className="finding-row-copy">
                <small>{finding.type}</small>
                <strong>{finding.title}</strong>
                <span>{finding.summary}</span>
                <span className="finding-row-badges">
                  <RiskBadge risk={finding.risk} />
                  <ConfidenceBadge score={finding.confidence} />
                </span>
              </span>
              <ChevronRight size={18} />
            </button>
          ))}
        </div>

        <aside className="finding-detail">
          <div className="finding-detail-top">
            <span className={`finding-detail-icon finding-row-icon-${selected.risk}`}>
              {selected.risk === "high" ? <ShieldAlert /> : selected.risk === "moderate" ? <CircleAlert /> : <CircleDot />}
            </span>
            <div>
              <p className="eyebrow">{selected.type}</p>
              <h2>{selected.title}</h2>
            </div>
          </div>
          <div className="finding-badges">
            <RiskBadge risk={selected.risk} />
            <ConfidenceBadge score={selected.confidence} />
          </div>
          <p className="finding-detail-summary">{selected.summary}</p>
          <div className="trust-grid">
            <div>
              <small>Potential importance</small>
              <strong className={`trust-risk trust-risk-${selected.risk}`}>
                {selected.risk === "high" ? "High risk" : selected.risk === "moderate" ? "Needs review" : "Informational"}
              </strong>
              <p>How important this candidate may be if confirmed.</p>
            </div>
            <div>
              <small>Evidence confidence</small>
              <strong>{confidenceBand(selected.confidence)} · {confidencePercent(selected.confidence)}</strong>
              <p>{selected.confidenceReason}</p>
            </div>
          </div>
          <div className="evidence-stack">
            <div className="evidence-stack-head">
              <div>
                <h3>Supporting evidence</h3>
                <p>{selected.citationIds.length} patient-owned source pages</p>
              </div>
              <BadgeCheck size={18} />
            </div>
            {selected.citationIds.map((citationId, index) => {
              const citation = citations.find((item) => item.id === citationId);
              if (!citation) return null;
              return (
                <button type="button" key={citation.id} onClick={() => openEvidence(citation.id)}>
                  <span>{index + 1}</span>
                  <div>
                    <small>{citation.documentName} · p. {citation.page}</small>
                    <strong>{citation.label}</strong>
                    <p>“{citation.snippet}”</p>
                  </div>
                  <BookOpen size={17} />
                </button>
              );
            })}
          </div>
          <div className="recommended-action">
            <AlertTriangle size={18} />
            <div>
              <strong>Professional review</strong>
              <p>{selected.recommendedAction}</p>
            </div>
          </div>
        </aside>
      </div>
      <SafetyNotice compact />
    </div>
  );
}

export function AskView({
  citations,
  openEvidence,
}: {
  citations: Citation[];
  openEvidence: OpenEvidence;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [question, setQuestion] = useState("");
  const [thinking, setThinking] = useState(false);

  const ask = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || thinking) return;
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: "user", content: trimmed };
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, answerQuestion(trimmed)]);
      setThinking(false);
    }, 620);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    ask(question);
  };

  const prompts = [
    "Was aspirin prescribed despite an earlier allergy?",
    "How has creatinine changed over time?",
    "Which metformin instruction is current?",
  ];

  return (
    <div className="ask-layout">
      <section className="ask-main">
        <div className="ask-heading">
          <span><MessageSquareText /></span>
          <div>
            <p className="eyebrow">Grounded record Q&A</p>
            <h2>Ask this record</h2>
            <p>Answers use only the uploaded evidence and open directly to their source pages.</p>
          </div>
        </div>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} className={`chat-message chat-message-${message.role}`}>
              <span className="chat-avatar">{message.role === "assistant" ? <Bot size={18} /> : "DR"}</span>
              <div className="chat-bubble">
                {message.role === "assistant" ? <small>MedTrace record assistant</small> : null}
                <p>{message.content}</p>
                {message.answerStatus ? (
                  <div className="answer-meta">
                    {message.risk ? <RiskBadge risk={message.risk} /> : null}
                    {typeof message.confidence === "number" ? <ConfidenceBadge score={message.confidence} /> : null}
                    <span className="answer-status">{message.answerStatus.replace("_", " ")}</span>
                  </div>
                ) : null}
                {message.citations?.length ? (
                  <div className="chat-citations">
                    <span>Sources</span>
                    {message.citations.map((citationId, index) => {
                      const citation = citations.find((item) => item.id === citationId);
                      return citation ? (
                        <button type="button" key={citation.id} onClick={() => openEvidence(citation.id)}>
                          <FileText size={14} />
                          [{index + 1}] {citation.documentName} · p. {citation.page}
                        </button>
                      ) : null;
                    })}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
          {thinking ? (
            <article className="chat-message chat-message-assistant">
              <span className="chat-avatar"><Bot size={18} /></span>
              <div className="chat-thinking">
                <LoaderCircle className="spin" size={16} />
                Checking structured facts and source pages…
              </div>
            </article>
          ) : null}
        </div>
        <div className="suggested-prompts">
          {prompts.map((prompt) => (
            <button type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}</button>
          ))}
        </div>
        <form className="chat-composer" onSubmit={onSubmit}>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                ask(question);
              }
            }}
            rows={2}
            placeholder="Ask about medications, allergies, dates, or lab trends…"
            aria-label="Question about the patient record"
          />
          <button className="button button-primary" type="submit" disabled={!question.trim() || thinking} aria-label="Send question">
            <Send size={17} />
          </button>
          <small>Enter to send · Shift + Enter for a new line</small>
        </form>
      </section>
      <aside className="ask-aside">
        <div className="ask-scope">
          <span><Bot /></span>
          <h3>What this assistant can do</h3>
          <ul>
            <li><Check /> Compare facts across visits</li>
            <li><Check /> Explain compatible lab trends</li>
            <li><Check /> Open exact source pages</li>
            <li><Check /> Refuse when evidence is insufficient</li>
          </ul>
        </div>
        <div className="record-scope">
          <div>
            <span className="scope-dot" />
            <strong>Record scope</strong>
          </div>
          <p>12 documents · 2019–2025</p>
          <small>Answers do not use another patient’s data.</small>
        </div>
        <SafetyNotice compact />
      </aside>
    </div>
  );
}
