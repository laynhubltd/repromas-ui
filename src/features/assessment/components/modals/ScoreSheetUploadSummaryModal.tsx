// Feature: score-sheet-bulk-operations
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import { Alert, Button, Modal, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
    ScoreSheetUploadError,
    ScoreSheetUploadSummary,
    ScoreSheetUploadSummaryState,
} from "../../types/score-sheet";

export type ScoreSheetUploadSummaryModalProps = {
  open: boolean;
  onClose: () => void;
  summary: ScoreSheetUploadSummary | null;
  summaryState: ScoreSheetUploadSummaryState | null;
};

const errorColumns: ColumnsType<ScoreSheetUploadError> = [
  {
    title: "Reg No",
    dataIndex: "regNo",
    key: "regNo",
    width: 160,
  },
  {
    title: "Reason",
    dataIndex: "message",
    key: "message",
  },
];

export function ScoreSheetUploadSummaryModal({
  open,
  onClose,
  summary,
  summaryState,
}: ScoreSheetUploadSummaryModalProps) {
  const token = useToken();

  const filteredErrors = summary?.errors.filter((e) => e.regNo !== null) ?? [];
  const systemErrorMessage = summary?.errors.find(
    (e) => e.regNo === null,
  )?.message;

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
          <div
            style={{ display: "flex", alignItems: "center", gap: token.sizeSM }}
          >
            <CheckCircleOutlined
              style={{ fontSize: 20, color: token.colorSuccess }}
            />
            <Typography.Text style={{ color: token.colorSuccess }}>
              {summary?.processedCount} score rows saved successfully.
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        {/* Partial state */}
        <ConditionalRenderer when={summaryState === "partial"}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: token.sizeMD,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: token.sizeSM,
              }}
            >
              <WarningOutlined
                style={{ fontSize: 20, color: token.colorWarning }}
              />
              <Typography.Text style={{ color: token.colorWarning }}>
                {summary?.processedCount} rows saved, {summary?.skippedCount}{" "}
                rows skipped.
              </Typography.Text>
            </div>
            <Table<ScoreSheetUploadError>
              columns={errorColumns}
              dataSource={filteredErrors}
              rowKey={(_, index) => String(index)}
              size="small"
              pagination={false}
              scroll={{ y: 240 }}
            />
          </div>
        </ConditionalRenderer>

        {/* Failed state */}
        <ConditionalRenderer when={summaryState === "failed"}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: token.sizeMD,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: token.sizeSM,
              }}
            >
              <CloseCircleOutlined
                style={{ fontSize: 20, color: token.colorError }}
              />
              <Typography.Text style={{ color: token.colorError }}>
                0 rows saved, {summary?.skippedCount} rows skipped.
              </Typography.Text>
            </div>
            <Table<ScoreSheetUploadError>
              columns={errorColumns}
              dataSource={filteredErrors}
              rowKey={(_, index) => String(index)}
              size="small"
              pagination={false}
              scroll={{ y: 240 }}
            />
          </div>
        </ConditionalRenderer>

        {/* System error state */}
        <ConditionalRenderer when={summaryState === "system-error"}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: token.sizeMD,
            }}
          >
            <Alert
              type="error"
              showIcon
              message={
                systemErrorMessage ?? "A system error occurred during upload."
              }
            />
            <Table<ScoreSheetUploadError>
              columns={errorColumns}
              dataSource={filteredErrors}
              rowKey={(_, index) => String(index)}
              size="small"
              pagination={false}
              scroll={{ y: 240 }}
            />
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
