import { FEE_EVENT_UI_COPY } from "@/shared/constants/feeEventOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Modal, Typography } from "antd";
import { useDeleteBillableEventModal } from "../../hooks/useBillableEventModal";
import type { BillableEvent } from "../../types/billable-event";

type DeleteBillableEventModalProps = {
  open: boolean;
  target: BillableEvent | null;
  onClose: () => void;
};

export function DeleteBillableEventModal({
  open,
  target,
  onClose,
}: DeleteBillableEventModalProps) {
  const token = useToken();
  const {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  } = useDeleteBillableEventModal(target, open, onClose);

  return (
    <Modal
      title={FEE_EVENT_UI_COPY.deleteFeeTitle}
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
          {FEE_EVENT_UI_COPY.deleteFeeDescription.replace(
            "{name}",
            target?.name ?? "this fee",
          )}
        </Typography.Paragraph>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 24,
          }}
        >
          <Button onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            loading={isDeleting}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
