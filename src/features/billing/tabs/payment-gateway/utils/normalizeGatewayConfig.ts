import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";

export function normalizeGatewayConfig(
  config: TenantPaymentGatewayConfig,
): TenantPaymentGatewayConfig {
  return {
    ...config,
    billableEventId: config.billableEventId ?? null,
    priority: config.priority ?? 1,
    isActive: config.isActive ?? true,
  };
}
