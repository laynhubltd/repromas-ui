import { describe, expect, it } from "vitest";
import {
  formatComponentsSummary,
  getLaneLabel,
  getMaxSchoolScoreExtra,
  isDeMethod,
  isJambWeightEditable,
  locksJambToZero,
  requiredComponentTypes,
  resolveLaneProfileFromStrategy,
} from "./scoringStrategyDisplay";

describe("scoringStrategyDisplay", () => {
  it("identifies DE methods", () => {
    expect(isDeMethod("PRIOR_QUAL_ONLY")).toBe(true);
    expect(isDeMethod("JAMB_ONLY")).toBe(false);
  });

  it("returns required component types for mixed methods", () => {
    expect(requiredComponentTypes("OLEVEL_POST_SCREENING")).toEqual([
      "olevel",
      "post_screening",
    ]);
    expect(requiredComponentTypes("PRIOR_QUAL_POST_SCREENING")).toEqual([
      "prior_qualification",
      "post_screening",
    ]);
  });

  it("formats component summaries", () => {
    expect(
      formatComponentsSummary([
        { type: "olevel", weight_percentage: 40 },
        { type: "post_screening", weight_percentage: 60 },
      ]),
    ).toBe("O'Level 40% · Post-screening 60%");
  });

  it("returns lane labels", () => {
    expect(getLaneLabel("POST_UTME_TEST")).toBe("UTME");
    expect(getLaneLabel("OLEVEL_ONLY")).toBe("DE");
  });

  it("identifies JAMB weight editability by lane", () => {
    expect(isJambWeightEditable("UTME_JAMB", "OLEVEL_GRADING")).toBe(true);
    expect(isJambWeightEditable("UTME_OPEN", "OLEVEL_GRADING")).toBe(true);
    expect(isJambWeightEditable("UTME_OPEN", "OLEVEL_ONLY")).toBe(false);
    expect(isJambWeightEditable("DIRECT_ENTRY", "OLEVEL_ONLY")).toBe(false);
  });

  it("locks JAMB to zero for DIRECT_ENTRY and UTME_OPEN school-only", () => {
    expect(locksJambToZero("DIRECT_ENTRY", "OLEVEL_ONLY")).toBe(true);
    expect(locksJambToZero("UTME_OPEN", "OLEVEL_ONLY")).toBe(true);
    expect(locksJambToZero("UTME_OPEN", "OLEVEL_GRADING")).toBe(false);
  });

  it("resolves lane profile from strategy with fallback", () => {
    expect(
      resolveLaneProfileFromStrategy({
        laneProfile: "UTME_OPEN",
        strategy: { screening_method: "OLEVEL_ONLY" } as never,
      }),
    ).toBe("UTME_OPEN");

    expect(
      resolveLaneProfileFromStrategy({
        laneProfile: undefined as never,
        strategy: { screening_method: "JAMB_ONLY" } as never,
      }),
    ).toBe("UTME_JAMB");
  });

  it("builds OLEVEL_ONLY max school score helper with live example", () => {
    expect(getMaxSchoolScoreExtra("OLEVEL_ONLY", 30)).toContain(
      "(24 ÷ 30) × 100 = 80",
    );
  });
});
