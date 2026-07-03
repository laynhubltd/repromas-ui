import { BILLING_PAYMENT_SESSION_KEYS } from "@/shared/constants/billingPaymentOptions";
import type {
  BillingPaymentProvider,
  PayerType,
} from "@/features/student-invoices/types/student-invoice";
import { resolvePayerTypeFromScope } from "@/features/student-invoices/utils/resolvePayerType";

export type StoredCheckoutContext = {
  providerReference: string;
  provider?: BillingPaymentProvider;
  amount?: string;
  currency?: string;
  eventCode?: string;
  feeChargeId?: number;
  /** Payer identity at checkout — frozen for payment-return polling. */
  payerType?: PayerType;
};

export function saveCheckoutContext(context: StoredCheckoutContext): void {
  sessionStorage.setItem(
    BILLING_PAYMENT_SESSION_KEYS.lastProviderReference,
    context.providerReference,
  );
  if (context.provider) {
    sessionStorage.setItem(
      BILLING_PAYMENT_SESSION_KEYS.lastPaymentProvider,
      context.provider,
    );
  }
  if (context.amount) {
    sessionStorage.setItem(
      BILLING_PAYMENT_SESSION_KEYS.lastPaymentAmount,
      context.amount,
    );
  }
  if (context.currency) {
    sessionStorage.setItem(
      BILLING_PAYMENT_SESSION_KEYS.lastPaymentCurrency,
      context.currency,
    );
  }
  if (context.eventCode) {
    sessionStorage.setItem(
      BILLING_PAYMENT_SESSION_KEYS.lastPaymentEventCode,
      context.eventCode,
    );
  }
  if (context.feeChargeId !== undefined) {
    sessionStorage.setItem(
      BILLING_PAYMENT_SESSION_KEYS.lastPaymentFeeChargeId,
      String(context.feeChargeId),
    );
  }
  if (context.payerType) {
    sessionStorage.setItem(
      BILLING_PAYMENT_SESSION_KEYS.lastPaymentPayerType,
      context.payerType,
    );
  }
}

function readStoredPayerType(): PayerType | undefined {
  const raw = sessionStorage.getItem(
    BILLING_PAYMENT_SESSION_KEYS.lastPaymentPayerType,
  );
  if (raw === "student" || raw === "admission_candidate") {
    return raw;
  }
  return undefined;
}

export function readCheckoutContext(): StoredCheckoutContext | null {
  const providerReference = sessionStorage.getItem(
    BILLING_PAYMENT_SESSION_KEYS.lastProviderReference,
  );
  if (!providerReference) return null;

  const feeChargeIdRaw = sessionStorage.getItem(
    BILLING_PAYMENT_SESSION_KEYS.lastPaymentFeeChargeId,
  );
  const feeChargeId =
    feeChargeIdRaw !== null && feeChargeIdRaw !== ""
      ? Number.parseInt(feeChargeIdRaw, 10)
      : undefined;

  return {
    providerReference,
    provider:
      (sessionStorage.getItem(
        BILLING_PAYMENT_SESSION_KEYS.lastPaymentProvider,
      ) as BillingPaymentProvider | null) ?? undefined,
    amount:
      sessionStorage.getItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentAmount) ??
      undefined,
    currency:
      sessionStorage.getItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentCurrency) ??
      undefined,
    eventCode:
      sessionStorage.getItem(
        BILLING_PAYMENT_SESSION_KEYS.lastPaymentEventCode,
      ) ?? undefined,
    feeChargeId:
      feeChargeId !== undefined && !Number.isNaN(feeChargeId)
        ? feeChargeId
        : undefined,
    payerType: readStoredPayerType(),
  };
}

export function clearCheckoutContext(): void {
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastProviderReference);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentProvider);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentAmount);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentCurrency);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentEventCode);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentFeeChargeId);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentPayerType);
}

/** Payer type for payment-return polling — prefers checkout snapshot over live JWT scope. */
export function resolveFlowPayerType(
  checkoutContext: StoredCheckoutContext | null,
  activeRoleScope: string | null | undefined,
): PayerType | null {
  if (checkoutContext?.payerType) {
    return checkoutContext.payerType;
  }
  return resolvePayerTypeFromScope(activeRoleScope);
}

/** Provider reference is stored in sessionStorage only (not URL query params). */
export function readProviderReferenceFromUrl(
  _searchParams: URLSearchParams,
): string | null {
  return readCheckoutContext()?.providerReference ?? null;
}

export function stripPaymentReturnSearchParams(
  searchParams: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  next.delete("paymentReturn");
  next.delete("providerReference");
  next.delete("returnTo");
  return next;
}
