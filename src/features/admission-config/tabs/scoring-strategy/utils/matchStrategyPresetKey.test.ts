import { describe, expect, it } from "vitest";
import { matchStrategyPresetKey } from "./matchStrategyPresetKey";

describe("matchStrategyPresetKey", () => {
  it("matches JAMB only preset", () => {
    expect(
      matchStrategyPresetKey({
        screening_method: "JAMB_ONLY",
        jamb_weight_percentage: 100,
        school_weight_percentage: 0,
        max_jamb_score: 400,
        max_school_score: 100,
        requires_jamb: true,
      }),
    ).toBe("jamb-only");
  });

  it("distinguishes UTME_JAMB vs UTME_OPEN 50/50 by requires_jamb", () => {
    expect(
      matchStrategyPresetKey({
        screening_method: "OLEVEL_GRADING",
        jamb_weight_percentage: 50,
        school_weight_percentage: 50,
        max_jamb_score: 400,
        max_school_score: 30,
        requires_jamb: true,
      }),
    ).toBe("olevel-5050");

    expect(
      matchStrategyPresetKey({
        screening_method: "OLEVEL_GRADING",
        jamb_weight_percentage: 50,
        school_weight_percentage: 50,
        max_jamb_score: 400,
        max_school_score: 30,
        requires_jamb: false,
      }),
    ).toBe("open-olevel-5050");
  });

  it("matches mixed DE preset with components", () => {
    expect(
      matchStrategyPresetKey({
        screening_method: "OLEVEL_POST_SCREENING",
        jamb_weight_percentage: 0,
        school_weight_percentage: 100,
        max_jamb_score: 0,
        max_school_score: 100,
        requires_jamb: false,
        components: [
          { type: "olevel", weight_percentage: 40 },
          { type: "post_screening", weight_percentage: 60 },
        ],
      }),
    ).toBe("olevel-post-6040");
  });

  it("returns undefined for custom strategy", () => {
    expect(
      matchStrategyPresetKey({
        screening_method: "OLEVEL_GRADING",
        jamb_weight_percentage: 60,
        school_weight_percentage: 40,
        max_jamb_score: 400,
        max_school_score: 30,
        requires_jamb: true,
      }),
    ).toBeUndefined();
  });
});
