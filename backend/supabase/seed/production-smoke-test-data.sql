-- MedTrace AI production smoke-test data.
--
-- How to use:
-- 1. In Supabase, create/sign in with one real test user.
-- 2. Go to Authentication > Users and copy that user's UUID.
-- 3. Replace PUT_AUTH_USER_UUID_HERE below with that UUID.
-- 4. Run this file in Supabase SQL Editor.
--
-- This inserts synthetic data only. It is not real medical data.

begin;

do $$
declare
  owner_uuid uuid := 'PUT_AUTH_USER_UUID_HERE';
  patient_uuid uuid := '00000000-0000-4000-8000-000000000001';
  allergy_doc_uuid uuid := '00000000-0000-4000-8000-000000000201';
  prescription_doc_uuid uuid := '00000000-0000-4000-8000-000000000202';
  lab_doc_uuid uuid := '00000000-0000-4000-8000-000000000203';
  visit_2019_uuid uuid := '00000000-0000-4000-8000-000000000301';
  visit_2024_uuid uuid := '00000000-0000-4000-8000-000000000302';
  finding_uuid uuid := '00000000-0000-4000-8000-000000000401';
  qa_thread_uuid uuid := '00000000-0000-4000-8000-000000000501';
begin
  if owner_uuid::text = 'PUT_AUTH_USER_UUID_HERE' then
    raise exception 'Replace PUT_AUTH_USER_UUID_HERE with a real auth.users.id before running this seed.';
  end if;

  insert into public.profiles (id, display_name)
  values (owner_uuid, 'MedTrace Smoke Tester')
  on conflict (id) do update set display_name = excluded.display_name;

  insert into public.patients (id, owner_id, display_label, external_reference, is_synthetic)
  values (patient_uuid, owner_uuid, 'Maya Fernando - Smoke Test', 'SMOKE-MAYA-001', true)
  on conflict (id) do update set
    owner_id = excluded.owner_id,
    display_label = excluded.display_label,
    external_reference = excluded.external_reference,
    is_synthetic = excluded.is_synthetic;

  insert into public.documents (
    id, patient_id, storage_path, original_filename, mime_type, byte_size, sha256,
    document_type, document_date, status, page_count, identity_status
  )
  values
    (
      allergy_doc_uuid, patient_uuid,
      owner_uuid || '/' || patient_uuid || '/' || allergy_doc_uuid || '/allergy-note.pdf',
      'allergy-note.pdf', 'application/pdf', 128000,
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'clinical_note', '2019-02-14', 'completed', 1, 'consistent'
    ),
    (
      prescription_doc_uuid, patient_uuid,
      owner_uuid || '/' || patient_uuid || '/' || prescription_doc_uuid || '/cardiology-prescription.pdf',
      'cardiology-prescription.pdf', 'application/pdf', 142000,
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      'prescription', '2024-03-22', 'completed', 1, 'consistent'
    ),
    (
      lab_doc_uuid, patient_uuid,
      owner_uuid || '/' || patient_uuid || '/' || lab_doc_uuid || '/lab-panel.pdf',
      'lab-panel.pdf', 'application/pdf', 155000,
      'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      'lab_report', '2025-01-12', 'completed', 1, 'consistent'
    )
  on conflict (id) do update set
    status = excluded.status,
    page_count = excluded.page_count,
    identity_status = excluded.identity_status;

  insert into public.document_pages (document_id, page_number, page_text, ocr_confidence)
  values
    (
      allergy_doc_uuid, 1,
      'Harbor Family Practice. Patient: Maya Fernando. Visit: 14 February 2019. Known allergies: Aspirin - rash and facial swelling. Avoid aspirin-containing products.',
      0.9800
    ),
    (
      prescription_doc_uuid, 1,
      'Cardiology prescription. Patient: Maya Fernando. Date: 22 March 2024. Aspirin 75 mg once daily for 30 days. Warfarin 5 mg once daily - continue.',
      0.9700
    ),
    (
      lab_doc_uuid, 1,
      'Laboratory report. Patient: Maya Fernando. Date: 12 January 2025. HbA1c 8.1 percent. Reference target noted by source laboratory: below 7.0 percent.',
      0.9600
    )
  on conflict (document_id, page_number) do update set
    page_text = excluded.page_text,
    ocr_confidence = excluded.ocr_confidence;

  insert into public.document_chunks (document_id, page_start, page_end, content, metadata)
  values
    (allergy_doc_uuid, 1, 1, 'Known allergies: Aspirin - rash and facial swelling.', '{"smoke_test": true}'::jsonb),
    (prescription_doc_uuid, 1, 1, 'Aspirin 75 mg once daily for 30 days. Warfarin 5 mg once daily - continue.', '{"smoke_test": true}'::jsonb),
    (lab_doc_uuid, 1, 1, 'HbA1c 8.1 percent. Reference target below 7.0 percent.', '{"smoke_test": true}'::jsonb);

  insert into public.visits (id, patient_id, source_document_id, visit_date, provider, facility, visit_type)
  values
    (visit_2019_uuid, patient_uuid, allergy_doc_uuid, '2019-02-14', 'Dr. L. Perera', 'Harbor Family Practice', 'Allergy review'),
    (visit_2024_uuid, patient_uuid, prescription_doc_uuid, '2024-03-22', 'Dr. S. Kumar', 'North Cardiology Clinic', 'Prescription review')
  on conflict (id) do update set
    source_document_id = excluded.source_document_id,
    visit_date = excluded.visit_date,
    provider = excluded.provider,
    facility = excluded.facility,
    visit_type = excluded.visit_type;

  insert into public.allergies (
    patient_id, substance_original, substance_normalized, reaction, recorded_date, status,
    source_document_id, source_page, source_text, extraction_confidence, extractor_model, prompt_version
  )
  values (
    patient_uuid, 'Aspirin', 'aspirin', 'rash and facial swelling', '2019-02-14', 'active',
    allergy_doc_uuid, 1,
    'Known allergies: Aspirin - rash and facial swelling. Avoid aspirin-containing products.',
    0.9400, 'smoke-test-fixture', 'clinical-extractor/v1'
  );

  insert into public.medications (
    patient_id, visit_id, original_name, normalized_name, normalized_ingredient,
    normalization_confidence, strength, dose, frequency, route, status, prescribed_date,
    start_date, source_document_id, source_page, source_text, extraction_confidence,
    extractor_model, prompt_version
  )
  values
    (
      patient_uuid, visit_2024_uuid, 'Aspirin 75 mg', 'aspirin 75 mg tablet', 'aspirin',
      0.9300, '75 mg', 'one tablet', 'once daily', 'oral', 'prescribed', '2024-03-22',
      '2024-03-22', prescription_doc_uuid, 1,
      'Aspirin 75 mg once daily for 30 days.',
      0.9200, 'smoke-test-fixture', 'clinical-extractor/v1'
    ),
    (
      patient_uuid, visit_2024_uuid, 'Warfarin 5 mg', 'warfarin 5 mg tablet', 'warfarin',
      0.9100, '5 mg', 'one tablet', 'once daily', 'oral', 'continued', '2024-03-22',
      '2024-03-22', prescription_doc_uuid, 1,
      'Warfarin 5 mg once daily - continue.',
      0.9000, 'smoke-test-fixture', 'clinical-extractor/v1'
    );

  insert into public.lab_results (
    patient_id, observed_at, test_code, test_name, value_numeric, comparator,
    unit, normalized_value, normalized_unit, range_high, flag, source_document_id,
    source_page, source_text, extraction_confidence, extractor_model, prompt_version
  )
  values (
    patient_uuid, '2025-01-12 08:30:00+00', 'HBA1C', 'HbA1c',
    8.1, '=', '%', 8.1, '%', 7.0, 'high',
    lab_doc_uuid, 1,
    'HbA1c 8.1 percent. Reference target below 7.0 percent.',
    0.9100, 'smoke-test-fixture', 'clinical-extractor/v1'
  );

  insert into public.timeline_events (patient_id, event_date, event_type, title, summary, source_refs)
  values
    (
      patient_uuid, '2019-02-14', 'allergy',
      'Aspirin allergy documented',
      'Source page documents aspirin allergy with rash and facial swelling.',
      jsonb_build_array(jsonb_build_object('document_id', allergy_doc_uuid, 'page', 1))
    ),
    (
      patient_uuid, '2024-03-22', 'medication',
      'Aspirin prescription appears later in record',
      'Prescription page lists aspirin 75 mg once daily.',
      jsonb_build_array(jsonb_build_object('document_id', prescription_doc_uuid, 'page', 1))
    ),
    (
      patient_uuid, '2025-01-12', 'laboratory',
      'HbA1c result recorded',
      'Lab report lists HbA1c 8.1 percent.',
      jsonb_build_array(jsonb_build_object('document_id', lab_doc_uuid, 'page', 1))
    );

  insert into public.findings (
    id, patient_id, deterministic_key, finding_type, severity, confidence,
    confidence_band, status, title, explanation, rule_id, verifier_status,
    verifier_rationale_safe, metadata
  )
  values (
    finding_uuid, patient_uuid, 'smoke-allergy-aspirin-2024',
    'allergy_contradiction', 'high', 0.9200, 'high', 'supported',
    'Aspirin appears after an earlier aspirin allergy',
    'The smoke-test record contains an earlier aspirin allergy page and a later aspirin prescription page. This is a review candidate and requires professional verification.',
    'SMOKE-ALLERGY-001', 'supported',
    'Both the allergy and later medication are visible in patient-owned source pages.',
    '{"smoke_test": true}'::jsonb
  )
  on conflict (id) do update set
    confidence = excluded.confidence,
    status = excluded.status,
    title = excluded.title,
    explanation = excluded.explanation;

  insert into public.finding_evidence (
    finding_id, document_id, page_number, entity_type, snippet
  )
  values
    (
      finding_uuid, allergy_doc_uuid, 1, 'allergy',
      'Known allergies: Aspirin - rash and facial swelling.'
    ),
    (
      finding_uuid, prescription_doc_uuid, 1, 'medication',
      'Aspirin 75 mg once daily for 30 days.'
    )
  on conflict do nothing;

  insert into public.processing_jobs (
    id, patient_id, idempotency_key, status, progress, current_stage,
    requested_document_ids, started_at, completed_at
  )
  values (
    '00000000-0000-4000-8000-000000000010',
    patient_uuid,
    'smoke-test-job-001',
    'completed',
    100,
    'Smoke test fixture loaded',
    array[allergy_doc_uuid, prescription_doc_uuid, lab_doc_uuid],
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update set
    status = excluded.status,
    progress = excluded.progress,
    current_stage = excluded.current_stage,
    requested_document_ids = excluded.requested_document_ids,
    completed_at = excluded.completed_at;

  insert into public.qa_threads (id, patient_id, owner_id, title)
  values (qa_thread_uuid, patient_uuid, owner_uuid, 'Smoke test Q&A')
  on conflict (id) do update set title = excluded.title;

  insert into public.qa_messages (
    thread_id, role, content, answer_status, risk_level, confidence, citations, safety_message
  )
  values
    (
      qa_thread_uuid, 'user',
      'Was aspirin prescribed despite an earlier allergy?',
      null, null, null, '[]'::jsonb, null
    ),
    (
      qa_thread_uuid, 'assistant',
      'The smoke-test record contains an earlier aspirin allergy note and a later aspirin prescription page. This is a review candidate and should be verified by a doctor or pharmacist.',
      'supported', 'high', 0.9200,
      jsonb_build_array(
        jsonb_build_object('document_id', allergy_doc_uuid, 'page', 1, 'snippet', 'Known allergies: Aspirin - rash and facial swelling.'),
        jsonb_build_object('document_id', prescription_doc_uuid, 'page', 1, 'snippet', 'Aspirin 75 mg once daily for 30 days.')
      ),
      'This application does not provide a diagnosis. Please verify high-risk or uncertain findings with a doctor or pharmacist.'
    );

  raise notice 'Smoke-test patient ready: %', patient_uuid;
end $$;

commit;
