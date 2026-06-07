import { FEE_ITEM_UI_COPY } from "@/shared/constants/feeItemOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteFeeItemModal } from "../../hooks/useFeeItemModal";
import type { FeeItem } from "../../types/fee-item";

type DeleteFeeItemModalProps = {
  open: boolean;
  target: FeeItem | null;
  onClose: () => void;
};

export function DeleteFeeItemModal({
  open,
  target,
  onClose,
}: DeleteFeeItemModalProps) {
  const token = useToken();

  const {
    state: { isDeleting, suggestDeactivate },
    actions: { handleConfirm, handleCancel },
  } = useDeleteFeeItemModal(target, open, onClose);

  return (
    <Modal
      title="Delete Fee Item"
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
        <Typography.Paragraph>
          Are you sure you want to delete{" "}
          <Typography.Text strong>{target?.name}</Typography.Text>? This cannot
          be undone if the item is not referenced by any pricing rule.
        </Typography.Paragraph>

        {suggestDeactivate ? (
          <Alert
            type="warning"
            showIcon
            message={FEE_ITEM_UI_COPY.deactivateHint}
            style={{ marginTop: 16 }}
          />
        ) : null}

        <Button
          type="primary"
          danger
          loading={isDeleting}
          disabled={isDeleting}
          block
          onClick={handleConfirm}
          style={{ height: 48, fontWeight: 600, marginTop: 24 }}
        >
          Delete Fee Item
        </Button>
      </div>

      <div
        style={{
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
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
