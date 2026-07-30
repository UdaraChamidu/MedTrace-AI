# ChartHarbor AI n8n workflow templates

These ten files are valid, inactive n8n workflow templates. They intentionally contain no credentials and are safe by default. They define triggers, contracts, guardrails, and safe fallback behavior; they are not production-ready until the credentialed nodes below are connected and the checklist passes.

## Import order

Import `WF-99`, then `WF-02` through `WF-08`, then the public entry workflows `WF-01` and `WF-09`. Keep all workflows inactive while configuring credentials. Set WF-99 as the error workflow for WF-01..09.

Create these n8n credentials:

- Supabase server credential using `SUPABASE_URL` and the service-role key. Never expose it to the browser.
- OpenAI credential using the Responses API.
- RxNorm HTTP credential/base URL if the instance requires allow-listing.
- Optional licensed interaction-provider credential. The repository fallback is explicitly curated demo coverage only.

## Mandatory production node wiring

### WF-01 Process Patient Record

The exported template validates the request and demonstrates the immediate `202` response. Before activation, insert these nodes after `Validate Contract` in a background branch:

1. Read the `Authorization: Bearer …` header and validate the JWT against `SUPABASE_JWKS_URL` (issuer, signature, expiry, and audience).
2. Query `patients` for both the request `patient_id` and JWT subject as `owner_id`; return the same `404/403` response for missing and unauthorized patients.
3. Atomically claim `processing_jobs` by `(patient_id,idempotency_key)`.
4. Return `202` before long work; use a separate execution/sub-workflow invocation for processing.
5. Fetch only requested, patient-owned documents and execute WF-02 with controlled concurrency.
6. Execute WF-05, WF-06, WF-07, and WF-08; write timeline events and audit rows.
7. Set the job to `completed`, `partial`, or `failed`.

Input:

```json
{
  "patient_id": "00000000-0000-4000-8000-000000000001",
  "job_id": "00000000-0000-4000-8000-000000000010",
  "document_ids": ["00000000-0000-4000-8000-000000000201"]
}
```

Immediate output:

```json
{"accepted":true,"job_id":"00000000-0000-4000-8000-000000000010","status":"queued"}
```

### WF-02 Process One Document

After `Prepare Document Contract`, add: service-side Storage download, SHA-256, duplicate lookup, page-preserving text/vision extraction, WF-03/WF-04, strict schema validation, one repair retry, identity-consistency check, one database transaction, page-aware chunks, embeddings, and final document status.

If explicit name, external patient ID, DOB, sex, or age conflicts—or shared identity evidence is insufficient—set `documents.identity_status` accordingly, set status `needs_review`, and stop clinical merge. Folder labels are not identity evidence.

### WF-03 Normalize Medication

Call RxNorm approximate matching with `rxnorm_query`; preserve `original_name`. Store RxCUI, normalized ingredient/product, response confidence, and ambiguity. Never treat a spelling guess as certain.

### WF-04 Normalize Laboratory Result

Map approved aliases, parse comparator/value/unit/range, and apply only reviewed conversion rules. Keep the original value/unit. `comparison_eligible=false` prevents incompatible-unit trends.

### WF-05 Medication Reconciliation

Fetch patient-scoped medications and run `@chartharbor/backend` deterministic duplicate and dosage-conflict functions in a task runner or bundled Code node. The model may explain supplied candidates but may not create interaction truth.

### WF-06 Laboratory Trends

Group by canonical test and compatible unit, sort by observation time, require at least two values, compute direction, then call the v1 lab prompt for restrained wording. Every point retains evidence.

### WF-07 Safety Rules

Supply candidates created by the TypeScript rule engine (duplicate, dosage, allergy, curated/licensed interaction). The template rejects unversioned or non-verifiable candidates.

### WF-08 Evidence Verification

Fetch cited structured entities and page text, call the configured high-reasoning verifier with strict output, then run citation validation. Persist only `supported` or `partially_supported`; reject `contradicted`/`insufficient`.

### WF-09 Ask Record Question

The importable template safely returns `insufficient`. Replace the middle node with:

1. JWT and patient-ownership validation identical to WF-01.
2. Structured SQL retrieval.
3. `match_patient_chunks` RPC with patient filter.
4. v1 QA strict output call.
5. patient/page/snippet citation validation.
6. confidence calculation and mandatory safety wording.
7. `qa_messages` write and response.

Never activate WF-09 with retrieval but without the citation gate.

### WF-99 Error Handler

After `Sanitize Failure`, insert a Supabase write to `workflow_failures`. Retry only transient timeouts, `429`, and `5xx` errors with bounded exponential backoff. Do not store tokens, raw document content, credentials, or model chain-of-thought in errors.

## Verification checklist

- Workflows import without JSON errors and remain inactive until configured.
- JWT signature/issuer/expiry/audience and patient ownership are enforced for both webhooks.
- A second user cannot read, process, retrieve, or cite the first user's patient.
- Long processing responds `202` quickly and updates `processing_jobs`.
- Repeated idempotency keys and SHA-256 values do not duplicate clinical rows.
- Conflicting/insufficient explicit identity is quarantined.
- Model calls have timeout, one schema-repair retry, correlation ID, model/prompt version, and token audit.
- Every safety candidate passes WF-08.
- Every answer citation belongs to the patient, page exists, and snippet maps to the page.
- Storage bucket is private and the service-role key never appears in frontend variables.
