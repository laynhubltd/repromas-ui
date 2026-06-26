import type { Rule } from "antd/es/form";
import type { GatewayProvider } from "../types/payment-gateway-config";

export const providerRules: Rule[] = [
  { required: true, message: "Provider is required" },
];

export const scopeRules: Rule[] = [
  { required: true, message: "Scope is required" },
];

const requiredString = (label: string): Rule[] => [
  { required: true, message: `${label} is required` },
  { whitespace: true, message: `${label} cannot be empty` },
];

export function getCredentialFieldRules(
  provider: GatewayProvider | undefined,
  field: string,
): Rule[] {
  if (!provider) return [];

  const requiredFields: Record<GatewayProvider, string[]> = {
    PAYSTACK: ["public_key", "secret_key"],
    FLUTTERWAVE: ["public_key", "secret_key", "webhook_secret"],
    REMITA: ["merchant_id", "service_type_id", "api_key"],
  };

  const optionalFields = ["base_url"];

  if (optionalFields.includes(field)) {
    return [];
  }

  if (requiredFields[provider]?.includes(field)) {
    const labels: Record<string, string> = {
      public_key: "Public key",
      secret_key: "Secret key",
      webhook_secret: "Webhook secret",
      merchant_id: "Merchant ID",
      service_type_id: "Service type ID",
      api_key: "API key",
    };
    return requiredString(labels[field] ?? field);
  }

  return [];
}

export const baseUrlRules: Rule[] = [
  {
    type: "url",
    message: "Enter a valid URL",
    warningOnly: true,
  },
];
