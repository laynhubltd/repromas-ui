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
  Radio,
  Select,
  Tag,
  Typography,
} from "antd";
import { usePolicyFormModal } from "../../hooks/usePolicyModal";
import type { CourseAssessmentPolicy } from "../../types/course-assessment-policy";
import {
  breakdownNameRules,
  totalWeightPercentageRules,
  validateConfigId,
  validateScoreCapValue,
} from "../../utils/validators";
// ─── Constants ────────────────────────────────────────────────────────────────

const CALCULATION_METHOD_OPTIONS = [
  { value: "WEIGHTED_SUM", label: "Weighted Sum" },
  { value: "AVERAGE", label: "Average" },
  { value: "BEST_OF", label: "Best Of" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export type PolicyFormModalProps = {
  open: boolean;
  /** null = create mode, CourseAssessmentPolicy = edit mode */
  target: CourseAssessmentPolicy | null;
  onClose: () => void;
};

/**
 * PolicyFormModal — view-only upsert modal for CourseAssessmentPolicy.
 * All logic is delegated to usePolicyFormModal.
 *
 * Create mode: all fields editable with defaults.
 * Edit mode: scope and configId rendered as read-only text.
 *
 * Requirements: 5.1–5.16, 12.4, 12.9
 */
export function PolicyFormModal({
  open,
  target,
  onClose,
}: PolicyFormModalProps) {
  const token = useToken();
  const {
    state,
    actions,
    form,
    programs,
    isProgramsLoading,
    versions,
    isVersionsLoading,
    courseConfigs,
    isCourseConfigsLoading,
  } = usePolicyFormModal(target, open, onClose);

  const {
    isEditMode,
    isSubmitting,
    formError,
    scopeValue,
    applyScoreCapOnVetoValue,
    selectedProgramId,
    selectedVersionId,
    bothSelected,
  } = state;

  const {
    handleSubmit,
    handleClose,
    handleScopeChange,
    handleScoreCapToggle,
    handleProgramChange,
    handleVersionChange,
    handleConfigSearch,
  } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Assessment Policy" : "Create Assessment Policy"}
      open={open}
      onCancel={handleClose}
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
        <ErrorAlert error={formError} />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          {/* ── Scope ──────────────────────────────────────────────────── */}
          {isEditMode ? (
            <Form.Item label="Scope">
              <Tag color={target?.scope === "GLOBAL" ? "purple" : "blue"}>
                {target?.scope ?? "—"}
              </Tag>
            </Form.Item>
          ) : (
            <Form.Item
              name="scope"
              label={
                <span>
                  Scope{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: "Scope is required" }]}
              initialValue="COURSE"
            >
              <Radio.Group
                onChange={(e) => handleScopeChange(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="COURSE">Course</Radio.Button>
                <Radio.Button value="GLOBAL">Global</Radio.Button>
              </Radio.Group>
            </Form.Item>
          )}

          {/* ── Config ID ──────────────────────────────────────────────── */}
          {isEditMode ? (
            <Form.Item label="Course Configuration">
              <Typography.Text>
                {target?.configId != null ? (
                  target?.courseConfig?.course ? (
                    `${target.courseConfig.course.code} → ${target.courseConfig.course.title}`
                  ) : (
                    `Config #${target.configId}`
                  )
                ) : (
                  <Typography.Text type="secondary">
                    — (Global policy)
                  </Typography.Text>
                )}
              </Typography.Text>
            </Form.Item>
          ) : scopeValue === "COURSE" ? (
            <>
              {/* Program selector */}
              <Form.Item
                label={
                  <span>
                    Program{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>
                      *
                    </span>
                  </span>
                }
              >
                <Select
                  placeholder="Select program"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={isProgramsLoading}
                  value={selectedProgramId}
                  onChange={(val: number | undefined) =>
                    handleProgramChange(val)
                  }
                  style={{ height: 40 }}
                  options={programs.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                />
              </Form.Item>

              {/* Curriculum version selector */}
              <Form.Item
                label={
                  <span>
                    Curriculum Version{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>
                      *
                    </span>
                  </span>
                }
              >
                <Select
                  placeholder="Select curriculum version"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  loading={isVersionsLoading}
                  disabled={selectedProgramId === undefined}
                  value={selectedVersionId}
                  onChange={(val: number | undefined) =>
                    handleVersionChange(val)
                  }
                  style={{ height: 40 }}
                  options={versions.map((v) => ({
                    value: v.id,
                    label: v.name,
                  }))}
                />
              </Form.Item>

              {/* Course configuration dropdown — server-side search */}
              <Form.Item
                name="configId"
                label={
                  <span>
                    Course Configuration{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>
                      *
                    </span>
                  </span>
                }
                rules={validateConfigId(scopeValue)}
              >
                <Select
                  placeholder={
                    !bothSelected
                      ? "Select program and version first"
                      : "Search by course code…"
                  }
                  disabled={!bothSelected}
                  loading={isCourseConfigsLoading}
                  showSearch
                  filterOption={false}
                  onSearch={handleConfigSearch}
                  style={{ height: 40 }}
                  options={courseConfigs.map((config) => ({
                    value: config.id,
                    label: config.course
                      ? `${config.course.code} ${config.course.title}`
                      : `Config #${config.id}`,
                  }))}
                  allowClear
                />
              </Form.Item>
            </>
          ) : (
            // GLOBAL scope — configId field hidden (will be null on submit)
            <Form.Item name="configId" hidden>
              <InputNumber />
            </Form.Item>
          )}

          {/* ── Breakdown Name ─────────────────────────────────────────── */}
          <Form.Item
            name="breakdownName"
            label={
              <span>
                Breakdown Name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={breakdownNameRules}
          >
            <Input
              placeholder="e.g. Standard Assessment Breakdown"
              maxLength={100}
            />
          </Form.Item>

          {/* ── Calculation Method ─────────────────────────────────────── */}
          <Form.Item
            name="calculationMethod"
            label={
              <span>
                Calculation Method{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={[
              { required: true, message: "Calculation method is required" },
            ]}
          >
            <Select
              placeholder="Select calculation method"
              style={{ height: 40 }}
              options={CALCULATION_METHOD_OPTIONS}
            />
          </Form.Item>

          {/* ── Total Weight Percentage ────────────────────────────────── */}
          <Form.Item
            name="totalWeightPercentage"
            label={
              <span>
                Total Weight Percentage{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={totalWeightPercentageRules}
          >
            <InputNumber
              min={0.01}
              max={100}
              precision={2}
              style={{ width: "100%", height: 40 }}
              addonAfter="%"
            />
          </Form.Item>

          {/* ── Fail Course If Component Fails ─────────────────────────── */}
          <Form.Item name="failCourseIfComponentFails" valuePropName="checked">
            <Checkbox>Fail course if any component fails</Checkbox>
          </Form.Item>

          {/* ── Apply Score Cap On Veto ────────────────────────────────── */}
          <Form.Item name="applyScoreCapOnVeto" valuePropName="checked">
            <Checkbox onChange={(e) => handleScoreCapToggle(e.target.checked)}>
              Apply score cap on veto
            </Checkbox>
          </Form.Item>

          {/* ── Score Cap Value ────────────────────────────────────────── */}
          <Form.Item
            name="scoreCapValue"
            label={
              <span>
                Score Cap Value{" "}
                {applyScoreCapOnVetoValue && (
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                )}
              </span>
            }
            rules={validateScoreCapValue(applyScoreCapOnVetoValue)}
          >
            <InputNumber
              min={0}
              max={99.99}
              precision={2}
              disabled={!applyScoreCapOnVetoValue}
              style={{ width: "100%", height: 40 }}
              addonAfter="%"
              placeholder={applyScoreCapOnVetoValue ? "e.g. 39" : "—"}
            />
          </Form.Item>
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
          {isEditMode ? "Save Changes" : "Create Policy"}
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
