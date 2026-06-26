import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import {
  GATEWAY_CONFIG_UI_COPY,
  GATEWAY_SCOPE_GLOBAL_LABEL,
} from "@/shared/constants/gatewayConfigOptions";
import { gatewayLabel } from "@/features/student-payments/utils/gatewayDisplay";
import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";

export function formatGatewayConfigUpdatedAt(updatedAt: string): string {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getGatewayConfigStatusLabel(config: TenantPaymentGatewayConfig): string {
  return config.isActive ? "Active" : "Inactive";
}

function resolveBillableEventForConfig(
  config: TenantPaymentGatewayConfig,
  eventById: Map<number, BillableEvent>,
): BillableEvent | undefined {
  if (config.billableEvent) {
    return config.billableEvent as BillableEvent;
  }
  if (config.billableEventId == null) {
    return undefined;
  }
  return eventById.get(config.billableEventId);
}

export function resolveScopeLabel(
  config: TenantPaymentGatewayConfig | null | undefined,
  eventById: Map<number, BillableEvent>,
): string {
  if (!config) return "—";
  if (config.billableEventId == null) {
    return GATEWAY_SCOPE_GLOBAL_LABEL;
  }
  const event = resolveBillableEventForConfig(config, eventById);
  if (event) {
    return `${event.code} — ${event.name}`;
  }
  return `Event #${config.billableEventId}`;
}

export function resolveScopeShortLabel(
  config: TenantPaymentGatewayConfig | null | undefined,
  eventById: Map<number, BillableEvent>,
): string {
  if (!config) return "—";
  if (config.billableEventId == null) {
    return "Global fallback";
  }
  const event = resolveBillableEventForConfig(config, eventById);
  return event ? event.code : `#${config.billableEventId}`;
}

export function resolveScopeGuidedText(
  config: TenantPaymentGatewayConfig | null | undefined,
  eventById: Map<number, BillableEvent>,
): string | null {
  if (!config || config.billableEventId == null) {
    return null;
  }

  const event = resolveBillableEventForConfig(config, eventById);
  if (!event) {
    return GATEWAY_CONFIG_UI_COPY.scopeUnknownEvent;
  }
  if (!event.isActive) {
    return GATEWAY_CONFIG_UI_COPY.scopeInactiveEvent;
  }
  return null;
}

export function resolveScopeDescription(
  config: TenantPaymentGatewayConfig | null | undefined,
  eventById: Map<number, BillableEvent>,
): string | null {
  if (!config || config.billableEventId == null) {
    return null;
  }
  const event = resolveBillableEventForConfig(config, eventById);
  return event?.description?.trim() || null;
}

export function formatProviderLabel(provider: TenantPaymentGatewayConfig["provider"]): string {
  return gatewayLabel(provider);
}
