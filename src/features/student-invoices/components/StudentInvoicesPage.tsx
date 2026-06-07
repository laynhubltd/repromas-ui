import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { appPaths } from "@/app/routing/app-path";
import { STUDENT_INVOICE_UI_COPY } from "@/shared/constants/studentInvoiceOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { ArrowRightOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Pagination,
  Row,
  Switch,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { PaymentReturnAlert } from "@/features/student-payments/components/PaymentReturnAlert";
import { useStudentInvoicesPage } from "../hooks/useStudentInvoicesPage";
import type { StudentInvoice } from "../types/student-invoice";
import {
  formatInvoiceAmount,
  formatInvoiceStatus,
  formatIssuedDate,
  invoiceListPrimaryTitle,
} from "../utils/invoiceDisplay";

export function StudentInvoicesPage() {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useStudentInvoicesPage();

  const columns: ColumnsType<StudentInvoice> = [
    {
      title: "Fee",
      key: "eventName",
      render: (_: unknown, record) => (
        <Typography.Text strong>{invoiceListPrimaryTitle(record)}</Typography.Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: StudentInvoice["status"]) => {
        const display = formatInvoiceStatus(status);
        return <Tag color={display.color}>{display.label}</Tag>;
      },
    },
    {
      title: "Outstanding",
      dataIndex: "amountOutstandingTotal",
      key: "amountOutstandingTotal",
      render: (amount: string, record) =>
        formatInvoiceAmount(amount, record.currency),
    },
    {
      title: "Issued",
      dataIndex: "issuedAt",
      key: "issuedAt",
      render: (issuedAt: string) => formatIssuedDate(issuedAt),
    },
    {
      title: "",
      key: "actions",
      width: 160,
      align: "right",
      render: (_: unknown, record) => (
        <Flex gap={8} justify="flex-end">
          <Button size="small" onClick={() => actions.handleOpenInvoice(record.id)}>
            {STUDENT_INVOICE_UI_COPY.viewDetails}
          </Button>
          {record.canPay ? (
            <Button
              type="primary"
              size="small"
              onClick={() => actions.handleOpenInvoice(record.id)}
            >
              {STUDENT_INVOICE_UI_COPY.payNow}
            </Button>
          ) : null}
        </Flex>
      ),
    },
  ];

  const cardState = state.isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%", maxWidth: 1100, margin: "0 auto" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title={STUDENT_INVOICE_UI_COPY.explainerTitle}
        body={STUDENT_INVOICE_UI_COPY.explainerBody}
      />

      <PaymentReturnAlert polling={state.paymentReturnPolling} />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Open invoices"
            value={state.totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex align="center" gap={12} wrap="wrap">
        <Flex align="center" gap={8}>
          <Switch
            checked={!state.activeOnly}
            onChange={(checked) => actions.handleActiveOnlyChange(!checked)}
          />
          <Typography.Text>{STUDENT_INVOICE_UI_COPY.showPastInvoices}</Typography.Text>
        </Flex>
      </Flex>

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={state.sectionError ?? STUDENT_INVOICE_UI_COPY.loadListError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && flags.hasData && !isMobile}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={state.invoices}
            pagination={false}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && flags.hasData && isMobile}>
          <Flex vertical gap={12}>
            {state.invoices.map((invoice) => {
              const statusDisplay = formatInvoiceStatus(invoice.status);
              return (
                <Card key={invoice.id} size="small">
                  <Flex vertical gap={12}>
                    <Flex justify="space-between" align="flex-start" gap={8}>
                      <Typography.Text strong>
                        {invoiceListPrimaryTitle(invoice)}
                      </Typography.Text>
                      <Tag color={statusDisplay.color}>{statusDisplay.label}</Tag>
                    </Flex>
                    <Typography.Text type="secondary">
                      Outstanding:{" "}
                      {formatInvoiceAmount(
                        invoice.amountOutstandingTotal,
                        invoice.currency,
                      )}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      {formatIssuedDate(invoice.issuedAt)}
                    </Typography.Text>
                    <Flex gap={8}>
                      <Button
                        block={isMobile}
                        onClick={() => actions.handleOpenInvoice(invoice.id)}
                      >
                        {STUDENT_INVOICE_UI_COPY.viewDetails}
                      </Button>
                      {invoice.canPay ? (
                        <Button
                          type="primary"
                          block={isMobile}
                          onClick={() => actions.handleOpenInvoice(invoice.id)}
                        >
                          {STUDENT_INVOICE_UI_COPY.payNow}
                        </Button>
                      ) : null}
                    </Flex>
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
              {STUDENT_INVOICE_UI_COPY.emptyTitle}
            </Typography.Title>
            <Typography.Text type="secondary">
              {STUDENT_INVOICE_UI_COPY.emptyDescription}
            </Typography.Text>
            <Link to={appPaths.studentHome}>
              <Button type="link" icon={<ArrowRightOutlined />}>
                Back to home
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
