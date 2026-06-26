import { BILLING_PAYMENT_SESSION_KEYS } from "@/shared/constants/billingPaymentOptions";
import type { BillingPaymentProvider } from "@/features/student-invoices/types/student-invoice";

export type StoredCheckoutContext = {
  providerReference: string;
  provider?: BillingPaymentProvider;
  amount?: string;
  currency?: string;
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
}

export function readCheckoutContext(): StoredCheckoutContext | null {
  const providerReference = sessionStorage.getItem(
    BILLING_PAYMENT_SESSION_KEYS.lastProviderReference,
  );
  if (!providerReference) return null;

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
  };
}

export function clearCheckoutContext(): void {
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastProviderReference);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentProvider);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentAmount);
  sessionStorage.removeItem(BILLING_PAYMENT_SESSION_KEYS.lastPaymentCurrency);
}

export function readProviderReferenceFromUrl(
  searchParams: URLSearchParams,
): string | null {
  const fromUrl = searchParams.get("providerReference");
  if (fromUrl?.trim()) return fromUrl.trim();
  return readCheckoutContext()?.providerReference ?? null;
}
