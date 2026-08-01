# MedTrace AI architecture

## Decision

The implementation follows the project plan's React, Supabase, n8n, and OpenAI
direction without introducing a custom Express or FastAPI service. It uses two
runtime modes behind the same client repository interface:

- **Demo mode** returns cached, synthetic, page-linked results and simulates
  asynchronous processing. It makes the complete product reviewable without
  credentials or network access.
- **Connected mode** uploads files directly to private Supabase Storage, reads
  patient-owned rows through RLS, subscribes to Realtime job updates, and calls
  authenticated n8n webhooks for processing and Q&A.

## Runtime flow

```text
React browser application
  |-- Auth, patient data, results ------> Supabase Auth/PostgreSQL + RLS
  |-- Direct private uploads ----------> Supabase Storage
  |-- process-records / ask-record ----> n8n authenticated webhooks
  |                                        |-- JWT + ownership validation
  |                                        |-- OpenAI structured extraction
  |                                        |-- deterministic clinical rules
  |                                        `-- server-side Supabase writes
  `-- Realtime job updates <----------- Supabase Realtime
```

## Trust boundaries

The browser receives only the Supabase anon key and the signed-in user's JWT.
The service role, OpenAI key, and provider credentials remain in n8n or another
server-side secret store. n8n must validate the JWT signature, issuer, audience,
expiry, and patient ownership before processing a request.

Uploaded content is untrusted. Models receive an explicit instruction not to
follow directions found inside records. Extraction writes are accepted only
after strict schema and citation validation.

## Evidence contract

Every extracted clinical entity stores:

- source document ID;
- source page number;
- exact supporting snippet;
- extraction confidence;
- model and prompt version.

Every derived finding links to one or more source entities through
`finding_evidence`. A Q&A citation is displayed only when its document belongs
to the selected patient and its page exists.

## Clinical reasoning boundary

Language models classify, extract, verify evidence, and produce restrained
plain-language explanations. Deterministic code handles normalized duplicate
medications, incompatible instructions, allergy matches, approved unit
conversions, and interaction-provider lookups. An LLM is never the sole source
of interaction truth.

Risk answers “how concerning is the reviewed candidate?” Confidence answers
“how complete and consistent is the evidence?” They are calculated and
displayed separately.

## Availability and failure behavior

Processing returns `202 Accepted`, records an idempotency key and file hash, and
continues asynchronously. Per-document success remains visible when another
document fails. Retries are bounded, failures are sanitized, and exhausted
items enter `workflow_failures` for review.

