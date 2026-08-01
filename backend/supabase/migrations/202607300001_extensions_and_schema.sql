-- MedTrace AI platform schema.
-- Every record in view. Every claim anchored.

create extension if not exists pgcrypto;
create extension if not exists vector with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  display_label text not null check (length(trim(display_label)) between 1 and 120),
  external_reference text,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp')),
  byte_size bigint not null check (byte_size > 0),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  document_type text,
  document_date date,
  status text not null default 'uploaded'
    check (status in ('uploaded', 'queued', 'processing', 'completed', 'needs_review', 'failed', 'duplicate')),
  page_count integer check (page_count is null or page_count >= 1),
  identity_status text not null default 'unverified'
    check (identity_status in ('unverified', 'consistent', 'conflicting', 'insufficient')),
  identity_fingerprint jsonb not null default '{}'::jsonb,
  duplicate_of_document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (patient_id, storage_path)
);

create unique index documents_patient_sha256_unique
  on public.documents(patient_id, sha256)
  where sha256 is not null and status <> 'duplicate';
create index documents_patient_status_idx on public.documents(patient_id, status);

create table public.document_pages (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  page_number integer not null check (page_number >= 1),
  page_text text not null default '',
  ocr_confidence numeric(5,4) check (ocr_confidence between 0 and 1),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (document_id, page_number)
);

create table public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  page_start integer not null check (page_start >= 1),
  page_end integer not null check (page_end >= page_start),
  content text not null check (length(trim(content)) > 0),
  embedding extensions.vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);
create index document_chunks_document_idx on public.document_chunks(document_id);
create index document_chunks_embedding_hnsw_idx on public.document_chunks
  using hnsw (embedding extensions.vector_cosine_ops)
  where embedding is not null;

create table public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  source_document_id uuid references public.documents(id) on delete set null,
  visit_date date,
  provider text,
  facility text,
  visit_type text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index visits_patient_date_idx on public.visits(patient_id, visit_date);

create table public.medications (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  visit_id uuid references public.visits(id) on delete set null,
  original_name text not null check (length(trim(original_name)) > 0),
  normalized_name text,
  normalized_ingredient text,
  rxcui text,
  normalization_confidence numeric(5,4) not null default 0 check (normalization_confidence between 0 and 1),
  strength text,
  dose text,
  frequency text,
  route text,
  timing text,
  status text not null default 'unknown'
    check (status in ('prescribed', 'continued', 'changed', 'stopped', 'historical', 'unknown')),
  prescribed_date date,
  start_date date,
  end_date date,
  explicit_replacement_for_id uuid references public.medications(id) on delete set null,
  source_document_id uuid not null references public.documents(id) on delete cascade,
  source_page integer not null check (source_page >= 1),
  source_text text not null check (length(trim(source_text)) > 0),
  extraction_confidence numeric(5,4) not null check (extraction_confidence between 0 and 1),
  extractor_model text not null,
  prompt_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index medications_patient_ingredient_idx
  on public.medications(patient_id, normalized_ingredient);
create index medications_patient_dates_idx
  on public.medications(patient_id, start_date, end_date);

create table public.allergies (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  substance_original text not null check (length(trim(substance_original)) > 0),
  substance_normalized text,
  reaction text,
  recorded_date date,
  status text not null default 'unknown' check (status in ('active', 'inactive', 'unknown')),
  source_document_id uuid not null references public.documents(id) on delete cascade,
  source_page integer not null check (source_page >= 1),
  source_text text not null check (length(trim(source_text)) > 0),
  extraction_confidence numeric(5,4) not null check (extraction_confidence between 0 and 1),
  extractor_model text not null,
  prompt_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index allergies_patient_substance_idx
  on public.allergies(patient_id, substance_normalized);

create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  visit_id uuid references public.visits(id) on delete set null,
  observed_at timestamptz,
  test_code text,
  test_name text not null check (length(trim(test_name)) > 0),
  value_numeric numeric,
  value_text text,
  comparator text check (comparator is null or comparator in ('<', '<=', '=', '>=', '>')),
  unit text,
  normalized_value numeric,
  normalized_unit text,
  range_low numeric,
  range_high numeric,
  flag text not null default 'unknown' check (flag in ('low', 'normal', 'high', 'abnormal', 'unknown')),
  source_document_id uuid not null references public.documents(id) on delete cascade,
  source_page integer not null check (source_page >= 1),
  source_text text not null check (length(trim(source_text)) > 0),
  extraction_confidence numeric(5,4) not null check (extraction_confidence between 0 and 1),
  extractor_model text not null,
  prompt_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (value_numeric is not null or value_text is not null),
  check (range_high is null or range_low is null or range_high >= range_low)
);
create index lab_results_patient_test_date_idx
  on public.lab_results(patient_id, test_code, observed_at);

create table public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  visit_id uuid references public.visits(id) on delete set null,
  name text not null check (length(trim(name)) > 0),
  code text,
  status text not null default 'documented'
    check (status in ('documented', 'historical', 'resolved', 'unknown')),
  source_document_id uuid not null references public.documents(id) on delete cascade,
  source_page integer not null check (source_page >= 1),
  source_text text not null check (length(trim(source_text)) > 0),
  extraction_confidence numeric(5,4) not null check (extraction_confidence between 0 and 1),
  extractor_model text not null,
  prompt_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index diagnoses_patient_name_idx on public.diagnoses(patient_id, name);

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  event_date date,
  event_type text not null,
  title text not null,
  summary text not null,
  source_refs jsonb not null default '[]'::jsonb check (jsonb_typeof(source_refs) = 'array'),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index timeline_events_patient_date_idx
  on public.timeline_events(patient_id, event_date desc);

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  deterministic_key text not null,
  finding_type text not null
    check (finding_type in ('duplicate_medication', 'dosage_conflict', 'allergy_contradiction', 'drug_interaction', 'lab_trend')),
  severity text not null
    check (severity in ('informational', 'low', 'medium', 'high', 'critical')),
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  confidence_band text not null check (confidence_band in ('low', 'moderate', 'high')),
  status text not null default 'candidate'
    check (status in ('candidate', 'supported', 'partially_supported', 'rejected', 'needs_review')),
  title text not null,
  explanation text not null,
  rule_id text,
  verifier_status text check (verifier_status is null or verifier_status in ('supported', 'partially_supported', 'contradicted', 'insufficient')),
  verifier_rationale_safe text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (patient_id, deterministic_key)
);
create index findings_patient_severity_idx on public.findings(patient_id, severity, status);

create table public.finding_evidence (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references public.findings(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  page_number integer not null check (page_number >= 1),
  entity_type text not null check (entity_type in ('medication', 'allergy', 'lab_result', 'diagnosis', 'visit', 'document')),
  entity_id uuid,
  snippet text not null check (length(trim(snippet)) > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (finding_id, document_id, page_number, entity_type, entity_id)
);
create index finding_evidence_finding_idx on public.finding_evidence(finding_id);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  idempotency_key text not null,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'partial', 'failed', 'cancelled')),
  progress integer not null default 0 check (progress between 0 and 100),
  current_stage text,
  correlation_id uuid not null default gen_random_uuid(),
  requested_document_ids uuid[] not null default '{}',
  error_summary text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (patient_id, idempotency_key)
);
create index processing_jobs_patient_created_idx
  on public.processing_jobs(patient_id, created_at desc);

create table public.qa_threads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
create index qa_threads_patient_idx on public.qa_threads(patient_id, created_at desc);

create table public.qa_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.qa_threads(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(trim(content)) > 0),
  answer_status text check (answer_status is null or answer_status in ('supported', 'partially_supported', 'contradicted', 'insufficient')),
  risk_level text check (risk_level is null or risk_level in ('informational', 'low', 'medium', 'high', 'critical')),
  confidence numeric(5,4) check (confidence between 0 and 1),
  citations jsonb not null default '[]'::jsonb check (jsonb_typeof(citations) = 'array'),
  safety_message text,
  created_at timestamptz not null default timezone('utc', now())
);
create index qa_messages_thread_created_idx on public.qa_messages(thread_id, created_at);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.processing_jobs(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  correlation_id uuid not null,
  agent_name text not null,
  agent_version text not null,
  model text,
  prompt_version text,
  status text not null check (status in ('started', 'completed', 'failed', 'timed_out')),
  retry_count integer not null default 0 check (retry_count >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  estimated_cost_usd numeric(12,6) check (estimated_cost_usd is null or estimated_cost_usd >= 0),
  schema_valid boolean,
  safe_error jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);
create index agent_runs_job_idx on public.agent_runs(job_id, created_at);

create table public.workflow_failures (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.processing_jobs(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  correlation_id uuid not null,
  workflow text not null,
  node_name text,
  error_code text not null,
  retryable boolean not null default false,
  retry_count integer not null default 0 check (retry_count >= 0),
  payload_safe jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);
create index workflow_failures_unresolved_idx
  on public.workflow_failures(patient_id, created_at)
  where resolved_at is null;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger patients_set_updated_at before update on public.patients
  for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
create trigger visits_set_updated_at before update on public.visits
  for each row execute function public.set_updated_at();
create trigger medications_set_updated_at before update on public.medications
  for each row execute function public.set_updated_at();
create trigger allergies_set_updated_at before update on public.allergies
  for each row execute function public.set_updated_at();
create trigger lab_results_set_updated_at before update on public.lab_results
  for each row execute function public.set_updated_at();
create trigger diagnoses_set_updated_at before update on public.diagnoses
  for each row execute function public.set_updated_at();
create trigger timeline_events_set_updated_at before update on public.timeline_events
  for each row execute function public.set_updated_at();
create trigger findings_set_updated_at before update on public.findings
  for each row execute function public.set_updated_at();
create trigger processing_jobs_set_updated_at before update on public.processing_jobs
  for each row execute function public.set_updated_at();
create trigger qa_threads_set_updated_at before update on public.qa_threads
  for each row execute function public.set_updated_at();
