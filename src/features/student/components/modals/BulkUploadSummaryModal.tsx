// Feature: student-bulk-upload
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DownloadOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { Button, Modal, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { UploadError, UploadSummary, UploadSummaryState } from "../../types/student";

type BulkUploadSummaryModalProps = {
  open: boolean;
  onClose: () => void;
  summary: UploadSummary | null;
  summaryState: UploadSummaryState | null;
  onDownloadErrorReport: () => void;
};

const errorColumns: ColumnsType<UploadError> = [
  {
    title: "Row",
    dataIndex: "row",
    key: "row",
    width: 80,
    render: (row?: number) => (row !== undefined ? row : "—"),
  },
  {
    title: "Matric Number",
    dataIndex: "matricNumber",
    key: "matricNumber",
    width: 160,
  },
  {
    title: "Reason",
    dataIndex: "message",
    key: "message",
  },
];

export function BulkUploadSummaryModal({
  open,
  onClose,
  summary,
  summaryState,
  onDownloadErrorReport,
}: BulkUploadSummaryModalProps) {
  const token = useToken();

  const showDownloadButton =
    summaryState !== null && summaryState !== "success" && summaryState !== "parse-error";

  return (
    <Modal
      title="Upload Summary"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnHidden
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        {/* Success state */}
        <ConditionalRenderer when={summaryState === "success"}>
          <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
            <CheckCircleOutlined style={{ fontSize: 20, color: token.colorSuccess }} />
            <Typography.Text style={{ color: token.colorSuccess }}>
              {summary?.processedCount} students created successfully.
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        {/* Partial state */}
        <ConditionalRenderer when={summaryState === "partial"}>
          <div style={{ display: "flex", flexDirection: "column", gap: token.sizeMD }}>
            <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
              <WarningOutlined style={{ fontSize: 20, color: token.colorWarning }} />
              <Typography.Text style={{ color: token.colorWarning }}>
                {summary?.processedCount} students created, {summary?.skippedCount} rows skipped.
              </Typography.Text>
            </div>
            <Table<UploadError>
              columns={errorColumns}
              dataSource={summary?.errors ?? []}
              rowKey={(_, index) => String(index)}
              size="small"
              pagination={false}
              scroll={{ y: 240 }}
            />
          </div>
        </ConditionalRenderer>

        {/* Failed state */}
        <ConditionalRenderer when={summaryState === "failed"}>
          <div style={{ display: "flex", flexDirection: "column", gap: token.sizeMD }}>
            <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
              <CloseCircleOutlined style={{ fontSize: 20, color: token.colorError }} />
              <Typography.Text style={{ color: token.colorError }}>
                0 students created, {summary?.skippedCount} rows skipped.
              </Typography.Text>
            </div>
            <Table<UploadError>
              columns={errorColumns}
              dataSource={summary?.errors ?? []}
              rowKey={(_, index) => String(index)}
              size="small"
              pagination={false}
              scroll={{ y: 240 }}
            />
          </div>
        </ConditionalRenderer>

        {/* Parse error state */}
        <ConditionalRenderer when={summaryState === "parse-error"}>
          <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
            <CloseCircleOutlined style={{ fontSize: 20, color: token.colorError }} />
            <Typography.Text style={{ color: token.colorError }}>
              The uploaded file could not be parsed as a valid Excel file. Please download a fresh
              template and try again.
            </Typography.Text>
          </div>
        </ConditionalRenderer>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <ConditionalRenderer when={showDownloadButton}>
          <Button
            icon={<DownloadOutlined />}
            onClick={onDownloadErrorReport}
            block
            style={{ height: 40 }}
          >
            Download Error Report
          </Button>
        </ConditionalRenderer>
        <Button
          type="text"
          block
          onClick={onClose}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
