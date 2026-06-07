// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Button, Modal, Typography } from "antd";
import { useDeleteEvaluationStatusModal } from "../hooks/useEvaluationStatusModal";
import type { ScoreEvaluationStatus } from "../types/evaluation-status";

type DeleteEvaluationStatusModalProps = {
  open: boolean;
  target: ScoreEvaluationStatus | null;
  onClose: () => void;
};

export function DeleteEvaluationStatusModal({
  open,
  target,
  onClose,
}: DeleteEvaluationStatusModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteEvaluationStatusModal(
    target,
    open,
    onClose,
  );
  const { isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  const isDefaultStatus = target?.isDefault === true;

  return (
    <Modal
      title="Delete Evaluation Status"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
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
        <ConditionalRenderer when={target !== null}>
          <Typography.Text>
            Are you sure you want to delete{" "}
            <Typography.Text strong>"{target?.name}"</Typography.Text>?
          </Typography.Text>
        </ConditionalRenderer>

        <div style={{ marginTop: 12 }}>
          <Typography.Text type="secondary">
            Deleting this status will not update existing score sheets that
            reference it.
          </Typography.Text>
        </div>

        <ConditionalRenderer when={isDefaultStatus}>
          <div style={{ marginTop: 12 }}>
            <Typography.Text type="warning">
              The default status cannot be deleted. Reassign the default to
              another status first.
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
        <PermissionGuard permission={Permission.ScoreEvaluationStatusesDelete}>
          <Button
            type="primary"
            danger
            loading={isDeleting}
            disabled={isDeleting || isDefaultStatus}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete Evaluation Status
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isDeleting}
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
