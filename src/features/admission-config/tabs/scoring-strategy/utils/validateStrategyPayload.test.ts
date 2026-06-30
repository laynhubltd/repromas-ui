import { describe, expect, it } from "vitest";
import { validateStrategyPayload } from "./validateStrategyPayload";

describe("validateStrategyPayload", () => {
  it("accepts valid JAMB_ONLY payload on UTME_JAMB", () => {
    expect(
      validateStrategyPayload("UTME_JAMB", {
        screening_method: "JAMB_ONLY",
        jamb_weight_percentage: 100,
        school_weight_percentage: 0,
        max_jamb_score: 400,
        max_school_score: 100,
        requires_jamb: true,
      }),
    ).toEqual({ valid: true });
  });

  it("rejects JAMB_ONLY on UTME_OPEN", () => {
    const result = validateStrategyPayload("UTME_OPEN", {
      screening_method: "JAMB_ONLY",
      jamb_weight_percentage: 100,
      school_weight_percentage: 0,
      max_jamb_score: 400,
      max_school_score: 100,
      requires_jamb: false,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toContain("not allowed for this lane");
  });

  it("accepts UTME_OPEN 50/50 with requires_jamb false", () => {
    expect(
      validateStrategyPayload("UTME_OPEN", {
        screening_method: "OLEVEL_GRADING",
        jamb_weight_percentage: 50,
        school_weight_percentage: 50,
        max_jamb_score: 400,
        max_school_score: 30,
        requires_jamb: false,
      }),
    ).toEqual({ valid: true });
  });

  it("rejects weights that do not sum to 100", () => {
    const result = validateStrategyPayload("UTME_JAMB", {
      screening_method: "OLEVEL_GRADING",
      jamb_weight_percentage: 40,
      school_weight_percentage: 50,
      max_jamb_score: 400,
      max_school_score: 30,
      requires_jamb: true,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Weights must sum to 100%");
  });

  it("rejects DE method with requires_jamb true", () => {
    const result = validateStrategyPayload("DIRECT_ENTRY", {
      screening_method: "OLEVEL_ONLY",
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
      max_school_score: 30,
      requires_jamb: true,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Direct Entry methods cannot require JAMB");
  });

  it("requires components for mixed methods", () => {
    const result = validateStrategyPayload("DIRECT_ENTRY", {
      screening_method: "OLEVEL_POST_SCREENING",
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
      max_school_score: 100,
      requires_jamb: false,
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Mixed methods require component weights");
  });

  it("accepts valid mixed method payload", () => {
    expect(
      validateStrategyPayload("DIRECT_ENTRY", {
        screening_method: "PRIOR_QUAL_POST_SCREENING",
        jamb_weight_percentage: 0,
        school_weight_percentage: 100,
        max_jamb_score: 0,
        max_school_score: 100,
        requires_jamb: false,
        components: [
          { type: "prior_qualification", weight_percentage: 60 },
          { type: "post_screening", weight_percentage: 40 },
        ],
      }),
    ).toEqual({ valid: true });
  });

  it("rejects components on single DE method", () => {
    const result = validateStrategyPayload("DIRECT_ENTRY", {
      screening_method: "PRIOR_QUAL_ONLY",
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
      max_school_score: 100,
      requires_jamb: false,
      components: [{ type: "prior_qualification", weight_percentage: 100 }],
    });
    expect(result.valid).toBe(false);
    expect(result.message).toBe(
      "Components must be omitted for single-component methods",
    );
  });
});
