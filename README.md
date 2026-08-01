# MedTrace AI

**Every record in view. Every claim anchored.**

MedTrace AI is a web application for reviewing medical records from multiple
visits in one place. It helps a user open a patient workspace, review a timeline
of records, inspect possible prescription/allergy issues, view lab trends, and
ask questions that are answered with source citations.

The current project includes a polished public demo path that works without
cloud credentials, plus Supabase database migrations and n8n workflow templates
for the connected AI processing pipeline.

> This application does not provide a diagnosis. Do not start, stop, or change
> medication based on this result. Please verify high-risk or uncertain findings
> with a doctor or pharmacist.

## Try The Demo

Requirements: Node.js 20 or newer and npm.

```powershell
cd "F:\MedTrace AI"
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`, then choose
the demo flow. The demo uses cached synthetic results so it is reliable for
review, rehearsal, and submission.

For deployment or judging, keep this value unless the full Supabase/n8n pipeline
has already been tested:

```env
VITE_DATA_MODE=demo
```

## What The App Shows

- A responsive landing page and demo entry
- Patient workspace list and patient dashboard
- Chronological medical timeline
- Medication review and possible safety findings
- Laboratory trend view
- Evidence drawer with document, page, snippet, and confidence
- Ask-the-record chat with cited answers and insufficient-evidence refusals
- Medical safety messages that avoid diagnosis or treatment instructions

## Project Structure

```text
frontend/             React, TypeScript, Vite, Tailwind, Recharts
backend/              Clinical rules, Supabase SQL, n8n workflows, prompts
docs/                 Architecture, evaluation, dataset audit, deployment notes
project_docs/         Original competition/project instructions
DataSet YGC26/        Supplied competition document images
```

## Quality Checks

Run these before submitting or deploying a new version:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

The end-to-end browser tests are available with:

```powershell
npm.cmd run test:e2e
```

## Supabase Setup

Run the SQL files in Supabase SQL Editor in this order:

```text
backend/supabase/migrations/202607300001_extensions_and_schema.sql
backend/supabase/migrations/202607300002_rls_storage_and_rpc.sql
backend/supabase/migrations/202607300003_cross_patient_integrity.sql
```

These create the database tables, indexes, Row Level Security policies, private
storage setup, vector search helper, and cross-patient protection triggers.

Frontend-safe environment variables:

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_N8N_BASE_URL=https://your-n8n-domain.com
```

Private values must stay server-side only:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_legacy_jwt_secret
OPENAI_API_KEY=your_openai_key
N8N_WEBHOOK_SECRET=your_random_webhook_secret
```

Never commit `.env`, service-role keys, OpenAI keys, or n8n credentials.

## n8n Setup

Import all workflows from `backend/n8n/workflows`.

Recommended import order:

```text
WF-99 Error Handler
WF-02 Process One Document
WF-03 Normalize Medication
WF-04 Normalize Laboratory Result
WF-05 Medication Reconciliation
WF-06 Laboratory Trends
WF-07 Safety Rules
WF-08 Evidence Verification
WF-01 Process Patient Record
WF-09 Ask Record Question
```

Keep workflows inactive until Supabase, OpenAI, JWT validation, patient ownership
checks, and webhook secrets are configured.

## Deployment Notes

The frontend has already been prepared for Vercel-style hosting. Use:

```text
Root directory: .
Build command: npm.cmd run build
Output directory: frontend/dist
```

For the competition demo, the safest deployment mode is:

```env
VITE_DATA_MODE=demo
```

Switch to `VITE_DATA_MODE=supabase` only after the Supabase RLS rules and n8n
workflows have been tested with at least two users.

## More Documentation

- [Architecture](docs/architecture.md)
- [Implementation plan](docs/implementation-plan.md)
- [Dataset audit](docs/dataset-audit.md)
- [Evaluation guide](docs/evaluation.md)
- [Deployment checklist](docs/deployment-checklist.md)
- [n8n setup notes](backend/n8n/README.md)

