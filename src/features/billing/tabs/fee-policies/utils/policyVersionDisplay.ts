import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import {
  formatCatalogField,
  formatEnumAsLabel,
} from "@/features/billing/tabs/fee-events/utils/feeEventDisplay";
import { MISSING_FEE_CHARGE_POLICY_OPTIONS } from "@/shared/constants/billableEventOptions";
import type { BillableEventPolicy } from "../types/billable-event-policy";
import {
  formatEffectiveRange,
  formatPolicyDate,
  formatPolicyVersionLabel,
} from "./billingPolicyDisplay";

const CODE_LABEL_FALLBACKS: Record<string, string> = {
  ADMISSION_APPLICATION_FEE: "Application fee",
  ADMISSION_ACCEPTANCE_FEE: "Acceptance fee",
  SEMESTER_REGISTRATION_FEE: "Semester registration fee",
};

const TIMING_LABEL_FALLBACKS: Record<string, string> = {
  PAY_BEFORE: "Pay before",
  PAY_AFTER: "Pay after",
};

function labelFromStaticOptions(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return (
    options.find((option) => option.value === value)?.label ??
    formatEnumAsLabel(value)
  );
}

export type PolicyVersionCardDisplay = {
  versionLabel: string;
  effectiveRange: string;
  isCurrent: boolean;
  paymentTiming: string;
  occurrence: string;
  period: string;
  guardStep: string;
  arrears: string;
};

export function getPolicyVersionCardDisplay(
  policy: BillableEventPolicy,
  labelMaps: FeeEventsTabLabelMaps,
): PolicyVersionCardDisplay {
  return {
    versionLabel: formatPolicyVersionLabel(policy),
    effectiveRange: formatEffectiveRange(policy),
    isCurrent: policy.isActive,
    paymentTiming: formatCatalogField(
      policy.paymentTiming,
      labelMaps.timingLabels,
    ),
    occurrence: formatCatalogField(
      policy.occurrenceMode,
      labelMaps.occurrenceLabels,
    ),
    period: formatCatalogField(policy.periodType, labelMaps.periodLabels),
    guardStep: formatCatalogField(
      policy.guardWorkflowStep,
      labelMaps.guardLabels,
    ),
    arrears: formatCatalogField(policy.arrearsMode, labelMaps.arrearsLabels),
  };
}

export type PolicyVersionDrawerDisplay = {
  feeTypeLabel: string;
  code: string;
  paymentTiming: string;
  trigger: string;
  guardStep: string;
  missingFeeChargePolicy: string;
  fulfilledStatuses: string;
  occurrence: string;
  period: string;
  arrears: string;
  effectiveFrom: string;
  effectiveTo: string;
};

export function getPolicyVersionDrawerDisplay(
  policy: BillableEventPolicy,
  labelMaps: FeeEventsTabLabelMaps,
): PolicyVersionDrawerDisplay {
  const fulfilledStatuses =
    policy.fulfilledStatuses.length > 0
      ? policy.fulfilledStatuses
          .map((status) =>
            formatCatalogField(status, labelMaps.fulfilledStatusLabels),
          )
          .join(", ")
      : "—";

  return {
    feeTypeLabel: formatCatalogField(
      policy.code,
      labelMaps.codeLabels,
      CODE_LABEL_FALLBACKS,
    ),
    code: policy.code,
    paymentTiming: formatCatalogField(
      policy.paymentTiming,
      labelMaps.timingLabels,
      TIMING_LABEL_FALLBACKS,
    ),
    trigger: formatCatalogField(
      policy.feeChargeTriggerEvent,
      labelMaps.triggerLabels,
    ),
    guardStep: formatCatalogField(
      policy.guardWorkflowStep,
      labelMaps.guardLabels,
    ),
    missingFeeChargePolicy: labelFromStaticOptions(
      MISSING_FEE_CHARGE_POLICY_OPTIONS,
      policy.missingFeeChargePolicy,
    ),
    fulfilledStatuses,
    occurrence: formatCatalogField(
      policy.occurrenceMode,
      labelMaps.occurrenceLabels,
    ),
    period: formatCatalogField(policy.periodType, labelMaps.periodLabels),
    arrears: formatCatalogField(policy.arrearsMode, labelMaps.arrearsLabels),
    effectiveFrom: formatPolicyDate(policy.effectiveFrom),
    effectiveTo: policy.effectiveTo
      ? formatPolicyDate(policy.effectiveTo)
      : "—",
  };
}
