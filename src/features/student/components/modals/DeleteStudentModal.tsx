// Feature: student
import { useToken } from "@/shared/hooks/useToken";
import { Button, Modal } from "antd";
import { useDeleteStudentModal } from "../../hooks/useStudentModal";
import type { Student } from "../../types/student";

export type DeleteStudentModalProps = {
  open: boolean;
  target: Student | null;
  onClose: () => void;
};

export function DeleteStudentModal({ open, target, onClose }: DeleteStudentModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteStudentModal(target, onClose);
  const { isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  const studentLabel = target
    ? `${target.matricNumber} — ${target.firstName} ${target.lastName}`
    : "";

  return (
    <Modal
      title="Delete Student"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
      destroyOnHidden
      closable
      styles={{
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <p style={{ margin: 0, color: token.colorText }}>
          Delete student &apos;{studentLabel}&apos;? This cannot be undone.
        </p>
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
          type="primary"
          danger
          loading={isLoading}
          disabled={isLoading}
          onClick={handleConfirm}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          Delete Student
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
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
