import { STUDENT_PAYMENT_UI_COPY } from "@/shared/constants/billingPaymentOptions";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { ArrowLeftOutlined, CopyOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Flex,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BillingPaymentAllocation } from "@/features/student-invoices/types/student-invoice";
import { useStudentPaymentReceiptPage } from "../hooks/useStudentPaymentReceiptPage";
import { resolveAllocationLineName } from "@/features/billing/utils/billingEmbedDisplay";
import { formatFeeChargeLabel } from "@/features/billing/utils/billingEmbedDisplay";
import {
  formatPaymentAmount,
  formatPaymentDate,
  formatTransactionStatus,
} from "../utils/paymentDisplay";

export function StudentPaymentReceiptPage() {
  const { state, actions, flags } = useStudentPaymentReceiptPage();
  const payment = state.payment;

  const allocationColumns: ColumnsType<BillingPaymentAllocation> = [
    {
      title: "Item",
      key: "line",
      render: (_: unknown, record) =>
        resolveAllocationLineName(
          state.allocationLineNames,
          record.invoiceLineId,
        ),
    },
    {
      title: STUDENT_PAYMENT_UI_COPY.lineAmount,
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount: string) => formatPaymentAmount(amount, state.currency),
    },
  ];

  const handleCopyReference = async () => {
    const ref = payment?.transaction?.providerReference;
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
      message.success(STUDENT_PAYMENT_UI_COPY.referenceCopied);
    } catch {
      message.error("Could not copy reference");
    }
  };

  return (
    <Flex vertical gap={24} style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={actions.handleBackToList}
        style={{ alignSelf: "flex-start", paddingLeft: 0 }}
      >
        {STUDENT_PAYMENT_UI_COPY.backToList}
      </Button>

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={3} variant="card" />}
      >
        {state.sectionError ? (
          <ErrorAlert
            variant="section"
            error={state.sectionError}
            onRetry={actions.refetch}
          />
        ) : payment ? (
          <>
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              {formatPaymentAmount(payment.amount, state.currency)}
            </Typography.Title>
            {state.paymentTitle ? (
              <Typography.Text type="secondary">{state.paymentTitle}</Typography.Text>
            ) : null}

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={STUDENT_PAYMENT_UI_COPY.paidAt}>
                {formatPaymentDate(
                  payment.transaction?.paidAt ?? payment.createdAt,
                )}
              </Descriptions.Item>
              {payment.transaction?.providerReference ? (
                <Descriptions.Item
                  label={STUDENT_PAYMENT_UI_COPY.providerReference}
                >
                  <Flex align="center" gap={8}>
                    <Typography.Text code>
                      {payment.transaction.providerReference}
                    </Typography.Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={handleCopyReference}
                      aria-label={STUDENT_PAYMENT_UI_COPY.copyReference}
                    />
                  </Flex>
                </Descriptions.Item>
              ) : null}
              {payment.transaction?.status ? (
                <Descriptions.Item label="Status">
                  {formatTransactionStatus(payment.transaction.status).label}
                </Descriptions.Item>
              ) : null}
              {payment.invoice?.invoiceNumber ||
              state.invoiceDetail?.eventName ? (
                <Descriptions.Item label="Bill">
                  {payment.invoice?.invoiceNumber ??
                    state.invoiceDetail?.eventName}
                </Descriptions.Item>
              ) : null}
              {payment.feeCharge ? (
                <Descriptions.Item label="Fee">
                  {formatFeeChargeLabel(payment.feeCharge)}
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            {flags.hasInvoice ? (
              <Button onClick={actions.handleViewBill}>
                {STUDENT_PAYMENT_UI_COPY.viewBill}
              </Button>
            ) : null}

            {payment.allocations && payment.allocations.length > 0 ? (
              <>
                <Typography.Title level={5}>
                  {STUDENT_PAYMENT_UI_COPY.allocations}
                </Typography.Title>
                <Table
                  rowKey="id"
                  columns={allocationColumns}
                  dataSource={payment.allocations}
                  pagination={false}
                  size="small"
                />
              </>
            ) : null}
          </>
        ) : null}
      </DataLoader>
    </Flex>
  );
}
