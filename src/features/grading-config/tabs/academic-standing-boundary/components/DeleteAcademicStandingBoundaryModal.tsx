import { useApiError } from "@/shared/hooks/useApiError";
import { useToken } from "@/shared/hooks/useToken";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Alert, Button, Flex, Modal, Typography } from "antd";
import { useDeleteAcademicStandingBoundaryMutation } from "../api/academicStandingBoundaryApi";
import type { AcademicStandingBoundary } from "../types/academic-standing-boundary";

export interface DeleteAcademicStandingBoundaryModalProps {
  open: boolean;
  target: AcademicStandingBoundary | null;
  onClose: () => void;
}

export function DeleteAcademicStandingBoundaryModal({
  open,
  target,
  onClose,
}: DeleteAcademicStandingBoundaryModalProps) {
  const token = useToken();
  const [deleteBoundary, { isLoading }] = useDeleteAcademicStandingBoundaryMutation();
  const handleApiError = useApiError();

  if (!target) return null;

  const stepCount = target.escalationSteps?.length ?? 0;

  const handleDelete = async () => {
    try {
      await deleteBoundary(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Academic Standing boundary", "deleted"),
      );
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
      title="Delete Tier Boundary"
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
            Are you sure you want to delete boundary <strong>"{target.name}"</strong> (Min CGPA: {Number(target.minCgpa).toFixed(2)})?
          </Typography.Text>

          {stepCount > 0 ? (
            <Alert
              type="warning"
              showIcon
              title="Escalation Ladder Steps Deletion"
              description={`This boundary has ${stepCount} escalation ladder ${stepCount === 1 ? "step" : "steps"}. Deleting this boundary will also delete all of its escalation steps.`}
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
          Yes, Delete Boundary
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
