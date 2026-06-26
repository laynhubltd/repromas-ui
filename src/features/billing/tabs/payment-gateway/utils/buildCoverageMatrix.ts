import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import { GATEWAY_SCOPE_GLOBAL_LABEL } from "@/shared/constants/gatewayConfigOptions";
import { gatewayLabel } from "@/features/student-payments/utils/gatewayDisplay";
import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";

export type CoverageMatrixRow = {
  key: string;
  scopeLabel: string;
  isGlobal: boolean;
  billableEventId: number | null;
  activeProvider: string | null;
  activeConfigId: number | null;
  hasGap: boolean;
};

export type CoverageMatrixResult = {
  rows: CoverageMatrixRow[];
  gapCount: number;
  hasActiveGlobalFallback: boolean;
};

export function buildCoverageMatrix(
  configs: TenantPaymentGatewayConfig[],
  activeEvents: BillableEvent[],
): CoverageMatrixResult {
  const activeGlobal = configs.find(
    (c) => c.billableEventId == null && c.isActive,
  );

  const globalRow: CoverageMatrixRow = {
    key: "global",
    scopeLabel: GATEWAY_SCOPE_GLOBAL_LABEL,
    isGlobal: true,
    billableEventId: null,
    activeProvider: activeGlobal ? gatewayLabel(activeGlobal.provider) : null,
    activeConfigId: activeGlobal?.id ?? null,
    hasGap: !activeGlobal,
  };

  const eventRows: CoverageMatrixRow[] = activeEvents.map((event) => {
    const eventConfig = configs.find(
      (c) => c.billableEventId === event.id && c.isActive,
    );
    const hasCoverage = Boolean(eventConfig || activeGlobal);
    return {
      key: `event-${event.id}`,
      scopeLabel: `${event.code} — ${event.name}`,
      isGlobal: false,
      billableEventId: event.id,
      activeProvider: eventConfig
        ? gatewayLabel(eventConfig.provider)
        : activeGlobal
          ? `${gatewayLabel(activeGlobal.provider)} (fallback)`
          : null,
      activeConfigId: eventConfig?.id ?? activeGlobal?.id ?? null,
      hasGap: !hasCoverage,
    };
  });

  const rows = [globalRow, ...eventRows];
  const gapCount = eventRows.filter((row) => row.hasGap).length;

  return {
    rows,
    gapCount,
    hasActiveGlobalFallback: Boolean(activeGlobal),
  };
}

export function hasEventSpecificWithoutGlobalFallback(
  configs: TenantPaymentGatewayConfig[],
): boolean {
  const hasEventSpecific = configs.some(
    (c) => c.billableEventId != null && c.isActive,
  );
  const hasGlobalFallback = configs.some(
    (c) => c.billableEventId == null && c.isActive,
  );
  return hasEventSpecific && !hasGlobalFallback;
}
