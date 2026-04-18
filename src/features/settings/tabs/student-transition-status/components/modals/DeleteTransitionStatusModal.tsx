// Feature: student-transition-status
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteTransitionStatusModal } from "../../hooks/useTransitionStatusModal";
import type { StudentTransitionStatus } from "../../types/student-transition-status";

export type DeleteTransitionStatusModalProps = {
  open: boolean;
  target: StudentTransitionStatus | null;
  usageCount: number;
  onClose: () => void;
};

export function DeleteTransitionStatusModal({
  open,
  target,
  usageCount,
  onClose,
}: DeleteTransitionStatusModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteTransitionStatusModal(target, usageCount, open, onClose);
  const { error, isLoading, isBlocked } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Transition Status"
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
        <ErrorAlert variant="form" error={error} />

        {/* Blocking message — status is in use */}
        <ConditionalRenderer when={isBlocked}>
          <Typography.Text>
            This status is assigned to{" "}
            <strong>{usageCount}</strong> enrollment transition(s) and cannot be deleted.
            Reassign those transitions first.
          </Typography.Text>
        </ConditionalRenderer>

        {/* Confirmation message — safe to delete */}
        <ConditionalRenderer when={!isBlocked}>
          <Typography.Text>
            Delete status &ldquo;<strong>{target?.name}</strong>&rdquo;? This cannot be undone.
          </Typography.Text>
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
        {/* Destructive confirm button — only shown when not blocked */}
        <ConditionalRenderer when={!isBlocked}>
          <PermissionGuard permission={Permission.StudentTransitionStatusesDelete}>
            <Button
              type="primary"
              danger
              loading={isLoading}
              disabled={isLoading}
              onClick={handleConfirm}
              block
              style={{ height: 48, fontWeight: 600 }}
            >
              Delete Status
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

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
