// Feature: course-assessment-policy
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Button,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Typography,
} from "antd";
import { useComponentFormModal } from "../../hooks/useComponentModal";
import type { CourseAssessmentComponent } from "../../types/course-assessment-policy";
import {
  componentNameRules,
  validateComponentCode,
  validateMinPassPercentage,
  validateWeightPercentage,
} from "../../utils/validators";

// ─── Props ────────────────────────────────────────────────────────────────────

export type ComponentFormModalProps = {
  open: boolean;
  /** The policy this component belongs to (used in create mode) */
  policyId: number | null;
  /** The policy's breakdown name for display */
  policyName: string | null;
  /** null = create mode, CourseAssessmentComponent = edit mode */
  target: CourseAssessmentComponent | null;
  /** The policy's total weight budget */
  totalWeightPercentage: number;
  /** Sum of existing components' weights (excluding the one being edited) */
  usedWeight: number;
  onClose: () => void;
};

/**
 * ComponentFormModal — view-only upsert modal for CourseAssessmentComponent.
 * All logic is delegated to useComponentFormModal.
 *
 * Create mode: policyId pre-filled as read-only, other fields at defaults.
 * Edit mode: policyId displayed as read-only text.
 *
 * Requirements: 7.1–7.11, 12.4, 12.9
 */
export function ComponentFormModal({
  open,
  policyId,
  policyName,
  target,
  totalWeightPercentage,
  usedWeight,
  onClose,
}: ComponentFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useComponentFormModal(
    policyId,
    target,
    open,
    onClose,
    totalWeightPercentage,
    usedWeight,
  );

  const { isEditMode, isSubmitting, formError, mustPassValue } = state;
  const { handleSubmit, handleClose, handleMustPassToggle } = actions;

  // Resolve the effective policyId for display
  const displayPolicyId = isEditMode ? target?.policyId : policyId;

  return (
    <Modal
      title={isEditMode ? "Edit Component" : "Add Component"}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={520}
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
        <ErrorAlert error={formError} />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          {/* ── Policy (read-only) ─────────────────────────────────────── */}
          <Form.Item label="Policy">
            <Typography.Text type="secondary">
              {policyName ??
                (displayPolicyId != null ? `Policy #${displayPolicyId}` : "—")}
            </Typography.Text>
          </Form.Item>

          {/* ── Code ───────────────────────────────────────────────────── */}
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
            rules={validateComponentCode()}
          >
            <Input
              placeholder="e.g. CA_01"
              maxLength={20}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>

          {/* ── Name ───────────────────────────────────────────────────── */}
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
            rules={componentNameRules}
          >
            <Input placeholder="e.g. Continuous Assessment" maxLength={100} />
          </Form.Item>

          {/* ── Weight Percentage ──────────────────────────────────────── */}
          <Form.Item
            name="weightPercentage"
            label={
              <span>
                Weight Percentage{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={validateWeightPercentage(totalWeightPercentage, usedWeight)}
          >
            <InputNumber
              min={0.01}
              max={100}
              precision={2}
              style={{ width: "100%", height: 40 }}
              addonAfter="%"
            />
          </Form.Item>

          {/* ── Is Mandatory To Attempt ────────────────────────────────── */}
          <Form.Item name="isMandatoryToAttempt" valuePropName="checked">
            <Checkbox>Mandatory to attempt</Checkbox>
          </Form.Item>

          {/* ── Must Pass ──────────────────────────────────────────────── */}
          <Form.Item name="mustPass" valuePropName="checked">
            <Checkbox onChange={(e) => handleMustPassToggle(e.target.checked)}>
              Must pass
            </Checkbox>
          </Form.Item>

          {/* ── Min Pass Percentage ────────────────────────────────────── */}
          <Form.Item
            name="minPassPercentage"
            label={
              <span>
                Minimum Pass Percentage{" "}
                {mustPassValue && (
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                )}
              </span>
            }
            rules={validateMinPassPercentage(mustPassValue)}
          >
            <InputNumber
              min={0}
              max={100}
              precision={2}
              disabled={!mustPassValue}
              style={{ width: "100%", height: 40 }}
              addonAfter="%"
              placeholder={mustPassValue ? "e.g. 50" : "—"}
            />
          </Form.Item>

          {/* ── Sub Components (optional JSON) TODO: add this back if the backend is fully ready ─────────────────────────── */}
          {/* <Form.Item
            name="subComponents"
            label="Sub Components (JSON, optional)"
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              rows={3}
              placeholder='e.g. [{"name": "Quiz 1", "weight": 50}]'
              style={{ fontFamily: "monospace", fontSize: token.fontSizeSM }}
            />
          </Form.Item> */}
        </Form>
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
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Add Component"}
        </Button>
        <Button
          type="text"
          block
          onClick={handleClose}
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
