# Implementation plan

## Milestone 1 - evidence-linked cached demo

- Build the frontend shell and responsive patient dashboard.
- Seed a synthetic competition case with timeline, medication, laboratory,
  finding, Q&A, and evidence data.
- Ensure the central judge path works without network access.

Acceptance: open demo, inspect a high-risk candidate, view its exact evidence,
review a lab trend, and ask a multi-document question.

## Milestone 2 - protected data platform

- Apply the Supabase schema, ownership model, indexes, triggers, Storage
  policies, and patient-scoped search function.
- Add direct private uploads, job records, and Realtime subscriptions.
- Verify isolation using two distinct users.

Acceptance: one user cannot list, mutate, search, or sign a URL for another
user's patient data.

## Milestone 3 - document processing

- Import the intake and single-document n8n workflows.
- Preserve page boundaries during PDF/image extraction.
- Validate strict structured outputs and provenance before transactional writes.
- Record model, prompt, latency, token use, retry, and correlation metadata.

Acceptance: a supplied image produces typed entities and a timeline event without
manual database changes.

## Milestone 4 - reconciliation and trends

- Normalize medication names through an adapter with local aliases and optional
  RxNorm lookup.
- Run duplicate, dosage, allergy, and cited interaction rules.
- Compare laboratory points only when units are compatible.
- Verify every candidate before display.

Acceptance: golden cases are repeatable, all critical claims have evidence, and
incompatible lab units are never graphed as one series.

## Milestone 5 - grounded record Q&A

- Retrieve structured records and patient-filtered chunks.
- Produce strict answer status, risk, confidence, citations, and safety wording.
- Reject patient-invalid or page-invalid citations.
- Return insufficient evidence when the record cannot support the central claim.

Acceptance: supported questions cite real pages; unsupported questions clearly
refuse to speculate.

## Milestone 6 - release hardening

- Run typecheck, unit, integration, RLS isolation, and browser journey tests.
- Verify idempotency, prompt-injection resistance, rate/cost limits, and
  recoverable partial failures.
- Deploy the frontend, Supabase project, and n8n instance.

