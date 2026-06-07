import { ADMIN_INVOICE_UI_COPY } from "@/shared/constants/billingInvoiceOptions";
import {
  formatFeeChargeLabel,
  formatInvoiceStatusLabel,
} from "@/features/billing/utils/billingEmbedDisplay";
import { formatPaymentAmount } from "@/features/student-payments/utils/paymentDisplay";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Descriptions, Drawer, Table, Tag } from "antd";
import { useGetBillingInvoiceQuery } from "../api/billingInvoiceApi";

type InvoiceDetailDrawerProps = {
  invoiceId: number | null;
  open: boolean;
  onClose: () => void;
};

export function InvoiceDetailDrawer({
  invoiceId,
  open,
  onClose,
}: InvoiceDetailDrawerProps) {
  const { data: invoice, isLoading, isError, refetch } =
    useGetBillingInvoiceQuery(invoiceId ?? 0, { skip: !open || invoiceId == null });

  const statusLabel = formatInvoiceStatusLabel(invoice?.status);

  return (
    <Drawer
      title={ADMIN_INVOICE_UI_COPY.invoiceDetailTitle}
      open={open}
      onClose={onClose}
      width={640}
    >
      <DataLoader loading={isLoading} loader={null}>
        {isError ? (
          <ErrorAlert
            variant="section"
            error={ADMIN_INVOICE_UI_COPY.loadDetailError}
            onRetry={refetch}
          />
        ) : invoice ? (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={ADMIN_INVOICE_UI_COPY.invoiceNumber}>
                {invoice.invoiceNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag>{statusLabel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Outstanding">
                {formatPaymentAmount(
                  invoice.amountOutstandingTotal,
                  invoice.currency,
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Fee">
                {formatFeeChargeLabel(invoice.feeCharge)}
              </Descriptions.Item>
            </Descriptions>

            {invoice.lines && invoice.lines.length > 0 ? (
              <Table
                style={{ marginTop: 16 }}
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={[...invoice.lines].sort(
                  (a, b) => a.sortOrder - b.sortOrder,
                )}
                columns={[
                  { title: "Item", dataIndex: "lineName", key: "lineName" },
                  {
                    title: "Amount",
                    dataIndex: "lineAmount",
                    key: "lineAmount",
                    align: "right" as const,
                    render: (amount: string) =>
                      formatPaymentAmount(amount, invoice.currency),
                  },
                  {
                    title: "Required",
                    dataIndex: "isRequired",
                    key: "isRequired",
                    render: (v: boolean) =>
                      v
                        ? ADMIN_INVOICE_UI_COPY.requiredLine
                        : ADMIN_INVOICE_UI_COPY.optionalLine,
                  },
                ]}
              />
            ) : null}
          </>
        ) : null}
      </DataLoader>
    </Drawer>
  );
}
