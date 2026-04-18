// Feature: program-credit-limits
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteCreditLimitModal } from "../../hooks/useCreditLimitModal";
import type { RegistrationCreditLimit } from "../../types/credit-limits";

export type DeleteCreditLimitModalProps = {
  open: boolean;
  target: RegistrationCreditLimit | null;
  onClose: () => void;
};

export function DeleteCreditLimitModal({
  open,
  target,
  onClose,
}: DeleteCreditLimitModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteCreditLimitModal(target, open, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Credit Limit"
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
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <ErrorAlert error={error} />
        <Typography.Text>
          Are you sure you want to delete this credit limit configuration? This
          action cannot be undone.
        </Typography.Text>
        <Typography.Text type="warning">
          Warning: Students matched by this rule will fall back to the next
          matching rule. If no fallback rule exists, course registration will
          fail for affected students.
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
        <PermissionGuard permission={Permission.RegistrationCreditLimitsDelete}>
          <Button
            type="primary"
            danger
            loading={isLoading}
            disabled={isLoading}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete Credit Limit
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
