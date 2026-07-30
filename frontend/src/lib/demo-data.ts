import type { ChatMessage, Patient, PatientRecord } from "../types";

export const DEMO_PATIENT_ID = "competition-case";

const citations = [
  {
    id: "cit-allergy",
    documentId: "doc-2019-allergy",
    documentName: "Allergy & visit note · 2019",
    page: 1,
    date: "14 Feb 2019",
    label: "Allergy list",
    snippet: "Allergies: Aspirin — rash and facial swelling. Avoid aspirin-containing products.",
    highlightedText: "Aspirin — rash and facial swelling",
    pageContent: [
      "Harbor Family Practice",
      "Patient: Maya Fernando  |  Visit: 14 February 2019",
      "KNOWN ALLERGIES",
      "Aspirin — rash and facial swelling",
      "Plan: Avoid aspirin-containing products. Allergy discussed with patient.",
      "Signed electronically by Dr. L. Perera",
    ],
  },
  {
    id: "cit-warfarin",
    documentId: "doc-2023-discharge",
    documentName: "Cardiology discharge summary · 2023",
    page: 3,
    date: "30 Aug 2023",
    label: "Discharge medications",
    snippet: "Warfarin 5 mg tablet — take one tablet once daily at 18:00. Review INR in 7 days.",
    highlightedText: "Warfarin 5 mg tablet — once daily",
    pageContent: [
      "Northshore Cardiology Unit",
      "Discharge summary  |  30 August 2023",
      "DISCHARGE MEDICATIONS",
      "Warfarin 5 mg tablet — take one tablet once daily at 18:00.",
      "Metformin 500 mg — one tablet twice daily with meals.",
      "Follow-up: INR review within 7 days.",
    ],
  },
  {
    id: "cit-aspirin",
    documentId: "doc-2024-prescription",
    documentName: "Cardiology prescription · 2024",
    page: 1,
    date: "09 May 2024",
    label: "Prescription",
    snippet: "Aspirin 75 mg once daily for 30 days. Warfarin 5 mg once daily — continue.",
    highlightedText: "Aspirin 75 mg once daily",
    pageContent: [
      "West Bay Specialist Centre",
      "Prescription  |  09 May 2024",
      "Rx",
      "1. Aspirin 75 mg — take one tablet once daily for 30 days.",
      "2. Warfarin 5 mg — take one tablet once daily; continue.",
      "Review with the cardiology clinic in 2 weeks.",
    ],
  },
  {
    id: "cit-metformin",
    documentId: "doc-2024-clinic",
    documentName: "Diabetes clinic note · 2024",
    page: 2,
    date: "22 Nov 2024",
    label: "Medication plan",
    snippet: "Metformin 1000 mg twice daily. Earlier active list records 500 mg twice daily; replacement is not explicit.",
    highlightedText: "Metformin 1000 mg twice daily",
    pageContent: [
      "City Diabetes Clinic",
      "Follow-up note  |  22 November 2024",
      "MEDICATION PLAN",
      "Metformin 1000 mg — one tablet twice daily with meals.",
      "The prior 500 mg instruction remains in the imported active medication list.",
      "No explicit discontinue instruction is visible on this page.",
    ],
  },
  {
    id: "cit-lab-1",
    documentId: "doc-2023-labs",
    documentName: "Chemistry panel · 2023",
    page: 1,
    date: "18 Sep 2023",
    label: "Creatinine result",
    snippet: "Creatinine 0.9 mg/dL (laboratory reference range 0.6–1.2 mg/dL).",
    highlightedText: "Creatinine 0.9 mg/dL",
    pageContent: [
      "Central Diagnostics",
      "Chemistry panel  |  18 September 2023",
      "Creatinine: 0.9 mg/dL     Reference: 0.6–1.2",
      "Potassium: 4.2 mmol/L    Reference: 3.5–5.1",
      "Results should be interpreted by the requesting clinician.",
    ],
  },
  {
    id: "cit-lab-3",
    documentId: "doc-2025-labs",
    documentName: "Renal function panel · 2025",
    page: 1,
    date: "12 Mar 2025",
    label: "Latest creatinine result",
    snippet: "Creatinine 1.6 mg/dL (laboratory reference range 0.6–1.2 mg/dL), flagged high.",
    highlightedText: "Creatinine 1.6 mg/dL — H",
    pageContent: [
      "Central Diagnostics",
      "Renal function panel  |  12 March 2025",
      "Creatinine: 1.6 mg/dL  H  Reference: 0.6–1.2",
      "Potassium: 4.5 mmol/L    Reference: 3.5–5.1",
      "H indicates above the laboratory's listed range.",
    ],
  },
];

export const demoRecord: PatientRecord = {
  patient: {
    id: DEMO_PATIENT_ID,
    name: "Maya Fernando",
    initials: "MF",
    birthYear: 1988,
    recordLabel: "Competition case · synthetic",
    lastUpdated: "30 Jul 2026, 18:42",
    documentCount: 12,
    findingCount: 4,
    status: "Ready",
    isDemo: true,
  },
  citations,
  events: [
    {
      id: "event-allergy",
      date: "14 Feb 2019",
      year: "2019",
      type: "allergy",
      title: "Aspirin allergy documented",
      provider: "Harbor Family Practice",
      summary: "Rash and facial swelling recorded with instruction to avoid aspirin-containing products.",
      tags: ["Allergy", "Evidence verified"],
      citationId: "cit-allergy",
    },
    {
      id: "event-warfarin",
      date: "30 Aug 2023",
      year: "2023",
      type: "medication",
      title: "Warfarin added at discharge",
      provider: "Northshore Cardiology Unit",
      summary: "Warfarin 5 mg once daily at 18:00; INR review requested.",
      tags: ["Medication", "Cardiology"],
      citationId: "cit-warfarin",
    },
    {
      id: "event-lab-1",
      date: "18 Sep 2023",
      year: "2023",
      type: "laboratory",
      title: "Creatinine within listed range",
      provider: "Central Diagnostics",
      summary: "Creatinine measured at 0.9 mg/dL (reference 0.6–1.2).",
      tags: ["Laboratory", "Within range"],
      citationId: "cit-lab-1",
    },
    {
      id: "event-aspirin",
      date: "09 May 2024",
      year: "2024",
      type: "medication",
      title: "Aspirin prescribed while warfarin continued",
      provider: "West Bay Specialist Centre",
      summary: "Aspirin 75 mg once daily appears after the earlier aspirin allergy record.",
      tags: ["Medication", "High-risk review"],
      citationId: "cit-aspirin",
    },
    {
      id: "event-metformin",
      date: "22 Nov 2024",
      year: "2024",
      type: "medication",
      title: "Metformin instruction changed",
      provider: "City Diabetes Clinic",
      summary: "A 1000 mg twice-daily instruction appears while 500 mg twice daily remains on the active list.",
      tags: ["Medication", "Needs review"],
      citationId: "cit-metformin",
    },
    {
      id: "event-lab-3",
      date: "12 Mar 2025",
      year: "2025",
      type: "laboratory",
      title: "Creatinine above listed range",
      provider: "Central Diagnostics",
      summary: "Creatinine measured at 1.6 mg/dL, the third value in a rising series.",
      tags: ["Laboratory", "Above range"],
      citationId: "cit-lab-3",
    },
  ],
  medications: [
    {
      id: "med-warfarin",
      name: "Warfarin 5 mg",
      ingredient: "warfarin",
      instruction: "1 tablet once daily at 18:00",
      status: "Active",
      started: "30 Aug 2023",
      provider: "Northshore Cardiology Unit",
      confidence: 0.96,
      citationId: "cit-warfarin",
    },
    {
      id: "med-aspirin",
      name: "Aspirin 75 mg",
      ingredient: "aspirin",
      instruction: "1 tablet once daily for 30 days",
      status: "Needs review",
      started: "09 May 2024",
      provider: "West Bay Specialist Centre",
      confidence: 0.94,
      citationId: "cit-aspirin",
    },
    {
      id: "med-metformin-500",
      name: "Metformin 500 mg",
      ingredient: "metformin",
      instruction: "1 tablet twice daily with meals",
      status: "Active",
      started: "30 Aug 2023",
      provider: "Northshore Cardiology Unit",
      confidence: 0.88,
      citationId: "cit-warfarin",
    },
    {
      id: "med-metformin-1000",
      name: "Metformin 1000 mg",
      ingredient: "metformin",
      instruction: "1 tablet twice daily with meals",
      status: "Needs review",
      started: "22 Nov 2024",
      provider: "City Diabetes Clinic",
      confidence: 0.82,
      citationId: "cit-metformin",
    },
  ],
  labs: [
    {
      id: "lab-creatinine",
      name: "Creatinine",
      unit: "mg/dL",
      rangeLow: 0.6,
      rangeHigh: 1.2,
      direction: "Rising",
      explanation:
        "This value increased across three compatible tests. The latest result is above that laboratory’s listed range. This describes the uploaded record and is not a diagnosis.",
      points: [
        { date: "2023-09-18", label: "Sep ’23", value: 0.9 },
        { date: "2024-05-10", label: "May ’24", value: 1.2 },
        { date: "2025-03-12", label: "Mar ’25", value: 1.6 },
      ],
      citationId: "cit-lab-3",
    },
    {
      id: "lab-potassium",
      name: "Potassium",
      unit: "mmol/L",
      rangeLow: 3.5,
      rangeHigh: 5.1,
      direction: "Stable",
      explanation:
        "Three values remain within the listed laboratory ranges with no clear upward or downward direction.",
      points: [
        { date: "2023-09-18", label: "Sep ’23", value: 4.2 },
        { date: "2024-05-10", label: "May ’24", value: 4.1 },
        { date: "2025-03-12", label: "Mar ’25", value: 4.5 },
      ],
      citationId: "cit-lab-3",
    },
  ],
  findings: [
    {
      id: "finding-allergy",
      type: "Allergy contradiction",
      title: "Aspirin appears after an earlier aspirin allergy",
      summary:
        "An aspirin allergy with rash and facial swelling was documented in 2019. A 2024 prescription lists aspirin 75 mg.",
      risk: "high",
      confidence: 0.92,
      confidenceReason: "Both medication name and chronology are explicit on two source pages.",
      status: "Evidence verified",
      citationIds: ["cit-allergy", "cit-aspirin"],
      recommendedAction: "Please verify this promptly with a doctor or pharmacist.",
    },
    {
      id: "finding-interaction",
      type: "Potential interaction",
      title: "Aspirin and warfarin overlap in the record",
      summary:
        "The later prescription lists aspirin while warfarin is marked to continue. This combination may increase bleeding risk and requires professional review.",
      risk: "high",
      confidence: 0.89,
      confidenceReason: "Both medicines and the continuation instruction are visible; active dates are partly inferred.",
      status: "Evidence verified",
      citationIds: ["cit-warfarin", "cit-aspirin"],
      recommendedAction: "Do not change either medicine based on this result. Contact a doctor or pharmacist.",
    },
    {
      id: "finding-dosage",
      type: "Dosage conflict",
      title: "Two metformin strengths remain active",
      summary:
        "The record contains 500 mg twice daily and 1000 mg twice daily instructions without a visible replacement or stop instruction.",
      risk: "moderate",
      confidence: 0.81,
      confidenceReason: "Dosages are explicit, but the intent of the later clinician is not documented.",
      status: "Needs review",
      citationIds: ["cit-warfarin", "cit-metformin"],
      recommendedAction: "Ask the prescribing clinician or pharmacist which instruction is current.",
    },
    {
      id: "finding-duplicate",
      type: "Duplicate therapy",
      title: "Overlapping metformin entries may represent one intended change",
      summary:
        "Two active entries normalize to the same ingredient. They may be duplicate records or an undocumented dose change.",
      risk: "informational",
      confidence: 0.74,
      confidenceReason: "Ingredient match is strong; active-date overlap is uncertain.",
      status: "Needs review",
      citationIds: ["cit-warfarin", "cit-metformin"],
      recommendedAction: "Confirm the active medication list during the next professional review.",
    },
  ],
};

export const starterPatients: Patient[] = [
  demoRecord.patient,
  {
    id: "alex-silva",
    name: "Alex Silva",
    initials: "AS",
    birthYear: 1972,
    recordLabel: "Personal workspace",
    lastUpdated: "28 Jul 2026, 09:10",
    documentCount: 3,
    findingCount: 0,
    status: "Needs review",
  },
];

const greeting: ChatMessage = {
  id: "assistant-welcome",
  role: "assistant",
  content:
    "Ask about medications, allergies, dates, or lab trends. I’ll answer only from this record and cite the supporting pages.",
};

export const initialMessages: ChatMessage[] = [greeting];

export function answerQuestion(question: string): ChatMessage {
  const normalized = question.toLowerCase();
  const base = {
    id: `assistant-${Date.now()}`,
    role: "assistant" as const,
  };

  if (/(allerg|aspirin|despite|contradict)/.test(normalized)) {
    return {
      ...base,
      content:
        "Yes—a possible contradiction is present. Aspirin was recorded as an allergy in 2019, including rash and facial swelling, and aspirin 75 mg was prescribed in May 2024. This is a record cross-check, not a diagnosis. Do not start, stop, or change medication based on this result; please verify it promptly with a doctor or pharmacist.",
      citations: ["cit-allergy", "cit-aspirin"],
      risk: "high",
      confidence: 0.92,
      answerStatus: "supported",
    };
  }

  if (/(warfarin|interaction|bleed)/.test(normalized)) {
    return {
      ...base,
      content:
        "The record shows warfarin 5 mg continuing when aspirin 75 mg was prescribed. That overlap is flagged as a potential interaction for professional review; the uploaded records do not establish whether it was intentional. Do not change either medicine based on this answer.",
      citations: ["cit-warfarin", "cit-aspirin"],
      risk: "high",
      confidence: 0.89,
      answerStatus: "supported",
    };
  }

  if (/(creatinine|kidney|renal|lab|trend)/.test(normalized)) {
    return {
      ...base,
      content:
        "Creatinine rose from 0.9 mg/dL in September 2023 to 1.2 in May 2024 and 1.6 in March 2025. The latest value is above that laboratory’s listed 0.6–1.2 mg/dL range. This describes a trend in the uploaded records and does not provide a diagnosis; discuss it with a clinician.",
      citations: ["cit-lab-1", "cit-lab-3"],
      risk: "moderate",
      confidence: 0.95,
      answerStatus: "supported",
    };
  }

  if (/(metformin|dose|dosage|duplicate)/.test(normalized)) {
    return {
      ...base,
      content:
        "Two metformin instructions appear active: 500 mg twice daily and 1000 mg twice daily. The later note does not visibly state that it replaces the earlier instruction, so the current dose cannot be determined safely from these records alone. Please confirm with the prescriber or pharmacist.",
      citations: ["cit-warfarin", "cit-metformin"],
      risk: "moderate",
      confidence: 0.81,
      answerStatus: "partially_supported",
    };
  }

  return {
    ...base,
    content:
      "I can’t answer that from the uploaded records with enough evidence. Try asking about the aspirin allergy, the warfarin overlap, metformin instructions, or the creatinine trend. This application does not provide a diagnosis.",
    citations: [],
    risk: "informational",
    confidence: 0.38,
    answerStatus: "insufficient",
  };
}
