import type { CandidateFinding, InteractionRule, Medication } from "../domain.js";
import { canonicalIngredient, medicationEvidence, pairKey } from "./shared.js";

/**
 * Demonstration coverage only. This is not a comprehensive interaction database.
 * Source URLs are retained with every finding so the evidence can be reviewed.
 */
export const CURATED_INTERACTION_RULES: readonly InteractionRule[] = Object.freeze([
  {
    id: "demo-warfarin-aspirin-v1",
    ingredients: ["aspirin", "warfarin"],
    severity: "high",
    summary: "The curated demo source identifies increased bleeding risk when used together.",
    sourceName: "DailyMed — warfarin sodium prescribing information",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=ed365958-7c79-46ae-a160-15a8087eaf92",
    sourceVersion: "review-before-production"
  },
  {
    id: "demo-clarithromycin-simvastatin-v1",
    ingredients: ["clarithromycin", "simvastatin"],
    severity: "critical",
    summary:
      "The curated demo source lists the combination as contraindicated because clarithromycin can increase simvastatin exposure.",
    sourceName: "DailyMed — simvastatin prescribing information",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=simvastatin",
    sourceVersion: "review-before-production"
  },
  {
    id: "demo-spironolactone-potassium-v1",
    ingredients: ["potassium chloride", "spironolactone"],
    severity: "high",
    summary:
      "The curated demo source warns that potassium supplementation can increase hyperkalemia risk with spironolactone.",
    sourceName: "DailyMed — spironolactone prescribing information",
    sourceUrl: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=spironolactone",
    sourceVersion: "review-before-production"
  }
]);

function ingredientsMatch(
  left: string,
  right: string,
  rule: InteractionRule
): boolean {
  const [a, b] = rule.ingredients;
  return (left === a && right === b) || (left === b && right === a);
}

export function detectCuratedInteractions(
  medications: readonly Medication[],
  rules: readonly InteractionRule[] = CURATED_INTERACTION_RULES
): readonly CandidateFinding[] {
  const findings: CandidateFinding[] = [];

  for (let leftIndex = 0; leftIndex < medications.length; leftIndex += 1) {
    const left = medications[leftIndex];
    if (!left || left.status === "stopped" || left.status === "historical") continue;
    const leftIngredient = canonicalIngredient(left);
    if (leftIngredient === null) continue;

    for (let rightIndex = leftIndex + 1; rightIndex < medications.length; rightIndex += 1) {
      const right = medications[rightIndex];
      if (
        !right ||
        right.patientId !== left.patientId ||
        right.status === "stopped" ||
        right.status === "historical"
      ) {
        continue;
      }
      const rightIngredient = canonicalIngredient(right);
      if (rightIngredient === null) continue;

      const rule = rules.find((candidate) =>
        ingredientsMatch(leftIngredient, rightIngredient, candidate)
      );
      if (!rule) continue;
      const pair = pairKey(left.id, right.id);

      findings.push({
        id: `drug_interaction:${rule.id}:${pair}`,
        patientId: left.patientId,
        type: "drug_interaction",
        severity: rule.severity,
        title: `Curated interaction candidate: ${leftIngredient} + ${rightIngredient}`,
        explanation: rule.summary,
        evidence: [medicationEvidence(left), medicationEvidence(right)],
        ruleId: rule.id,
        requiresEvidenceVerification: true,
        metadata: {
          sourceName: rule.sourceName,
          sourceUrl: rule.sourceUrl,
          sourceVersion: rule.sourceVersion,
          coverage: "curated-demo-only"
        }
      });
    }
  }

  return findings;
}
