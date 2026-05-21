// Feature: course-assessment-policy
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeletePolicyModal } from "../../hooks/usePolicyModal";
import type { CourseAssessmentPolicy } from "../../types/course-assessment-policy";

// ─── Props ────────────────────────────────────────────────────────────────────

export type DeletePolicyModalProps = {
  open: boolean;
  target: CourseAssessmentPolicy | null;
  /** Number of components that will be cascade-deleted with this policy */
  componentCount: number;
  onClose: () => void;
};

/**
 * DeletePolicyModal — view-only confirmation modal for deleting a CourseAssessmentPolicy.
 * All logic is delegated to useDeletePolicyModal.
 *
 * Displays the policy breakdownName and a cascade-delete warning that includes
 * the exact component count (Property 6: Cascade Delete Warning Count).
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.7, 12.4
 */
export function DeletePolicyModal({
  open,
  target,
  componentCount,
  onClose,
}: DeletePolicyModalProps) {
  const token = useToken();
  const { state, actions } = useDeletePolicyModal(
    target,
    componentCount,
    open,
    onClose,
  );
  const { isDeleting, error } = state;
  const { handleConfirm, handleClose } = actions;

  return (
    <Modal
      title="Delete Assessment Policy"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={480}
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
        <ErrorAlert error={error} />

        {/* Confirmation message */}
        <Typography.Text>
          Are you sure you want to delete the policy{" "}
          <Typography.Text strong>
            {target?.breakdownName ?? "this policy"}
          </Typography.Text>
          ?
        </Typography.Text>

        {/* Cascade-delete warning — always shown, count is exact (Req 6.2, 6.7) */}
        <div style={{ marginTop: 12 }}>
          <Alert
            type="warning"
            showIcon
            message={`This will also delete all ${componentCount} components in this policy's breakdown. This action cannot be undone.`}
          />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
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
          type="primary"
          danger
          loading={isDeleting}
          disabled={isDeleting}
          onClick={handleConfirm}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Delete Policy
        </Button>
        <Button
          type="text"
          block
          onClick={handleClose}
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
