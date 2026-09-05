import { useApiError } from "@/shared/hooks/useApiError";
import { useToken } from "@/shared/hooks/useToken";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Alert, Button, Flex, Modal, Typography } from "antd";
import { useDeleteAcademicStandingMutation } from "../api/academicStandingApi";
import type { AcademicStanding } from "../types/academic-standing";

export interface DeleteAcademicStandingModalProps {
  open: boolean;
  target: AcademicStanding | null;
  onClose: () => void;
}

export function DeleteAcademicStandingModal({
  open,
  target,
  onClose,
}: DeleteAcademicStandingModalProps) {
  const token = useToken();
  const [deleteStanding, { isLoading }] = useDeleteAcademicStandingMutation();
  const handleApiError = useApiError();

  if (!target) return null;

  const boundaryCount = target.boundaries?.length ?? 0;

  const handleDelete = async () => {
    try {
      await deleteStanding(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Academic Standing policy", "deleted"));
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
      title="Delete Academic Standing Policy"
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
            Are you sure you want to delete policy <strong>"{target.name}"</strong>?
          </Typography.Text>

          {boundaryCount > 0 ? (
            <Alert
              type="warning"
              showIcon
              title="Cascade Deletion Warning"
              description={`This policy contains ${boundaryCount} CGPA tier ${boundaryCount === 1 ? "boundary" : "boundaries"}. Deleting it will remove all associated boundaries and escalation steps.`}
            />
          ) : (
            <Typography.Text type="secondary">
              This action cannot be undone.
            </Typography.Text>
          )}
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
          Yes, Delete Policy
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
