import { ExplainerCallout, Table } from "@/components/ui-kit";
import {
  ADMIN_PAYMENT_TRANSACTION_ITEMS_PER_PAGE,
  ADMIN_PAYMENT_UI_COPY,
} from "@/shared/constants/billingPaymentOptions";
import {
  formatFeeChargeLabel,
  formatInvoiceLabel,
  formatPayerTypeLabel,
} from "@/features/billing/utils/billingEmbedDisplay";
import {
  formatPaymentAmount,
  formatPaymentDate,
  formatTransactionStatus,
  isAbandonedCheckout,
} from "@/features/student-payments/utils/paymentDisplay";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { useToken } from "@/shared/hooks/useToken";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Flex, Pagination, Segmented, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { usePaymentTransactionsTab } from "../hooks/usePaymentTransactionsTab";
import type { BillingPaymentTransaction } from "../types/billing-payment-transaction";
import { TransactionDetailDrawer } from "./TransactionDetailDrawer";

export function PaymentTransactionsTab() {
  const token = useToken();
  const { state, actions, flags } = usePaymentTransactionsTab();

  const columns: ColumnsType<BillingPaymentTransaction> = [
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v: string) => formatPaymentDate(v),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_: unknown, record) =>
        formatPaymentAmount(record.amount, record.currency),
    },
    {
      title: ADMIN_PAYMENT_UI_COPY.fee,
      key: "fee",
      render: (_: unknown, record) => formatFeeChargeLabel(record.feeCharge),
    },
    {
      title: ADMIN_PAYMENT_UI_COPY.bill,
      key: "bill",
      render: (_: unknown, record) => formatInvoiceLabel(record.invoice),
    },
    {
      title: ADMIN_PAYMENT_UI_COPY.payer,
      key: "payer",
      render: (_: unknown, record) => formatPayerTypeLabel(record.payerType),
    },
    {
      title: "Reference",
      dataIndex: "providerReference",
      key: "providerReference",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record) => {
        const display = formatTransactionStatus(status);
        return (
          <Flex gap={4} align="center">
            <Tag color={display.color}>{display.label}</Tag>
            {isAbandonedCheckout(record) ? (
              <Tag color="warning">Abandoned</Tag>
            ) : null}
          </Flex>
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => actions.handleOpenDetail(record.id)}
        />
      ),
    },
  ];

  return (
    <>
      <ExplainerCallout
        intent="info"
        collapsible
        title={ADMIN_PAYMENT_UI_COPY.transactionsExplainerTitle}
        body={ADMIN_PAYMENT_UI_COPY.transactionsExplainerBody}
      />

      <Segmented
        options={[
          { label: ADMIN_PAYMENT_UI_COPY.filterAll, value: "all" },
          { label: ADMIN_PAYMENT_UI_COPY.filterPending, value: "PENDING" },
          { label: ADMIN_PAYMENT_UI_COPY.filterConfirmed, value: "CONFIRMED" },
        ]}
        value={state.statusFilter ?? "all"}
        onChange={(value) =>
          actions.handleStatusFilter(
            value === "all" ? null : (value as "PENDING" | "CONFIRMED"),
          )
        }
        style={{ marginBottom: 16 }}
      />

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={
              state.sectionError ?? ADMIN_PAYMENT_UI_COPY.loadTransactionsError
            }
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && flags.hasData}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={state.transactions}
            pagination={false}
          />
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Pagination
              current={state.page}
              pageSize={ADMIN_PAYMENT_TRANSACTION_ITEMS_PER_PAGE}
              total={state.totalItems}
              onChange={actions.handlePageChange}
              showSizeChanger={false}
            />
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!state.sectionError && !flags.hasData && !state.isLoading}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
          })}
        >
          <Typography.Text type="secondary">
            {ADMIN_PAYMENT_UI_COPY.emptyTransactions}
          </Typography.Text>
        </ConditionalRenderer>
      </DataLoader>

      <TransactionDetailDrawer
        transactionId={state.detailId}
        open={state.detailOpen}
        onClose={actions.handleCloseDetail}
      />
    </>
  );
}
