import { describe, expect, it } from "vitest";
import {
  isValidOccurrencePeriodPair,
  periodTypeForOccurrenceMode,
} from "../occurrencePeriodPairing";

describe("occurrencePeriodPairing", () => {
  it("maps ONCE_PER_RESOURCE to NONE", () => {
    expect(periodTypeForOccurrenceMode("ONCE_PER_RESOURCE")).toBe("NONE");
  });

  it("maps PER_SESSION to SESSION", () => {
    expect(periodTypeForOccurrenceMode("PER_SESSION")).toBe("SESSION");
  });

  it("maps PER_SEMESTER to SEMESTER", () => {
    expect(periodTypeForOccurrenceMode("PER_SEMESTER")).toBe("SEMESTER");
  });

  it("validates matching pairs", () => {
    expect(isValidOccurrencePeriodPair("PER_SESSION", "SESSION")).toBe(true);
    expect(isValidOccurrencePeriodPair("PER_SESSION", "NONE")).toBe(false);
  });
});
