import { ExplainerCallout, Table } from "@/components/ui-kit";
import {
  ADMIN_PAYMENT_UI_COPY,
  ADMIN_PAYMENT_ITEMS_PER_PAGE,
} from "@/shared/constants/billingPaymentOptions";
import {
  formatFeeChargeLabel,
  formatInvoiceLabel,
} from "@/features/billing/utils/billingEmbedDisplay";
import { formatPaymentAmount } from "@/features/student-payments/utils/paymentDisplay";
import { formatTransactionStatus } from "@/features/student-payments/utils/paymentDisplay";
import { formatPaymentDate } from "@/features/student-payments/utils/paymentDisplay";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { useToken } from "@/shared/hooks/useToken";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Flex, Pagination, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { usePaymentsTab, type UsePaymentsTabOptions } from "../hooks/usePaymentsTab";
import type { BillingPayment } from "../types/billing-payment";
import { PaymentDetailDrawer } from "./PaymentDetailDrawer";

export function PaymentsTab(options: UsePaymentsTabOptions = {}) {
  const token = useToken();
  const { state, actions, flags } = usePaymentsTab(options);

  const columns: ColumnsType<BillingPayment> = [
    {
      title: "Date",
      key: "date",
      render: (_: unknown, record) =>
        formatPaymentDate(record.transaction?.paidAt ?? record.createdAt),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: string, record) =>
        formatPaymentAmount(amount, record.transaction?.currency ?? "NGN"),
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
      title: "Reference",
      key: "ref",
      render: (_: unknown, record) =>
        record.transaction?.providerReference ?? "—",
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record) => {
        const status = record.transaction?.status ?? "CONFIRMED";
        const display = formatTransactionStatus(status);
        return <Tag color={display.color}>{display.label}</Tag>;
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
          aria-label="View payment"
        />
      ),
    },
  ];

  return (
    <>
      <ExplainerCallout
        intent="info"
        collapsible
        title={ADMIN_PAYMENT_UI_COPY.paymentsExplainerTitle}
        body={ADMIN_PAYMENT_UI_COPY.paymentsExplainerBody}
      />

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={state.sectionError ?? ADMIN_PAYMENT_UI_COPY.loadPaymentsError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && flags.hasData}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={state.payments}
            pagination={false}
          />
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Pagination
              current={state.page}
              pageSize={ADMIN_PAYMENT_ITEMS_PER_PAGE}
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
            {ADMIN_PAYMENT_UI_COPY.emptyPayments}
          </Typography.Text>
        </ConditionalRenderer>
      </DataLoader>

      <PaymentDetailDrawer
        paymentId={state.detailId}
        open={state.detailOpen}
        onClose={actions.handleCloseDetail}
      />
    </>
  );
}
