import { getPolicyVersionDrawerDisplay } from "@/features/billing/tabs/fee-policies/utils/policyVersionDisplay";
import type { BillableEventPolicy } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";

const labelMaps: FeeEventsTabLabelMaps = {
  triggerLabels: { APPLICATION_STARTED: "When application starts" },
  guardLabels: { VERIFY_DOCUMENTS: "Verify documents" },
  timingLabels: { PAY_BEFORE: "Pay before" },
  codeLabels: { ADMISSION_ACCEPTANCE_FEE: "Acceptance fee" },
  fulfilledStatusLabels: {
    FULFILLED: "Paid in full",
    WAIVED: "Waived",
  },
  occurrenceLabels: { PER_SEMESTER: "Per semester" },
  periodLabels: { SEMESTER: "Semester" },
  arrearsLabels: { STRICT: "Strict" },
};

const policy: BillableEventPolicy = {
  id: 1,
  code: "ADMISSION_ACCEPTANCE_FEE",
  eventId: 2,
  versionNo: 3,
  effectiveFrom: "2024-06-01T10:00:00Z",
  effectiveTo: null,
  isActive: true,
  paymentTiming: "PAY_BEFORE",
  feeChargeTriggerEvent: "APPLICATION_STARTED",
  guardWorkflowStep: "VERIFY_DOCUMENTS",
  guardRequired: true,
  missingFeeChargePolicy: "BLOCK",
  fulfilledStatuses: ["FULFILLED", "WAIVED"],
  occurrenceMode: "PER_SEMESTER",
  periodType: "SEMESTER",
  arrearsMode: "STRICT",
  createdAt: "2024-06-01T10:00:00Z",
};

describe("getPolicyVersionDrawerDisplay", () => {
  it("uses catalog and fallback labels instead of raw enums", () => {
    const display = getPolicyVersionDrawerDisplay(policy, labelMaps);
    expect(display.feeTypeLabel).toBe("Acceptance fee");
    expect(display.paymentTiming).toBe("Pay before");
    expect(display.trigger).toBe("When application starts");
    expect(display.guardStep).toBe("Verify documents");
    expect(display.occurrence).toBe("Per semester");
    expect(display.fulfilledStatuses).toBe("Paid in full, Waived");
    expect(display.missingFeeChargePolicy).toContain("Block");
  });
});
