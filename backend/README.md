# ChartHarbor AI backend

**Every record in view. Every claim anchored.**

This directory contains the platform/backend layer for ChartHarbor AI. It deliberately does not contain Express, FastAPI, or another application server: authenticated browser access is handled by Supabase, orchestration by n8n, and deterministic review logic by this TypeScript package.

This is an information-organization and review prototype, not clinical decision support. It does not provide a diagnosis, recommend medication changes, or claim comprehensive interaction coverage.

## Contents

- `src/`: strict domain contracts, identity quarantine, deterministic clinical rules, confidence scoring, ownership checks, and citation validation.
- `tests/`: Vitest coverage for rules and trust boundaries.
- `supabase/migrations/`: normalized schema, provenance constraints, RLS, private Storage, pgvector index, and patient-filtered similarity RPC.
- `n8n/workflows/`: inactive, importable WF-01..09 and WF-99 templates.
- `n8n/README.md`: credential wiring, node-by-node completion instructions, payloads, and activation checks.
- `prompts/`: versioned v1 bounded-agent prompts.
- `fixtures/`: explicitly synthetic demo metadata. No private or competition medical data is committed.

## Deterministic safety pipeline

`runClinicalRules` emits candidates for:

- same-ingredient duplicates with overlapping/unclear dates and no explicit stop/replacement;
- explicit strength, dose, frequency, route, or timing conflicts without an intentional change;
- normalized medication/allergy matches when the medication is later or chronology is uncertain;
- exact ingredient-pair matches in the curated, cited demonstration interaction table.

Every candidate has deterministic evidence IDs, a rule version, and `requiresEvidenceVerification: true`. The UI must show only candidates accepted by the evidence-verification stage. The curated interaction table is a small competition/demo adapter, not a comprehensive safety database; production should use a licensed, clinically reviewed provider.

Confidence is calculated—not guessed—using:

```text
0.30 extraction quality
+ 0.25 evidence completeness
+ 0.20 cross-document consistency
+ 0.15 normalization certainty
+ 0.10 verifier agreement
```

Bands are high at `>=0.85`, moderate at `>=0.65`, and low below `0.65`. Risk severity is separate.

## Identity and evidence guardrails

Uploaded directory/folder names are never identity evidence. `checkIdentityConsistency` compares explicit name, patient/MRN ID, DOB, sex, and age. Conflicts and insufficient shared identity both quarantine a document for `needs_review`; clinical entities must not be merged until reviewed.

`validateCitations` requires:

- an existing document owned by the requested patient;
- a one-based page within the document;
- an indexed page;
- a normalized snippet that appears on that page;
- at least one citation for a central claim.

## Local verification

Node 20+ is required.

```bash
cd backend
npm install
npm run typecheck
npm test
npm run build
```

Copy `.env.example` to a local ignored environment file only when connecting Supabase/n8n. Keep the service-role and OpenAI keys server-side.

## Supabase

Apply migrations in filename order with the Supabase CLI or dashboard SQL migration tooling. The migrations expect Supabase's `auth`, `storage`, and `extensions` schemas. Embeddings use 1,536 dimensions for `text-embedding-3-small`.

The private bucket path contract is:

```text
{owner_id}/{patient_id}/{document_id}/{sanitized_filename}
```

The `match_patient_chunks` RPC verifies ownership, enforces patient filtering, optionally filters documents, validates threshold, and caps results at 50. The service role bypasses RLS, so n8n must still explicitly validate the caller JWT and patient owner before server-side actions.

## Product API contracts

`POST /webhook/process-records` accepts `patient_id`, `job_id`, and `document_ids`, then immediately returns `202` with `{accepted,job_id,status}`.

`POST /webhook/ask-record` returns `answer`, `answer_status`, `risk_level`, `confidence`, validated `citations`, and `safety_message`. Unsupported questions return `insufficient`, never invented background knowledge.

See [n8n/README.md](n8n/README.md) before activating any exported workflow.

## Dataset note

The supplied competition image set must be treated as messy evidence, not as a trusted patient directory. Do not claim an allergy or completed lab trend unless those facts exist on an actual page. The committed demo fixture is explicitly synthetic so it cannot be mistaken for competition evidence.
