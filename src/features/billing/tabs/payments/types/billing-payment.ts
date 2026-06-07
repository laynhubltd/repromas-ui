import type {
  ShallowFeeChargeEmbed,
  ShallowInvoiceEmbed,
} from "@/features/billing/utils/billingEmbedDisplay";
import type { BillingPaymentAllocation } from "@/features/student-invoices/types/student-invoice";

export type BillingPaymentTransactionEmbed = {
  id: number;
  provider: string;
  providerReference: string;
  status: string;
  paidAt: string | null;
  amount?: string;
  currency?: string;
};

export type BillingPayment = {
  id: number;
  paymentTransactionId: number;
  feeChargeId: number;
  invoiceId: number | null;
  amount: string;
  createdAt: string;
  updatedAt: string;
  transaction?: BillingPaymentTransactionEmbed | null;
  feeCharge?: ShallowFeeChargeEmbed | null;
  invoice?: ShallowInvoiceEmbed | null;
  allocations?: BillingPaymentAllocation[] | null;
};

export type BillingPaymentListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[feeChargeId]"?: number;
  "exact[invoiceId]"?: number;
  "exact[paymentTransactionId]"?: number;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};
