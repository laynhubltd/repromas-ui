import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Flex, Modal, Typography } from "antd";
import { useRevokeUserRoleModal } from "../../hooks/useUserRoleModal";
import type { UserRole } from "../../types/rbac";
import { ScopeBadge } from "../ScopeBadge";

export type RevokeUserRoleModalProps = {
  open: boolean;
  target: UserRole | null;
  userId: number;
  userName?: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function RevokeUserRoleModal({
  open,
  target,
  userId,
  userName,
  onClose,
  onSuccess,
}: RevokeUserRoleModalProps) {
  const token = useToken();
  const { state, actions } = useRevokeUserRoleModal(target, userId, open, onClose, onSuccess);
  const { isRevoking, lockoutError } = state;
  const { handleConfirm, handleCancel } = actions;

  const isGlobalAdminRole =
    target?.scope === "GLOBAL" || target?.roleName === "System Administrator";

  return (
    <Modal
      title={
        target
          ? `Revoke ${target.roleName} Role${userName ? ` from ${userName}` : ""}?`
          : "Revoke Role"
      }
      open={open}
      onCancel={isRevoking ? undefined : handleCancel}
      footer={null}
      width={500}
      closable={!isRevoking}
      keyboard={!isRevoking}
      maskClosable={!isRevoking}
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <Flex vertical gap={16} style={{ padding: 24 }}>
        {lockoutError && (
          <Alert
            type="error"
            showIcon
            message="Cannot Revoke Role (409 Conflict)"
            description={lockoutError}
          />
        )}

        {isGlobalAdminRole && !lockoutError && (
          <Alert
            type="warning"
            showIcon
            message="Global Administrator Protection"
            description="Revoking global administrator roles is verified against active administrator counts. The last administrator in the tenant cannot be revoked."
          />
        )}

        <Typography.Text>
          Are you sure you want to revoke the role{" "}
          <Typography.Text strong>'{target?.roleName}'</Typography.Text>
          {target && (
            <>
              {" "}
              <Flex component="span" align="center" gap={4} style={{ display: "inline-flex" }}>
                (<ScopeBadge scope={target.scope} />)
              </Flex>
            </>
          )}
          ? This will immediately remove all associated permissions.
        </Typography.Text>
      </Flex>

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
          type="default"
          block
          autoFocus
          onClick={handleCancel}
          disabled={isRevoking}
          style={{
            height: 44,
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <PermissionGuard permission={Permission.UserRolesDelete}>
          <Button
            type="primary"
            danger
            loading={isRevoking}
            disabled={isRevoking || Boolean(lockoutError)}
            onClick={handleConfirm}
            block
            style={{ height: 44, fontWeight: 600 }}
          >
            Revoke Role
          </Button>
        </PermissionGuard>
      </div>
    </Modal>
  );
}

