export type BillingPaymentTransactionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "FAILED"
  | "REVERSED";

export const PAYMENT_TRANSACTION_STATUS_LABELS: Record<
  BillingPaymentTransactionStatus,
  string
> = {
  PENDING: "Processing",
  CONFIRMED: "Confirmed",
  FAILED: "Failed",
  REVERSED: "Reversed",
};

export const PAYMENT_TRANSACTION_STATUS_COLORS: Record<
  BillingPaymentTransactionStatus,
  string
> = {
  PENDING: "processing",
  CONFIRMED: "success",
  FAILED: "error",
  REVERSED: "default",
};

export const STUDENT_PAYMENT_SORT_DEFAULT = "createdAt:desc";
export const STUDENT_PAYMENT_ITEMS_PER_PAGE = 20;
export const ADMIN_PAYMENT_ITEMS_PER_PAGE = 20;
export const ADMIN_PAYMENT_TRANSACTION_ITEMS_PER_PAGE = 20;

export const PAYMENT_RETURN_POLL_INTERVAL_MS = 2500;
export const PAYMENT_RETURN_POLL_MAX_MS = 60000;

export const HANDOFF_POLL_INTERVALS_MS = [2000, 4000, 8000] as const;
export const HANDOFF_POLL_MAX_ATTEMPTS = 12;

export const BILLING_PAYMENT_SESSION_KEYS = {
  lastProviderReference: "billing:lastProviderReference",
  lastPaymentAmount: "billing:lastPaymentAmount",
  lastPaymentCurrency: "billing:lastPaymentCurrency",
  lastPaymentProvider: "billing:lastPaymentProvider",
  lastPaymentEventCode: "billing:lastPaymentEventCode",
  lastPaymentFeeChargeId: "billing:lastPaymentFeeChargeId",
  lastPaymentPayerType: "billing:lastPaymentPayerType",
} as const;

export const STUDENT_PAYMENT_UI_COPY = {
  explainerTitle: "Payment history",
  explainerBody:
    "View payments you have made online. Processing payments may take a moment to appear after checkout.",
  loadListError: "Failed to load your payments.",
  loadDetailError: "Failed to load this payment.",
  emptyTitle: "No payments yet",
  emptyDescription:
    "When you complete a payment through My bills, it will appear here.",
  backToList: "Back to payments",
  viewReceipt: "View receipt",
  providerReference: "Reference",
  paidAt: "Paid on",
  amount: "Amount",
  allocations: "Applied to",
  viewBill: "View bill",
  paymentReturnProcessing: "Confirming your payment…",
  paymentReturnProcessingDetail:
    "Please wait while we verify your payment with the gateway. This usually takes a few seconds.",
  paymentReturnSuccess: "Payment received",
  paymentReturnSuccessDetail:
    "Your payment was recorded successfully. Your invoice balance will update shortly.",
  paymentReturnTimeout: "Payment still processing",
  paymentReturnTimeoutDetail:
    "We have not confirmed your payment yet. You can retry or check Payment history in a few minutes.",
  paymentReturnFailed: "Payment not confirmed",
  paymentReturnFailedDetail:
    "We could not confirm this payment. If you were charged, contact the bursary office with your payment reference.",
  retryPoll: "Check again",
  viewPaymentHistory: "View payment history",
  viewReceiptCta: "View receipt",
  continueApplicationCta: "Continue application",
  copyReference: "Copy reference",
  referenceCopied: "Reference copied",
  lineAmount: "Amount",
  abandonedCheckout: "Abandoned checkout",
} as const;

export const HANDOFF_UI_COPY = {
  confirmingPayment: "Confirming your payment…",
  confirmingPaymentDetail:
    "Please wait while we verify your payment with the gateway. This usually takes a few seconds.",
  paymentConfirmed: "Payment received",
  paymentConfirmedDetail:
    "Your payment was recorded successfully. Your invoice balance will update shortly.",
  matriculating: "Payment received — completing matriculation…",
  matriculatingDetail:
    "Your registration fee was confirmed. We are finalizing your matriculation.",
  handoff: "Updating your account…",
  handoffDetail: "Switching you to your student profile. This may take a moment.",
  complete: "Matriculation complete",
  completeDetail:
    "You have been matriculated. Your student portal is now available.",
  matriculationTimeout: "Matriculation still processing",
  matriculationTimeoutDetail:
    "Your payment was received but matriculation is taking longer than expected. Refresh the page in a few minutes or contact support.",
  handoffTimeout: "Account update timed out",
  handoffTimeoutDetail:
    "Matriculation completed but we could not refresh your session. Please sign out and sign in again.",
  goToHome: "Go to home",
} as const;

export const ADMIN_PAYMENT_UI_COPY = {
  paymentsExplainerTitle: "Payments",
  paymentsExplainerBody:
    "Settled cash applied to fee charges. Each row links to a gateway transaction and invoice allocations.",
  transactionsExplainerTitle: "Payment transactions",
  transactionsExplainerBody:
    "Gateway checkout attempts. Use Pending filter to find abandoned or stuck checkouts.",
  loadPaymentsError: "Failed to load payments.",
  loadTransactionsError: "Failed to load payment transactions.",
  emptyPayments: "No payments found",
  emptyTransactions: "No transactions found",
  filterAll: "All",
  filterPending: "Pending",
  filterConfirmed: "Confirmed",
  paymentDetailTitle: "Payment receipt",
  transactionDetailTitle: "Transaction detail",
  providerReference: "Provider reference",
  flutterwaveId: "Flutterwave ID",
  fee: "Fee",
  bill: "Bill",
  payer: "Payer",
  noLinkedPayment: "No payment posted yet",
  noInvoiceYet: "No invoice yet",
} as const;
