import { describe, expect, it } from "vitest";
import { evaluateVisibilityCondition } from "./evaluateVisibilityCondition";

describe("evaluateVisibilityCondition", () => {
  it("returns true when no condition", () => {
    expect(evaluateVisibilityCondition(undefined, {})).toBe(true);
  });

  it("evaluates equals operator", () => {
    expect(
      evaluateVisibilityCondition(
        { field: "sponsorType", operator: "equals", value: "parent" },
        { sponsorType: "parent" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibilityCondition(
        { field: "sponsorType", operator: "equals", value: "parent" },
        { sponsorType: "self" },
      ),
    ).toBe(false);
  });

  it("evaluates not_equals operator", () => {
    expect(
      evaluateVisibilityCondition(
        { field: "status", operator: "not_equals", value: "draft" },
        { status: "submitted" },
      ),
    ).toBe(true);
  });

  it("evaluates in operator", () => {
    expect(
      evaluateVisibilityCondition(
        { field: "state", operator: "in", value: ["LA", "OG"] },
        { state: "LA" },
      ),
    ).toBe(true);
    expect(
      evaluateVisibilityCondition(
        { field: "state", operator: "in", value: ["LA", "OG"] },
        { state: "AB" },
      ),
    ).toBe(false);
  });
});
