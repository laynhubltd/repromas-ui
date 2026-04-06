// Feature: faculty-department-management
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteFacultyModal } from "../../hooks/useFacultyModal";
import type { Faculty } from "../../types/faculty";

export type DeleteFacultyModalProps = {
  open: boolean;
  target: Faculty | null;
  onClose: () => void;
};

export function DeleteFacultyModal({ open, target, onClose }: DeleteFacultyModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteFacultyModal(target, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Faculty"
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
        <ErrorAlert error={error} />
        <Typography.Text>
          Are you sure you want to delete{" "}
          <Typography.Text strong>{target?.name}</Typography.Text>?
        </Typography.Text>
        <div style={{ marginTop: 12 }}>
          <Alert
            type="warning"
            showIcon
            message="Cascade deletion warning"
            description="Deleting this faculty will permanently delete all its departments and all programs under those departments. This cannot be undone."
          />
        </div>
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
          Delete Faculty
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
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
