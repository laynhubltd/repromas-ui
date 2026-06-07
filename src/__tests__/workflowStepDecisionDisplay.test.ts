import { describe, expect, it } from "vitest";
import {
  getBlockingItems,
  resolveWorkflowBlockingUi,
} from "@/features/billing/utils/workflowStepDecisionDisplay";
import type { WorkflowStepDecisionResponse } from "@/features/billing/types/workflow-step-decision";

const baseResponse: WorkflowStepDecisionResponse = {
  workflowStep: "COURSE_REGISTRATION_SUBMIT",
  resourceType: "student_enrollment_transition",
  resourceId: 42,
  payerType: "student",
  payerId: 17,
  allowed: false,
  blockingCount: 1,
  items: [],
};

describe("getBlockingItems", () => {
  it("returns items where allowed is false", () => {
    const response: WorkflowStepDecisionResponse = {
      ...baseResponse,
      items: [
        {
          eventCode: "REGISTRATION_FEE",
          allowed: false,
          status: "PENDING",
          feeChargeId: 901,
          amountDueTotal: "50000.00",
          amountDueRequired: "50000.00",
          amountPaidTotal: "0.00",
          amountCreditedTotal: "0.00",
          amountOutstandingTotal: "50000.00",
          amountOutstandingRequired: "50000.00",
          currentPeriodAllowed: false,
          arrearsAllowed: true,
          arrearsOpenCount: 0,
          arrearsOutstandingRequired: "0.00",
          reason: "Fee charge for REGISTRATION_FEE is not settled for the current period.",
        },
        {
          eventCode: "OTHER_FEE",
          allowed: true,
          status: "FULFILLED",
          feeChargeId: 902,
          amountDueTotal: "0.00",
          amountDueRequired: "0.00",
          amountPaidTotal: "0.00",
          amountCreditedTotal: "0.00",
          amountOutstandingTotal: "0.00",
          amountOutstandingRequired: "0.00",
          currentPeriodAllowed: true,
          arrearsAllowed: true,
          arrearsOpenCount: 0,
          arrearsOutstandingRequired: "0.00",
          reason: null,
        },
      ],
    };

    expect(getBlockingItems(response)).toHaveLength(1);
    expect(getBlockingItems(response)[0]?.eventCode).toBe("REGISTRATION_FEE");
  });
});

describe("resolveWorkflowBlockingUi", () => {
  it("returns pass when allowed is true", () => {
    const ui = resolveWorkflowBlockingUi({
      ...baseResponse,
      allowed: true,
      blockingCount: 0,
      items: [],
    });

    expect(ui.variant).toBe("pass");
    expect(ui.canPayNow).toBe(false);
  });

  it("returns payNow for pending current-period fee", () => {
    const ui = resolveWorkflowBlockingUi({
      ...baseResponse,
      items: [
        {
          eventCode: "REGISTRATION_FEE",
          allowed: false,
          status: "PENDING",
          feeChargeId: 901,
          amountDueTotal: "50000.00",
          amountDueRequired: "50000.00",
          amountPaidTotal: "0.00",
          amountCreditedTotal: "0.00",
          amountOutstandingTotal: "50000.00",
          amountOutstandingRequired: "50000.00",
          currentPeriodAllowed: false,
          arrearsAllowed: true,
          arrearsOpenCount: 0,
          arrearsOutstandingRequired: "0.00",
          reason: "Fee charge for REGISTRATION_FEE is not settled for the current period.",
        },
      ],
    });

    expect(ui.variant).toBe("payNow");
    expect(ui.canPayNow).toBe(true);
    expect(ui.payAmountDisplay).toBe("₦50,000.00");
    expect(ui.primaryItem?.feeChargeId).toBe(901);
  });

  it("returns preparing when fee charge not generated", () => {
    const ui = resolveWorkflowBlockingUi({
      ...baseResponse,
      items: [
        {
          eventCode: "REGISTRATION_FEE",
          allowed: false,
          status: null,
          feeChargeId: null,
          amountDueTotal: "0.00",
          amountDueRequired: "0.00",
          amountPaidTotal: "0.00",
          amountCreditedTotal: "0.00",
          amountOutstandingTotal: "0.00",
          amountOutstandingRequired: "0.00",
          currentPeriodAllowed: false,
          arrearsAllowed: true,
          arrearsOpenCount: 0,
          arrearsOutstandingRequired: "0.00",
          reason: "Fee charge not found for REGISTRATION_FEE.",
        },
      ],
    });

    expect(ui.variant).toBe("preparing");
    expect(ui.canPayNow).toBe(false);
  });

  it("returns cutover when reason mentions cutover", () => {
    const ui = resolveWorkflowBlockingUi({
      ...baseResponse,
      items: [
        {
          eventCode: "REGISTRATION_FEE",
          allowed: false,
          status: "FULFILLED",
          feeChargeId: 6,
          amountDueTotal: "112000.00",
          amountDueRequired: "110000.00",
          amountPaidTotal: "112000.00",
          amountCreditedTotal: "0.00",
          amountOutstandingTotal: "0.00",
          amountOutstandingRequired: "0.00",
          currentPeriodAllowed: false,
          arrearsAllowed: false,
          arrearsOpenCount: 0,
          arrearsOutstandingRequired: "0.00",
          reason: "Period-aware billing cutover is not complete for this tenant.",
        },
      ],
    });

    expect(ui.variant).toBe("cutover");
    expect(ui.canPayNow).toBe(false);
    expect(ui.message).toContain("cutover");
  });

  it("returns arrears when current period passes but arrears block", () => {
    const ui = resolveWorkflowBlockingUi({
      ...baseResponse,
      items: [
        {
          eventCode: "REGISTRATION_FEE",
          allowed: false,
          status: "FULFILLED",
          feeChargeId: 901,
          amountDueTotal: "50000.00",
          amountDueRequired: "50000.00",
          amountPaidTotal: "50000.00",
          amountCreditedTotal: "0.00",
          amountOutstandingTotal: "0.00",
          amountOutstandingRequired: "0.00",
          currentPeriodAllowed: true,
          arrearsAllowed: false,
          arrearsOpenCount: 2,
          arrearsOutstandingRequired: "25000.00",
          reason: "Prior-period arrears block registration.",
        },
      ],
    });

    expect(ui.variant).toBe("arrears");
    expect(ui.canPayNow).toBe(false);
    expect(ui.payAmountDisplay).toBe("₦25,000.00");
  });
});
