# ChartHarbor AI

**Every record in view. Every claim anchored.**

ChartHarbor AI is an evidence-linked medical record intelligence platform built
for the YGC AI Competition 2026. It turns records from multiple visits and
providers into a chronological patient view, highlights possible medication and
allergy conflicts, explains compatible laboratory trends, and answers
cross-document questions with page-level citations.

The repository includes a fully runnable cached competition demo and a
deployment-ready Supabase/n8n backend design. The demo does not require cloud
credentials.

> This application does not provide a diagnosis. Do not start, stop, or change
> medication based on this result. Please verify high-risk or uncertain findings
> with a doctor or pharmacist.

## What is implemented

- Professional responsive React dashboard and frictionless demo entry
- Patient workspaces, multi-file intake, and visible processing progress
- Chronological timeline with source provenance
- Medication reconciliation and deterministic safety-candidate rules
- Unit-safe laboratory trends and plain-language summaries
- Findings with separate risk and confidence indicators
- Evidence drawer with document/page/snippet context
- Grounded ask-the-record experience with supported and insufficient-evidence states
- Supabase PostgreSQL schema, indexes, storage policies, and Row Level Security
- Modular n8n workflow templates and strict, versioned AI prompts
- TypeScript schemas, clinical rules, confidence scoring, and automated tests

## Repository

```text
frontend/             React + TypeScript + Vite application
backend/              Clinical rules, Supabase, n8n, prompts, and tests
docs/                 Architecture, implementation, evaluation, and deployment
project_docs/         Original requirements (unchanged)
DataSet YGC26/        Supplied competition document images (unchanged)
```

## Run locally

Requirements: Node.js 20 or newer and npm.

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

Open the URL printed by Vite, then choose **Load competition case**. The default
`VITE_DATA_MODE=demo` path is self-contained and intentionally uses cached
synthetic results so the judging flow remains reliable.

Quality gates:

```powershell
npm.cmd run typecheck
npm.cmd run test
npm.cmd run test:e2e
npm.cmd run build
```

## Connect Supabase and n8n

1. Create a Supabase project and keep all medical tables and the
   `medical-documents` bucket private.
2. Apply the SQL migrations under `backend/supabase/migrations` in filename
   order.
3. Copy `.env.example` to an untracked `.env` and add the public Supabase URL
   and anon key for the frontend.
4. Import the JSON workflows in `backend/n8n/workflows` and configure
   credentials inside n8n.
5. Set `VITE_N8N_BASE_URL` to the public n8n base URL.
6. Change `VITE_DATA_MODE` to `supabase` after verifying RLS with two separate
   users.

Server-side secrets such as `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY`
must never appear in a `VITE_` variable or browser bundle.

See [architecture](docs/architecture.md),
[implementation plan](docs/implementation-plan.md),
[supplied dataset audit](docs/dataset-audit.md),
[evaluation guide](docs/evaluation.md), and
[deployment checklist](docs/deployment-checklist.md).

## Current integration limits

Real AI processing requires Supabase, n8n, and OpenAI credentials. Medication
normalization can use RxNorm, while interaction checks require either the
explicitly limited curated rules included in the backend or a licensed provider
adapter. No production clinical certification or compliance claim is made.
