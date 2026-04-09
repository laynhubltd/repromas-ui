// Feature: rbac-settings
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Flex, Modal, Typography } from "antd";
import { useRevokeUserRoleModal } from "../../hooks/useUserRoleModal";
import type { UserRole } from "../../types/rbac";
import { ScopeBadge } from "../ScopeBadge";

export type RevokeUserRoleModalProps = {
  open: boolean;
  target: UserRole | null;
  userId: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export function RevokeUserRoleModal({
  open,
  target,
  userId,
  onClose,
  onSuccess,
}: RevokeUserRoleModalProps) {
  const token = useToken();
  const { state, actions } = useRevokeUserRoleModal(target, userId, open, onClose, onSuccess);
  const { isRevoking, error } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Revoke Role"
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
          Revoke role{" "}
          <Typography.Text strong>'{target?.roleName}'</Typography.Text>
          {target && (
            <>
              {" "}
              <Flex component="span" align="center" gap={4} style={{ display: "inline-flex" }}>
                (<ScopeBadge scope={target.scope} />)
              </Flex>
            </>
          )}
          ? This cannot be undone.
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
        <PermissionGuard permission={Permission.UserRolesDelete}>
          <Button
            type="primary"
            danger
            loading={isRevoking}
            disabled={isRevoking}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Revoke Role
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isRevoking}
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
