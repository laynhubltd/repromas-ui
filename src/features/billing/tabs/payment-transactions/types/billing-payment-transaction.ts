import type {
  ShallowFeeChargeEmbed,
  ShallowInvoiceEmbed,
} from "@/features/billing/utils/billingEmbedDisplay";
import type { BillingPayment } from "../../payments/types/billing-payment";

export type BillingPaymentTransactionStatus =
  | "PENDING"
  | "CONFIRMED"
  | "FAILED"
  | "REVERSED"
  | string;

export type BillingPaymentTransaction = {
  id: number;
  provider: string;
  providerReference: string;
  flutterwaveTransactionId: number | null;
  amount: string;
  currency: string;
  status: BillingPaymentTransactionStatus;
  paidAt: string | null;
  payerType: string | null;
  payerId: number | null;
  createdAt: string;
  updatedAt: string;
  payments?: BillingPayment[] | null;
  feeCharge?: ShallowFeeChargeEmbed | null;
  invoice?: ShallowInvoiceEmbed | null;
};

export type BillingPaymentTransactionListParams = {
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  "exact[status]"?: BillingPaymentTransactionStatus;
  "exact[provider]"?: string;
  "exact[providerReference]"?: string;
  "exact[feeChargeId]"?: number;
  "exact[payerType]"?: string;
  "exact[payerId]"?: number;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};
