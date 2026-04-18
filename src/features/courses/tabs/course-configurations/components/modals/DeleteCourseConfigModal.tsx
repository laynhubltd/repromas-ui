// Feature: course-management
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeleteCourseConfigModal } from "../../hooks/useCourseConfigModal";
import type { CourseConfiguration } from "../../types/course-configuration";

export type DeleteCourseConfigModalProps = {
  open: boolean;
  target: CourseConfiguration | null;
  onClose: () => void;
};

export function DeleteCourseConfigModal({ open, target, onClose }: DeleteCourseConfigModalProps) {
  const token = useToken();
  const { state, actions } = useDeleteCourseConfigModal(target, open, onClose);
  const { error, isLoading } = state;
  const { handleConfirm, handleCancel } = actions;

  const courseCode = target?.course?.code ?? `Course #${target?.courseId}`;
  const courseTitle = target?.course?.title ?? "";
  const levelName = target?.level?.name ?? `Level #${target?.levelId}`;
  const semesterTypeName = target?.semesterType?.name ?? `Semester #${target?.semesterTypeId}`;

  return (
    <Modal
      title="Delete Course Configuration"
      open={open}
      onCancel={handleCancel}
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
        <Typography.Text>
          Are you sure you want to remove{" "}
          <Typography.Text strong>
            {courseCode}
            {courseTitle ? ` ${courseTitle}` : ""}
          </Typography.Text>{" "}
          from{" "}
          <Typography.Text strong>
            {levelName}, {semesterTypeName}
          </Typography.Text>
          ?
        </Typography.Text>
        <div style={{ marginTop: 12 }}>
          <Alert
            type="warning"
            showIcon
            message="Other configurations may reference this one as a prerequisite. Removing it may leave stale prerequisite references."
          />
        </div>
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
          Delete Configuration
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
