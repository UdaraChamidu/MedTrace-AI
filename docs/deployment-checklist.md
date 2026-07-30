# Deployment checklist

## Secrets and access

- [ ] No `.env`, service-role key, OpenAI key, or n8n credential is committed.
- [ ] Frontend contains only the Supabase anon key.
- [ ] RLS is enabled on every patient-owned table.
- [ ] Two-user isolation tests pass.
- [ ] Storage bucket is private and evidence uses short-lived signed URLs.
- [ ] n8n validates JWT signature and patient ownership.

## Data and safety

- [ ] Public demo uses synthetic or explicitly licensed competition fixtures.
- [ ] Upload type, magic bytes, size, and count are validated.
- [ ] Retention and deletion behavior is documented for the deployment.
- [ ] Every displayed clinical claim has valid page evidence.
- [ ] Risk and confidence are shown separately.
- [ ] Diagnosis and medication-change disclaimers remain visible.
- [ ] Interaction-provider limitations are disclosed.

## Reliability

- [ ] Processing webhook returns `202 Accepted` promptly.
- [ ] File hashes and idempotency keys are enforced.
- [ ] AI calls have timeouts, retry ceilings, cost limits, and audit records.
- [ ] Partial document failures remain recoverable.
- [ ] Typecheck, tests, lint, and production build pass.
- [ ] The deployed URL is tested in a private browser session.

