import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Button, Modal, Table, Tabs, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  CapsBulkUploadSummary,
  CapsBulkUploadSummaryState,
  CapsUploadIssue,
} from "../../types/admission-candidate";

type AdmissionCandidateBulkUploadResultModalProps = {
  open: boolean;
  onClose: () => void;
  summary: CapsBulkUploadSummary | null;
  summaryState: CapsBulkUploadSummaryState | null;
  onDownloadReport: () => void;
};

const issueColumns: ColumnsType<CapsUploadIssue> = [
  {
    title: "Row",
    dataIndex: "row",
    key: "row",
    width: 70,
    render: (row?: number) => (row !== undefined ? row : "—"),
  },
  {
    title: "Key",
    dataIndex: "key",
    key: "key",
    width: 160,
    render: (v?: string) => v ?? "—",
  },
  {
    title: "Stage",
    dataIndex: "stage",
    key: "stage",
    width: 120,
    render: (v?: string) => v ?? "—",
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
  },
];

export function AdmissionCandidateBulkUploadResultModal({
  open,
  onClose,
  summary,
  summaryState,
  onDownloadReport,
}: AdmissionCandidateBulkUploadResultModalProps) {
  const token = useToken();

  const showDownload =
    summaryState !== null &&
    summaryState !== "success" &&
    summaryState !== "parse-error";

  const errors = summary?.errors ?? [];
  const warnings = summary?.warnings ?? [];

  return (
    <Modal
      title="CAPS Upload Summary"
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
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
        <ConditionalRenderer when={summaryState === "success"}>
          <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
            <CheckCircleOutlined
              style={{ fontSize: 20, color: token.colorSuccess }}
            />
            <Typography.Text style={{ color: token.colorSuccess }}>
              {summary?.processedCount} rows processed successfully.
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={summaryState === "partial"}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: token.sizeMD }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
              <WarningOutlined
                style={{ fontSize: 20, color: token.colorWarning }}
              />
              <Typography.Text style={{ color: token.colorWarning }}>
                {summary?.processedCount} processed, {summary?.skippedCount}{" "}
                skipped. Review errors and warnings below.
              </Typography.Text>
            </div>
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={summaryState === "failed"}>
          <div style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}>
            <CloseCircleOutlined style={{ fontSize: 20, color: token.colorError }} />
            <Typography.Text style={{ color: token.colorError }}>
              0 rows processed, {summary?.skippedCount} skipped.
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={summaryState === "parse-error"}>
          <Typography.Text type="danger">
            {errors[0]?.message ?? "Failed to parse upload file."}
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={
            summaryState !== null &&
            summaryState !== "parse-error" &&
            (errors.length > 0 || warnings.length > 0)
          }
        >
          <Tabs
            style={{ marginTop: token.paddingMD }}
            items={[
              {
                key: "errors",
                label: `Errors (${errors.length})`,
                children: (
                  <Table<CapsUploadIssue>
                    columns={issueColumns}
                    dataSource={errors}
                    rowKey={(_, i) => `err-${i}`}
                    size="small"
                    pagination={false}
                    scroll={{ y: 240 }}
                  />
                ),
              },
              {
                key: "warnings",
                label: `Warnings (${warnings.length})`,
                children: (
                  <Table<CapsUploadIssue>
                    columns={issueColumns}
                    dataSource={warnings}
                    rowKey={(_, i) => `warn-${i}`}
                    size="small"
                    pagination={false}
                    scroll={{ y: 240 }}
                  />
                ),
              },
            ]}
          />
        </ConditionalRenderer>
      </div>

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
        <ConditionalRenderer when={showDownload}>
          <Button
            icon={<DownloadOutlined />}
            onClick={onDownloadReport}
            block
            style={{ height: 44 }}
          >
            Download Issues Report
          </Button>
        </ConditionalRenderer>
        <Button type="primary" onClick={onClose} block style={{ height: 44 }}>
          Done
        </Button>
      </div>
    </Modal>
  );
}
