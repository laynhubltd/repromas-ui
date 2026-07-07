import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { MATRIC_NUMBER_FORMAT_UI_COPY } from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Alert, Button, Modal, Typography } from "antd";
import { useReactivateMatricNumberFormatModal } from "../../hooks/useMatricNumberFormatModal";
import type { MatricFormatActiveSlot, MatricNumberFormat } from "../../types/matric-number-format";
import { isSlotActivationLocked } from "../../utils/slotLifecycleEligibility";

type ReactivateMatricNumberFormatModalProps = {
  open: boolean;
  target: MatricNumberFormat | null;
  activeSlots: MatricFormatActiveSlot[];
  onClose: () => void;
};

export function ReactivateMatricNumberFormatModal({
  open,
  target,
  activeSlots,
  onClose,
}: ReactivateMatricNumberFormatModalProps) {
  const token = useToken();
  const { state, actions } = useReactivateMatricNumberFormatModal(target, onClose);
  const { isLoading } = state;
  const { handleConfirm, handleCancel } = actions;
  const slotLocked =
    target !== null && isSlotActivationLocked(activeSlots, target.entryMode);

  return (
    <Modal
      title={MATRIC_NUMBER_FORMAT_UI_COPY.reactivateTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
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
        <Alert
          type="warning"
          showIcon
          message={
            slotLocked
              ? MATRIC_NUMBER_FORMAT_UI_COPY.reactivateBodyLockedSlot
              : MATRIC_NUMBER_FORMAT_UI_COPY.reactivateBody
          }
          style={{ marginBottom: 16 }}
        />
        <Typography.Text>
          {MATRIC_NUMBER_FORMAT_UI_COPY.actionReactivate}{" "}
          <Typography.Text strong>'{target?.code}'</Typography.Text>?
        </Typography.Text>
        <ConditionalRenderer when={slotLocked}>
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            {MATRIC_NUMBER_FORMAT_UI_COPY.reactivateLockedSlotNote}
          </Typography.Text>
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
        <PermissionGuard permission={Permission.MatricNumberFormatsActivate}>
          <Button
            type="primary"
            loading={isLoading}
            disabled={isLoading}
            onClick={() => void handleConfirm()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {MATRIC_NUMBER_FORMAT_UI_COPY.actionReactivate}
          </Button>
        </PermissionGuard>
        <Button type="text" block onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
