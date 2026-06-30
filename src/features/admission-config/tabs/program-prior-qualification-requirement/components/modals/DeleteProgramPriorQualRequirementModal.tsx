import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteProgramPriorQualRequirementModal } from "../../hooks/useProgramPriorQualRequirementModal";
import type { ProgramPriorQualificationRequirement } from "../../types/program-prior-qualification-requirement";
import { formatRequirementLineLabel } from "../../utils/requirementDisplay";

type DeleteProgramPriorQualRequirementModalProps = {
  open: boolean;
  target: ProgramPriorQualificationRequirement | null;
  onClose: () => void;
};

export function DeleteProgramPriorQualRequirementModal({
  open,
  target,
  onClose,
}: DeleteProgramPriorQualRequirementModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteProgramPriorQualRequirementModal(target, onClose);
  const { isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      open={open}
      title="Delete Prior Qual Requirement"
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isDeleting}>
          Cancel
        </Button>,
        <PermissionGuard
          key="delete"
          permission={Permission.AdmissionProgramPriorQualificationRequirementsDelete}
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
          <Typography.Text strong>
            {target ? formatRequirementLineLabel(target) : "this requirement"}
          </Typography.Text>
          ?
        </Typography.Text>
        <Alert
          type="warning"
          showIcon
          message="This affects DE eligibility"
          description="Removing a requirement changes which direct-entry candidates can qualify for this program."
        />
      </div>
    </Modal>
  );
}
