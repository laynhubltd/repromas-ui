import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { formatDeactivateBodyForSlot, MATRIC_NUMBER_FORMAT_UI_COPY } from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeactivateMatricNumberFormatModal } from "../../hooks/useMatricNumberFormatModal";
import type { MatricNumberFormat } from "../../types/matric-number-format";

type DeactivateMatricNumberFormatModalProps = {
  open: boolean;
  target: MatricNumberFormat | null;
  onClose: () => void;
};

export function DeactivateMatricNumberFormatModal({
  open,
  target,
  onClose,
}: DeactivateMatricNumberFormatModalProps) {
  const token = useToken();
  const { state, actions } = useDeactivateMatricNumberFormatModal(target, onClose);
  const { isLoading } = state;
  const { handleConfirm, handleCancel } = actions;
  const deactivateBody = target ? formatDeactivateBodyForSlot(target.entryMode) : "";

  return (
    <Modal
      title={MATRIC_NUMBER_FORMAT_UI_COPY.deactivateTitle}
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
          message={deactivateBody}
          style={{ marginBottom: 16 }}
        />
        <Typography.Text>
          Deactivate live format{" "}
          <Typography.Text strong>'{target?.code}'</Typography.Text>?
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
        <PermissionGuard permission={Permission.MatricNumberFormatsActivate}>
          <Button
            type="primary"
            danger
            loading={isLoading}
            disabled={isLoading}
            onClick={() => void handleConfirm()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {MATRIC_NUMBER_FORMAT_UI_COPY.actionDeactivate}
          </Button>
        </PermissionGuard>
        <Button type="text" block onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
