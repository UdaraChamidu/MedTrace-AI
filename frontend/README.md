# ChartHarbor AI frontend

Polished React + TypeScript frontend for the YGC 2026 medical record cross-checker.

> **Medical safety:** This application does not provide a diagnosis. Do not start, stop, or change medication based on this result. High-risk or uncertain findings should be verified with a doctor or pharmacist.

## What is included

- Public landing page and auth-style entry
- Patient workspace list and creation flow
- Multi-file PDF/image intake with asynchronous progress simulation
- Patient overview with cached workflow trace
- Chronological timeline
- Medication reconciliation table
- Recharts laboratory trends with source reference ranges
- Findings list/detail with risk and evidence confidence shown separately
- Evidence drawer with a styled source-page preview
- Deterministic cross-document Q&A and insufficient-evidence refusal
- Loading, empty, error, and reconnect-safe demo states
- Responsive layout, keyboard focus treatments, reduced-motion support, and semantic labels
- TanStack Query data orchestration
- `ChartHarborAdapter` boundary with demo and Supabase implementations

## Cached walkthrough disclosure

The bundled **Maya Fernando** case is synthetic. Its allergy, interaction, dosage, and laboratory examples demonstrate the requested judging workflow and are **not extracted claims about the supplied YGC image set**.

The supplied dataset contains mixed folder identities and duplicate files. Connecting the real extraction workflow must preserve that uncertainty rather than silently assigning those images to the synthetic case.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:4173`.

The default is reliable demo mode. No cloud credentials are required.

## Connect Supabase

Copy `.env.example` to `.env.local` and provide:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_N8N_API_BASE_URL=https://YOUR_N8N_HOST
VITE_DEMO_MODE=false
```

Only the public anon key belongs in the browser. Never expose a Supabase service-role key, OpenAI API key, or n8n credential to Vite.

The adapter contract is in `src/lib/data-adapter.ts`. `DemoAdapter` keeps the competition demo functional offline; `SupabaseAdapter` is the backend boundary. As backend tables stabilize, expand the adapter mapping without coupling pages directly to Supabase.

## Quality gates

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Tests cover confidence thresholds, risk labels, deterministic judge-style answers, medical safety wording, insufficient-evidence behavior, and citation integrity.

## Demo route

Use `/patients/competition-case` to open the cached synthetic walkthrough directly.
