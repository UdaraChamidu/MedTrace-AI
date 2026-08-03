# MedTrace AI final production test plan

This file is the step-by-step checklist for testing the final deployed MedTrace
AI application with Supabase and n8n.

## Current reality

The production n8n webhooks are reachable:

- `POST /webhook/process-records` returns `accepted=true` and `status=queued`.
- `POST /webhook/ask-record` returns a safe answer object.

The frontend has two modes:

- `VITE_DATA_MODE=demo`: stable public demo. Use this for submission if live
  processing has not been fully validated.
- `VITE_DATA_MODE=supabase`: Supabase-backed patient list/create mode. This
  currently verifies Supabase connectivity, but upload/reprocess/Q&A still need
  live frontend wiring before the entire app is truly production-connected.

## 1. Environment values

Local `.env` should contain:

```env
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_N8N_BASE_URL=https://n8n2.srv3.technology-center.info

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_legacy_jwt_secret
OPENAI_API_KEY=your_openai_key
N8N_WEBHOOK_SECRET=your_random_secret
```

Vercel should contain only frontend-safe values:

```env
VITE_DATA_MODE=demo
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_N8N_BASE_URL=https://n8n2.srv3.technology-center.info
```

Use `VITE_DATA_MODE=demo` on Vercel until live processing is fully wired and
tested.

## 2. Seed mock data into Supabase

Use this file:

```text
backend/supabase/seed/production-smoke-test-data.sql
```

Steps:

1. Create a real test user in Supabase Auth.
2. Copy the user's UUID from Supabase Authentication > Users.
3. Open the seed SQL file.
4. Replace `PUT_AUTH_USER_UUID_HERE` with that UUID.
5. Run the SQL in Supabase SQL Editor.
6. Confirm these rows exist:
   - patient: `00000000-0000-4000-8000-000000000001`
   - job: `00000000-0000-4000-8000-000000000010`
   - several documents, pages, medications, allergies, lab results, timeline
     events, and findings.

This seed data is synthetic only.

## 3. Test n8n production webhooks

Run this from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/test-production-webhooks.ps1
```

Expected output:

```text
PASS process-records returned accepted/queued.
PASS ask-record returned answer_status=insufficient.
Webhook smoke test complete.
```

If `ask-record` returns 404, activate `WF-09 Ask Record Question` in n8n.

If `process-records` fails, open the n8n execution log for `WF-01 Process
Patient Record` and check the failing node.

## 4. Test Supabase mode locally

Set local `.env`:

```env
VITE_DATA_MODE=supabase
```

Run:

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:5173/patients
```

Check:

1. Patient list loads without an error state.
2. Create patient works.
3. A new row appears in Supabase `patients`.
4. Refresh the browser and confirm the row remains visible.

If patients do not appear, verify that the signed-in Supabase user owns the
patient rows through `patients.owner_id`.

## 5. Test deployed Vercel demo

For the public submission build, use:

```env
VITE_DATA_MODE=demo
```

Open the Vercel URL in an incognito browser and test:

1. Landing page loads.
2. `Open demo` or `Explore the synthetic case` works.
3. Patient dashboard opens.
4. Findings tab opens.
5. A high-risk finding opens.
6. Evidence drawer opens and closes.
7. Ask tab opens.
8. A supported demo question returns cited evidence.
9. An unsupported question returns insufficient evidence.
10. Mobile viewport has no horizontal clipping.

## 6. What still blocks true full production mode

The current n8n workflows are imported and reachable, but they are still safe
templates. The following work remains before live production processing is real:

- Wire frontend file upload to private Supabase Storage.
- Insert `documents` and `processing_jobs` rows from the frontend.
- Call `POST /webhook/process-records` from the upload/reprocess flow.
- Replace simulated upload progress with real `processing_jobs` progress.
- Load real timeline, medications, labs, findings, and evidence from Supabase.
- Call `POST /webhook/ask-record` from the Ask tab.
- Add JWT and patient-ownership validation inside n8n before activating real
  processing against private data.
- Add OpenAI extraction, embedding, retrieval, and Supabase write nodes inside
  the n8n workflows.

Until those items are complete, use demo mode for public judging and Supabase
mode only for integration testing.

## 7. Final acceptance checklist

- Supabase SQL migrations have run successfully.
- `production-smoke-test-data.sql` has inserted synthetic test data.
- n8n `WF-01` and `WF-09` production URLs respond.
- Local Supabase mode can create/list patient rows.
- Vercel demo mode works in incognito.
- No service-role key, OpenAI key, JWT secret, or n8n secret is exposed in
  frontend environment variables.
- README and technical summary are updated.
- Run before handoff:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

