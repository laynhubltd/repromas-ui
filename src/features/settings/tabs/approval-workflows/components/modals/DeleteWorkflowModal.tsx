// Feature: settings/tabs/approval-workflows
import { useToken } from "@/shared/hooks/useToken";
import { Modal, Typography } from "antd";
import { useDeleteWorkflowModal } from "../../hooks/useWorkflowModal";
import type { WorkflowDefinitionDto } from "../../types/workflow-config";

type DeleteWorkflowModalProps = {
  open: boolean;
  target: WorkflowDefinitionDto | null;
  onClose: () => void;
};

export function DeleteWorkflowModal({
  open,
  target,
  onClose,
}: DeleteWorkflowModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteWorkflowModal(target, open, onClose);
  const { isDeleting } = state;
  const { handleDelete, handleCancel } = actions;

  if (!target) return null;

  return (
    <Modal
      open={open}
      title={
        <Typography.Text strong style={{ fontSize: token.fontSizeLG, color: token.colorError }}>
          Delete Workflow Definition
        </Typography.Text>
      }
      okText="Delete Definition"
      okButtonProps={{ danger: true, loading: isDeleting }}
      cancelButtonProps={{ disabled: isDeleting }}
      onOk={handleDelete}
      onCancel={handleCancel}
      destroyOnHidden
    >
      <div style={{ marginTop: token.marginMD }}>
        <Typography.Paragraph>
          Are you sure you want to delete the workflow definition{" "}
          <strong>"{target.name}"</strong> (<code>{target.code}</code>)?
        </Typography.Paragraph>
        <Typography.Text type="secondary">
          This action cannot be undone. Any steps and transition configurations under this workflow will be permanently removed.
        </Typography.Text>
      </div>
    </Modal>
  );
}
