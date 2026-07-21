import { useToken } from "@/shared/hooks/useToken";
import { MailOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Typography } from "antd";
import type { useResendPasswordModal } from "../../hooks/useUserDrawer";
import type { TenantUser } from "../../types/user-management";

type ResendPasswordController = ReturnType<typeof useResendPasswordModal>;

type ResendPasswordModalProps = {
  open: boolean;
  target: TenantUser | null;
  onClose: () => void;
  controller: ResendPasswordController;
};

export function ResendPasswordModal({
  open,
  target,
  controller,
}: ResendPasswordModalProps) {
  const token = useToken();
  const { state, actions } = controller;

  return (
    <Modal
      title="Resend Password Reset"
      open={open}
      onCancel={actions.handleCancel}
      footer={null}
      width={420}
      closable
      destroyOnHidden
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: "16px 24px" }}>
        <Flex vertical gap={16}>
          <Typography.Text>
            A new password reset link will be sent to:
          </Typography.Text>

          <div
            style={{
              background: token.colorBgLayout,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MailOutlined style={{ color: token.colorTextSecondary }} />
            <Typography.Text strong>{target?.email ?? "—"}</Typography.Text>
          </div>

          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Any previous reset tokens for this account will be invalidated.
          </Typography.Text>
        </Flex>

        <Flex justify="flex-end" gap={8} style={{ marginTop: 24 }}>
          <Button onClick={actions.handleCancel} disabled={state.isSending}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<MailOutlined />}
            loading={state.isSending}
            onClick={() => void actions.handleConfirm()}
          >
            Send Reset Email
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
