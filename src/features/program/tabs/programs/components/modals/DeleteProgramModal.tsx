// Feature: program-graduation-config
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteProgramModal } from "../../hooks/useProgramModal";
import type { Program } from "../../types/program";

export type DeleteProgramModalProps = {
  open: boolean;
  target: Program | null;
  onClose: () => void;
};

export function DeleteProgramModal({ open, target, onClose }: DeleteProgramModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteProgramModal(target, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Program"
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
          Delete program{" "}
          <Typography.Text strong>'{target?.name}'</Typography.Text>? Deleting this program will
          also delete all graduation requirements associated with it. This cannot be undone.
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
          Delete Program
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
