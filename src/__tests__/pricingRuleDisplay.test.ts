import { describe, expect, it } from "vitest";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import type { BillableEventPolicy } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";
import {
  formatPolicyVersionLabel,
  formatVersionNoLabel,
  getPricingRuleCardDisplay,
  getPricingRulePolicyDisplay,
} from "@/features/billing/tabs/pricing-rules/utils/pricingRuleDisplay";
import type { PricingRule } from "@/features/billing/tabs/pricing-rules/types/pricing-rule";

const emptyLabelMaps: FeeEventsTabLabelMaps = {
  triggerLabels: {},
  guardLabels: {},
  timingLabels: {},
  codeLabels: {},
  fulfilledStatusLabels: {},
  occurrenceLabels: { PER_SESSION: "Per session" },
  periodLabels: { SESSION: "Session" },
  arrearsLabels: {},
};

const samplePolicy: BillableEventPolicy = {
  id: 99,
  code: "TUITION",
  eventId: 1,
  versionNo: 3,
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  isActive: false,
  paymentTiming: "PAY_BEFORE",
  feeChargeTriggerEvent: "STUDENT_ENROLLMENT_TRANSITION_CREATED",
  guardWorkflowStep: "COURSE_REGISTRATION_SUBMIT",
  guardRequired: true,
  missingFeeChargePolicy: "BLOCK",
  fulfilledStatuses: ["FULFILLED"],
  occurrenceMode: "PER_SESSION",
  periodType: "SESSION",
  arrearsMode: "STRICT",
  createdAt: "",
};

const sampleRule: PricingRule = {
  id: 1,
  eventCode: "TUITION",
  billableEventPolicyId: 99,
  policy: samplePolicy,
  scope: "GLOBAL",
  referenceId: null,
  academicSessionId: null,
  levelId: null,
  studentCategory: null,
  indigeneStatus: "ANY",
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  priority: 10,
  isActive: true,
  items: [],
  grossPreview: "0",
  createdAt: "",
  updatedAt: "",
};

describe("formatVersionNoLabel", () => {
  it("returns null for undefined version", () => {
    expect(formatVersionNoLabel(undefined)).toBeNull();
  });

  it("never returns vundefined", () => {
    expect(formatVersionNoLabel(undefined)).not.toBe("vundefined");
  });
});

describe("formatPolicyVersionLabel", () => {
  it("uses embed version when present", () => {
    expect(
      formatPolicyVersionLabel(samplePolicy, new Map(), 99),
    ).toBe("v3");
  });

  it("falls back to policy id map", () => {
    expect(formatPolicyVersionLabel(undefined, new Map([[99, 2]]), 99)).toBe(
      "v2",
    );
  });

  it("returns null when version unknown", () => {
    expect(formatPolicyVersionLabel(undefined, new Map(), 99)).toBeNull();
  });
});

describe("getPricingRulePolicyDisplay", () => {
  it("does not put vundefined on policy version label", () => {
    const display = getPricingRulePolicyDisplay(
      {
        billableEventPolicyId: 99,
        policy: { ...samplePolicy, versionNo: undefined as unknown as number },
      },
      emptyLabelMaps,
    );
    expect(display.policyVersionLabel).toBeNull();
    expect(display.occurrenceLabel).toBe("Per session");
  });

  it("formats occurrenceMode as human-readable label", () => {
    const display = getPricingRulePolicyDisplay(sampleRule, emptyLabelMaps);
    expect(display.occurrenceLabel).toBe("Per session");
    expect(display.occurrenceLine).toContain("Per session");
    expect(display.occurrenceLabel).not.toBe("PER_SESSION");
  });

  it("marks historical policy when isActive is false", () => {
    const display = getPricingRulePolicyDisplay(sampleRule, emptyLabelMaps);
    expect(display.policyStatusLabel).toBe("Historical");
    expect(display.isHistoricalPolicy).toBe(true);
  });

  it("flags missing embed", () => {
    const display = getPricingRulePolicyDisplay(
      { billableEventPolicyId: 1, policy: null },
      emptyLabelMaps,
    );
    expect(display.policyEmbedMissing).toBe(true);
  });
});

describe("getPricingRuleCardDisplay", () => {
  it("includes policy version and occurrence on card display", () => {
    const display = getPricingRuleCardDisplay(
      sampleRule,
      new Map(),
      new Map([["TUITION", "Tuition"]]),
      emptyLabelMaps,
    );
    expect(display.policyVersionLabel).toBe("v3");
    expect(display.policyDisplay.occurrenceLabel).toBe("Per session");
    expect(display.eventLabel).toBe("Tuition");
  });
});
