import type { ShallowFeeChargeEmbed } from "@/features/billing/utils/billingEmbedDisplay";
import type { BillingPaymentAllocation } from "@/features/student-invoices/types/student-invoice";

export type BillingInvoiceLine = {
  id: number;
  invoiceId: number;
  lineName: string;
  lineAmount: string;
  isRequired: boolean;
  sortOrder: number;
  lineType?: string;
  allocations?: BillingPaymentAllocation[] | null;
};

export type BillingInvoice = {
  id: number;
  feeChargeId: number;
  invoiceNumber: string;
  status: string;
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
  feeCharge?: ShallowFeeChargeEmbed | null;
  lines?: BillingInvoiceLine[] | null;
};

export type BillingInvoiceListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[feeChargeId]"?: number;
  "exact[status]"?: string;
  "exact[isActive]"?: boolean;
  "exact[invoiceNumber]"?: string;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};
