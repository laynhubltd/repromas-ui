import type { TenantPaymentGatewayConfig } from "../types/payment-gateway-config";
import { normalizeGatewayConfig } from "./normalizeGatewayConfig";

type GatewayConfigCollectionResponse = {
  member?: TenantPaymentGatewayConfig[];
};

export function normalizeGatewayConfigList(
  raw: unknown,
): TenantPaymentGatewayConfig[] {
  if (Array.isArray(raw)) {
    return raw.map(normalizeGatewayConfig);
  }

  if (raw && typeof raw === "object" && "member" in raw) {
    const member = (raw as GatewayConfigCollectionResponse).member;
    if (Array.isArray(member)) {
      return member.map(normalizeGatewayConfig);
    }
  }

  return [];
}
