import { ExplainerCallout, Table } from "@/components/ui-kit";
import {
  ADMIN_INVOICE_ITEMS_PER_PAGE,
  ADMIN_INVOICE_UI_COPY,
} from "@/shared/constants/billingInvoiceOptions";
import {
  formatFeeChargeLabel,
  formatInvoiceStatusLabel,
} from "@/features/billing/utils/billingEmbedDisplay";
import { formatPaymentAmount } from "@/features/student-payments/utils/paymentDisplay";
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
import { useInvoicesTab, type UseInvoicesTabOptions } from "../hooks/useInvoicesTab";
import type { BillingInvoice } from "../types/billing-invoice";
import { InvoiceDetailDrawer } from "./InvoiceDetailDrawer";

export function InvoicesTab(options: UseInvoicesTabOptions = {}) {
  const token = useToken();
  const { state, actions, flags } = useInvoicesTab(options);

  const columns: ColumnsType<BillingInvoice> = [
    {
      title: ADMIN_INVOICE_UI_COPY.invoiceNumber,
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag>{formatInvoiceStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Outstanding",
      dataIndex: "amountOutstandingTotal",
      key: "amountOutstandingTotal",
      render: (amount: string, record) =>
        formatPaymentAmount(amount, record.currency),
    },
    {
      title: "Fee",
      key: "fee",
      render: (_: unknown, record) => formatFeeChargeLabel(record.feeCharge),
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
        title={ADMIN_INVOICE_UI_COPY.explainerTitle}
        body={ADMIN_INVOICE_UI_COPY.explainerBody}
      />

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={state.sectionError ?? ADMIN_INVOICE_UI_COPY.loadListError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && flags.hasData}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={state.invoices}
            pagination={false}
          />
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Pagination
              current={state.page}
              pageSize={ADMIN_INVOICE_ITEMS_PER_PAGE}
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
            {ADMIN_INVOICE_UI_COPY.emptyTitle}
          </Typography.Text>
        </ConditionalRenderer>
      </DataLoader>

      <InvoiceDetailDrawer
        invoiceId={state.detailId}
        open={state.detailOpen}
        onClose={actions.handleCloseDetail}
      />
    </>
  );
}
