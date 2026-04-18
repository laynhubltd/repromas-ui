// Feature: course-bulk-upload
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
import type { CourseUploadError, CourseUploadSummary, CourseUploadSummaryState } from "../../types/course";

type BulkUploadSummaryModalProps = {
  open: boolean;
  summary: CourseUploadSummary | null;
  summaryState: CourseUploadSummaryState | null;
  onClose: () => void;
  onDownloadErrorReport: () => void;
};

const errorColumns: ColumnsType<CourseUploadError> = [
  {
    title: "Row",
    dataIndex: "row",
    key: "row",
    width: 80,
    render: (row?: number) => (row !== undefined ? row : "—"),
  },
  {
    title: "Code",
    dataIndex: "code",
    key: "code",
    width: 140,
  },
  {
    title: "Reason",
    dataIndex: "message",
    key: "message",
  },
];

export function BulkUploadSummaryModal({
  open,
  summary,
  summaryState,
  onClose,
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
              {summary?.processedCount} courses created successfully.
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        {/* Partial state */}
        <ConditionalRenderer when={summaryState === "partial"}>
          <div style={{ display: "flex", flexDirection: "column", gap: token.sizeMD }}>
            <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
              <WarningOutlined style={{ fontSize: 20, color: token.colorWarning }} />
              <Typography.Text style={{ color: token.colorWarning }}>
                {summary?.processedCount} courses created, {summary?.skippedCount} rows skipped.
              </Typography.Text>
            </div>
            <Table<CourseUploadError>
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
                0 courses created, {summary?.skippedCount} rows skipped.
              </Typography.Text>
            </div>
            <Table<CourseUploadError>
              columns={errorColumns}
              dataSource={summary?.errors ?? []}
              rowKey={(_, index) => String(index)}
              size="small"
              pagination={false}
              scroll={{ y: 240 }}
            />
          </div>
        </ConditionalRenderer>

        {/* Parse-error state */}
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
