import type {
  ShallowFeeChargeEmbed,
  ShallowInvoiceEmbed,
} from "@/features/billing/utils/billingEmbedDisplay";
import type { PayerType } from "@/features/student-invoices/types/student-invoice";
import type { BillingPaymentAllocation } from "@/features/student-invoices/types/student-invoice";
import type {
  BillingPaymentTransactionStatus,
} from "@/shared/constants/billingPaymentOptions";

export type BillingPaymentProvider =
  | "FLUTTERWAVE"
  | "PAYSTACK"
  | "BANK_TRANSFER"
  | "MANUAL"
  | string;

export type StudentPaymentTransaction = {
  id: number;
  provider: BillingPaymentProvider;
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
  payments?: StudentPayment[] | null;
  feeCharge?: ShallowFeeChargeEmbed | null;
  invoice?: ShallowInvoiceEmbed | null;
};

export type StudentPayment = {
  id: number;
  paymentTransactionId: number;
  feeChargeId: number;
  invoiceId: number | null;
  amount: string;
  createdAt: string;
  updatedAt: string;
  transaction?: StudentPaymentTransaction | null;
  feeCharge?: ShallowFeeChargeEmbed | null;
  invoice?: ShallowInvoiceEmbed | null;
  allocations?: BillingPaymentAllocation[] | null;
};

export type PaginatedResponse<T> = {
  member: T[];
  totalItems: number;
};

export type MyPaymentsParams = {
  payerType: PayerType;
  page?: number;
  itemsPerPage?: number;
  sort?: string;
};

export type MyPaymentParams = {
  id: number;
  payerType: PayerType;
  include?: string;
};

export type MyPaymentTransactionsParams = {
  payerType: PayerType;
  providerReference?: string;
  status?: BillingPaymentTransactionStatus;
  page?: number;
  itemsPerPage?: number;
  sort?: string;
  include?: string;
};

export type PaymentReturnPollState =
  | "idle"
  | "processing"
  | "success"
  | "timeout"
  | "failed";
