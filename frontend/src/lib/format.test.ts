import { describe, expect, it } from "vitest";
import { confidenceBand, confidencePercent, formatFileSize, riskLabel } from "./format";

describe("confidence presentation", () => {
  it("uses the documented confidence thresholds", () => {
    expect(confidenceBand(0.85)).toBe("High");
    expect(confidenceBand(0.84)).toBe("Moderate");
    expect(confidenceBand(0.65)).toBe("Moderate");
    expect(confidenceBand(0.64)).toBe("Low");
  });

  it("avoids excessive precision in the interface", () => {
    expect(confidencePercent(0.9167)).toBe("92%");
  });
});

describe("basic display formatting", () => {
  it("formats document sizes clearly", () => {
    expect(formatFileSize(1_048_576)).toBe("1.0 MB");
    expect(formatFileSize(82_000)).toBe("80 KB");
  });

  it("keeps risk labels separate from confidence", () => {
    expect(riskLabel("high")).toBe("High risk");
    expect(riskLabel("moderate")).toBe("Review");
    expect(riskLabel("informational")).toBe("Informational");
  });
});
