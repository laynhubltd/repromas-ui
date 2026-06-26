export type PayerType = "student" | "admission_candidate";

export type InvoiceStatus =
  | "UNPAID"
  | "PARTIAL"
  | "PAID"
  | "WAIVED_COMPLETELY"
  | "CANCELLED";

export type InvoiceLineType = "CHARGE" | "CREDIT" | "TAX" | "ADJUSTMENT";

export type InvoiceLineStatus = "UNPAID" | "PARTIAL" | "PAID";

export type BillingPaymentAllocation = {
  id: number;
  paymentId: number;
  invoiceLineId: number;
  amount: string;
  createdAt: string;
};

export type StudentInvoiceLine = {
  id: number;
  invoiceId: number;
  lineType: InvoiceLineType;
  lineCode: string | null;
  lineName: string;
  accountingCode: string | null;
  quantity: string;
  unitAmount: string;
  lineAmount: string;
  isRequired: boolean;
  sortOrder: number;
  sourceRuleId: number | null;
  sourceRuleItemId: number | null;
  createdAt: string;
  updatedAt: string;
  lineStatus?: InvoiceLineStatus;
  allocatedPaidAmount?: string;
  outstandingAmount?: string;
  isSelected?: boolean;
  invoice?: StudentInvoice | null;
  allocations?: BillingPaymentAllocation[] | null;
};

export type StudentInvoice = {
  id: number;
  feeChargeId: number;
  invoiceNumber: string;
  status: InvoiceStatus;
  currency: string;
  amountDueTotal: string;
  amountPaidTotal: string;
  amountCreditedTotal: string;
  amountOutstandingTotal: string;
  issuedAt: string;
  dueAt: string | null;
  cancelledAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  eventCode: string;
  eventName: string;
  feeChargeStatus: string;
  amountOutstandingRequired: string;
  canPay: boolean;
  feeCharge?: Record<string, unknown> | null;
  lines?: StudentInvoiceLine[] | null;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};

export type MyInvoicesParams = {
  payerType: PayerType;
  activeOnly?: boolean;
  page?: number;
  itemsPerPage?: number;
  sort?: string;
};

export type MyInvoiceParams = {
  id: number;
  payerType: PayerType;
  include?: string;
  selectedOptionalLineIds?: string;
};

export type InitiatePaymentRequest = {
  redirectUrl: string;
  customerEmail?: string;
  customerName?: string;
  selectedOptionalLineIds?: number[];
};

export type BillingPaymentProvider =
  | "FLUTTERWAVE"
  | "PAYSTACK"
  | "REMITA"
  | "BANK_TRANSFER"
  | "MANUAL";

export type InitiatePaymentResponse = {
  checkoutUrl: string;
  providerReference?: string;
  /** Gateway selected for this tenant — drives checkout behaviour */
  provider?: BillingPaymentProvider;
  feeChargeId?: number;
  invoiceId?: number | null;
  amount?: string;
  currency?: string;
};
