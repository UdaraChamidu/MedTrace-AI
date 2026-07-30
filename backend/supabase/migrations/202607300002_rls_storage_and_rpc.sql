-- Ownership isolation, private Storage, and patient-filtered vector retrieval.

create or replace function public.current_user_owns_patient(target_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.patients
    where id = target_patient_id
      and owner_id = (select auth.uid())
  );
$$;

revoke all on function public.current_user_owns_patient(uuid) from public;
grant execute on function public.current_user_owns_patient(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.documents enable row level security;
alter table public.document_pages enable row level security;
alter table public.document_chunks enable row level security;
alter table public.visits enable row level security;
alter table public.medications enable row level security;
alter table public.allergies enable row level security;
alter table public.lab_results enable row level security;
alter table public.diagnoses enable row level security;
alter table public.timeline_events enable row level security;
alter table public.findings enable row level security;
alter table public.finding_evidence enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.qa_threads enable row level security;
alter table public.qa_messages enable row level security;
alter table public.agent_runs enable row level security;
alter table public.workflow_failures enable row level security;

create policy profiles_own_rows on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy patients_own_rows on public.patients
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy documents_owned_patient on public.documents
  for all to authenticated
  using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));

create policy document_pages_owned_patient on public.document_pages
  for all to authenticated
  using (exists (
    select 1 from public.documents d
    where d.id = document_id and public.current_user_owns_patient(d.patient_id)
  ))
  with check (exists (
    select 1 from public.documents d
    where d.id = document_id and public.current_user_owns_patient(d.patient_id)
  ));

create policy document_chunks_owned_patient on public.document_chunks
  for all to authenticated
  using (exists (
    select 1 from public.documents d
    where d.id = document_id and public.current_user_owns_patient(d.patient_id)
  ))
  with check (exists (
    select 1 from public.documents d
    where d.id = document_id and public.current_user_owns_patient(d.patient_id)
  ));

create policy visits_owned_patient on public.visits
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy medications_owned_patient on public.medications
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy allergies_owned_patient on public.allergies
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy lab_results_owned_patient on public.lab_results
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy diagnoses_owned_patient on public.diagnoses
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy timeline_events_owned_patient on public.timeline_events
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy findings_owned_patient on public.findings
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy processing_jobs_owned_patient on public.processing_jobs
  for all to authenticated using (public.current_user_owns_patient(patient_id))
  with check (public.current_user_owns_patient(patient_id));
create policy qa_threads_owned_patient on public.qa_threads
  for all to authenticated
  using (owner_id = (select auth.uid()) and public.current_user_owns_patient(patient_id))
  with check (owner_id = (select auth.uid()) and public.current_user_owns_patient(patient_id));
create policy agent_runs_owned_patient on public.agent_runs
  for select to authenticated using (public.current_user_owns_patient(patient_id));
create policy workflow_failures_owned_patient on public.workflow_failures
  for select to authenticated using (public.current_user_owns_patient(patient_id));

create policy finding_evidence_owned_patient on public.finding_evidence
  for all to authenticated
  using (exists (
    select 1 from public.findings f
    where f.id = finding_id and public.current_user_owns_patient(f.patient_id)
  ))
  with check (exists (
    select 1 from public.findings f
    where f.id = finding_id and public.current_user_owns_patient(f.patient_id)
  ));

create policy qa_messages_owned_patient on public.qa_messages
  for all to authenticated
  using (exists (
    select 1 from public.qa_threads t
    where t.id = thread_id
      and t.owner_id = (select auth.uid())
      and public.current_user_owns_patient(t.patient_id)
  ))
  with check (exists (
    select 1 from public.qa_threads t
    where t.id = thread_id
      and t.owner_id = (select auth.uid())
      and public.current_user_owns_patient(t.patient_id)
  ));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medical-documents',
  'medical-documents',
  false,
  52428800,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Required object name: {owner_id}/{patient_id}/{document_id}/{sanitized_filename}
create policy medical_documents_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_owns_patient(((storage.foldername(name))[2])::uuid)
  );
create policy medical_documents_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'medical-documents'
    and array_length(storage.foldername(name), 1) >= 4
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_owns_patient(((storage.foldername(name))[2])::uuid)
  );
create policy medical_documents_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_owns_patient(((storage.foldername(name))[2])::uuid)
  )
  with check (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_owns_patient(((storage.foldername(name))[2])::uuid)
  );
create policy medical_documents_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'medical-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.current_user_owns_patient(((storage.foldername(name))[2])::uuid)
  );

create or replace function public.match_patient_chunks(
  query_embedding extensions.vector(1536),
  target_patient_id uuid,
  target_document_ids uuid[] default null,
  match_threshold double precision default 0.60,
  match_count integer default 8
)
returns table (
  chunk_id uuid,
  document_id uuid,
  page_start integer,
  page_end integer,
  content text,
  metadata jsonb,
  similarity double precision
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if not public.current_user_owns_patient(target_patient_id) then
    raise exception 'patient not found or access denied' using errcode = '42501';
  end if;
  if match_threshold < 0 or match_threshold > 1 then
    raise exception 'match_threshold must be between 0 and 1';
  end if;

  return query
  select
    c.id,
    c.document_id,
    c.page_start,
    c.page_end,
    c.content,
    c.metadata,
    (1 - (c.embedding <=> query_embedding))::double precision
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where d.patient_id = target_patient_id
    and c.embedding is not null
    and (target_document_ids is null or c.document_id = any(target_document_ids))
    and (1 - (c.embedding <=> query_embedding)) >= match_threshold
  order by c.embedding <=> query_embedding
  limit least(greatest(match_count, 1), 50);
end;
$$;

revoke all on function public.match_patient_chunks(
  extensions.vector, uuid, uuid[], double precision, integer
) from public;
grant execute on function public.match_patient_chunks(
  extensions.vector, uuid, uuid[], double precision, integer
) to authenticated;
