import type {
  BillableEventCatalogEntry,
  PaymentTiming,
} from "@/features/billing/tabs/fee-events/types/billable-event";
import type { FormInstance } from "antd";
import type { PolicyFormValues } from "./billingPolicyPayload";
import { periodTypeForOccurrenceMode } from "./occurrencePeriodPairing";

export function applyCatalogDefaultsToPolicyForm(
  form: FormInstance<PolicyFormValues>,
  entry: BillableEventCatalogEntry,
  paymentTiming: PaymentTiming,
) {
  const defaults = entry.defaultsByPaymentTiming[paymentTiming];
  const occurrenceMode =
    defaults?.occurrenceMode ?? entry.defaultOccurrenceMode;
  const periodType =
    defaults?.periodType ??
    periodTypeForOccurrenceMode(occurrenceMode);

  form.setFieldsValue({
    paymentTiming,
    feeChargeTriggerEvent: defaults?.feeChargeTriggerEvent,
    guardWorkflowStep: defaults?.guardWorkflowStep,
    fulfilledStatuses: defaults?.fulfilledStatuses ?? ["FULFILLED", "WAIVED"],
    occurrenceMode,
    periodType,
    arrearsMode: defaults?.arrearsMode ?? entry.defaultArrearsMode,
    guardRequired: true,
    missingFeeChargePolicy: "BLOCK",
  });
}
