import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteJambGroupModal } from "../../hooks/useJambRuleModal";
import type { JambCombinationGroup } from "../../types/jamb-rule";

type DeleteGroupModalProps = {
  open: boolean;
  target: JambCombinationGroup | null;
  onClose: () => void;
};

export function DeleteGroupModal({
  open,
  target,
  onClose,
}: DeleteGroupModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteJambGroupModal(target, onClose);
  const { error, isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Requirement Group"
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
          Delete group{" "}
          <Typography.Text strong>{target?.name}</Typography.Text>?
        </Typography.Text>

        <Alert
          type="warning"
          showIcon
          message="All subject options in this group will also be removed."
          style={{ marginTop: 16 }}
        />
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
        <Button
          type="primary"
          danger
          loading={isDeleting}
          disabled={isDeleting}
          onClick={handleConfirm}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Delete
        </Button>
        <Button type="text" block onClick={handleCancel} disabled={isDeleting}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
