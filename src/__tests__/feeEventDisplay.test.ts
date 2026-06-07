import {
  getFeeEventCardDisplay,
  getFeeEventPolicyStatus,
} from "@/features/billing/tabs/fee-events/utils/feeEventDisplay";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";

const emptyLabelMaps: FeeEventsTabLabelMaps = {
  triggerLabels: {},
  guardLabels: {},
  timingLabels: {},
  codeLabels: {},
  fulfilledStatusLabels: {},
  occurrenceLabels: {},
  periodLabels: {},
  arrearsLabels: {},
};

const baseEvent: BillableEvent = {
  id: 1,
  code: "ADMISSION_APPLICATION_FEE",
  name: "Application Fee",
  description: "Bursar note",
  isActive: true,
  currentPolicy: null,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("getFeeEventPolicyStatus", () => {
  it("returns no policy when currentPolicy is null", () => {
    expect(getFeeEventPolicyStatus(baseEvent)).toEqual({
      kind: "noPolicy",
      label: "No policy",
    });
  });

  it("returns active version when policy exists", () => {
    const event: BillableEvent = {
      ...baseEvent,
      currentPolicy: {
        id: 10,
        versionNo: 2,
        isActive: true,
        paymentTiming: "PAY_BEFORE",
        feeChargeTriggerEvent: "APPLICATION_STARTED",
        guardWorkflowStep: "SUBMIT_APPLICATION",
        occurrenceMode: "ONCE_PER_RESOURCE",
        periodType: "NONE",
        arrearsMode: "STRICT",
      },
    };
    expect(getFeeEventPolicyStatus(event)).toEqual({
      kind: "active",
      label: "Active v2",
    });
  });

  it("returns shell inactive when event is inactive", () => {
    expect(
      getFeeEventPolicyStatus({ ...baseEvent, isActive: false }),
    ).toEqual({
      kind: "shellInactive",
      label: "Inactive shell",
    });
  });
});

describe("getFeeEventCardDisplay", () => {
  it("returns shell fields only", () => {
    const display = getFeeEventCardDisplay(baseEvent, emptyLabelMaps);
    expect(display.title).toBe("Application Fee");
    expect(display.code).toBe("ADMISSION_APPLICATION_FEE");
    expect(display.description).toBe("Bursar note");
    expect(display.feeTypeLabel).toBe("Application fee");
  });

  it("does not include policy fields on the card display", () => {
    const event: BillableEvent = {
      ...baseEvent,
      currentPolicy: {
        id: 10,
        versionNo: 1,
        isActive: true,
        paymentTiming: "PAY_AFTER",
        feeChargeTriggerEvent: "APPLICATION_STARTED",
        guardWorkflowStep: "VERIFY_DOCUMENTS",
        occurrenceMode: "PER_SEMESTER",
        periodType: "SEMESTER",
        arrearsMode: "CURRENT_PERIOD_ONLY",
      },
    };
    const display = getFeeEventCardDisplay(event, emptyLabelMaps);
    expect(display).not.toHaveProperty("payTiming");
    expect(display).not.toHaveProperty("policyStatusLabel");
  });
});
