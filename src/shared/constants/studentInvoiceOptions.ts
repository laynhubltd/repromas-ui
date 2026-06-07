import type { InvoiceStatus } from "@/features/student-invoices/types/student-invoice";

export const STUDENT_INVOICE_SORT_DEFAULT = "issuedAt:desc";
export const STUDENT_INVOICE_ITEMS_PER_PAGE = 20;

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  UNPAID: "Unpaid",
  PARTIAL: "Partially paid",
  PAID: "Paid",
  WAIVED_COMPLETELY: "Waived",
  CANCELLED: "Cancelled",
};

export const STUDENT_INVOICE_UI_COPY = {
  explainerTitle: "My bills",
  explainerBody:
    "View your fee invoices, see what you owe, and pay online. Required fees must be paid before some steps (such as course registration) can continue.",
  loadListError: "Failed to load your invoices.",
  loadDetailError: "Failed to load this invoice.",
  emptyTitle: "No invoices yet",
  emptyDescription:
    "When the school issues a bill for your account, it will appear here.",
  showPastInvoices: "Show past invoices",
  payNow: "Pay now",
  viewDetails: "View",
  backToList: "Back to invoices",
  updateSelection: "Update selection",
  optionalLineHelp:
    "Optional items are not included in your payment unless you select them below.",
  requiredLine: "Required",
  optionalLine: "Optional",
  guardAmountHint: "Required to continue some steps:",
  invoiceNumber: "Invoice number",
  issuedAt: "Issued",
  dueAt: "Due",
  amountDue: "Total due",
  amountPaid: "Paid",
  amountOutstanding: "Outstanding",
  cancelledNotice: "This invoice is no longer active and cannot be paid.",
  noPayableInvoice:
    "No payable invoice found for this fee. Open My bills or contact the bursary office.",
  paymentReturnMessage:
    "If you completed payment, your balance may take a moment to update. Refresh the list to see the latest status.",
  initiatePaymentError: "Could not start payment. Please try again.",
} as const;
