import {
  formatEventCodeLabel,
  humanizeEnumValue,
} from "@/shared/constants/billingDisplayLabels";
import { INVOICE_STATUS_LABELS } from "@/shared/constants/studentInvoiceOptions";
import { formatCurrencyDisplay } from "@/features/billing/tabs/pricing-rules/utils/computeGrossPreview";
import type {
  InvoiceStatus,
  StudentInvoice,
} from "../types/student-invoice";

export type InvoiceStatusDisplay = {
  label: string;
  color: "default" | "success" | "warning" | "error" | "processing";
};

export function formatInvoiceStatus(status: InvoiceStatus): InvoiceStatusDisplay {
  switch (status) {
    case "PAID":
      return { label: INVOICE_STATUS_LABELS.PAID, color: "success" };
    case "PARTIAL":
      return { label: INVOICE_STATUS_LABELS.PARTIAL, color: "warning" };
    case "UNPAID":
      return { label: INVOICE_STATUS_LABELS.UNPAID, color: "error" };
    case "WAIVED_COMPLETELY":
      return { label: INVOICE_STATUS_LABELS.WAIVED_COMPLETELY, color: "default" };
    case "CANCELLED":
      return { label: INVOICE_STATUS_LABELS.CANCELLED, color: "default" };
    default:
      return { label: humanizeEnumValue(status), color: "default" };
  }
}

export function invoiceListPrimaryTitle(
  invoice: StudentInvoice | null | undefined,
): string {
  if (!invoice) return "";
  return (
    invoice.eventName ||
    formatEventCodeLabel(invoice.eventCode)
  );
}

export function formatInvoiceAmount(
  amount: string | null | undefined,
  currency?: string,
): string {
  const formatted = formatCurrencyDisplay(amount ?? "0");
  if (!currency || currency === "NGN") {
    return formatted;
  }
  return `${currency} ${formatted}`;
}

export function buildSelectedOptionalLineIdsParam(lineIds: number[]): string | undefined {
  if (lineIds.length === 0) return undefined;
  return lineIds.join(",");
}

export function findInvoiceIdByFeeChargeId(
  invoices: StudentInvoice[],
  feeChargeId: number,
): number | null {
  const match = invoices.find(
    (invoice) => invoice.feeChargeId === feeChargeId && invoice.canPay,
  );
  return match?.id ?? null;
}

export function hasGuardAmountMismatch(invoice: StudentInvoice): boolean {
  const required = parseFloat(invoice.amountOutstandingRequired);
  const total = parseFloat(invoice.amountOutstandingTotal);
  if (Number.isNaN(required) || Number.isNaN(total)) return false;
  return required < total;
}

export function formatIssuedDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
