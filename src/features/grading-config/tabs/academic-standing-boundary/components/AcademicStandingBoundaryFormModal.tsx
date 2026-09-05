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
import { useAcademicStandingBoundaryModal } from "../hooks/useAcademicStandingBoundaryModal";
import type { AcademicStandingBoundary } from "../types/academic-standing-boundary";
import {
  boundaryNameRules,
  maxCarryoverRules,
  minCgpaRules,
  statusIdRules,
} from "../utils/validators";

export interface AcademicStandingBoundaryFormModalProps {
  policyId: number;
  policyMaxCgpa: number;
  open: boolean;
  target: AcademicStandingBoundary | null;
  onClose: () => void;
}

export function AcademicStandingBoundaryFormModal({
  policyId,
  policyMaxCgpa,
  open,
  target,
  onClose,
}: AcademicStandingBoundaryFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useAcademicStandingBoundaryModal(
    policyId,
    target,
    open,
    onClose,
  );
  const { isLoading, isEditMode, transitionStatuses, isStatusesLoading } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Tier Boundary" : "Add Tier Boundary"}
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
            <Col xs={24}>
              <Form.Item
                name="name"
                label={
                  <span>
                    Tier Name{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={boundaryNameRules}
              >
                <Input placeholder="e.g. Good Standing, Academic Probation" style={{ height: 40 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="minCgpa"
                label={
                  <span>
                    Minimum CGPA{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={minCgpaRules(policyMaxCgpa)}
                extra="Base tier must start at 0.00"
              >
                <InputNumber
                  min={0.0}
                  max={policyMaxCgpa}
                  step={0.01}
                  precision={2}
                  style={{ width: "100%", height: 40 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="studentTransitionStatusId"
                label={
                  <span>
                    Target Status{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={statusIdRules}
              >
                <Select
                  placeholder="Select Status"
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
                name="maxCarryoverCount"
                label="Maximum Allowed Carryover Courses"
                rules={maxCarryoverRules}
                extra="Students exceeding this count will be disqualified from this tier and fall to the next lower tier"
              >
                <InputNumber
                  min={0}
                  placeholder="Unlimited if empty"
                  style={{ width: "100%", height: 40 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item
                name="hasEscalationLadder"
                label="Enable Escalation Ladder"
                valuePropName="checked"
                extra={
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    When enabled, repeated terms falling into this standing follow a multi-step escalation ladder (e.g. Warning 1 → Warning 2 → Required to Withdraw).
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
          {isEditMode ? "Save Changes" : "Add Tier Boundary"}
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
