import { describe, expect, it } from "vitest";
import {
  buildCreatePayload,
  type PricingRuleFormValues,
} from "@/features/billing/tabs/pricing-rules/utils/pricingRulePayload";

const baseValues: PricingRuleFormValues = {
  eventCode: "TUITION",
  billableEventPolicyId: 42,
  scope: "GLOBAL",
  referenceId: null,
  indigeneStatus: "ANY",
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  priority: 10,
  isActive: true,
  items: [{ feeItemId: 1, amount: 1000, isMandatory: true }],
};

describe("buildCreatePayload", () => {
  it("includes billableEventPolicyId on create", () => {
    const payload = buildCreatePayload(baseValues);
    expect(payload.billableEventPolicyId).toBe(42);
    expect(payload.eventCode).toBe("TUITION");
  });

  it("rejects create when policy id is missing", () => {
    expect(() =>
      buildCreatePayload({ ...baseValues, billableEventPolicyId: undefined }),
    ).toThrow(/policy/i);
  });
});
