import type { CatalogOption } from "@/features/billing/tabs/fee-events/types/billable-event";
import type { BillableEventPolicy } from "../types/billable-event-policy";

export function labelForOption(
  options: CatalogOption[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export function formatPolicyVersionLabel(policy: BillableEventPolicy): string {
  return `v${policy.versionNo}`;
}

export function formatEffectiveRange(policy: BillableEventPolicy): string {
  if (policy.isActive) {
    return `From ${formatPolicyDate(policy.effectiveFrom)} — current`;
  }
  const end = policy.effectiveTo
    ? formatPolicyDate(policy.effectiveTo)
    : "—";
  return `${formatPolicyDate(policy.effectiveFrom)} — ${end}`;
}

export function formatPolicyDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

import { getSeedSkippedReasonLabel } from "@/shared/constants/billingDisplayLabels";

export function skippedReasonLabel(reason: string): string {
  return getSeedSkippedReasonLabel(reason);
}
