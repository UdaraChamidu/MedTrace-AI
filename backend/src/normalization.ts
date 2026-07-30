const FREQUENCY_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  od: "once daily",
  daily: "once daily",
  qd: "once daily",
  bid: "twice daily",
  bd: "twice daily",
  tid: "three times daily",
  tds: "three times daily",
  qid: "four times daily",
  nocte: "at night",
  prn: "as needed"
});

export function normalizeClinicalText(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value
    .normalize("NFKC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}.%/+-]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
  return normalized || null;
}

export function normalizeFrequency(value: string | null): string | null {
  const normalized = normalizeClinicalText(value);
  if (normalized === null) return null;
  return FREQUENCY_ALIASES[normalized] ?? normalized;
}

export function sameNormalizedValue(left: string | null, right: string | null): boolean {
  const a = normalizeClinicalText(left);
  const b = normalizeClinicalText(right);
  return a !== null && b !== null && a === b;
}
