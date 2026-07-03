import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { MATRIC_NUMBER_FORMAT_UI_COPY } from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Alert, Button, Modal, Typography } from "antd";
import { useActivateMatricNumberFormatModal } from "../../hooks/useMatricNumberFormatModal";
import type { MatricNumberFormat } from "../../types/matric-number-format";

type ActivateMatricNumberFormatModalProps = {
  open: boolean;
  target: MatricNumberFormat | null;
  activeFormat: MatricNumberFormat | null;
  onClose: () => void;
};

export function ActivateMatricNumberFormatModal({
  open,
  target,
  activeFormat,
  onClose,
}: ActivateMatricNumberFormatModalProps) {
  const token = useToken();
  const { state, actions } = useActivateMatricNumberFormatModal(target, activeFormat, onClose);
  const { isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title={MATRIC_NUMBER_FORMAT_UI_COPY.activateTitle}
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
          message={MATRIC_NUMBER_FORMAT_UI_COPY.activateBody}
          style={{ marginBottom: 16 }}
        />
        <Typography.Text>
          Activate draft{" "}
          <Typography.Text strong>'{target?.code}'</Typography.Text>?
        </Typography.Text>
        <ConditionalRenderer when={activeFormat !== null && activeFormat.id !== target?.id}>
          <Typography.Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            This will replace the current live format{" "}
            <Typography.Text code>{activeFormat?.code}</Typography.Text>.
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
            Activate Format
          </Button>
        </PermissionGuard>
        <Button type="text" block onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
