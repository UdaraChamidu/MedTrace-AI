# Supplied dataset audit

Audit date: 30 July 2026  
Scope: all 16 images under `DataSet YGC26/`

## Executive finding

The directory labels are not reliable patient identity or chronology. Documents
grouped under the same `Patient x` or `Patient y` folder contain conflicting
names, patient IDs, ages, sexes, locations, and dates. The application must not
silently merge every file in a folder into one longitudinal patient.

An intake identity guard should compare explicit patient identifiers and route
conflicting records to `needs_review`. Folder names and upload batches are
context, not proof of identity.

## Inventory quality

| Observation | Golden behavior |
| --- | --- |
| 16 PNG/JPEG prescription or clinical-note images | Accept image-first input and preserve each image as page 1 |
| Dates range from 1999 to 2025 and do not follow folder “year” order | Normalize only unambiguous dates; retain raw ambiguous dates |
| Patient names/IDs/demographics conflict inside both top-level folders | Quarantine conflicting records; do not build a false timeline |
| No documented allergy list or explicit NKDA | Store allergy status as unknown; never infer no known allergies |
| No completed lab values or reference ranges | Do not invent lab trends; investigation orders are not results |
| Several products, strengths, routes, and instructions are unclear or implausible | Preserve the original text and mark uncertainty/review |

## Exact duplicate

These two files are byte-identical and must resolve to one processed document:

- `DataSet YGC26/DataSet YGC26/Patient y/Year 3/2.jpg`
- `DataSet YGC26/DataSet YGC26/Patient y/Year 3/3.jpg`

SHA-256:

```text
2ED598C9C904E53D78A6F0E0AF255CC965415E8466A52896592EF33C96E1B837
```

Expected behavior: the second intake returns a duplicate/idempotent result and
does not create a second encounter or double-count isosorbide, atenolol, or
aspirin.

## High-value reviewed cases

### Pediatric prescription safety candidate

Source: `Patient x/Year 3/2.png`

The document states a four-month-old patient and includes warfarin,
aspirin/codeine, and amphetamine/dextroamphetamine mixed salts. Strengths and
monitoring evidence are missing, and the stated warfarin schedule/quantity do
not agree.

Expected behavior:

- preserve the page as evidence;
- flag a possible warfarin plus aspirin bleeding-risk pair using a cited,
  deterministic interaction rule;
- surface age/formulation and incomplete-dose concerns as review candidates,
  not diagnoses;
- show high risk separately from evidence confidence;
- recommend immediate professional verification without recommending a
  medication change.

### Duplicate beta-blocker candidate

Source: `Patient y/Year 3/6.jpg`

The handwritten record appears to contain Betaloc/metoprolol 100 mg twice daily
and oxprenolol 50 mg once daily. It also lists a suspect oral dorzolamide form
and unusual cimetidine strength.

Expected behavior:

- normalize brand and ingredient only when confidence meets the threshold;
- identify the two beta blockers as a possible therapeutic duplicate;
- keep the handwriting, strength, formulation, and duration uncertainties
  visible;
- do not claim the combination is definitively unsafe.

### Same-day prescription context

Sources: `Patient y/Year 3/2.jpg` and `Patient y/Year 3/4.jpg`

Both appear to describe the same named patient and date, but include different
medication sets and a provider-header/signature discrepancy. These may form one
reviewable same-day context only after identity confirmation.

Expected behavior: retain provider discrepancy and uncertain encounter linkage
rather than silently collapsing records.

### Ambiguous or incomplete dosage

Examples:

- `Patient y/Year 3/1.png`: amoxicillin “1 teaspoon” without a liquid
  concentration;
- `Patient x/Year 2/2.png`: twice-daily for eight days but a total of 20 stated;
- `Patient x/Year 3/2.png`: nightly warfarin for one week but total quantity 5;
- `Patient y/Year 2/2.jpg`: handwritten compounded-product terms with only
  moderate extraction confidence.

Expected behavior: show the mismatch or missing component and label the dose as
not fully verifiable. Never fill missing strength, unit, or duration from model
intuition.

## What the supplied set cannot validate

The supplied images alone cannot validate:

- an allergy-contradiction workflow;
- a measured longitudinal laboratory trend;
- a single continuous multi-year patient timeline.

The credential-free product demo therefore uses a clearly labelled synthetic
case for lab trends and allergy reasoning. Those synthetic results must not be
presented as extracted from the supplied YGC images. Live evaluation of the
provided images should focus on identity consistency, duplicate ingestion,
medication extraction, dosage completeness, and deterministic medication
cross-checks.

## Golden acceptance rules

1. Duplicate file content is idempotent per patient.
2. Conflicting explicit identities are never auto-merged.
3. Missing allergy evidence remains `unknown`, not `none`.
4. Investigation orders never become lab results.
5. Ambiguous locale dates retain their source text and review state.
6. Missing concentrations, strengths, units, and durations are never invented.
7. Safety candidates retain exact source image, page 1, and snippet.
8. No interaction claim is created solely from language-model output.
9. Every high-risk or low-confidence result recommends doctor/pharmacist review.
10. The UI never instructs the user to start, stop, or change medication.

