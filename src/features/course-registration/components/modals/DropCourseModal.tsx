import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Flex, Modal, Typography } from "antd";
import { useDropCourseModal } from "../../hooks/useDropCourseModal";
import type { CourseItem } from "../../types/course-registration";

export type DropCourseModalProps = {
  open: boolean;
  target: CourseItem | null;
  studentId: number | null;
  semesterTypeId: number | null;
  studentName?: string;
  onClose: () => void;
};

/**
 * Modal confirmation for dropping a student course registration.
 *
 * View-only component — all mutation logic lives in useDropCourseModal.
 */
export function DropCourseModal({
  open,
  target,
  studentId,
  semesterTypeId,
  studentName,
  onClose,
}: DropCourseModalProps) {
  const token = useToken();
  const { state, actions } = useDropCourseModal(
    target,
    studentId,
    semesterTypeId,
    open,
    onClose,
  );
  const { isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  if (!target) return null;

  return (
    <Modal
      title="Drop Course Registration"
      open={open}
      onCancel={handleCancel}
      destroyOnHidden
      closable
      width={480}
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          loading={isLoading}
          disabled={isLoading || state.isMissingId}
          onClick={handleConfirm}
          data-testid="confirm-drop-course-button"
        >
          Confirm Drop
        </Button>,
      ]}
    >
      <Flex vertical gap={16} style={{ padding: 16 }}>
        <Alert
          type="warning"
          showIcon
          title="Admin Course Drop"
          description="Dropping this course removes the student's registration for this semester. Any unpublished draft scores will be discarded. Published score sheets cannot be dropped."
        />
        <Flex vertical gap={4}>
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            {target.courseCode} — {target.courseTitle}
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            Credit Units: {target.creditUnits} Unit{target.creditUnits !== 1 ? "s" : ""}
            {studentName ? ` • Student: ${studentName}` : ""}
          </Typography.Text>
        </Flex>
      </Flex>
    </Modal>
  );
}
