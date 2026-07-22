import { ADMIN_PAYMENT_UI_COPY } from "@/shared/constants/billingPaymentOptions";
import {
  formatFeeChargeLabel,
  formatInvoiceLabel,
  formatPayerTypeLabel,
  formatPostedPaymentsSummary,
} from "@/features/billing/utils/billingEmbedDisplay";
import {
  formatPaymentAmount,
  formatPaymentDate,
  formatTransactionStatus,
  isAbandonedCheckout,
} from "@/features/student-payments/utils/paymentDisplay";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Descriptions, Drawer, Tag, Typography } from "antd";
import { MetadataRenderer } from "@/shared/ui/MetadataRenderer";
import { useGetBillingPaymentTransactionQuery } from "../api/billingPaymentTransactionApi";

type TransactionDetailDrawerProps = {
  transactionId: number | null;
  open: boolean;
  onClose: () => void;
};

export function TransactionDetailDrawer({
  transactionId,
  open,
  onClose,
}: TransactionDetailDrawerProps) {
  const { data: tx, isLoading, isError, refetch } =
    useGetBillingPaymentTransactionQuery(transactionId ?? 0, {
      skip: !open || transactionId == null,
    });

  const statusDisplay = tx ? formatTransactionStatus(tx.status) : null;
  const abandoned = tx ? isAbandonedCheckout(tx) : false;
  const postedSummary = tx
    ? formatPostedPaymentsSummary(tx.payments, tx.currency)
    : "";

  return (
    <Drawer
      title={ADMIN_PAYMENT_UI_COPY.transactionDetailTitle}
      open={open}
      onClose={onClose}
      width={560}
    >
      <DataLoader loading={isLoading} loader={null}>
        {isError ? (
          <ErrorAlert
            variant="section"
            error={ADMIN_PAYMENT_UI_COPY.loadTransactionsError}
            onRetry={refetch}
          />
        ) : tx ? (
          <>
            {abandoned ? (
              <Tag color="warning" style={{ marginBottom: 12 }}>
                Abandoned checkout
              </Tag>
            ) : null}
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Status">
                {statusDisplay ? (
                  <Tag color={statusDisplay.color}>{statusDisplay.label}</Tag>
                ) : null}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                {formatPaymentAmount(tx.amount, tx.currency)}
              </Descriptions.Item>
              <Descriptions.Item
                label={ADMIN_PAYMENT_UI_COPY.providerReference}
              >
                <Typography.Text code>{tx.providerReference}</Typography.Text>
              </Descriptions.Item>
              {tx.payerType ? (
                <Descriptions.Item label={ADMIN_PAYMENT_UI_COPY.payer}>
                  {formatPayerTypeLabel(tx.payerType)}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label={ADMIN_PAYMENT_UI_COPY.fee}>
                {formatFeeChargeLabel(tx.feeCharge)}
              </Descriptions.Item>
              {tx.invoice ? (
                <Descriptions.Item label={ADMIN_PAYMENT_UI_COPY.bill}>
                  {formatInvoiceLabel(tx.invoice)}
                </Descriptions.Item>
              ) : null}
              {tx.flutterwaveTransactionId != null ? (
                <Descriptions.Item
                  label={ADMIN_PAYMENT_UI_COPY.flutterwaveId}
                >
                  {tx.flutterwaveTransactionId}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="Created">
                {formatPaymentDate(tx.createdAt)}
              </Descriptions.Item>
              {tx.paidAt ? (
                <Descriptions.Item label="Paid at">
                  {formatPaymentDate(tx.paidAt)}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="Settlement">
                {postedSummary || ADMIN_PAYMENT_UI_COPY.noLinkedPayment}
              </Descriptions.Item>
            </Descriptions>
            {tx.metadataJson != null ? (
              <div style={{ marginTop: 20 }}>
                <Typography.Text
                  type="secondary"
                  strong
                  style={{ display: "block", marginBottom: 10, fontSize: 13 }}
                >
                  Gateway Data
                </Typography.Text>
                <MetadataRenderer
                  value={tx.metadataJson}
                  variant="descriptions"
                  size="small"
                  bordered
                  showRawToggle
                  showCopyJson
                />
              </div>
            ) : null}
          </>
        ) : null}
      </DataLoader>
    </Drawer>
  );
}
