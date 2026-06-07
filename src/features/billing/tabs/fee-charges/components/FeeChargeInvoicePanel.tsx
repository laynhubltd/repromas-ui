import { ADMIN_INVOICE_UI_COPY } from "@/shared/constants/billingInvoiceOptions";
import { InvoicesTab } from "@/features/billing/tabs/invoices";
import { useGetBillingInvoicesQuery } from "@/features/billing/tabs/invoices/api/billingInvoiceApi";
import { DataLoader } from "@/shared/ui/DataLoader";
import { Typography } from "antd";

type FeeChargeInvoicePanelProps = {
  feeChargeId: number;
};

export function FeeChargeInvoicePanel({ feeChargeId }: FeeChargeInvoicePanelProps) {
  const { data, isLoading } = useGetBillingInvoicesQuery({
    "exact[feeChargeId]": feeChargeId,
    "exact[isActive]": true,
    itemsPerPage: 1,
  });

  const hasInvoice = (data?.totalItems ?? 0) > 0;

  return (
    <DataLoader loading={isLoading} loader={null}>
      {hasInvoice ? (
        <InvoicesTab initialFeeChargeId={feeChargeId} />
      ) : (
        <Typography.Text type="secondary">
          {ADMIN_INVOICE_UI_COPY.noInvoiceYet}
        </Typography.Text>
      )}
    </DataLoader>
  );
}
