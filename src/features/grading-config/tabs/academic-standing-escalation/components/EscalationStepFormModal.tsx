import { useToken } from "@/shared/hooks/useToken";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Switch,
  Typography,
} from "antd";
import { SEMANTIC_KIND_LABELS } from "@/features/settings/tabs/student-transition-status/utils/semanticKindPresentation";
import { useAcademicStandingEscalationModal } from "../hooks/useAcademicStandingEscalationModal";
import type { AcademicStandingEscalationStep } from "../types/academic-standing-escalation";
import {
  actionTimingModeRules,
  semesterTypeRules,
  stepLabelRules,
  stepNumberRules,
  stepStatusRules,
} from "../utils/validators";

export interface EscalationStepFormModalProps {
  boundaryId: number;
  defaultStepNumber: number;
  open: boolean;
  target: AcademicStandingEscalationStep | null;
  onClose: () => void;
}

export function EscalationStepFormModal({
  boundaryId,
  defaultStepNumber,
  open,
  target,
  onClose,
}: EscalationStepFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useAcademicStandingEscalationModal(
    boundaryId,
    defaultStepNumber,
    target,
    open,
    onClose,
  );
  const {
    isLoading,
    isEditMode,
    formState,
    transitionStatuses,
    isStatusesLoading,
    semesterTypes,
    isSemesterTypesLoading,
  } = state;
  const { handleSubmit, handleCancel, handleActionTimingModeChange } = actions;

  const timingOptions = [
    {
      value: "ANY_SEMESTER",
      label: "Any Semester Diet (Executes immediately)",
    },
    {
      value: "SESSION_END",
      label: "Session End (Executes at end of academic year / clamped mid-session)",
    },
    {
      value: "SPECIFIC_SEMESTER",
      label: "Specific Semester (Restricted to a designated semester diet)",
    },
  ];

  return (
    <Modal
      title={isEditMode ? "Edit Escalation Step" : "Add Escalation Step"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 520 }}
      destroyOnHidden
      closable
      styles={{
        body: { padding: token.paddingSM },
        header: {
          margin: 0,
          padding: token.paddingSM,
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
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="stepNumber"
                label={
                  <span>
                    Step{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={stepNumberRules}
              >
                <InputNumber
                  min={1}
                  disabled={isEditMode}
                  style={{ width: "100%", height: 40 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={16}>
              <Form.Item
                name="label"
                label={
                  <span>
                    Step Label{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={stepLabelRules}
              >
                <Input
                  placeholder="e.g. Warning 1, Required to Withdraw"
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="studentTransitionStatusId"
                label={
                  <span>
                    Target Student Status{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={stepStatusRules}
              >
                <Select
                  placeholder="Select Transition Status"
                  loading={isStatusesLoading}
                  showSearch
                  optionFilterProp="label"
                  options={transitionStatuses.map((s) => ({
                    value: s.id,
                    label: s.semanticKind && s.semanticKind !== "OTHER"
                      ? `${s.name} (${SEMANTIC_KIND_LABELS[s.semanticKind]})`
                      : s.name,
                  }))}
                  popupRender={(menu) => (
                    <>
                      {menu}
                      <div
                        style={{
                          padding: "8px 12px",
                          borderTop: `1px solid ${token.colorBorderSecondary}`,
                          fontSize: token.fontSizeSM,
                          color: token.colorTextTertiary,
                        }}
                      >
                        Admin-managed statuses (e.g. Deferred, Suspended) cannot be assigned by the engine and are not listed.
                      </div>
                    </>
                  )}
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="actionTimingMode"
                label={
                  <span>
                    Action Timing Mode{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={actionTimingModeRules}
                extra="Session End defers terminal actions until full session conclusion while recording mid-session breaches as deferred clamps."
              >
                <Select
                  options={timingOptions}
                  onChange={handleActionTimingModeChange}
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>
          </Row>

          {formState.actionTimingMode === "SPECIFIC_SEMESTER" && (
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="semesterTypeId"
                  label={
                    <span>
                      Target Semester Type{" "}
                      <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                    </span>
                  }
                  rules={semesterTypeRules}
                >
                  <Select
                    placeholder="Select Semester Type"
                    loading={isSemesterTypesLoading}
                    showSearch
                    optionFilterProp="label"
                    options={semesterTypes.map((st) => ({
                      value: st.id,
                      label: `${st.name} (${st.code})`,
                    }))}
                    style={{ height: 40 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="isTerminal"
                label="Terminal Exit Step"
                valuePropName="checked"
                extra={
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    Enable if this is the final exit rung of the ladder (e.g. Expulsion / Required to Withdraw). Students reaching this step do not escalate further.
                  </Typography.Text>
                }
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
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
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Add Escalation Step"}
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
