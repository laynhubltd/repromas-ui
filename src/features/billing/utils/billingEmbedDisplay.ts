import { ADMIN_INVOICE_STATUS_LABELS } from "@/shared/constants/billingInvoiceOptions";
import {
  formatEventCodeLabel,
  formatFeeChargeStatusLabel,
  formatPayerTypeLabel,
  humanizeEnumValue,
} from "@/shared/constants/billingDisplayLabels";

export type ShallowFeeChargeEmbed = {
  eventCode?: string;
  eventName?: string;
  status?: string;
  occurrenceKey?: string;
  payerType?: string;
  payerId?: number;
  studentId?: number | null;
  candidateId?: number | null;
};

export type ShallowInvoiceEmbed = {
  invoiceNumber?: string;
  status?: string;
  eventCode?: string;
  eventName?: string;
  currency?: string;
};

export type InvoiceLineNameSource = {
  id: number;
  lineName: string;
};

export { formatPayerTypeLabel };

/** Primary label for a fee charge embed (display name / event + optional status). */
export function formatFeeChargeLabel(
  feeCharge: ShallowFeeChargeEmbed | Record<string, unknown> | null | undefined,
): string {
  if (!feeCharge || typeof feeCharge !== "object") return "—";

  const embed = feeCharge as ShallowFeeChargeEmbed;
  const name = formatEventCodeLabel(embed.eventCode, {
    displayName: embed.eventName,
  });
  if (name === "—") return "—";

  const status = embed.status;
  if (status) {
    const statusLabel = formatFeeChargeStatusLabel(status);
    return `${name} (${statusLabel})`;
  }

  return name;
}

/** Primary label for an invoice embed. */
export function formatInvoiceLabel(
  invoice: ShallowInvoiceEmbed | Record<string, unknown> | null | undefined,
): string {
  if (!invoice || typeof invoice !== "object") return "—";

  const embed = invoice as ShallowInvoiceEmbed;
  if (embed.invoiceNumber) return embed.invoiceNumber;

  if (embed.eventName) return embed.eventName;

  const fromCode = formatEventCodeLabel(embed.eventCode);
  if (fromCode !== "—") return fromCode;

  return "—";
}

export function formatInvoiceStatusLabel(status: string | undefined): string {
  if (!status) return "—";
  const key = status.toUpperCase();
  return (
    ADMIN_INVOICE_STATUS_LABELS[key] ??
    ADMIN_INVOICE_STATUS_LABELS[status] ??
    humanizeEnumValue(status)
  );
}

/** Bill / fee context for payment list rows. */
export function formatPaymentContextLabel(payment: {
  invoice?: ShallowInvoiceEmbed | Record<string, unknown> | null;
  feeCharge?: ShallowFeeChargeEmbed | Record<string, unknown> | null;
}): string {
  const invoice = payment.invoice as ShallowInvoiceEmbed | null | undefined;
  if (invoice?.eventName) return invoice.eventName;
  if (invoice?.invoiceNumber) return invoice.invoiceNumber;

  const feeCharge = payment.feeCharge as ShallowFeeChargeEmbed | null | undefined;
  if (feeCharge?.eventName) return feeCharge.eventName;
  const feeFromCode = formatEventCodeLabel(feeCharge?.eventCode);
  if (feeFromCode !== "—") return feeFromCode;

  const invoiceFromCode = formatEventCodeLabel(invoice?.eventCode);
  if (invoiceFromCode !== "—") return invoiceFromCode;

  return "—";
}

export function buildInvoiceLineNameMap(
  lines: InvoiceLineNameSource[] | null | undefined,
): Map<number, string> {
  const map = new Map<number, string>();
  for (const line of lines ?? []) {
    map.set(line.id, line.lineName);
  }
  return map;
}

export function resolveAllocationLineName(
  lineMap: Map<number, string>,
  invoiceLineId: number,
): string {
  return lineMap.get(invoiceLineId) ?? "—";
}

/** Settled payment summary on a transaction (no internal payment id). */
export function formatPostedPaymentsSummary(
  payments:
    | Array<{
        amount?: string;
        invoice?: ShallowInvoiceEmbed | null;
        feeCharge?: ShallowFeeChargeEmbed | null;
      }>
    | null
    | undefined,
  _currency = "NGN",
): string {
  if (!payments?.length) return "";

  return payments
    .map((payment) => {
      const bill = formatInvoiceLabel(payment.invoice);
      const fee = formatFeeChargeLabel(payment.feeCharge);
      const parts = [bill !== "—" ? bill : null, fee !== "—" ? fee : null].filter(
        Boolean,
      );
      return parts.length > 0 ? parts.join(" · ") : "Settled payment";
    })
    .join("; ");
}
