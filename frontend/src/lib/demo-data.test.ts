import { describe, expect, it } from "vitest";
import { answerQuestion, demoRecord } from "./demo-data";

describe("deterministic cached Q&A", () => {
  it("answers the allergy judge question with both source pages", () => {
    const answer = answerQuestion(
      "Was aspirin prescribed despite the allergy noted in the earlier report?",
    );

    expect(answer.answerStatus).toBe("supported");
    expect(answer.risk).toBe("high");
    expect(answer.citations).toEqual(["cit-allergy", "cit-aspirin"]);
    expect(answer.content).toContain("Do not start, stop, or change medication");
  });

  it("summarizes the compatible-unit lab series without diagnosing", () => {
    const answer = answerQuestion("How has creatinine changed over time?");

    expect(answer.content).toContain("0.9 mg/dL");
    expect(answer.content).toContain("1.6");
    expect(answer.content).toContain("does not provide a diagnosis");
    expect(answer.confidence).toBe(0.95);
  });

  it("refuses questions not supported by the record", () => {
    const answer = answerQuestion("What operation should this patient schedule?");

    expect(answer.answerStatus).toBe("insufficient");
    expect(answer.citations).toEqual([]);
    expect(answer.confidence).toBeLessThan(0.65);
  });
});

describe("cached evidence integrity", () => {
  it("resolves every finding citation to a patient-owned source fixture", () => {
    const citationIds = new Set(demoRecord.citations.map((citation) => citation.id));
    const unresolved = demoRecord.findings.flatMap((finding) =>
      finding.citationIds.filter((citationId) => !citationIds.has(citationId)),
    );

    expect(unresolved).toEqual([]);
  });

  it("clearly labels the walkthrough as synthetic", () => {
    expect(demoRecord.patient.recordLabel.toLowerCase()).toContain("synthetic");
  });
});
