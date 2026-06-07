import { describe, expect, it } from "vitest";
import {
  buildPublishPayload,
  buildRevisePayload,
  policiesAreEqual,
} from "../billingPolicyPayload";

const sampleValues = {
  paymentTiming: "PAY_BEFORE" as const,
  feeChargeTriggerEvent: "STUDENT_ENROLLMENT_TRANSITION_CREATED",
  guardWorkflowStep: "COURSE_REGISTRATION_SUBMIT",
  guardRequired: true,
  missingFeeChargePolicy: "BLOCK" as const,
  fulfilledStatuses: ["FULFILLED", "WAIVED"],
  occurrenceMode: "PER_SESSION" as const,
  periodType: "SESSION" as const,
  arrearsMode: "STRICT" as const,
};

describe("billingPolicyPayload", () => {
  it("includes bindEventId only on publish payload", () => {
    const publish = buildPublishPayload(12, sampleValues);
    expect(publish.bindEventId).toBe(12);
    expect(publish.paymentTiming).toBe("PAY_BEFORE");

    const revise = buildRevisePayload(sampleValues);
    expect("bindEventId" in revise).toBe(false);
  });

  it("detects equal policy field sets", () => {
    const other = { ...sampleValues, fulfilledStatuses: ["WAIVED", "FULFILLED"] };
    expect(policiesAreEqual(sampleValues, other)).toBe(true);
    expect(
      policiesAreEqual(sampleValues, {
        ...sampleValues,
        occurrenceMode: "PER_SEMESTER",
        periodType: "SEMESTER",
      }),
    ).toBe(false);
  });
});
