import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteJambCombinationModal } from "../../hooks/useJambRuleModal";
import type { JambSubjectCombination } from "../../types/jamb-rule";

type DeleteCombinationModalProps = {
  open: boolean;
  target: JambSubjectCombination | null;
  onClose: () => void;
  onDeleted?: () => void;
};

export function DeleteCombinationModal({
  open,
  target,
  onClose,
  onDeleted,
}: DeleteCombinationModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteJambCombinationModal(
    target,
    onClose,
    onDeleted,
  );
  const { isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete JAMB Combination"
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
        <Typography.Text>
          Delete{" "}
          <Typography.Text strong>{target?.name}</Typography.Text> (
          {target?.scope})?
        </Typography.Text>

        <Alert
          type="warning"
          showIcon
          message="This permanently removes all requirement groups and subject options in this combination."
          style={{ marginTop: 16 }}
        />

        <ConditionalRenderer when={target?.scope === "GLOBAL"}>
          <Alert
            type="error"
            showIcon
            message="Deleting the GLOBAL fallback may leave programs without a JAMB subject rule."
            style={{ marginTop: 12 }}
          />
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
