# ChartHarbor AI contributor guide

## Product boundary

ChartHarbor AI organizes and cross-checks uploaded medical records. It is not a
diagnostic or prescribing system. Never add language that tells a user to start,
stop, or change medication.

## Repository boundaries

- `frontend/` owns the React application and client-side adapters.
- `backend/` owns schemas, rules, prompts, Supabase migrations, and n8n exports.
- `project_docs/` and `DataSet YGC26/` are source material. Do not modify them.

## Engineering rules

- Every clinical claim must retain document, page, snippet, and confidence.
- Risk severity and evidence confidence are separate values.
- Drug interaction truth comes from deterministic, cited data providers, never
  solely from a language model.
- Treat filenames and document content as untrusted input.
- Do not commit credentials, private medical data, or permanent public file URLs.
- Keep the credential-free demo path working while adding cloud integrations.
- Run typecheck, tests, and a production build before handing off changes.

