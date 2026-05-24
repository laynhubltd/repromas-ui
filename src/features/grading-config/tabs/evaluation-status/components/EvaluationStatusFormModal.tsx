// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Alert, Button, Form, Input, Modal, Switch, Typography } from "antd";
import { useEvaluationStatusFormModal } from "../hooks/useEvaluationStatusModal";
import type { ScoreEvaluationStatus } from "../types/evaluation-status";
import { codeRules, nameRules } from "../utils/validators";

type EvaluationStatusFormModalProps = {
  open: boolean;
  target: ScoreEvaluationStatus | null;
  onClose: () => void;
};

export function EvaluationStatusFormModal({
  open,
  target,
  onClose,
}: EvaluationStatusFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useEvaluationStatusFormModal(
    target,
    open,
    onClose,
  );
  const {
    isEditMode,
    isSubmitting,
    isDefault,
    requiresRetake,
    earnsCredit,
  } = state;
  const {
    handleSubmit,
    handleCancel,
    handleIsDefaultChange,
    handleRequiresRetakeChange,
    handleEarnsCreditChange,
    handleCodeChange,
  } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Evaluation Status" : "Create Evaluation Status"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
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
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          {/* Name */}
          <Form.Item
            name="name"
            label={
              <span>
                Name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={nameRules}
          >
            <Input placeholder="e.g. Passed" style={{ height: 40 }} />
          </Form.Item>

          {/* Code */}
          <Form.Item
            name="code"
            label={
              <span>
                Code{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={codeRules}
          >
            <Input
              placeholder="e.g. PASS"
              style={{ height: 40, fontFamily: "monospace" }}
              onChange={(e) => handleCodeChange(e.target.value)}
              maxLength={5}
            />
          </Form.Item>

          {/* isStandardGraded */}
          <Form.Item
            name="isStandardGraded"
            label="Standard Graded"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Typography.Text
            type="secondary"
            style={{
              fontSize: token.fontSizeSM,
              display: "block",
              marginTop: -16,
              marginBottom: 16,
            }}
          >
            When disabled, the status code is used as the transcript grade
            instead of the computed letter grade.
          </Typography.Text>

          {/* computesInGpa */}
          <Form.Item
            name="computesInGpa"
            label="Counts in GPA"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* earnsCredit */}
          <Form.Item
            name="earnsCredit"
            label="Earns Credit"
            valuePropName="checked"
          >
            <Switch onChange={handleEarnsCreditChange} />
          </Form.Item>

          {/* requiresRetake */}
          <Form.Item
            name="requiresRetake"
            label="Requires Retake"
            valuePropName="checked"
          >
            <Switch onChange={handleRequiresRetakeChange} />
          </Form.Item>

          {/* Cross-validation warning: requiresRetake + earnsCredit */}
          <ConditionalRenderer when={requiresRetake && earnsCredit}>
            <Alert
              type="warning"
              showIcon
              message="Contradictory flags"
              description="A status that requires a retake should not also earn credit. This combination is logically contradictory — the student must redo the course yet is awarded credit for it."
              style={{ marginBottom: 16 }}
            />
          </ConditionalRenderer>

          {/* isDefault */}
          <Form.Item
            name="isDefault"
            label="Default Status"
            valuePropName="checked"
            style={{ marginBottom: isDefault ? 8 : 0 }}
          >
            <Switch onChange={handleIsDefaultChange} />
          </Form.Item>

          {/* isDefault warning */}
          <ConditionalRenderer when={isDefault}>
            <Alert
              type="warning"
              showIcon
              message="Setting this as default will replace the current default status."
              style={{ marginBottom: 0 }}
            />
          </ConditionalRenderer>
        </Form>
      </div>

      {/* Footer */}
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
              ? Permission.ScoreEvaluationStatusesUpdate
              : Permission.ScoreEvaluationStatusesCreate
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
            {isEditMode ? "Save Changes" : "Create"}
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
