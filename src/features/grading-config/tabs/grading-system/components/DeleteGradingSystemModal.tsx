// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteGradingSystemModal } from "../hooks/useGradingSystemModal";
import type { GradingSystem } from "../types/grading-system";

type DeleteGradingSystemModalProps = {
  open: boolean;
  target: GradingSystem | null;
  onClose: () => void;
};

export function DeleteGradingSystemModal({
  open,
  target,
  onClose,
}: DeleteGradingSystemModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteGradingSystemModal(target, open, onClose);
  const { isDeleting, error, boundaryCount } = state;
  const { handleConfirm, handleCancel } = actions;

  const hasBoundaryCount = typeof boundaryCount === "number";

  return (
    <Modal
      title="Delete Grading System"
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
            Are you sure you want to delete{" "}
            <Typography.Text strong>"{target?.name}"</Typography.Text>?
          </Typography.Text>
        </ConditionalRenderer>

        <div style={{ marginTop: 12 }}>
          <ConditionalRenderer
            when={hasBoundaryCount && (boundaryCount ?? 0) > 0}
          >
            <Typography.Text type="warning">
              This will also delete all{" "}
              <Typography.Text strong type="warning">
                {boundaryCount}
              </Typography.Text>{" "}
              grade boundaries in this system. Are you sure?
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer when={!hasBoundaryCount}>
            <Typography.Text type="warning">
              This will also delete all grade boundaries in this system. Are you
              sure?
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer
            when={hasBoundaryCount && (boundaryCount ?? 0) === 0}
          >
            <Typography.Text type="secondary">
              This grading system has no grade boundaries.
            </Typography.Text>
          </ConditionalRenderer>
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
            Delete Grading System
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
