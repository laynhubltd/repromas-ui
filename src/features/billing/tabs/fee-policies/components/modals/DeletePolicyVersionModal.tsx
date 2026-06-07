import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { BILLING_POLICY_UI_COPY } from "@/shared/constants/billingPolicyOptions";
import { Button, Modal, Typography } from "antd";
import type { BillableEventPolicy } from "../../types/billable-event-policy";
import { useDeletePolicyVersionModal } from "../../hooks/useDeletePolicyVersionModal";
import { formatPolicyVersionLabel } from "../../utils/billingPolicyDisplay";

type DeletePolicyVersionModalProps = {
  open: boolean;
  target: BillableEventPolicy | null;
  onClose: () => void;
};

export function DeletePolicyVersionModal({
  open,
  target,
  onClose,
}: DeletePolicyVersionModalProps) {
  const {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  } = useDeletePolicyVersionModal(target, open, onClose);

  return (
    <Modal
      title={BILLING_POLICY_UI_COPY.deleteVersionTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      <Typography.Paragraph>
        {BILLING_POLICY_UI_COPY.deleteVersionDescription
          .replace("{versionNo}", target ? formatPolicyVersionLabel(target) : "")
          .replace("{code}", target?.code ?? "")}
      </Typography.Paragraph>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button onClick={handleCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <PermissionGuard permission={Permission.BillingBillableEventsDelete}>
          <Button danger type="primary" loading={isDeleting} onClick={handleConfirm}>
            Delete
          </Button>
        </PermissionGuard>
      </div>
    </Modal>
  );
}
