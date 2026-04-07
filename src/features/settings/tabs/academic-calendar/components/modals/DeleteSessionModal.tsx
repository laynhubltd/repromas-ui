import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteSessionModal } from "../../hooks/useSessionModal";
import type { AcademicSession } from "../../types/academic-calendar";

export type DeleteSessionModalProps = {
  open: boolean;
  target: AcademicSession | null;
  onClose: () => void;
};

export function DeleteSessionModal({ open, target, onClose }: DeleteSessionModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteSessionModal(target, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Session"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 480 }}
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
        <ErrorAlert variant="form" error={error} />

        <Typography.Text>
          All semesters under this session will be permanently deleted.
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
          danger
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={handleConfirm}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Delete Session
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
