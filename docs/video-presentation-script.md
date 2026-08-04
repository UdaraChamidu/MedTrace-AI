# MedTrace AI video presentation script

Use this document to record a 4-5 minute Round 1 presentation video. The script
is written so you can read it naturally while showing the deployed app.

Recommended final video length: 4 minutes 30 seconds.

## Production demo links

Use these links while recording so you can jump directly to each part of the
deployed app:

| Screen | Production URL |
| --- | --- |
| Landing page | https://med-trace-ai-frontend.vercel.app/ |
| Patient workspaces | https://med-trace-ai-frontend.vercel.app/patients |
| Demo patient overview | https://med-trace-ai-frontend.vercel.app/patients/competition-case |
| Timeline tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=timeline |
| Medications tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=medications |
| Labs tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=labs |
| Findings tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=findings |
| Ask tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=ask |

## Submission positioning

For Round 1, present MedTrace AI as:

- a working, publicly deployed evidence-linked demo;
- a Supabase-backed data platform with SQL schema and RLS prepared;
- an n8n workflow-based backend architecture with imported production webhooks;
- an OpenAI-ready extraction and reasoning pipeline;
- a safety-first medical record review tool, not a diagnostic system.

Be honest if asked: the public demo uses a stable cached/synthetic case for
reliability. Supabase and n8n infrastructure are prepared, and the next
implementation phase is the full live upload-to-extraction pipeline.

Do not claim that the live AI extraction pipeline is fully complete unless it
has been implemented and tested end to end.

## Before recording

Open these in advance:

1. Landing page: https://med-trace-ai-frontend.vercel.app/
2. Patient demo dashboard: https://med-trace-ai-frontend.vercel.app/patients/competition-case
3. Findings tab: https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=findings
4. Ask tab: https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=ask
5. Optional: Supabase table view showing tables.
6. Optional: n8n workflows list showing imported workflows.

Recommended app environment for the public video:

```env
VITE_DATA_MODE=demo
```

This gives the smoothest Round 1 recording.

## Video structure

| Time | Section | What to show |
| --- | --- | --- |
| 0:00-0:25 | Problem | Landing page |
| 0:25-0:50 | Solution | Open demo |
| 0:50-2:35 | Product demo | Dashboard, findings, evidence, Ask tab |
| 2:35-3:35 | Technical architecture | Supabase/n8n/OpenAI explanation |
| 3:35-4:10 | Current status and next implementation | Explain live backend roadmap |
| 4:10-4:30 | Impact and close | Return to dashboard or landing |

## Full spoken script

### 0:00-0:25 - Problem

Show: MedTrace AI landing page.

Open:

```text
https://med-trace-ai-frontend.vercel.app/
```

Say:

> Medical information is often fragmented across , laboratory
> reports, discharge summaries, and clinical notes. A patient may have records
> from different visits and different providers, but the important safety story
> is usually spread across multiple documents. That makes it easy to miss an
> earlier allergy, a repeated medication, a dosage change, or a lab trend that
> needs review.

### 0:25-0:50 - Solution

Show: Click `Open demo` or `Explore the synthetic case`.

Direct link if needed:

```text
https://med-trace-ai-frontend.vercel.app/patients
```

Say:

> MedTrace AI solves this by turning multiple medical documents into one
> evidence-linked patient record. It organizes the record into a timeline,
> highlights possible medication and allergy review items, explains lab trends,
> and lets a reviewer ask questions across the whole record. Most importantly,
> every important claim is anchored to a source document, page, snippet, and
> confidence score.

### 0:50-1:25 - Dashboard and timeline

Show: Patient dashboard overview.

Open:

```text
https://med-trace-ai-frontend.vercel.app/patients/competition-case
```

Say:

> This is the patient workspace. The dashboard shows the number of source
> documents, timeline events, high-risk review items, and evidence coverage. The
> goal is not to replace a doctor or pharmacist. The goal is to make the record
> easier to review and to show where each finding came from.

Show: Timeline tab.

Open:

```text
https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=timeline
```

Say:

> The timeline brings visits, allergies, prescriptions, and lab results into one
> chronological view. This is important because a single document may not show a
> conflict, but the conflict can become visible when records are viewed together.

### 1:25-2:05 - Findings and evidence

Show: Findings tab. Open a high-risk finding.

Open:

```text
https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=findings
```

Say:

> Here, MedTrace AI shows a possible review item: aspirin appears after an
> earlier aspirin allergy. Notice that risk and confidence are separate. Risk
> describes how important the candidate may be if confirmed. Confidence describes
> how strongly the uploaded evidence supports the finding.

Open the evidence drawer.

Say:

> When I open the evidence, the system shows the exact source context. The
> reviewer can see the document title, page number, snippet, and evidence
> confidence. This is the central idea of MedTrace AI: not just an answer, but an
> answer with traceable proof.

### 2:05-2:35 - Ask the record

Show: Ask tab.

Open:

```text
https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=ask
```

Ask/click a sample supported question, such as:

```text
Was aspirin prescribed despite an earlier allergy?
```

Say:

> The Ask tab is designed for cross-document questions. The answer is grounded in
> the record and includes citations. If the record does not contain enough
> evidence, the system refuses to guess.

Ask or show unsupported question, such as:

```text
What is this patient's blood type?
```

Say:

> For unsupported questions, MedTrace AI returns an insufficient-evidence answer.
> This is important in a medical context because the system should not invent
> missing facts.

### 2:35-3:35 - Technical architecture

Show: optional Supabase tables, n8n workflows list, or just stay on app and speak.

Say:

> The frontend is built with React, TypeScript, Vite, Tailwind CSS, TanStack
> Query, and Recharts. The data platform is Supabase: Auth, PostgreSQL, private
> Storage, Row Level Security, Realtime job updates, and pgvector for
> patient-filtered retrieval.

Say:

> The backend architecture uses n8n as the workflow orchestrator instead of a
> custom Express or FastAPI server. There are ten workflow templates: process
> patient record, process one document, normalize medication, normalize lab
> result, medication reconciliation, lab trends, safety rules, evidence
> verification, ask-record Q&A, and error handling.

Say:

> OpenAI is planned for multimodal document understanding, strict structured
> extraction, evidence verification, embeddings, and grounded Q&A. The system
> keeps deterministic rules for medication duplication, dosage conflicts, allergy
> matches, unit compatibility, and cited interaction providers. This means the
> language model is not the sole authority for safety-critical checks.

Say:

> The database schema includes patient-owned documents, pages, chunks, visits,
> medications, allergies, labs, diagnoses, timeline events, findings, evidence,
> processing jobs, Q&A messages, agent runs, and workflow failures. Row Level
> Security is designed so one user cannot access another user's patient record.

### 3:35-4:10 - Current status and next implementation

Show: n8n workflows or the production test plan if desired.

Say:

> For Round 1, the public demo is intentionally stable and credential-free. I
> have also created the Supabase schema, database migrations, private storage
> policies, n8n workflow exports, production webhook tests, and environment
> configuration for the live backend.

Say:

> The next implementation phase is the full live pipeline: upload a file to
> private Supabase Storage, create document and processing job rows, call the n8n
> process-records webhook, run OpenAI extraction inside n8n, write normalized
> results back to Supabase, update progress through Realtime, and then load the
> real timeline, findings, evidence, and Q&A answers in the frontend.

Say:

> This architecture lets the project grow from a reliable Round 1 demo into a
> complete production workflow without changing the product direction.

### 4:10-4:30 - Impact and close

Show: dashboard or evidence drawer.

Say:

> MedTrace AI does not diagnose and does not tell a patient to change medication.
> It makes fragmented records easier to review, highlights possible issues for
> professional verification, and keeps every result anchored to evidence. The
> value is simple: every record in view, every claim anchored.

## Shorter 3-minute version

Use this if the video needs to be tighter.

> MedTrace AI is an evidence-linked medical record intelligence platform for the
> YGC AI Competition. Medical records are often fragmented across prescriptions,
> labs, and clinical notes, so important issues can be missed when each document
> is reviewed alone.
>
> MedTrace AI brings those records into one patient workspace. It shows a
> chronological timeline, medication review items, lab trends, and
> cross-document Q&A. The key principle is that every important claim has a
> source document, page, snippet, and confidence value.
>
> In this demo, I open a synthetic patient case. The dashboard summarizes the
> record, the timeline shows events across visits, and the Findings tab shows a
> possible aspirin-allergy contradiction. When I open the finding, I can inspect
> the exact supporting evidence. Risk and confidence are shown separately, which
> is important because a high-risk item may still require evidence review.
>
> The Ask tab answers record-level questions with citations. If the record does
> not support a question, the system returns insufficient evidence instead of
> inventing an answer.
>
> Technically, the frontend uses React, TypeScript, Vite, Tailwind CSS, TanStack
> Query, and Recharts. Supabase provides Auth, PostgreSQL, private Storage, Row
> Level Security, Realtime, and pgvector. n8n is used as the backend orchestrator
> with ten workflow templates for intake, extraction, normalization,
> reconciliation, safety rules, evidence verification, Q&A, and error handling.
> OpenAI is planned for multimodal extraction, structured outputs, evidence
> verification, embeddings, and grounded explanations.
>
> The current Round 1 demo is stable and deployed. Supabase tables and n8n
> webhooks are prepared. The next implementation phase is full live processing:
> upload to private storage, call n8n, run OpenAI extraction, write results back
> to Supabase, and load real findings in the dashboard.
>
> MedTrace AI is not a diagnostic or prescribing system. It helps users review
> fragmented records carefully, with every result anchored to evidence.

## Demo clicks checklist

Use this while recording:

1. Open deployed app: https://med-trace-ai-frontend.vercel.app/
2. Click `Open demo`.
3. Open the patient walkthrough: https://med-trace-ai-frontend.vercel.app/patients/competition-case
4. Show overview metrics.
5. Open Timeline tab: https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=timeline
6. Open Findings tab: https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=findings
7. Click the aspirin/allergy finding.
8. Open evidence.
9. Open Ask tab: https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=ask
10. Ask supported question.
11. Ask unsupported question.
12. Close with architecture/impact.

## What to say if judges ask about backend completion

Say:

> The public Round 1 demo is stable and shows the product experience. The backend
> foundation is prepared with Supabase migrations, RLS, private storage policies,
> n8n workflow exports, and production webhook tests. The imported n8n workflows
> are currently safe templates. The next phase is wiring the full live extraction
> path: private upload, processing jobs, OpenAI extraction, embeddings, evidence
> verification, and Supabase result loading.

This answer is honest and technically strong. Do not say the full live AI
pipeline is already complete unless it is actually implemented and tested.

## Files to mention if needed

- `frontend/`: React application.
- `backend/supabase/migrations/`: database schema, RLS, storage, RPC.
- `backend/n8n/workflows/`: ten workflow exports.
- `backend/prompts/`: versioned AI prompts.
- `docs/MedTrace_AI_Technical_Summary.docx`: editable technical summary.
- `docs/final-production-test-plan.md`: production test checklist.
- `docs/full-system-implementation-plan.md`: next implementation roadmap.
