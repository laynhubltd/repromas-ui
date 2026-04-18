// Feature: system-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal } from "antd";
import { useDeleteSystemConfigModal } from "../../hooks/useSystemConfigModal";
import type { SystemConfig } from "../../types/system-config";

export type DeleteSystemConfigModalProps = {
  open: boolean;
  target: SystemConfig | null;
  onClose: () => void;
};

export function DeleteSystemConfigModal({ open, target, onClose }: DeleteSystemConfigModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteSystemConfigModal(target, open, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete System Configuration"
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
        <p style={{ margin: 0, color: token.colorText }}>
          Delete this configuration? Removing CREDIT_LOAD_LIMITS while students are actively
          registering will cause registration failures for affected students.
        </p>
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
        <PermissionGuard permission={Permission.SystemConfigsDelete}>
          <Button
            type="primary"
            danger
            loading={isLoading}
            disabled={isLoading}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete Configuration
          </Button>
        </PermissionGuard>
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
