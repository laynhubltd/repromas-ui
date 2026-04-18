// Feature: settings-timeframe
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import type { SystemTimeFrame } from "../types/system-timeframe";

type DeleteTimeFrameModalProps = {
  open: boolean;
  target: SystemTimeFrame | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  error?: string | null;
};

export function DeleteTimeFrameModal({
  open,
  target,
  onClose,
  onConfirm,
  isLoading,
  error,
}: DeleteTimeFrameModalProps) {
  const token = useToken();

  if (!target) return null;

  return (
    <Modal
      title="Delete Time Frame"
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
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
        <ErrorAlert variant="form" error={error} />
        <Typography.Text>
          Delete this time frame? This cannot be undone. Consider deactivating it instead.
        </Typography.Text>
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
        <Button
          type="primary"
          danger
          loading={isLoading}
          disabled={isLoading}
          onClick={onConfirm}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Delete Time Frame
        </Button>
        <Button
          type="text"
          block
          onClick={onClose}
          disabled={isLoading}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
