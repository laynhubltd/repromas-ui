import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteJambOptionModal } from "../../hooks/useJambRuleModal";
import type { JambCombinationOption } from "../../types/jamb-rule";

type DeleteOptionModalProps = {
  open: boolean;
  target: JambCombinationOption | null;
  onClose: () => void;
};

export function DeleteOptionModal({
  open,
  target,
  onClose,
}: DeleteOptionModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteJambOptionModal(target, onClose);
  const { error, isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Remove Subject Option"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={440}
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
          Remove{" "}
          <Typography.Text strong>
            {target?.subject?.name ?? "Unknown subject"}
          </Typography.Text>{" "}
          from this group?
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
        <Button
          type="primary"
          danger
          loading={isDeleting}
          disabled={isDeleting}
          onClick={handleConfirm}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Remove
        </Button>
        <Button type="text" block onClick={handleCancel} disabled={isDeleting}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
