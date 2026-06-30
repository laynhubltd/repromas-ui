import { describe, expect, it } from "vitest";
import { buildStrategyPayload } from "./buildStrategyPayload";

describe("buildStrategyPayload", () => {
  it("sets requires_jamb true for UTME JAMB legacy", () => {
    const payload = buildStrategyPayload("UTME_JAMB", {
      screening_method: "JAMB_ONLY",
      jamb_weight_percentage: 100,
      school_weight_percentage: 0,
      max_jamb_score: 400,
      max_school_score: 100,
      requires_jamb: true,
    });

    expect(payload).toEqual({
      screening_method: "JAMB_ONLY",
      jamb_weight_percentage: 100,
      school_weight_percentage: 0,
      max_jamb_score: 400,
      max_school_score: 100,
      requires_jamb: true,
    });
    expect(payload.components).toBeUndefined();
  });

  it("keeps editable JAMB weights for UTME_OPEN OLEVEL_GRADING", () => {
    const payload = buildStrategyPayload("UTME_OPEN", {
      screening_method: "OLEVEL_GRADING",
      jamb_weight_percentage: 50,
      school_weight_percentage: 50,
      max_jamb_score: 400,
      max_school_score: 30,
      requires_jamb: false,
    });

    expect(payload).toMatchObject({
      jamb_weight_percentage: 50,
      school_weight_percentage: 50,
      max_jamb_score: 400,
      requires_jamb: false,
    });
  });

  it("omits components for single DE methods", () => {
    const payload = buildStrategyPayload("DIRECT_ENTRY", {
      screening_method: "PRIOR_QUAL_ONLY",
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
      max_school_score: 100,
      requires_jamb: false,
    });

    expect(payload.components).toBeUndefined();
    expect(payload.requires_jamb).toBe(false);
  });

  it("locks DE weights when form fields are unmounted", () => {
    const payload = buildStrategyPayload("DIRECT_ENTRY", {
      screening_method: "OLEVEL_ONLY",
      jamb_weight_percentage: undefined as unknown as number,
      school_weight_percentage: undefined as unknown as number,
      max_jamb_score: 400,
      max_school_score: 30,
      requires_jamb: false,
    });

    expect(payload).toMatchObject({
      screening_method: "OLEVEL_ONLY",
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
      max_school_score: 30,
      requires_jamb: false,
    });
  });

  it("locks UTME_OPEN school-only methods", () => {
    const payload = buildStrategyPayload("UTME_OPEN", {
      screening_method: "OLEVEL_ONLY",
      jamb_weight_percentage: 50,
      school_weight_percentage: 50,
      max_jamb_score: 400,
      max_school_score: 30,
      requires_jamb: false,
    });

    expect(payload).toMatchObject({
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
    });
  });

  it("includes components for mixed DE methods", () => {
    const components = [
      { type: "olevel" as const, weight_percentage: 40 },
      { type: "post_screening" as const, weight_percentage: 60 },
    ];

    const payload = buildStrategyPayload("DIRECT_ENTRY", {
      screening_method: "OLEVEL_POST_SCREENING",
      jamb_weight_percentage: 0,
      school_weight_percentage: 100,
      max_jamb_score: 0,
      max_school_score: 100,
      requires_jamb: false,
      components,
    });

    expect(payload.components).toEqual(components);
  });
});
