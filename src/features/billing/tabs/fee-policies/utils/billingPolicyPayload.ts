import type {
  BillableEventPolicy,
  BillableEventPolicyWritableFields,
  PublishBillableEventPolicyRequest,
  ReviseBillableEventPolicyRequest,
} from "../types/billable-event-policy";

export type PolicyFormValues = BillableEventPolicyWritableFields;

export function buildPublishPayload(
  bindEventId: number,
  values: PolicyFormValues,
): PublishBillableEventPolicyRequest {
  return {
    bindEventId,
    paymentTiming: values.paymentTiming,
    feeChargeTriggerEvent: values.feeChargeTriggerEvent,
    guardWorkflowStep: values.guardWorkflowStep,
    guardRequired: values.guardRequired,
    missingFeeChargePolicy: values.missingFeeChargePolicy,
    fulfilledStatuses: values.fulfilledStatuses,
    occurrenceMode: values.occurrenceMode,
    periodType: values.periodType,
    arrearsMode: values.arrearsMode,
  };
}

export function buildRevisePayload(
  values: PolicyFormValues,
): ReviseBillableEventPolicyRequest {
  return {
    paymentTiming: values.paymentTiming,
    feeChargeTriggerEvent: values.feeChargeTriggerEvent,
    guardWorkflowStep: values.guardWorkflowStep,
    guardRequired: values.guardRequired,
    missingFeeChargePolicy: values.missingFeeChargePolicy,
    fulfilledStatuses: values.fulfilledStatuses,
    occurrenceMode: values.occurrenceMode,
    periodType: values.periodType,
    arrearsMode: values.arrearsMode,
  };
}

export function policyWritableFieldsFromPolicy(
  policy: BillableEventPolicy,
): PolicyFormValues {
  return {
    paymentTiming: policy.paymentTiming,
    feeChargeTriggerEvent: policy.feeChargeTriggerEvent,
    guardWorkflowStep: policy.guardWorkflowStep,
    guardRequired: policy.guardRequired,
    missingFeeChargePolicy: policy.missingFeeChargePolicy,
    fulfilledStatuses: [...policy.fulfilledStatuses],
    occurrenceMode: policy.occurrenceMode,
    periodType: policy.periodType,
    arrearsMode: policy.arrearsMode,
  };
}

export function policiesAreEqual(
  a: PolicyFormValues,
  b: PolicyFormValues,
): boolean {
  return (
    a.paymentTiming === b.paymentTiming &&
    a.feeChargeTriggerEvent === b.feeChargeTriggerEvent &&
    a.guardWorkflowStep === b.guardWorkflowStep &&
    a.guardRequired === b.guardRequired &&
    a.missingFeeChargePolicy === b.missingFeeChargePolicy &&
    a.occurrenceMode === b.occurrenceMode &&
    a.periodType === b.periodType &&
    a.arrearsMode === b.arrearsMode &&
    arraysEqual(a.fulfilledStatuses, b.fulfilledStatuses)
  );
}

function arraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}
