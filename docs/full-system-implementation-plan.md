# MedTrace AI full system implementation plan

This plan explains how to move MedTrace AI from the current stable demo and
working infrastructure templates into a fully live Supabase + n8n + OpenAI
production flow.

## Current state

Already working:

- React/Vite frontend demo flow.
- Vercel deployment in demo mode.
- Supabase project and SQL schema.
- Supabase mock seed data.
- n8n workflow imports.
- n8n production webhooks for `process-records` and `ask-record`.
- Local test script for n8n webhook reachability.
- README, technical summary, and production test plan.

Not fully live yet:

- Real document upload from frontend to Supabase Storage.
- Real `documents` and `processing_jobs` creation from uploaded files.
- Frontend call from upload/reprocess flow to n8n.
- Real n8n JWT validation and patient ownership verification.
- OpenAI extraction, embeddings, and Supabase writes inside n8n.
- Dashboard loading full real patient results from Supabase.
- Ask tab calling n8n and displaying live cited answers.
- Realtime job progress.

Keep the public deployed app in demo mode until this plan is complete:

```env
VITE_DATA_MODE=demo
```

Use local integration mode for development:

```env
VITE_DATA_MODE=supabase
VITE_N8N_BASE_URL=https://n8n2.srv3.technology-center.info
```

## Architecture target

```text
Browser
  |-- Supabase Auth
  |-- Supabase RLS reads
  |-- Supabase private Storage upload
  |-- POST /webhook/process-records ----> n8n
  |-- POST /webhook/ask-record ---------> n8n
  |-- Realtime processing_jobs updates

n8n
  |-- Validate Supabase JWT
  |-- Confirm patient ownership
  |-- Download private files with service role
  |-- Call OpenAI Responses API
  |-- Run deterministic rules
  |-- Verify evidence
  |-- Write normalized rows to Supabase

Supabase
  |-- Auth users and profiles
  |-- patients/documents/pages/entities/findings
  |-- private medical-documents bucket
  |-- RLS and patient-filtered RPCs
```

## Phase 1 - Supabase auth, profile, and patient ownership

Goal: Supabase mode must create and load patient workspaces owned by the signed
in user.

Files likely affected:

- `frontend/src/lib/data-adapter.ts`
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/pages/PatientListPage.tsx`
- `frontend/src/pages/CreatePatientPage.tsx`
- `frontend/src/types.ts`

Tasks:

1. Add a clean Supabase sign-in/sign-up flow or controlled test login flow.
2. Ensure each authenticated user has a `profiles` row.
3. Update `SupabaseAdapter.createPatient` to include `owner_id = auth.uid()`.
4. Update patient list loading to respect authenticated session state.
5. Add clear empty/error states for unauthenticated or unauthorized access.

Acceptance tests:

- Sign in as test user.
- Create patient.
- Refresh page.
- Patient remains visible.
- Supabase `patients.owner_id` matches the Auth user UUID.
- A second user cannot see the first user's patient.

Do not proceed until this works.

## Phase 2 - Real document upload to Supabase Storage

Goal: The upload dialog should upload files to the private Supabase
`medical-documents` bucket and create matching `documents` rows.

Files likely affected:

- `frontend/src/components/UploadDialog.tsx`
- `frontend/src/pages/PatientDashboardPage.tsx`
- `frontend/src/lib/data-adapter.ts`
- `frontend/src/lib/format.ts`
- `frontend/src/types.ts`

Tasks:

1. Replace simulated upload progress in Supabase mode with real upload logic.
2. Keep demo-mode simulation unchanged.
3. Validate accepted file types:
   - PDF
   - PNG
   - JPG/JPEG
   - WebP
4. Enforce size limits before upload.
5. Create one `documents` row per file.
6. Upload file to this storage path:

   ```text
   {owner_id}/{patient_id}/{document_id}/{sanitized_filename}
   ```

7. Store:
   - `patient_id`
   - `storage_path`
   - `original_filename`
   - `mime_type`
   - `byte_size`
   - `status = uploaded`
8. Show per-file success/failure state.

Acceptance tests:

- Upload one image/PDF.
- File appears in Supabase Storage.
- Row appears in `documents`.
- Storage path follows the required pattern.
- Upload rejects unsupported files.
- Upload rejects oversized files.
- Demo mode still works.

## Phase 3 - Processing job creation and n8n call

Goal: After upload, the frontend creates a job and calls the n8n
`process-records` webhook.

Files likely affected:

- `frontend/src/components/UploadDialog.tsx`
- `frontend/src/pages/PatientDashboardPage.tsx`
- `frontend/src/lib/data-adapter.ts`
- `frontend/src/lib/n8n-client.ts` new
- `frontend/src/types.ts`

Tasks:

1. Add an `n8n-client.ts` helper.
2. Read `VITE_N8N_BASE_URL`.
3. Get the current Supabase access token.
4. Insert a `processing_jobs` row:

   ```text
   patient_id
   idempotency_key
   status = queued
   progress = 0
   requested_document_ids
   ```

5. Call:

   ```text
   POST {VITE_N8N_BASE_URL}/webhook/process-records
   ```

6. Send:

   ```json
   {
     "patient_id": "...",
     "job_id": "...",
     "document_ids": ["..."]
   }
   ```

7. Include:

   ```http
   Authorization: Bearer <supabase_access_token>
   ```

8. Display accepted/queued response in the upload dialog.

Acceptance tests:

- Upload file.
- Job row is created.
- n8n execution appears.
- Webhook returns `accepted=true`.
- UI shows queued/processing state.
- Invalid n8n URL shows a useful error.

## Phase 4 - n8n WF-01 security and job orchestration

Goal: `WF-01 Process Patient Record` becomes a secure, real intake workflow.

n8n workflow:

- `WF-01-process-patient-record.json`

Tasks inside n8n:

1. Read `Authorization: Bearer ...` header.
2. Validate Supabase JWT:
   - signature
   - issuer
   - audience
   - expiry
3. Extract the user ID from the JWT.
4. Query Supabase using service-role credentials.
5. Confirm `patients.id = patient_id` and `patients.owner_id = jwt.sub`.
6. Confirm each requested document belongs to the patient.
7. Update `processing_jobs.status = processing`.
8. Update `processing_jobs.current_stage = validating`.
9. Execute `WF-02 Process One Document` for each document.
10. Execute reconciliation/trend/rules/verification workflows.
11. Mark the job as:
    - `completed`
    - `partial`
    - `failed`
12. Write sanitized errors to `workflow_failures`.

Acceptance tests:

- Valid token + owned patient succeeds.
- Missing token fails.
- Invalid token fails.
- Token for another user fails.
- Document from another patient fails.
- Job status updates in Supabase.

## Phase 5 - One-document extraction pipeline

Goal: n8n can process one uploaded document and write real extracted rows.

n8n workflow:

- `WF-02-process-one-document.json`

Tasks inside n8n:

1. Download the private file from Supabase Storage using service role.
2. Compute SHA-256 and check duplicates.
3. Preserve page boundaries.
4. Send file/page content to OpenAI Responses API.
5. Use strict structured output.
6. Retry once with a repair prompt if schema validation fails.
7. Insert:
   - `document_pages`
   - `visits`
   - `medications`
   - `allergies`
   - `lab_results`
   - `diagnoses`
   - `timeline_events`
   - `document_chunks`
8. Generate embeddings for chunks.
9. Mark document:
   - `completed`
   - `needs_review`
   - `failed`
   - `duplicate`

Acceptance tests:

- One sample PDF/image creates at least one `document_pages` row.
- Extracted clinical rows retain page, snippet, and confidence.
- Document status changes from uploaded to completed/needs_review.
- Bad/corrupt file marks failed without corrupting existing rows.

## Phase 6 - Medication, allergy, lab, and evidence rules

Goal: Real extracted data creates evidence-linked findings.

n8n workflows:

- `WF-03 Normalize Medication`
- `WF-04 Normalize Laboratory Result`
- `WF-05 Medication Reconciliation`
- `WF-06 Laboratory Trends`
- `WF-07 Safety Rules`
- `WF-08 Evidence Verification`

Tasks:

1. Normalize medications through local alias/RxNorm provider.
2. Normalize lab units only when approved.
3. Detect duplicate medications.
4. Detect dosage conflicts.
5. Detect allergy contradictions.
6. Detect curated/licensed interaction candidates.
7. Verify every candidate with source page evidence.
8. Insert:
   - `findings`
   - `finding_evidence`
9. Reject unsupported or contradicted candidates.

Acceptance tests:

- Seeded aspirin allergy + later aspirin medication produces a supported
  allergy contradiction.
- Finding has two evidence rows.
- Evidence snippets map to correct document pages.
- Risk severity and confidence are separate.
- Unsupported candidate is rejected or marked needs review.

## Phase 7 - Dashboard loads real Supabase patient record

Goal: In Supabase mode, the patient dashboard should display real rows instead
of demo-derived rows.

Files likely affected:

- `frontend/src/lib/data-adapter.ts`
- `frontend/src/types.ts`
- `frontend/src/components/DashboardViews.tsx`
- `frontend/src/components/EvidenceDrawer.tsx`
- `frontend/src/pages/PatientDashboardPage.tsx`

Tasks:

1. Update `SupabaseAdapter.getPatientRecord`.
2. Load:
   - patient
   - documents
   - document_pages
   - timeline_events
   - medications
   - allergies
   - lab_results
   - findings
   - finding_evidence
3. Convert Supabase rows into frontend `PatientRecord`.
4. Add fallback labels for missing optional data.
5. Evidence drawer should use real page text/snippet.
6. Keep demo adapter unchanged.

Acceptance tests:

- Open seeded patient.
- Timeline shows seeded events.
- Medication tab shows seeded aspirin/warfarin.
- Lab tab shows seeded HbA1c.
- Findings tab shows seeded allergy contradiction.
- Evidence drawer opens seeded source snippets.

## Phase 8 - Real Ask-the-record workflow

Goal: The Ask tab calls n8n and displays live answers.

Files likely affected:

- `frontend/src/components/DashboardViews.tsx`
- `frontend/src/lib/n8n-client.ts`
- `frontend/src/lib/data-adapter.ts`
- `frontend/src/types.ts`

n8n workflow:

- `WF-09 Ask Record Question`

Tasks:

1. Add frontend `askRecord` function.
2. Create or reuse a `qa_threads` row.
3. Send:

   ```json
   {
     "patient_id": "...",
     "thread_id": "...",
     "question": "..."
   }
   ```

4. Include Supabase access token.
5. In n8n, validate JWT and ownership.
6. Retrieve structured rows and patient-filtered chunks.
7. Call OpenAI Q&A prompt.
8. Validate citations.
9. Write `qa_messages`.
10. Return answer to frontend.

Acceptance tests:

- Supported question returns `answer_status=supported`.
- Unsupported question returns `answer_status=insufficient`.
- Every citation belongs to the patient.
- Invalid patient ID fails.
- Ask tab remains usable on mobile.

## Phase 9 - Realtime job progress

Goal: Upload/reprocess progress reflects actual `processing_jobs`.

Files likely affected:

- `frontend/src/components/UploadDialog.tsx`
- `frontend/src/pages/PatientDashboardPage.tsx`
- `frontend/src/lib/data-adapter.ts`

Tasks:

1. Subscribe to Supabase Realtime for `processing_jobs`.
2. Show:
   - queued
   - processing
   - extracting
   - normalizing
   - checking
   - verifying
   - completed
   - partial
   - failed
3. Replace fake progress in Supabase mode.
4. Keep fake progress in demo mode.
5. Add retry/reprocess behavior.

Acceptance tests:

- Job progress updates without refresh.
- Refresh keeps current job status.
- Failed job shows safe error summary.
- Completed job triggers patient record refresh.

## Phase 10 - Production hardening

Goal: The system is safe enough for a final live demo.

Tasks:

1. Verify no secrets in frontend/Vercel:
   - no service-role key
   - no OpenAI key
   - no JWT secret
   - no n8n webhook secret
2. Test RLS with two users.
3. Test private Storage with two users.
4. Test n8n rejects another user's patient ID.
5. Add OpenAI timeout and retry limits.
6. Add workflow cost tracking.
7. Add sanitized workflow failure logging.
8. Run browser tests on desktop and mobile.
9. Test deployed app in incognito.

Required commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
npm.cmd run test:e2e
```

## Recommended implementation order

Do not implement everything at once. Use this order:

1. Supabase auth/profile/patient ownership.
2. Real file upload to Supabase Storage.
3. Processing job creation.
4. Frontend call to n8n `process-records`.
5. n8n JWT and ownership validation.
6. n8n job status updates.
7. One-document extraction.
8. Real dashboard reads from Supabase.
9. Findings and evidence.
10. Live Ask tab.
11. Realtime progress.
12. Production hardening.

## First milestone to build

The first implementation milestone should be:

```text
Sign in -> create patient -> upload one file -> create document row
-> create processing job -> call n8n -> show queued/completed job in UI
```

This proves the frontend, Supabase, and n8n are connected without needing the
entire AI extraction pipeline yet.

## Safety rule for deployment

Only switch Vercel to:

```env
VITE_DATA_MODE=supabase
```

after the full live path is tested. Until then:

```env
VITE_DATA_MODE=demo
```

is the correct public setting.

