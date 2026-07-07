import { formatCurrencyDisplay } from "@/features/billing/tabs/pricing-rules/utils/computeGrossPreview";
import { formatPaymentContextLabel } from "@/features/billing/utils/billingEmbedDisplay";
import {
  formatEventCodeLabel,
  humanizeEnumValue,
} from "@/shared/constants/billingDisplayLabels";
import {
  PAYMENT_TRANSACTION_STATUS_COLORS,
  PAYMENT_TRANSACTION_STATUS_LABELS,
  type BillingPaymentTransactionStatus,
} from "@/shared/constants/billingPaymentOptions";
import type {
  StudentPayment,
  StudentPaymentTransaction,
} from "../types/student-payment";

const ABANDONED_CHECKOUT_MS = 24 * 60 * 60 * 1000;

export function formatPaymentAmount(
  amount: string | null | undefined,
  currency = "NGN",
): string {
  if (!amount) return "—";
  const formatted = formatCurrencyDisplay(amount);
  if (!currency || currency === "NGN") return formatted;
  return `${currency} ${formatted}`;
}

export function formatTransactionStatus(status: string): {
  label: string;
  color: string;
} {
  const key = status.toUpperCase() as BillingPaymentTransactionStatus;
  return {
    label: PAYMENT_TRANSACTION_STATUS_LABELS[key] ?? humanizeEnumValue(status),
    color: PAYMENT_TRANSACTION_STATUS_COLORS[key] ?? "default",
  };
}

export function getPostedPayments(
  transaction: StudentPaymentTransaction | null | undefined,
): StudentPayment[] {
  if (!transaction?.payments) return [];
  return transaction.payments.filter((p) => p != null);
}

/** Doc: success requires CONFIRMED transaction AND at least one billing_payment row. */
export function isTransactionSettled(
  transaction: StudentPaymentTransaction | null | undefined,
): boolean {
  if (!transaction) return false;
  if (transaction.status !== "CONFIRMED") return false;
  return getPostedPayments(transaction).length > 0;
}

export function resolvePollStateFromTransaction(
  transaction: StudentPaymentTransaction | null | undefined,
  elapsedMs: number,
  maxMs: number,
): "processing" | "success" | "timeout" | "failed" {
  if (isTransactionSettled(transaction)) return "success";
  if (!transaction) {
    return elapsedMs >= maxMs ? "timeout" : "processing";
  }
  if (transaction.status === "FAILED" || transaction.status === "REVERSED") {
    return "failed";
  }
  if (
    transaction.status === "CONFIRMED" &&
    getPostedPayments(transaction).length === 0
  ) {
    return elapsedMs >= maxMs ? "timeout" : "processing";
  }
  if (transaction.status === "PENDING") {
    return elapsedMs >= maxMs ? "timeout" : "processing";
  }
  return elapsedMs >= maxMs ? "timeout" : "processing";
}

export function isAbandonedCheckout(
  transaction: { status: string; createdAt: string },
  nowMs = Date.now(),
): boolean {
  if (transaction.status !== "PENDING") return false;
  const created = Date.parse(transaction.createdAt);
  if (Number.isNaN(created)) return false;
  return nowMs - created >= ABANDONED_CHECKOUT_MS;
}

export function formatPaymentFeeLabel(payment: StudentPayment): string {
  return formatEventCodeLabel(payment.feeCharge?.eventCode, {
    displayName: payment.feeCharge?.eventName,
  });
}

export function paymentListSubtitle(payment: StudentPayment): string {
  const label = formatPaymentContextLabel(payment);
  return label !== "—" ? label : "Payment received";
}

export function formatPaymentDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function firstTransactionFromList(
  member: StudentPaymentTransaction[] | undefined,
  providerReference: string,
): StudentPaymentTransaction | null {
  if (!member?.length) return null;
  const match = member.find((t) => t.providerReference === providerReference);
  return match ?? member[0] ?? null;
}
