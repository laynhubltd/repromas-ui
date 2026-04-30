// Feature: course-assessment-policy
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteComponentModal } from "../../hooks/useComponentModal";
import type { CourseAssessmentComponent } from "../../types/course-assessment-policy";

// ─── Props ────────────────────────────────────────────────────────────────────

export type DeleteComponentModalProps = {
  open: boolean;
  target: CourseAssessmentComponent | null;
  /** When true, an additional warning is shown that the policy will have no components */
  isLastComponent: boolean;
  onClose: () => void;
};

/**
 * DeleteComponentModal — view-only confirmation modal for deleting a CourseAssessmentComponent.
 * All logic is delegated to useDeleteComponentModal.
 *
 * Displays the component code and name. When isLastComponent=true, shows an
 * additional warning that the policy will have no components after deletion.
 *
 * Requirements: 8.1–8.6, 12.4
 */
export function DeleteComponentModal({
  open,
  target,
  isLastComponent,
  onClose,
}: DeleteComponentModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteComponentModal(
    target,
    isLastComponent,
    open,
    onClose,
  );
  const { isDeleting, error } = state;
  const { handleConfirm, handleClose } = actions;

  return (
    <Modal
      title="Delete Component"
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
          Are you sure you want to delete the component{" "}
          <Typography.Text strong code>
            {target?.code ?? "—"}
          </Typography.Text>
          {target?.name ? (
            <>
              {" "}
              <Typography.Text type="secondary">
                ({target.name})
              </Typography.Text>
            </>
          ) : null}
          ?
        </Typography.Text>

        {/* Last-component warning — only shown when this is the final component */}
        {isLastComponent && (
          <div style={{ marginTop: 12 }}>
            <Alert
              type="warning"
              showIcon
              message="This policy will have no components after deletion."
            />
          </div>
        )}
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
          Delete Component
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
