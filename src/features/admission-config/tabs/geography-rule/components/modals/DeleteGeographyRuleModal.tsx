import { PermissionGuard } from "@/features/access-control/PermissionGuard";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteGeographyRuleModal } from "../../hooks/useGeographyRuleModal";
import type { GeographyRuleRow } from "../../hooks/useGeographyRuleTab";

type DeleteGeographyRuleModalProps = {
  open: boolean;
  target: GeographyRuleRow | null;
  onClose: () => void;
};

export function DeleteGeographyRuleModal({
  open,
  target,
  onClose,
}: DeleteGeographyRuleModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteGeographyRuleModal(target, open, onClose);
  const { isDeleting, error } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete Geography Rule"
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
        <ErrorAlert variant="form" error={error} />

        <ConditionalRenderer when={target !== null}>
          <Typography.Text>
            Remove the geography rule for{" "}
            <Typography.Text strong>
              {target?.stateName} ({target?.stateCode})
            </Typography.Text>
            ? The state will default to Merit classification at screening time.
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
        <PermissionGuard permission={Permission.AdmissionGeographyRulesDelete}>
          <Button
            type="primary"
            danger
            loading={isDeleting}
            disabled={isDeleting}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete Rule
          </Button>
        </PermissionGuard>
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
