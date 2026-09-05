import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
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
} from "antd";
import { SEMANTIC_KIND_LABELS } from "@/features/settings/tabs/student-transition-status/utils/semanticKindPresentation";
import { useAcademicStandingModal } from "../hooks/useAcademicStandingModal";
import type { AcademicStanding } from "../types/academic-standing";
import {
  maxCgpaRules,
  maxProbationsRules,
  policyNameRules,
  referenceIdRules,
  scopeRules,
} from "../utils/validators";

export interface AcademicStandingFormModalProps {
  open: boolean;
  target: AcademicStanding | null;
  onClose: () => void;
}

export function AcademicStandingFormModal({
  open,
  target,
  onClose,
}: AcademicStandingFormModalProps) {
  const token = useToken();
  const { academicUnit } = useInstitutionTerminology();
  const { state, actions, form } = useAcademicStandingModal(target, open, onClose);
  const {
    isLoading,
    isEditMode,
    formState,
    faculties,
    departments,
    programs,
    levels,
    curriculumVersions,
    nonTerminalStatuses,
  } = state;
  const { handleSubmit, handleCancel, handleScopeChange } = actions;

  const scopeOptions = [
    { value: "GLOBAL", label: "Global (Institution-wide)" },
    { value: "FACULTY", label: `${academicUnit.singular} Scope` },
    { value: "DEPARTMENT", label: "Department Scope" },
    { value: "PROGRAM", label: "Program Scope" },
  ];

  return (
    <Modal
      title={isEditMode ? "Edit Standing Policy" : "Create Standing Policy"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 720 }}
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
                    Policy Name{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={policyNameRules}
              >
                <Input placeholder="e.g. Standard Undergraduate Standing Policy" style={{ height: 40 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="scope"
                label={
                  <span>
                    Scope{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={scopeRules}
              >
                <Select
                  options={scopeOptions}
                  disabled={isEditMode}
                  onChange={handleScopeChange}
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>

            {formState.scope !== "GLOBAL" && (
              <Col xs={24} sm={12}>
                <Form.Item
                  name="referenceId"
                  label={
                    <span>
                      {formState.scope === "FACULTY"
                        ? academicUnit.singular
                        : formState.scope === "DEPARTMENT"
                        ? "Department"
                        : "Program"}{" "}
                      <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                    </span>
                  }
                  rules={referenceIdRules}
                >
                  {formState.scope === "FACULTY" && (
                    <Select
                      placeholder={academicUnit.selectPlaceholder}
                      showSearch
                      optionFilterProp="label"
                      disabled={isEditMode}
                      options={faculties.map((f) => ({
                        value: f.id,
                        label: `${f.name} (${f.code})`,
                      }))}
                      style={{ height: 40 }}
                    />
                  )}
                  {formState.scope === "DEPARTMENT" && (
                    <Select
                      placeholder="Select Department"
                      showSearch
                      optionFilterProp="label"
                      disabled={isEditMode}
                      options={departments.map((d) => ({
                        value: d.id,
                        label: `${d.name} (${d.code})`,
                      }))}
                      style={{ height: 40 }}
                    />
                  )}
                  {formState.scope === "PROGRAM" && (
                    <Select
                      placeholder="Select Program"
                      showSearch
                      optionFilterProp="label"
                      disabled={isEditMode}
                      options={programs.map((p) => ({
                        value: p.id,
                        label: `${p.name} (${p.code})`,
                      }))}
                      style={{ height: 40 }}
                    />
                  )}
                </Form.Item>
              </Col>
            )}

            <Col xs={24} sm={formState.scope === "GLOBAL" ? 12 : 12}>
              <Form.Item
                name="maxCgpa"
                label={
                  <span>
                    Maximum CGPA Scale{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={maxCgpaRules}
              >
                <InputNumber
                  min={1.0}
                  max={10.0}
                  step={0.01}
                  precision={2}
                  style={{ width: "100%", height: 40 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="evaluationPeriod"
                label="Evaluation Period"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: "EACH_SEMESTER", label: "Each Semester (Standard)" },
                    { value: "SESSION_END_ONLY", label: "Session End Only" },
                  ]}
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="maxProbationsPerCareer"
                label="Max Probations Per Career"
                rules={maxProbationsRules}
                extra="Leave empty for unlimited allowed probation terms"
              >
                <InputNumber
                  min={1}
                  placeholder="Unlimited if empty"
                  style={{ width: "100%", height: 40 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="levelId" label="Level Constraint (Optional)">
                <Select
                  allowClear
                  placeholder="Apply to all levels"
                  options={levels.map((l) => ({ value: l.id, label: l.name }))}
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item name="curriculumVersionId" label="Curriculum Version Constraint (Optional)">
                <Select
                  allowClear
                  placeholder="Apply to all curriculum versions"
                  options={curriculumVersions.map((c) => ({
                    value: c.id,
                    label: c.name ?? `Version #${c.id}`,
                  }))}
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lapsedRegistrationStatusId"
                label="Lapsed Registration Status (Participation Guard)"
                extra="Status assigned when a student registers courses but records 0% participation (100% unexcused absence / TCU = 0)."
              >
                <Select
                  allowClear
                  placeholder="Select non-terminal standing (e.g. Absent Without Leave)"
                  showSearch
                  optionFilterProp="label"
                  options={nonTerminalStatuses.map((s) => ({
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

            <Col xs={24} sm={12}>
              <Form.Item
                name="resetOnRecovery"
                label="Reset Breach Counter Upon Recovery"
                valuePropName="checked"
                extra="When enabled, returning to Good Standing clears consecutive probation count."
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
          {isEditMode ? "Save Changes" : "Create Standing Policy"}
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
