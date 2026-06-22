import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteDocumentTypeModal } from "../../hooks/useDocumentTypeModal";
import type { AdmissionDocumentType } from "../../types/document-type";

type DeleteDocumentTypeModalProps = {
  open: boolean;
  target: AdmissionDocumentType | null;
  onClose: () => void;
};

export function DeleteDocumentTypeModal({
  open,
  target,
  onClose,
}: DeleteDocumentTypeModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteDocumentTypeModal(target, onClose);
  const { isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      open={open}
      title="Delete Document Type"
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isDeleting}>
          Cancel
        </Button>,
        <PermissionGuard key="delete" permission={Permission.AdmissionDocumentTypesDelete}>
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
          description="Deleted document types cannot be recovered. If this type has been used in form fields or uploads, those references may be left orphaned. Consider deactivating it instead."
        />
      </div>
    </Modal>
  );
}
