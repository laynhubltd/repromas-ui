import type {
  GatewayCredentials,
  GatewayProvider,
  UpsertGatewayConfigRequest,
} from "../types/payment-gateway-config";
import type { GATEWAY_SCOPE_GLOBAL_VALUE } from "@/shared/constants/gatewayConfigOptions";

type FormCredentialValues = {
  public_key?: string;
  secret_key?: string;
  webhook_secret?: string;
  merchant_id?: string;
  service_type_id?: string;
  api_key?: string;
  base_url?: string;
};

export type PaymentGatewayConfigFormValues = {
  provider: GatewayProvider;
  billableEventId?: number | null;
  scopeValue?: number | typeof GATEWAY_SCOPE_GLOBAL_VALUE;
  isActive: boolean;
  credentials: FormCredentialValues;
};

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function buildPaystackCredentials(
  credentials: FormCredentialValues,
): GatewayCredentials {
  return {
    public_key: credentials.public_key?.trim() ?? "",
    secret_key: credentials.secret_key?.trim() ?? "",
  };
}

function buildFlutterwaveCredentials(
  credentials: FormCredentialValues,
): GatewayCredentials {
  const result: GatewayCredentials = {
    public_key: credentials.public_key?.trim() ?? "",
    secret_key: credentials.secret_key?.trim() ?? "",
    webhook_secret: credentials.webhook_secret?.trim() ?? "",
  };
  const baseUrl = trimOptional(credentials.base_url);
  if (baseUrl) {
    (result as { base_url?: string }).base_url = baseUrl;
  }
  return result;
}

function buildRemitaCredentials(
  credentials: FormCredentialValues,
): GatewayCredentials {
  const result: GatewayCredentials = {
    merchant_id: credentials.merchant_id?.trim() ?? "",
    service_type_id: credentials.service_type_id?.trim() ?? "",
    api_key: credentials.api_key?.trim() ?? "",
  };
  const baseUrl = trimOptional(credentials.base_url);
  if (baseUrl) {
    (result as { base_url?: string }).base_url = baseUrl;
  }
  return result;
}

export function buildGatewayCredentialsPayload(
  provider: GatewayProvider,
  credentials: FormCredentialValues,
): GatewayCredentials {
  switch (provider) {
    case "PAYSTACK":
      return buildPaystackCredentials(credentials);
    case "FLUTTERWAVE":
      return buildFlutterwaveCredentials(credentials);
    case "REMITA":
      return buildRemitaCredentials(credentials);
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

export function buildUpsertGatewayConfigPayload(
  values: PaymentGatewayConfigFormValues,
): UpsertGatewayConfigRequest {
  return {
    provider: values.provider,
    credentials: buildGatewayCredentialsPayload(
      values.provider,
      values.credentials,
    ),
    isActive: values.isActive,
    priority: 1,
    billableEventId: values.billableEventId ?? null,
  };
}

export function credentialsToFormValues(
  credentials: GatewayCredentials,
): FormCredentialValues {
  return {
    public_key: "public_key" in credentials ? credentials.public_key : undefined,
    secret_key: "secret_key" in credentials ? credentials.secret_key : undefined,
    webhook_secret:
      "webhook_secret" in credentials ? credentials.webhook_secret : undefined,
    merchant_id:
      "merchant_id" in credentials ? credentials.merchant_id : undefined,
    service_type_id:
      "service_type_id" in credentials
        ? credentials.service_type_id
        : undefined,
    api_key: "api_key" in credentials ? credentials.api_key : undefined,
    base_url: "base_url" in credentials ? credentials.base_url : undefined,
  };
}
