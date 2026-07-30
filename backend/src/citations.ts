import type {
  Citation,
  CitationValidationContext,
  CitationValidationResult
} from "./domain.js";

function comparableText(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/gu, " ").trim();
}

export function validateCitations(
  citations: readonly Citation[],
  context: CitationValidationContext,
  options: Readonly<{ requireCitation?: boolean; requireSnippetMatch?: boolean }> = {}
): CitationValidationResult {
  const requireCitation = options.requireCitation ?? true;
  const requireSnippetMatch = options.requireSnippetMatch ?? true;
  const errors: string[] = [];

  if (requireCitation && citations.length === 0) {
    errors.push("A central claim requires at least one citation.");
  }

  for (const [index, citation] of citations.entries()) {
    const document = context.documents.find((candidate) => candidate.id === citation.documentId);
    if (!document) {
      errors.push(`Citation ${index} references an unknown document.`);
      continue;
    }
    if (document.patientId !== context.patientId) {
      errors.push(`Citation ${index} references a document owned by another patient.`);
      continue;
    }
    if (!Number.isInteger(citation.page) || citation.page < 1 || citation.page > document.pageCount) {
      errors.push(`Citation ${index} references an invalid page.`);
      continue;
    }
    const page = context.pages.find(
      (candidate) =>
        candidate.documentId === citation.documentId && candidate.page === citation.page
    );
    if (!page) {
      errors.push(`Citation ${index} references a page that has not been indexed.`);
      continue;
    }
    if (requireSnippetMatch) {
      const snippet = comparableText(citation.snippet);
      const pageText = comparableText(page.text);
      if (snippet.length < 3 || !pageText.includes(snippet)) {
        errors.push(`Citation ${index} snippet does not appear on the referenced page.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
