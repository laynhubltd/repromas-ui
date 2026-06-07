import { PaymentsTab } from "@/features/billing/tabs/payments";

type FeeChargePaymentsPanelProps = {
  feeChargeId: number;
};

export function FeeChargePaymentsPanel({ feeChargeId }: FeeChargePaymentsPanelProps) {
  return <PaymentsTab initialFeeChargeId={feeChargeId} />;
}
