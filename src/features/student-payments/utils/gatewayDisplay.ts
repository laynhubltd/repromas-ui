import type { BillingPaymentProvider } from "@/features/student-invoices/types/student-invoice";

/**
 * Returns a human-readable label for a payment gateway provider.
 * Use this wherever the UI displays the gateway name — receipts, transaction
 * detail, payment return pages, etc.
 */
export function gatewayLabel(
  provider: BillingPaymentProvider | string | undefined | null,
): string {
  switch (provider) {
    case "FLUTTERWAVE":
      return "Flutterwave";
    case "PAYSTACK":
      return "Paystack";
    case "REMITA":
      return "Remita";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "MANUAL":
      return "Manual";
    default:
      return provider ?? "—";
  }
}
