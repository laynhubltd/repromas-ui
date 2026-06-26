import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";

export function buildGatewayEventByIdMap(
  configs: TenantPaymentGatewayConfig[],
  activeEvents: BillableEvent[] = [],
): Map<number, BillableEvent> {
  const map = new Map<number, BillableEvent>();

  for (const event of activeEvents) {
    map.set(event.id, event);
  }

  for (const config of configs) {
    if (config.billableEvent) {
      map.set(config.billableEvent.id, config.billableEvent as BillableEvent);
    }
  }

  return map;
}
