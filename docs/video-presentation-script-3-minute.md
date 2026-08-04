# MedTrace AI 3-minute video presentation script

Use this file for the final short Round 1 competition video.

Recommended length: around 3 minutes.

## Demo links

| Screen | URL |
| --- | --- |
| Landing page | https://med-trace-ai-frontend.vercel.app/ |
| Patient dashboard | https://med-trace-ai-frontend.vercel.app/patients/competition-case |
| Timeline tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=timeline |
| Findings tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=findings |
| Ask tab | https://med-trace-ai-frontend.vercel.app/patients/competition-case?tab=ask |

If direct links show a 404 during recording, first open the landing page and
navigate using the app buttons/tabs.

## Final 3-minute script

### 0:00-0:25 - Problem

Show: landing page.

Say:

> Hi, this is MedTrace AI, an evidence-linked medical record intelligence
> platform. Medical records are often scattered across prescriptions, lab
> reports, discharge summaries, and clinical notes. When these documents are
> reviewed separately, important details like allergies, medication conflicts,
> or lab trends can be missed.

### 0:25-0:50 - Solution

Show: click `Open demo`.

Say:

> MedTrace AI brings those documents into one patient workspace. It creates a
> timeline, highlights possible review items, supports record-level questions,
> and connects every important claim to source evidence: the document, page,
> snippet, and confidence score.

### 0:50-1:30 - Dashboard and timeline

Show: patient dashboard, then Timeline tab.

Say:

> This is the demo patient workspace. The dashboard summarizes the documents,
> timeline events, evidence coverage, and review items. The timeline arranges
> visits, allergies, medications, and lab results in chronological order, so the
> reviewer can understand the patient story across multiple records.

### 1:30-2:05 - Findings and evidence

Show: Findings tab and open one evidence item.

Say:

> In the Findings tab, the system shows possible issues for review, such as a
> medication appearing after an earlier allergy. Risk and confidence are shown
> separately. When I open the evidence, I can see the exact source context. This
> is the core idea of MedTrace AI: not just an AI result, but a traceable result.

### 2:05-2:30 - Ask tab

Show: Ask tab.

Say:

> The Ask tab lets a reviewer ask questions across the record. If the answer is
> supported, MedTrace AI shows citations. If the documents do not contain enough
> evidence, it returns an insufficient-evidence response instead of guessing.

### 2:30-2:50 - Technical stack

Show: app, Supabase, or n8n workflows.

Say:

> The frontend uses React, TypeScript, Vite, Tailwind CSS, TanStack Query, and
> Recharts. Supabase provides Auth, PostgreSQL, private Storage, Row Level
> Security, Realtime, and pgvector. n8n is used as the backend workflow
> orchestrator, and OpenAI is planned for document extraction, embeddings,
> evidence verification, and grounded Q&A.

### 2:50-3:05 - Status and close

Show: dashboard or landing page.

Say:

> For Round 1, the deployed demo is stable with a synthetic evidence-linked
> case. Supabase tables and n8n workflow templates are prepared. The next step
> is the full live pipeline from private upload to AI extraction and real
> dashboard results. MedTrace AI is not a diagnostic system; it helps users
> review records with every claim anchored to evidence.

## If you need to finish under exactly 3 minutes

In the technical stack section, replace the longer paragraph with this shorter
version:

> The frontend uses React and TypeScript. Supabase handles the database,
> authentication, storage, and security. n8n is used for backend workflows, and
> OpenAI is planned for extraction, evidence verification, and grounded Q&A.

This shorter line should bring the video closer to exactly 3 minutes.
