import { describe, expect, it } from "vitest";
import { formatOrGroupHeader, formatThresholdSummary } from "./requirementDisplay";
import type { ProgramPriorQualificationRequirement } from "../types/program-prior-qualification-requirement";

describe("requirementDisplay", () => {
  it("formats threshold summary for points", () => {
    const row = {
      minimumPoints: 16,
      minimumClass: null,
      minimumClassRank: null,
      priorQualificationType: {
        assessmentFormat: "POINTS" as const,
      },
    } as ProgramPriorQualificationRequirement;

    expect(formatThresholdSummary(row)).toBe("≥ 16 pts");
  });

  it("formats OR group header", () => {
    expect(formatOrGroupHeader("ANY_OF_1")).toBe("Pick one · Set 1");
  });
});
