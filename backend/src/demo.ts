import type { Allergy, Medication } from "./domain.js";

export const SYNTHETIC_DEMO_NOTICE =
  "Synthetic demonstration data for ChartHarbor AI; not taken from the competition image set.";

const patientId = "00000000-0000-4000-8000-000000000001";

export const syntheticDemoMedications: readonly Medication[] = Object.freeze([
  {
    id: "00000000-0000-4000-8000-000000000101",
    patientId,
    originalName: "Warfarin 5 mg",
    normalizedName: "warfarin 5 mg tablet",
    normalizedIngredient: "warfarin",
    rxcui: "855332",
    normalizationConfidence: 0.98,
    instruction: {
      strength: "5 mg",
      dose: "1 tablet",
      frequency: "once daily",
      route: "oral",
      timing: null
    },
    status: "prescribed",
    prescribedDate: "2026-01-05",
    startDate: "2026-01-05",
    endDate: null,
    explicitReplacementForId: null,
    provenance: {
      documentId: "00000000-0000-4000-8000-000000000201",
      page: 1,
      sourceText: "Warfarin 5 mg, take one tablet by mouth once daily.",
      extractionConfidence: 0.97
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    patientId,
    originalName: "Warfarin 2 mg",
    normalizedName: "warfarin 2 mg tablet",
    normalizedIngredient: "warfarin",
    rxcui: "855306",
    normalizationConfidence: 0.97,
    instruction: {
      strength: "2 mg",
      dose: "2 tablets",
      frequency: "twice daily",
      route: "oral",
      timing: null
    },
    status: "prescribed",
    prescribedDate: "2026-01-12",
    startDate: "2026-01-12",
    endDate: null,
    explicitReplacementForId: null,
    provenance: {
      documentId: "00000000-0000-4000-8000-000000000202",
      page: 2,
      sourceText: "Warfarin 2 mg, two tablets twice daily.",
      extractionConfidence: 0.94
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    patientId,
    originalName: "Aspirin 81 mg",
    normalizedName: "aspirin 81 mg tablet",
    normalizedIngredient: "aspirin",
    rxcui: "243670",
    normalizationConfidence: 0.99,
    instruction: {
      strength: "81 mg",
      dose: "1 tablet",
      frequency: "once daily",
      route: "oral",
      timing: null
    },
    status: "prescribed",
    prescribedDate: "2026-01-12",
    startDate: "2026-01-12",
    endDate: null,
    explicitReplacementForId: null,
    provenance: {
      documentId: "00000000-0000-4000-8000-000000000202",
      page: 2,
      sourceText: "Aspirin 81 mg once daily.",
      extractionConfidence: 0.98
    }
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    patientId,
    originalName: "Penicillin V",
    normalizedName: "penicillin v",
    normalizedIngredient: "penicillin v",
    rxcui: null,
    normalizationConfidence: 0.9,
    instruction: {
      strength: "500 mg",
      dose: "1 tablet",
      frequency: "twice daily",
      route: "oral",
      timing: null
    },
    status: "prescribed",
    prescribedDate: "2026-01-20",
    startDate: "2026-01-20",
    endDate: "2026-01-27",
    explicitReplacementForId: null,
    provenance: {
      documentId: "00000000-0000-4000-8000-000000000203",
      page: 1,
      sourceText: "Penicillin V 500 mg twice daily for 7 days.",
      extractionConfidence: 0.92
    }
  }
]);

export const syntheticDemoAllergies: readonly Allergy[] = Object.freeze([
  {
    id: "00000000-0000-4000-8000-000000000301",
    patientId,
    substanceOriginal: "Penicillin V",
    substanceNormalized: "penicillin v",
    reaction: "rash",
    recordedDate: "2025-08-01",
    status: "active",
    provenance: {
      documentId: "00000000-0000-4000-8000-000000000204",
      page: 1,
      sourceText: "Allergy: Penicillin V — rash.",
      extractionConfidence: 0.96
    }
  }
]);
