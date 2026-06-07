import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { statusLabelByValue } from "@/shared/constants/admissionCycleOptions";
import { Alert, Button, Form, Input, Modal, Typography } from "antd";
import { useTransitionAdmissionCycleModal } from "../../hooks/useAdmissionCycleModal";
import type { AdmissionCycle, TransitionDirection } from "../../types/admission-cycle";
import { formatEntryBatchLabel } from "../../utils/admissionCycleDisplay";
import { transitionReasonRules } from "../../utils/validators";

type TransitionAdmissionCycleModalProps = {
  open: boolean;
  target: AdmissionCycle | null;
  direction: TransitionDirection;
  sessionName?: string;
  onClose: () => void;
};

export function TransitionAdmissionCycleModal({
  open,
  target,
  direction,
  sessionName,
  onClose,
}: TransitionAdmissionCycleModalProps) {
  const token = useToken();
  const modalKey = target ? `${target.id}-${direction}` : "transition";

  const { state, actions, form } = useTransitionAdmissionCycleModal(
    target,
    direction,
    onClose,
  );
  const {
    isTransitioning,
    isRollback,
    targetStatus,
    buttonLabel,
    warningMessage,
  } = state;
  const { handleConfirm, handleCancel } = actions;

  const canShowTransition = target !== null && targetStatus !== null;
  const fromStatusLabel =
    target !== null
      ? (statusLabelByValue[target.status] ?? target.status)
      : "";
  const toStatusLabel =
    targetStatus !== null
      ? (statusLabelByValue[targetStatus] ?? targetStatus)
      : "";

  return (
    <Modal
      key={modalKey}
      title={isRollback ? "Roll Back Cycle Status" : "Advance Cycle Status"}
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
          <Typography.Text style={{ display: "block", marginBottom: 8 }}>
            {isRollback ? "Roll back" : "Advance"}{" "}
            <Typography.Text strong>"{target?.name}"</Typography.Text> from{" "}
            <Typography.Text strong>{fromStatusLabel}</Typography.Text> to{" "}
            <Typography.Text strong>{toStatusLabel}</Typography.Text>?
          </Typography.Text>

          {target !== null ? (
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 12, fontSize: token.fontSizeSM }}
            >
              {sessionName ? `${sessionName} · ` : ""}
              {formatEntryBatchLabel(target.entryMode, target.batchNo)}
            </Typography.Text>
          ) : null}

          <ConditionalRenderer when={warningMessage !== null}>
            <Alert
              type="warning"
              showIcon
              message={warningMessage}
              style={{ marginBottom: isRollback ? 16 : 0 }}
            />
          </ConditionalRenderer>

          <ConditionalRenderer when={isRollback}>
            <Form form={form} layout="vertical" requiredMark={false}>
              <Form.Item
                name="reason"
                label={
                  <span>
                    Reason{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>
                      *
                    </span>
                  </span>
                }
                rules={transitionReasonRules}
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  placeholder="Explain why this cycle is being rolled back…"
                  rows={3}
                />
              </Form.Item>
            </Form>
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
            disabled={isTransitioning || !canShowTransition}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
            danger={isRollback}
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
