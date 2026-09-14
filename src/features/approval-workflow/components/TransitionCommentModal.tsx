// Feature: approval-workflow
import { useToken } from "@/shared/hooks/useToken";
import { Form, Input, Modal, Typography } from "antd";
import type { WorkflowTransitionDto } from "../types/approval-workflow";

type TransitionCommentModalProps = {
  open: boolean;
  transition: WorkflowTransitionDto | null;
  comment: string;
  isExecuting: boolean;
  onCommentChange: (comment: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function TransitionCommentModal({
  open,
  transition,
  comment,
  isExecuting,
  onCommentChange,
  onConfirm,
  onCancel,
}: TransitionCommentModalProps) {
  const token = useToken();

  if (!transition) return null;

  const isReverse = transition.direction === "REVERSE";
  const actionLabel =
    transition.actionName ||
    transition.actionLabel ||
    transition.name ||
    "Advance";
  const targetStepLabel =
    transition.toLabel ||
    transition.toState ||
    transition.toStep?.label ||
    transition.toStep?.name ||
    "previous step";
  const isSubmitDisabled = isExecuting || !comment.trim();

  return (
    <Modal
      open={open}
      title={
        <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
          {isReverse ? `Return / Reject: ${actionLabel}` : `Confirm: ${actionLabel}`}
        </Typography.Text>
      }
      okText={actionLabel}
      okButtonProps={{
        danger: isReverse,
        disabled: isSubmitDisabled,
        loading: isExecuting,
      }}
      cancelButtonProps={{ disabled: isExecuting }}
      onOk={onConfirm}
      onCancel={onCancel}
      destroyOnHidden
    >
      <div style={{ marginTop: token.marginMD, marginBottom: token.marginSM }}>
        <Typography.Paragraph type="secondary" style={{ marginBottom: token.marginMD }}>
          {isReverse
            ? `Please provide a mandatory reason for returning this record to "${targetStepLabel}". This remark will be recorded in the audit trail.`
            : `Please provide any remarks or justification for performing "${actionLabel}".`}
        </Typography.Paragraph>

        <Form layout="vertical">
          <Form.Item
            label={
              <span>
                <strong>Reason / Remark</strong>{" "}
                <Typography.Text type="danger">*</Typography.Text>
              </span>
            }
            required
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter explanation or reason..."
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              disabled={isExecuting}
              autoFocus
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
