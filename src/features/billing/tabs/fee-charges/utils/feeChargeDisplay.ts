import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import { formatFeeChargeStatusLabel } from "@/shared/constants/billingDisplayLabels";
import type { FeeCharge } from "../types/fee-charge";

export function isGrandfatheredFeeCharge(
  charge: Pick<FeeCharge, "billableEventPolicyId">,
  event: Pick<BillableEvent, "currentPolicy"> | null | undefined,
): boolean {
  const activePolicyId = event?.currentPolicy?.id;
  if (activePolicyId == null) return false;
  return charge.billableEventPolicyId !== activePolicyId;
}

export function formatFeeChargeStatus(status: string): string {
  return formatFeeChargeStatusLabel(status);
}
