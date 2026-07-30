-- Defense in depth: service-role writes must not create cross-patient provenance.

alter table public.documents
  add constraint documents_id_patient_unique unique (id, patient_id);

alter table public.medications
  add constraint medications_source_document_same_patient
  foreign key (source_document_id, patient_id)
  references public.documents(id, patient_id) on delete cascade;
alter table public.allergies
  add constraint allergies_source_document_same_patient
  foreign key (source_document_id, patient_id)
  references public.documents(id, patient_id) on delete cascade;
alter table public.lab_results
  add constraint lab_results_source_document_same_patient
  foreign key (source_document_id, patient_id)
  references public.documents(id, patient_id) on delete cascade;
alter table public.diagnoses
  add constraint diagnoses_source_document_same_patient
  foreign key (source_document_id, patient_id)
  references public.documents(id, patient_id) on delete cascade;

create or replace function public.enforce_visit_document_patient()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.source_document_id is not null and not exists (
    select 1 from public.documents d
    where d.id = new.source_document_id and d.patient_id = new.patient_id
  ) then
    raise exception 'visit source document must belong to the visit patient'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger visit_document_patient_guard
  before insert or update of patient_id, source_document_id on public.visits
  for each row execute function public.enforce_visit_document_patient();

create or replace function public.enforce_finding_evidence_patient()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.findings f
    join public.documents d on d.id = new.document_id
    where f.id = new.finding_id and f.patient_id = d.patient_id
  ) then
    raise exception 'finding evidence must belong to the finding patient'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger finding_evidence_patient_guard
  before insert or update on public.finding_evidence
  for each row execute function public.enforce_finding_evidence_patient();

create or replace function public.enforce_qa_thread_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.patients p
    where p.id = new.patient_id and p.owner_id = new.owner_id
  ) then
    raise exception 'Q&A thread owner must own the patient'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger qa_thread_owner_guard
  before insert or update on public.qa_threads
  for each row execute function public.enforce_qa_thread_owner();

create or replace function public.enforce_job_document_patient()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from unnest(new.requested_document_ids) requested_id
    where not exists (
      select 1 from public.documents d
      where d.id = requested_id and d.patient_id = new.patient_id
    )
  ) then
    raise exception 'processing job document must belong to the job patient'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger processing_job_document_guard
  before insert or update of patient_id, requested_document_ids on public.processing_jobs
  for each row execute function public.enforce_job_document_patient();

create or replace function public.enforce_agent_job_patient()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.job_id is not null and not exists (
    select 1 from public.processing_jobs j
    where j.id = new.job_id and j.patient_id = new.patient_id
  ) then
    raise exception 'agent/failure job must belong to the same patient'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger agent_runs_job_patient_guard
  before insert or update of patient_id, job_id on public.agent_runs
  for each row execute function public.enforce_agent_job_patient();
create trigger workflow_failures_job_patient_guard
  before insert or update of patient_id, job_id on public.workflow_failures
  for each row execute function public.enforce_agent_job_patient();
