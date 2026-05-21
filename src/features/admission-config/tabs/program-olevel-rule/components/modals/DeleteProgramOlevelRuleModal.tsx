import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeleteProgramOlevelRuleModal } from "../../hooks/useProgramOlevelRuleModal";
import type { ProgramOlevelRequirement } from "../../types/program-olevel-rule";

type DeleteProgramOlevelRuleModalProps = {
  open: boolean;
  target: ProgramOlevelRequirement | null;
  onClose: () => void;
};

export function DeleteProgramOlevelRuleModal({
  open,
  target,
  onClose,
}: DeleteProgramOlevelRuleModalProps) {
  const token = useToken();

  const {
    state: { error, isDeleting },
    actions: { handleConfirm, handleCancel },
  } = useDeleteProgramOlevelRuleModal(target, open, onClose);

  const programName = target?.program?.name ?? "Unknown program";
  const subjectName = target?.subject?.name ?? "Unknown subject";

  return (
    <Modal
      title="Remove Program O'Level Requirement"
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

        <Typography.Paragraph style={{ marginBottom: 8 }}>
          Remove the O'Level requirement for{" "}
          <Typography.Text strong>{subjectName}</Typography.Text> on{" "}
          <Typography.Text strong>{programName}</Typography.Text>?
        </Typography.Paragraph>

        <Typography.Text
          type="secondary"
          style={{ display: "block", fontSize: token.fontSizeSM }}
        >
          Screening may treat this subject as optional for this program until a
          new requirement is added.
        </Typography.Text>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 24,
          }}
        >
          <Button onClick={handleCancel}>Cancel</Button>
          <PermissionGuard permission={Permission.AdmissionProgramOlevelRulesDelete}>
            <Button
              danger
              type="primary"
              loading={isDeleting}
              onClick={handleConfirm}
              style={{ fontWeight: 600 }}
            >
              Remove Requirement
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </Modal>
  );
}
