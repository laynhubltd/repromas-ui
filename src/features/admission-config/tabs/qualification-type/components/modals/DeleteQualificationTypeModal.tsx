import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteQualificationTypeModal } from "../../hooks/useQualificationTypeModal";
import type { PriorQualificationType } from "../../types/prior-qualification-type";

type DeleteQualificationTypeModalProps = {
  open: boolean;
  target: PriorQualificationType | null;
  onClose: () => void;
};

export function DeleteQualificationTypeModal({
  open,
  target,
  onClose,
}: DeleteQualificationTypeModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteQualificationTypeModal(target, onClose);
  const { isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      open={open}
      title="Delete Qualification Type"
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isDeleting}>
          Cancel
        </Button>,
        <PermissionGuard
          key="delete"
          permission={Permission.AdmissionPriorQualificationTypesDelete}
        >
          <Button
            danger
            type="primary"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={handleConfirm}
          >
            Delete
          </Button>
        </PermissionGuard>,
      ]}
      destroyOnHidden
    >
      <div style={{ display: "flex", flexDirection: "column", gap: token.marginMD }}>
        <Typography.Text>
          Are you sure you want to delete{" "}
          <Typography.Text strong>"{target?.name}"</Typography.Text>?
        </Typography.Text>

        <Alert
          type="warning"
          showIcon
          message="Deactivating is safer than deleting"
          description="If this type is referenced by program rules or candidate records, deletion returns 409. Deactivate the type instead to hide it from new forms while preserving historical data."
        />
      </div>
    </Modal>
  );
}
