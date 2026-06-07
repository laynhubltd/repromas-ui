import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Button, Modal, Typography } from "antd";
import { useDeleteOlevelSubjectModal } from "../../hooks/useOlevelSubjectModal";
import type { OlevelSubject } from "../../types/olevel-subject";

type DeleteOlevelSubjectModalProps = {
  open: boolean;
  target: OlevelSubject | null;
  onClose: () => void;
};

export function DeleteOlevelSubjectModal({
  open,
  target,
  onClose,
}: DeleteOlevelSubjectModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteOlevelSubjectModal(target, open, onClose);
  const { isDeleting } = state;
  const { handleConfirm, handleCancel } = actions;

  return (
    <Modal
      title="Delete O'Level Subject"
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
        <ConditionalRenderer when={target !== null}>
          <Typography.Text>
            Delete subject{" "}
            <Typography.Text strong>"{target?.name}"</Typography.Text>
            {target?.code ? ` (${target.code})` : ""}? This cannot be undone.
            Remove any program requirements referencing this subject first.
          </Typography.Text>
        </ConditionalRenderer>
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
        <PermissionGuard permission={Permission.AdmissionOlevelSubjectsDelete}>
          <Button
            type="primary"
            danger
            loading={isDeleting}
            disabled={isDeleting}
            onClick={handleConfirm}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Delete Subject
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
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
