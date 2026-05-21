// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, InputNumber, Modal, Switch } from "antd";
import { useGradingSystemBoundaryFormModal } from "../hooks/useGradingSystemBoundaryModal";
import type { GradingSystemBoundary } from "../types/grading-system-boundary";
import {
    gradePointRules,
    letterGradeRules,
    maxScoreRules,
    minScoreRules,
} from "../utils/validators";

type GradingSystemBoundaryFormModalProps = {
  open: boolean;
  target: GradingSystemBoundary | null;
  gradingSystemId: number | null;
  onClose: () => void;
  existingBoundaries: GradingSystemBoundary[];
};

export function GradingSystemBoundaryFormModal({
  open,
  target,
  gradingSystemId,
  onClose,
  existingBoundaries,
}: GradingSystemBoundaryFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useGradingSystemBoundaryFormModal(
    target,
    gradingSystemId,
    open,
    onClose,
    existingBoundaries,
  );
  const { isEditMode, isSubmitting, formError, overlapError } = state;
  const { handleSubmit, handleCancel } = actions;

  const combinedError = overlapError ?? formError;

  return (
    <Modal
      title={isEditMode ? "Edit Grade Boundary" : "Add Grade Boundary"}
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
        <ErrorAlert variant="form" error={combinedError} />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{ isPass: true }}
        >
          {/* Letter Grade */}
          <Form.Item
            name="letterGrade"
            label={
              <span>
                Letter Grade{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={letterGradeRules}
          >
            <Input
              placeholder="e.g. A, B+, C-"
              maxLength={50}
              style={{ height: 40 }}
            />
          </Form.Item>

          {/* Min Score */}
          <Form.Item
            name="minScore"
            label={
              <span>
                Min Score{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={minScoreRules}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.01}
              precision={2}
              placeholder="e.g. 70.00"
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          {/* Max Score */}
          <Form.Item
            name="maxScore"
            label={
              <span>
                Max Score{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={maxScoreRules}
          >
            <InputNumber
              min={0}
              max={100}
              step={0.01}
              precision={2}
              placeholder="e.g. 100.00"
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          {/* Grade Point */}
          <Form.Item
            name="gradePoint"
            label={
              <span>
                Grade Point{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={gradePointRules}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              placeholder="e.g. 5.00"
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          {/* isPass */}
          <Form.Item
            name="isPass"
            label="Pass"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch defaultChecked />
          </Form.Item>
        </Form>
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
        <PermissionGuard
          permission={
            isEditMode
              ? Permission.GradingSchemaConfigsUpdate
              : Permission.GradingSchemaConfigsCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Changes" : "Add Boundary"}
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isSubmitting}
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
