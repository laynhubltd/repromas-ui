import type { BillableEventPolicySeedResult } from "@/features/billing/tabs/fee-policies/types/billable-event-policy";
import type { ConfigurePricingParams } from "@/features/billing/types/configure-pricing";
import type { FeeEventsTabLabelMaps } from "../types/fee-events-tab";
import { formatCatalogField } from "./feeEventDisplay";

type SeedCreatedPolicy = BillableEventPolicySeedResult["createdPolicies"][number];

export function formatSeedPolicyHint(
  policy: SeedCreatedPolicy,
  labelMaps: FeeEventsTabLabelMaps,
): string {
  const version =
    Number.isFinite(policy.versionNo) && policy.versionNo > 0
      ? `v${policy.versionNo} policy`
      : "v1 policy";

  if (policy.periodType && policy.periodType !== "NONE") {
    const period = formatCatalogField(
      policy.periodType,
      labelMaps.periodLabels,
    );
    if (period !== "—") {
      return `${version}, ${period.toLowerCase()}`;
    }
  }

  const occurrence = formatCatalogField(
    policy.occurrenceMode,
    labelMaps.occurrenceLabels,
  );
  if (occurrence !== "—") {
    return `${version}, ${occurrence.toLowerCase()}`;
  }

  return version;
}

export function buildSeedCreatedLines(
  result: BillableEventPolicySeedResult,
  labelMaps: FeeEventsTabLabelMaps,
): string[] {
  const policyByCode = new Map(
    result.createdPolicies.map((policy) => [policy.code, policy]),
  );

  return result.createdEvents.map((event) => {
    const policy = policyByCode.get(event.code);
    const hint = policy
      ? formatSeedPolicyHint(policy, labelMaps)
      : "v1 policy";
    return `${event.name} (${event.code}) — ${hint}`;
  });
}

export function getSeedConfigurePricingParams(
  result: BillableEventPolicySeedResult,
): ConfigurePricingParams | null {
  const firstPolicy = result.createdPolicies[0];
  if (!firstPolicy) return null;
  return {
    eventCode: firstPolicy.code,
    billableEventPolicyId: firstPolicy.id,
  };
}
