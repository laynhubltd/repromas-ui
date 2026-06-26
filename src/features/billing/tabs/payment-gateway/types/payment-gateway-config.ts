export type GatewayProvider = "PAYSTACK" | "FLUTTERWAVE" | "REMITA";

export type FlutterwaveCredentials = {
  public_key: string;
  secret_key: string;
  webhook_secret: string;
  base_url?: string;
};

export type PaystackCredentials = {
  public_key: string;
  secret_key: string;
};

export type RemitaCredentials = {
  merchant_id: string;
  service_type_id: string;
  api_key: string;
  base_url?: string;
};

export type GatewayCredentials =
  | FlutterwaveCredentials
  | PaystackCredentials
  | RemitaCredentials;

/** Billable event shell embedded via `?include=billableEvent`. */
export type GatewayBillableEventEmbed = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  currentPolicy?: unknown | null;
};

export type TenantPaymentGatewayConfig = {
  id: number;
  provider: GatewayProvider;
  credentials: GatewayCredentials;
  isActive: boolean;
  priority: number;
  billableEventId: number | null;
  billableEvent?: GatewayBillableEventEmbed | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertGatewayConfigRequest = {
  provider: GatewayProvider;
  credentials: GatewayCredentials;
  isActive?: boolean;
  priority?: number;
  billableEventId?: number | null;
};

export type UpdateGatewayConfigRequest = {
  id: number;
  body: UpsertGatewayConfigRequest;
};

export type GatewayScopeFilter = "global" | "event" | undefined;
