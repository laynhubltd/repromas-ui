import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteVersionModal } from "../hooks/useDeleteVersionModal";
import type { CurriculumVersion } from "../types/curriculum-version";

interface DeleteVersionModalProps {
  open: boolean;
  target: CurriculumVersion | null;
  onClose: () => void;
}

export function DeleteVersionModal({ open, target, onClose }: DeleteVersionModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteVersionModal(target, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Curriculum Version"
      open={open}
      onCancel={handleCancel}
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
        {error && (
          <Alert type="error" description={error} style={{ marginBottom: 16 }} showIcon />
        )}
        <Typography.Text>
          Are you sure you want to delete{" "}
          <Typography.Text strong>{target?.name}</Typography.Text>? This action cannot be undone.
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
          onClick={handleConfirm}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Delete Version
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
          style={{ height: 40, color: token.colorTextSecondary, fontWeight: 500, fontSize: token.fontSizeSM }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
