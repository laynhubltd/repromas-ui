import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { Button, Modal, Space, Typography } from "antd";
import { useDeleteProgramAdmissionConfigModal } from "../../hooks/useProgramAdmissionConfigModal";
import type { ProgramAdmissionConfig } from "../../types/program-admission-config";

type DeleteProgramAdmissionConfigModalProps = {
  open: boolean;
  target: ProgramAdmissionConfig | null;
  onClose: () => void;
};

export function DeleteProgramAdmissionConfigModal({
  open,
  target,
  onClose,
}: DeleteProgramAdmissionConfigModalProps) {
  const {
    state: { isDeleting, blockedByAllocations, totalSeatsUsed },
    actions: { handleConfirm, handleCancel },
  } = useDeleteProgramAdmissionConfigModal(target, onClose);

  const programName = target?.program?.name ?? "this program";

  return (
    <Modal
      title="Delete Admission Cut-offs/Quota"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden
    >
      <Typography.Paragraph>
        Delete admission cut-offs/quota configuration for{" "}
        <Typography.Text strong>{programName}</Typography.Text>?
      </Typography.Paragraph>

      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        This action removes capacity split and cut-off settings used during offer allocation.
      </Typography.Text>

      <Typography.Text
        type={blockedByAllocations ? "danger" : "secondary"}
        style={{ display: "block", marginBottom: 16 }}
      >
        {blockedByAllocations
          ? `Delete blocked: ${totalSeatsUsed} slots already allocated.`
          : "No slots allocated yet. Delete is allowed."}
      </Typography.Text>

      <Space style={{ width: "100%", justifyContent: "flex-end" }}>
        <Button onClick={handleCancel}>Cancel</Button>
        <PermissionGuard permission={Permission.AdmissionProgramAdmissionConfigsDelete}>
          <Button
            danger
            type="primary"
            onClick={handleConfirm}
            loading={isDeleting}
            disabled={blockedByAllocations}
          >
            Delete Config
          </Button>
        </PermissionGuard>
      </Space>
    </Modal>
  );
}
