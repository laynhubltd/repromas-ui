import { ExplainerCallout } from "@/components/ui-kit";
import { appPaths } from "@/app/routing/app-path";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { STUDENT_PAYMENT_UI_COPY } from "@/shared/constants/billingPaymentOptions";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { useToken } from "@/shared/hooks/useToken";
import { ArrowRightOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Pagination,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { useStudentPaymentsPage } from "../hooks/useStudentPaymentsPage";
import type { StudentPayment } from "../types/student-payment";
import {
  formatInvoiceLabel,
} from "@/features/billing/utils/billingEmbedDisplay";
import {
  formatPaymentAmount,
  formatPaymentDate,
  formatTransactionStatus,
  paymentListSubtitle,
} from "../utils/paymentDisplay";

export function StudentPaymentsPage() {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useStudentPaymentsPage();

  const columns: ColumnsType<StudentPayment> = [
    {
      title: "Date",
      key: "date",
      render: (_: unknown, record) =>
        formatPaymentDate(
          record.transaction?.paidAt ?? record.createdAt,
        ),
    },
    {
      title: "Bill",
      key: "bill",
      render: (_: unknown, record) => (
        <Typography.Text>{formatInvoiceLabel(record.invoice)}</Typography.Text>
      ),
    },
    {
      title: "Fee",
      key: "fee",
      render: (_: unknown, record) => (
        <Typography.Text>{paymentListSubtitle(record)}</Typography.Text>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_: unknown, record) =>
        formatPaymentAmount(
          record.amount,
          record.transaction?.currency ?? "NGN",
        ),
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
      width: 120,
      align: "right",
      render: (_: unknown, record) => (
        <Button size="small" onClick={() => actions.handleOpenPayment(record.id)}>
          {STUDENT_PAYMENT_UI_COPY.viewReceipt}
        </Button>
      ),
    },
  ];

  return (
    <Flex vertical gap={24} style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title={STUDENT_PAYMENT_UI_COPY.explainerTitle}
        body={STUDENT_PAYMENT_UI_COPY.explainerBody}
      />

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={state.sectionError ?? STUDENT_PAYMENT_UI_COPY.loadListError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && flags.hasData && !isMobile}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={state.payments}
            pagination={false}
            onRow={(record) => ({
              onClick: () => actions.handleOpenPayment(record.id),
              style: { cursor: "pointer" },
            })}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && flags.hasData && isMobile}>
          <Flex vertical gap={12}>
            {state.payments.map((payment) => {
              const status = payment.transaction?.status ?? "CONFIRMED";
              const display = formatTransactionStatus(status);
              return (
                <Card
                  key={payment.id}
                  size="small"
                  onClick={() => actions.handleOpenPayment(payment.id)}
                  style={{ cursor: "pointer" }}
                >
                  <Flex vertical gap={8}>
                    <Flex justify="space-between" align="flex-start" gap={8}>
                      <Flex vertical gap={2}>
                        <Typography.Text strong>
                          {formatInvoiceLabel(payment.invoice)}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {paymentListSubtitle(payment)}
                        </Typography.Text>
                      </Flex>
                      <Tag color={display.color}>{display.label}</Tag>
                    </Flex>
                    <Typography.Text>
                      {formatPaymentAmount(
                        payment.amount,
                        payment.transaction?.currency ?? "NGN",
                      )}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      {formatPaymentDate(
                        payment.transaction?.paidAt ?? payment.createdAt,
                      )}
                    </Typography.Text>
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!state.sectionError && !flags.hasData && !state.isLoading}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            {STUDENT_PAYMENT_UI_COPY.emptyTitle}
          </Typography.Title>
          <Typography.Text type="secondary">
            {STUDENT_PAYMENT_UI_COPY.emptyDescription}
          </Typography.Text>
          <Link to={appPaths.StudentInvoices}>
            <Button type="link" icon={<ArrowRightOutlined />}>
              Go to My bills
            </Button>
          </Link>
        </ConditionalRenderer>

        <ConditionalRenderer when={flags.hasData && !state.isLoading}>
          <Flex justify="flex-end">
            <Pagination
              current={state.page}
              pageSize={state.itemsPerPage}
              total={state.totalItems}
              onChange={actions.handlePageChange}
              showSizeChanger={false}
            />
          </Flex>
        </ConditionalRenderer>
      </DataLoader>
    </Flex>
  );
}
