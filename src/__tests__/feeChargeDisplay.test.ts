import { describe, expect, it } from "vitest";
import { isGrandfatheredFeeCharge } from "@/features/billing/tabs/fee-charges/utils/feeChargeDisplay";

describe("isGrandfatheredFeeCharge", () => {
  it("returns true when charge policy differs from active policy", () => {
    expect(
      isGrandfatheredFeeCharge(
        { billableEventPolicyId: 1 },
        { currentPolicy: { id: 2, versionNo: 2, isActive: true } as never },
      ),
    ).toBe(true);
  });

  it("returns false when charge matches active policy", () => {
    expect(
      isGrandfatheredFeeCharge(
        { billableEventPolicyId: 2 },
        { currentPolicy: { id: 2, versionNo: 2, isActive: true } as never },
      ),
    ).toBe(false);
  });

  it("returns false when event has no active policy", () => {
    expect(
      isGrandfatheredFeeCharge({ billableEventPolicyId: 1 }, { currentPolicy: null }),
    ).toBe(false);
  });
});
