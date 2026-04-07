// Feature: staff
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteStaffModal } from "../../hooks/useStaffModal";
import type { Staff } from "../../types/staff";

export type DeleteStaffModalProps = {
  open: boolean;
  target: Staff | null;
  onClose: () => void;
};

export function DeleteStaffModal({ open, target, onClose }: DeleteStaffModalProps) {
  const { state, actions } = useDeleteStaffModal(target, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Staff"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnHidden
    >
      <div style={{ padding: "16px 0" }}>
        <ErrorAlert variant="form" error={error} />

        <Typography.Text>
          Delete staff record for{" "}
          <Typography.Text strong>'{target?.fileNumber}'</Typography.Text>? The user account will
          NOT be deleted — only the staff record will be removed.
        </Typography.Text>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
        <Button onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button danger type="primary" loading={isLoading} onClick={handleConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
