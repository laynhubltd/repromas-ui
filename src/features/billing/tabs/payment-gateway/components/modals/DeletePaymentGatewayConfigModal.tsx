import { GATEWAY_CONFIG_UI_COPY } from "@/shared/constants/gatewayConfigOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeletePaymentGatewayConfigModal } from "../../hooks/usePaymentGatewayConfigModal";
import type { TenantPaymentGatewayConfig } from "../../types/payment-gateway-config";
import {
  formatProviderLabel,
  resolveScopeShortLabel,
} from "../../utils/gatewayConfigDisplay";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";

type DeletePaymentGatewayConfigModalProps = {
  open: boolean;
  target: TenantPaymentGatewayConfig | null;
  onClose: () => void;
  eventById: Map<number, BillableEvent>;
};

export function DeletePaymentGatewayConfigModal({
  open,
  target,
  onClose,
  eventById,
}: DeletePaymentGatewayConfigModalProps) {
  const token = useToken();

  const {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  } = useDeletePaymentGatewayConfigModal(target, open, onClose);

  const scopeLabel = target
    ? resolveScopeShortLabel(target, eventById)
    : "";

  return (
    <Modal
      title={GATEWAY_CONFIG_UI_COPY.deleteTitle}
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
          Delete the{" "}
          <Typography.Text strong>
            {target ? formatProviderLabel(target.provider) : ""}
          </Typography.Text>{" "}
          configuration for{" "}
          <Typography.Text strong>{scopeLabel}</Typography.Text>? Stored
          credentials will be removed.
        </Typography.Paragraph>

        <ConditionalRenderer when={target?.isActive === true}>
          <Alert
            type="warning"
            showIcon
            message={GATEWAY_CONFIG_UI_COPY.deleteActiveWarning}
            style={{ marginTop: 16 }}
          />
        </ConditionalRenderer>

        <Button
          type="primary"
          danger
          loading={isDeleting}
          disabled={isDeleting}
          block
          onClick={handleConfirm}
          style={{ height: 48, fontWeight: 600, marginTop: 24 }}
        >
          Delete configuration
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
