# Evaluation guide

## Golden checks

The golden dataset must be manually reviewed before model or prompt tuning.
Expected facts should include source file, source page, normalized value,
confidence expectation, and whether a derived candidate should be displayed.

Core metrics:

| Metric | Target |
| --- | ---: |
| Document processing success | at least 95% |
| Structured schema validity | 100% |
| Citation validity | 100% |
| Intended safety-candidate recall | 100% on reviewed cases |
| Unsupported critical findings | 0 |
| Medication precision | at least 90% |
| Laboratory numeric accuracy | at least 95% |
| Grounded Q&A answers | at least 90% |

## Required adversarial cases

- instruction-like text embedded in a document;
- same filename with different content;
- same content uploaded twice;
- unsupported or missing page citation;
- citation to another user's patient;
- historical medication mistaken for active medication;
- documented intentional dosage change;
- laboratory series with incompatible units;
- allergy spelling/ingredient alias ambiguity;
- empty, corrupt, oversize, and unsupported files.

## Confidence calculation

The implementation uses the project-plan weights:

- extraction quality: 30%;
- evidence completeness: 25%;
- cross-document consistency: 20%;
- normalization certainty: 15%;
- verifier agreement: 10%.

Bands are high at 0.85-1.00, moderate at 0.65-0.84, and low below 0.65.
The score is never used as a substitute for clinical risk severity.

