import { ADMIN_PAYMENT_UI_COPY } from "@/shared/constants/billingPaymentOptions";
import {
  buildInvoiceLineNameMap,
  formatFeeChargeLabel,
  formatInvoiceLabel,
  formatInvoiceStatusLabel,
  resolveAllocationLineName,
} from "@/features/billing/utils/billingEmbedDisplay";
import { useGetBillingInvoiceQuery } from "@/features/billing/tabs/invoices/api/billingInvoiceApi";
import { formatPaymentAmount } from "@/features/student-payments/utils/paymentDisplay";
import { formatTransactionStatus } from "@/features/student-payments/utils/paymentDisplay";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Descriptions, Drawer, Table, Tag, Typography } from "antd";
import { useMemo } from "react";
import { useGetBillingPaymentQuery } from "../api/billingPaymentApi";

type PaymentDetailDrawerProps = {
  paymentId: number | null;
  open: boolean;
  onClose: () => void;
};

export function PaymentDetailDrawer({
  paymentId,
  open,
  onClose,
}: PaymentDetailDrawerProps) {
  const { data: payment, isLoading, isError, refetch } =
    useGetBillingPaymentQuery(paymentId ?? 0, { skip: !open || paymentId == null });

  const invoiceId = payment?.invoiceId ?? null;
  const { data: invoiceWithLines } = useGetBillingInvoiceQuery(invoiceId ?? 0, {
    skip: !open || invoiceId == null,
  });

  const lineNameMap = useMemo(
    () => buildInvoiceLineNameMap(invoiceWithLines?.lines),
    [invoiceWithLines?.lines],
  );

  const currency =
    (payment?.transaction?.currency as string | undefined) ??
    invoiceWithLines?.currency ??
    "NGN";
  const txStatus = payment?.transaction?.status;

  return (
    <Drawer
      title={ADMIN_PAYMENT_UI_COPY.paymentDetailTitle}
      open={open}
      onClose={onClose}
      width={560}
    >
      <DataLoader loading={isLoading} loader={null}>
        {isError ? (
          <ErrorAlert
            variant="section"
            error={ADMIN_PAYMENT_UI_COPY.loadPaymentsError}
            onRetry={refetch}
          />
        ) : payment ? (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Amount">
                {formatPaymentAmount(payment.amount, currency)}
              </Descriptions.Item>
              <Descriptions.Item label={ADMIN_PAYMENT_UI_COPY.fee}>
                {formatFeeChargeLabel(payment.feeCharge)}
              </Descriptions.Item>
              {payment.invoice || invoiceWithLines ? (
                <Descriptions.Item label={ADMIN_PAYMENT_UI_COPY.bill}>
                  {formatInvoiceLabel(payment.invoice ?? invoiceWithLines)}
                  {invoiceWithLines?.status ? (
                    <Tag style={{ marginLeft: 8 }}>
                      {formatInvoiceStatusLabel(invoiceWithLines.status)}
                    </Tag>
                  ) : null}
                </Descriptions.Item>
              ) : null}
              {payment.transaction?.providerReference ? (
                <Descriptions.Item
                  label={ADMIN_PAYMENT_UI_COPY.providerReference}
                >
                  <Typography.Text code>
                    {payment.transaction.providerReference}
                  </Typography.Text>
                </Descriptions.Item>
              ) : null}
              {txStatus ? (
                <Descriptions.Item label="Transaction status">
                  <Tag color={formatTransactionStatus(txStatus).color}>
                    {formatTransactionStatus(txStatus).label}
                  </Tag>
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            {payment.allocations && payment.allocations.length > 0 ? (
              <Table
                style={{ marginTop: 16 }}
                size="small"
                rowKey="id"
                pagination={false}
                dataSource={payment.allocations}
                columns={[
                  {
                    title: "Line item",
                    key: "lineName",
                    render: (_: unknown, record) =>
                      resolveAllocationLineName(lineNameMap, record.invoiceLineId),
                  },
                  {
                    title: "Amount",
                    dataIndex: "amount",
                    key: "amount",
                    align: "right" as const,
                    render: (amount: string) =>
                      formatPaymentAmount(amount, currency),
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
