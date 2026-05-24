import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ADMISSION_CYCLE_STATUS_OPTIONS } from "@/shared/constants/admissionCycleOptions";
import { Alert, Button, Modal, Typography } from "antd";
import { useTransitionAdmissionCycleModal } from "../../hooks/useAdmissionCycleModal";
import type { AdmissionCycle } from "../../types/admission-cycle";

type TransitionAdmissionCycleModalProps = {
  open: boolean;
  target: AdmissionCycle | null;
  onClose: () => void;
};

const statusLabelByValue = Object.fromEntries(
  ADMISSION_CYCLE_STATUS_OPTIONS.map((opt) => [opt.value, opt.label]),
) as Record<string, string>;

export function TransitionAdmissionCycleModal({
  open,
  target,
  onClose,
}: TransitionAdmissionCycleModalProps) {
  const token = useToken();
  const { state, actions } = useTransitionAdmissionCycleModal(
    target,
    open,
    onClose,
  );
  const { isTransitioning, nextStatus, buttonLabel, warningMessage } =
    state;
  const { handleConfirm, handleCancel } = actions;

  const canShowTransition = target !== null && nextStatus !== null;
  const fromStatusLabel =
    target !== null
      ? (statusLabelByValue[target.status] ?? target.status)
      : "";
  const toStatusLabel =
    nextStatus !== null
      ? (statusLabelByValue[nextStatus] ?? nextStatus)
      : "";

  return (
    <Modal
      title="Advance Cycle Status"
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
        <ConditionalRenderer when={canShowTransition}>
          <Typography.Text style={{ display: "block", marginBottom: 12 }}>
            Advance{" "}
            <Typography.Text strong>"{target?.name}"</Typography.Text> from{" "}
            <Typography.Text strong>{fromStatusLabel}</Typography.Text> to{" "}
            <Typography.Text strong>{toStatusLabel}</Typography.Text>?
          </Typography.Text>

          <ConditionalRenderer when={warningMessage !== null}>
            <Alert
              type="warning"
              showIcon
              message={warningMessage}
              style={{ marginBottom: 0 }}
            />
          </ConditionalRenderer>
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
        <PermissionGuard permission={Permission.AdmissionCyclesTransition}>
          <Button
            type="primary"
            loading={isTransitioning}
            disabled={isTransitioning || nextStatus === null}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {buttonLabel}
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isTransitioning}
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
