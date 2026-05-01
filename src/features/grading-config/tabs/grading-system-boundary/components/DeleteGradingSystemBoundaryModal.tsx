// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteGradingSystemBoundaryModal } from "../hooks/useGradingSystemBoundaryModal";
import type { GradingSystemBoundary } from "../types/grading-system-boundary";

type DeleteGradingSystemBoundaryModalProps = {
  open: boolean;
  target: GradingSystemBoundary | null;
  onClose: () => void;
};

export function DeleteGradingSystemBoundaryModal({
  open,
  target,
  onClose,
}: DeleteGradingSystemBoundaryModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteGradingSystemBoundaryModal(
    target,
    open,
    onClose,
  );
  const { isDeleting, error } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Grade Boundary"
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

        <ConditionalRenderer when={target !== null}>
          <Typography.Text>
            Delete grade boundary{" "}
            <Typography.Text strong>"{target?.letterGrade}"</Typography.Text> (
            {target?.minScore}–{target?.maxScore})?
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
        <PermissionGuard permission={Permission.GradingSchemaConfigsDelete}>
          <Button
            type="primary"
            danger
            loading={isDeleting}
            disabled={isDeleting}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete Boundary
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
