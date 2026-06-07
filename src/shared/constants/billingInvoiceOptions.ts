export const ADMIN_INVOICE_SORT_DEFAULT = "issuedAt:desc";
export const ADMIN_INVOICE_ITEMS_PER_PAGE = 20;

export const ADMIN_INVOICE_STATUS_LABELS: Record<string, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Partially paid",
  PAID: "Paid",
  WAIVED_COMPLETELY: "Waived",
  CANCELLED: "Cancelled",
};

export const ADMIN_INVOICE_UI_COPY = {
  explainerTitle: "Invoices",
  explainerBody:
    "Read-only invoice documents issued for fee charges. Use Payments and Fee charges for operational balances.",
  loadListError: "Failed to load invoices.",
  loadDetailError: "Failed to load invoice.",
  emptyTitle: "No invoices found",
  noInvoiceYet: "No invoice has been issued for this fee charge yet.",
  invoiceDetailTitle: "Invoice detail",
  invoiceNumber: "Invoice number",
  linesTitle: "Line items",
  requiredLine: "Required",
  optionalLine: "Optional",
} as const;
