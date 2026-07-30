import { describe, expect, it } from "vitest";
import { validateCitations } from "../src/citations.js";

const patientId = "patient-a";
const context = {
  patientId,
  documents: [
    { id: "doc-a", patientId, pageCount: 2 },
    { id: "doc-b", patientId: "patient-b", pageCount: 1 }
  ],
  pages: [
    {
      documentId: "doc-a",
      page: 2,
      text: "Medication list: Warfarin 5 mg once daily."
    }
  ]
};

describe("citation validation", () => {
  it("accepts an owned document, valid page, and matching snippet", () => {
    expect(
      validateCitations(
        [{ documentId: "doc-a", page: 2, snippet: "warfarin 5 mg once daily" }],
        context
      )
    ).toEqual({ valid: true, errors: [] });
  });

  it("rejects another patient's document", () => {
    const result = validateCitations(
      [{ documentId: "doc-b", page: 1, snippet: "anything" }],
      context
    );
    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("another patient");
  });

  it("rejects missing central evidence and fabricated snippets", () => {
    expect(validateCitations([], context).valid).toBe(false);
    expect(
      validateCitations(
        [{ documentId: "doc-a", page: 2, snippet: "not present" }],
        context
      ).valid
    ).toBe(false);
  });
});
