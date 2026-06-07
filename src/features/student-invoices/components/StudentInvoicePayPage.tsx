import { STUDENT_INVOICE_UI_COPY } from "@/shared/constants/studentInvoiceOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Flex,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useStudentInvoicePayPage } from "../hooks/useStudentInvoicePayPage";
import type { StudentInvoice, StudentInvoiceLine } from "../types/student-invoice";
import {
  formatInvoiceAmount,
  formatInvoiceStatus,
  formatIssuedDate,
  hasGuardAmountMismatch,
  invoiceListPrimaryTitle,
} from "../utils/invoiceDisplay";

type StudentInvoicePayDetailsProps = {
  invoice: StudentInvoice;
  lines: StudentInvoiceLine[];
  isPaying: boolean;
  isMobile: boolean;
  flags: ReturnType<typeof useStudentInvoicePayPage>["flags"];
  actions: ReturnType<typeof useStudentInvoicePayPage>["actions"];
};

function StudentInvoicePayDetails({
  invoice,
  lines,
  isPaying,
  isMobile,
  flags,
  actions,
}: StudentInvoicePayDetailsProps) {
  const token = useToken();
  const statusDisplay = formatInvoiceStatus(invoice.status);

  const lineColumns: ColumnsType<StudentInvoiceLine> = [
    {
      title: "Item",
      dataIndex: "lineName",
      key: "lineName",
      render: (name: string, record) => (
        <Flex vertical gap={4}>
          <Typography.Text>{name}</Typography.Text>
          <Tag color={record.isRequired ? "blue" : "default"}>
            {record.isRequired
              ? STUDENT_INVOICE_UI_COPY.requiredLine
              : STUDENT_INVOICE_UI_COPY.optionalLine}
          </Tag>
        </Flex>
      ),
    },
    {
      title: "Amount",
      dataIndex: "lineAmount",
      key: "lineAmount",
      align: "right",
      render: (amount: string) => formatInvoiceAmount(amount, invoice.currency),
    },
    {
      title: "Status",
      key: "lineStatus",
      render: (_: unknown, record) =>
        record.lineStatus ? (
          <Tag>{record.lineStatus}</Tag>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Include",
      key: "include",
      width: 88,
      align: "center",
      render: (_: unknown, record) =>
        record.isRequired ? (
          <Checkbox checked disabled />
        ) : (
          <Checkbox
            checked={flags.isLineSelected(record.id, record.isRequired)}
            onChange={() => actions.handleToggleOptionalLine(record.id)}
          />
        ),
    },
  ];

  return (
    <Flex vertical gap={16}>
      <Card>
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="flex-start" wrap="wrap" gap={12}>
            <Flex vertical gap={4}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {invoiceListPrimaryTitle(invoice)}
              </Typography.Title>
              <Typography.Text type="secondary">
                {STUDENT_INVOICE_UI_COPY.invoiceNumber}: {invoice.invoiceNumber}
              </Typography.Text>
            </Flex>
            <Tag color={statusDisplay.color}>{statusDisplay.label}</Tag>
          </Flex>

          <Typography.Title level={2} style={{ margin: 0 }}>
            {formatInvoiceAmount(invoice.amountOutstandingTotal, invoice.currency)}
          </Typography.Title>
          <Typography.Text type="secondary">
            {STUDENT_INVOICE_UI_COPY.amountOutstanding}
          </Typography.Text>

          <Flex gap={24} wrap="wrap">
            <Typography.Text type="secondary">
              {STUDENT_INVOICE_UI_COPY.issuedAt}: {formatIssuedDate(invoice.issuedAt)}
            </Typography.Text>
            {invoice.dueAt ? (
              <Typography.Text type="secondary">
                {STUDENT_INVOICE_UI_COPY.dueAt}: {formatIssuedDate(invoice.dueAt)}
              </Typography.Text>
            ) : null}
          </Flex>

          <Flex gap={24} wrap="wrap">
            <Typography.Text>
              {STUDENT_INVOICE_UI_COPY.amountDue}:{" "}
              {formatInvoiceAmount(invoice.amountDueTotal, invoice.currency)}
            </Typography.Text>
            <Typography.Text>
              {STUDENT_INVOICE_UI_COPY.amountPaid}:{" "}
              {formatInvoiceAmount(invoice.amountPaidTotal, invoice.currency)}
            </Typography.Text>
          </Flex>
        </Flex>
      </Card>

      <ConditionalRenderer when={hasGuardAmountMismatch(invoice)}>
        <Alert
          type="info"
          showIcon
          message={STUDENT_INVOICE_UI_COPY.guardAmountHint}
          description={formatInvoiceAmount(
            invoice.amountOutstandingRequired,
            invoice.currency,
          )}
        />
      </ConditionalRenderer>

      <ConditionalRenderer when={flags.isCancelled}>
        <Alert
          type="warning"
          showIcon
          message={STUDENT_INVOICE_UI_COPY.cancelledNotice}
        />
      </ConditionalRenderer>

      <Card title="Line items" size="small">
        <ConditionalRenderer when={flags.hasOptionalLines}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {STUDENT_INVOICE_UI_COPY.optionalLineHelp}
          </Typography.Paragraph>
        </ConditionalRenderer>

        <Table
          rowKey="id"
          columns={lineColumns}
          dataSource={lines}
          pagination={false}
          size="small"
        />

        <ConditionalRenderer when={flags.hasOptionalLines && flags.selectionDirty}>
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Button onClick={actions.handleUpdateSelection}>
              {STUDENT_INVOICE_UI_COPY.updateSelection}
            </Button>
          </Flex>
        </ConditionalRenderer>
      </Card>

      <Flex
        justify="flex-end"
        gap={12}
        wrap="wrap"
        style={
          isMobile
            ? {
                position: "sticky",
                bottom: 0,
                padding: token.paddingMD,
                background: token.colorBgContainer,
                borderTop: `1px solid ${token.colorBorder}`,
                marginLeft: -token.paddingMD,
                marginRight: -token.paddingMD,
              }
            : undefined
        }
      >
        <Button onClick={actions.handleBackToList}>
          {STUDENT_INVOICE_UI_COPY.backToList}
        </Button>
        <Button
          type="primary"
          size="large"
          block={isMobile}
          disabled={!flags.canPay || flags.isCancelled}
          loading={isPaying}
          onClick={actions.handlePayNow}
          data-testid="student-invoice-pay-now-button"
        >
          {STUDENT_INVOICE_UI_COPY.payNow}
          {invoice.amountOutstandingTotal
            ? ` (${formatInvoiceAmount(invoice.amountOutstandingTotal, invoice.currency)})`
            : ""}
        </Button>
      </Flex>
    </Flex>
  );
}

export function StudentInvoicePayPage() {
  const isMobile = useIsMobile();
  const { state, actions, flags } = useStudentInvoicePayPage();
  const invoice = state.invoice;

  return (
    <Flex vertical gap={24} style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={actions.handleBackToList}
        style={{ padding: 0, alignSelf: "flex-start" }}
      >
        {STUDENT_INVOICE_UI_COPY.backToList}
      </Button>

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={3} variant="card" />}
      >
        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={state.sectionError ?? STUDENT_INVOICE_UI_COPY.loadDetailError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!state.sectionError && !!invoice}>
          <StudentInvoicePayDetails
            invoice={invoice!}
            lines={state.lines}
            isPaying={state.isPaying}
            isMobile={isMobile}
            flags={flags}
            actions={actions}
          />
        </ConditionalRenderer>
      </DataLoader>
    </Flex>
  );
}
