import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import {
  GATEWAY_SCOPE_GLOBAL_LABEL,
  GATEWAY_SCOPE_GLOBAL_VALUE,
} from "@/shared/constants/gatewayConfigOptions";
import type {
  GatewayProvider,
  TenantPaymentGatewayConfig,
} from "../types/payment-gateway-config";

export type ScopeOption = {
  value: number | typeof GATEWAY_SCOPE_GLOBAL_VALUE;
  label: string;
  disabled?: boolean;
};

export function hasConfigForScope(
  configs: TenantPaymentGatewayConfig[],
  provider: GatewayProvider | undefined,
  billableEventId: number | null,
): boolean {
  if (!provider) return false;
  return configs.some(
    (config) =>
      config.provider === provider &&
      config.billableEventId === billableEventId,
  );
}

export function buildScopeOptions(
  events: BillableEvent[],
  configs: TenantPaymentGatewayConfig[],
  provider: GatewayProvider | undefined,
  editingConfigId?: number,
): ScopeOption[] {
  const globalDisabled =
    provider !== undefined &&
    hasConfigForScope(configs, provider, null) &&
    !configs.some(
      (c) =>
        c.id === editingConfigId &&
        c.provider === provider &&
        c.billableEventId === null,
    );

  const globalOption: ScopeOption = {
    value: GATEWAY_SCOPE_GLOBAL_VALUE,
    label: GATEWAY_SCOPE_GLOBAL_LABEL,
    disabled: globalDisabled,
  };

  const eventOptions: ScopeOption[] = events.map((event) => {
    const disabled =
      provider !== undefined &&
      hasConfigForScope(configs, provider, event.id) &&
      !configs.some(
        (c) =>
          c.id === editingConfigId &&
          c.provider === provider &&
          c.billableEventId === event.id,
      );

    return {
      value: event.id,
      label: `${event.code} — ${event.name}`,
      disabled,
    };
  });

  return [globalOption, ...eventOptions];
}

export function scopeValueToBillableEventId(
  value: number | typeof GATEWAY_SCOPE_GLOBAL_VALUE,
): number | null {
  return value === GATEWAY_SCOPE_GLOBAL_VALUE ? null : value;
}

export function billableEventIdToScopeValue(
  billableEventId: number | null | undefined,
): number | typeof GATEWAY_SCOPE_GLOBAL_VALUE {
  return billableEventId == null
    ? GATEWAY_SCOPE_GLOBAL_VALUE
    : billableEventId;
}
