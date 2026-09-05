import { useApiError } from "@/shared/hooks/useApiError";
import { useToken } from "@/shared/hooks/useToken";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Button, Flex, Modal, Typography } from "antd";
import { useDeleteAcademicStandingEscalationStepMutation } from "../api/academicStandingEscalationApi";
import type { AcademicStandingEscalationStep } from "../types/academic-standing-escalation";

export interface DeleteEscalationStepModalProps {
  open: boolean;
  target: AcademicStandingEscalationStep | null;
  onClose: () => void;
}

export function DeleteEscalationStepModal({
  open,
  target,
  onClose,
}: DeleteEscalationStepModalProps) {
  const token = useToken();
  const [deleteStep, { isLoading }] =
    useDeleteAcademicStandingEscalationStepMutation();
  const handleApiError = useApiError();

  if (!target) return null;

  const handleDelete = async () => {
    try {
      await deleteStep(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Escalation step", "deleted"));
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: "DELETE",
        },
      });
    }
  };

  return (
    <Modal
      title="Delete Escalation Step"
      open={open}
      onCancel={onClose}
      footer={null}
      width="100%"
      style={{ maxWidth: 440 }}
      destroyOnHidden
      closable
      styles={{
        body: { padding: token.paddingSM },
        header: {
          margin: 0,
          padding: token.paddingSM,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <Flex vertical gap={16}>
          <Typography.Text>
            Are you sure you want to delete Step {target.stepNumber}: <strong>"{target.label}"</strong>?
          </Typography.Text>
          <Typography.Text type="secondary">
            This action cannot be undone.
          </Typography.Text>
        </Flex>
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
        <Button
          danger
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={handleDelete}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Yes, Delete Step
        </Button>
        <Button
          type="text"
          block
          onClick={onClose}
          disabled={isLoading}
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
