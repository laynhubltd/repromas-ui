import type { GatewayProvider } from "@/features/billing/tabs/payment-gateway/types/payment-gateway-config";

export const GATEWAY_CONFIG_INCLUDE = "billableEvent" as const;

export const GATEWAY_PROVIDER_OPTIONS: {
  value: GatewayProvider;
  label: string;
}[] = [
  { value: "PAYSTACK", label: "Paystack" },
  { value: "FLUTTERWAVE", label: "Flutterwave" },
  { value: "REMITA", label: "Remita" },
];

export const GATEWAY_SCOPE_GLOBAL_LABEL =
  "Global fallback (all other fees)" as const;

export const GATEWAY_SCOPE_GLOBAL_VALUE = "__global__" as const;

export const GATEWAY_ACTIVE_FILTER_OPTIONS = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
] as const;

export const GATEWAY_SCOPE_FILTER_OPTIONS = [
  { value: "global" as const, label: "Global fallback" },
  { value: "event" as const, label: "Event-specific" },
] as const;

export const GATEWAY_WEBHOOK_PATHS = {
  PAYSTACK: "/billing/payment-transactions/webhook/paystack",
  FLUTTERWAVE: "/billing/payment-transactions/webhook/flutterwave",
  REMITA: "/billing/payment-transactions/webhook/remita",
} as const;

export const GATEWAY_CONFIG_UI_COPY = {
  explainerTitle: "Payment gateway routing",
  explainerBody:
    "Configure which online payment provider handles each fee at checkout. The system picks a gateway in this order: (1) active config for the fee's billable event, (2) active global fallback, (3) payment fails if neither exists. Students never choose a gateway — routing is automatic.",
  emptyTitle: "No payment gateways configured",
  emptyBody:
    "Start with a global fallback gateway so students can pay fees that do not have a dedicated provider.",
  emptyCta: "Add global fallback gateway",
  createTitle: "Add payment gateway",
  editTitle: "Edit payment gateway",
  createSubmit: "Add gateway",
  editSubmit: "Save changes",
  deleteTitle: "Delete gateway configuration",
  deleteActiveWarning:
    "This configuration is active. Deleting removes stored credentials. Prefer deactivating if this gateway was used in production.",
  deactivateSuccess: "Gateway deactivated.",
  noGlobalFallbackWarning:
    "You have event-specific gateways but no active global fallback. Fees without a dedicated gateway will fail at checkout.",
  siblingDeactivatedNote:
    "The previous active gateway for this scope was deactivated.",
  coverageMatrixTitle: "Coverage overview",
  coverageMatrixHint:
    "Shows which provider is active per scope. Gaps mean checkout may fail unless a global fallback covers that fee.",
  webhookPanelTitle: "Webhook URLs",
  webhookPanelHint:
    "Register these URLs in your provider dashboard. Credentials must match the merchant account.",
  scopeImmutableHint:
    "Scope and provider cannot be changed after creation. Delete and create a new configuration to change them.",
  activateConfirmTitle: "Activate this gateway?",
  activateConfirmBody:
    "Activating will deactivate any other active gateway for the same scope (same billable event or global fallback).",
  detailDrawerTitle: "Gateway configuration",
  credentialsTitle: "Credentials",
  loadDetailError: "Failed to load gateway configuration.",
  scopeSelectHelp:
    "Global fallback handles any fee without a dedicated gateway. Event-specific rows override the fallback for that fee only.",
  scopeSelectProviderFirst:
    "Select a payment provider first, then choose which fees it should handle.",
  scopeSelectPlaceholder: "Choose scope…",
  scopeSelectProviderFirstPlaceholder: "Select provider first",
  scopeUnknownEvent:
    "Billable event unavailable — it may be inactive or removed. Check Fee Events setup.",
  scopeInactiveEvent:
    "This billable event is inactive. New fee charges may not use this gateway until the event is reactivated.",
  scopeRoutingHint:
    "Checkout uses an event-specific gateway first, then the global fallback.",
} as const;

export const GATEWAY_CREDENTIAL_TOOLTIPS = {
  public_key: "Public key from your provider dashboard.",
  secret_key: "Secret key — keep confidential.",
  webhook_secret: "Used to verify webhook signatures from Flutterwave.",
  merchant_id: "Remita merchant ID.",
  service_type_id: "Remita service type ID for this fee category.",
  api_key: "Remita API key.",
  base_url:
    "Optional. Override Remita or Flutterwave API host (e.g. demo vs production).",
} as const;
