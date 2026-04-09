// Feature: course-management
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, InputNumber, Modal, Select } from "antd";
import { useCourseConfigFormModal } from "../../hooks/useCourseConfigModal";
import type { CourseConfiguration } from "../../types/course-configuration";
import { courseStatusRules, creditUnitRules } from "../../utils/validators";

export type CourseConfigFormModalProps = {
  open: boolean;
  /** null = create mode, CourseConfiguration = edit mode */
  target: CourseConfiguration | null;
  onClose: () => void;
  programId?: number;
  versionId?: number;
  prefillLevelId?: number;
  prefillSemesterTypeId?: number;
};

const COURSE_STATUS_OPTIONS = [
  { value: "CORE", label: "Core" },
  { value: "ELECTIVE", label: "Elective" },
  { value: "REQUIRED", label: "Required" },
  { value: "PREREQUISITE", label: "Prerequisite" },
];

export function CourseConfigFormModal({
  open,
  target,
  onClose,
  programId,
  versionId,
  prefillLevelId,
  prefillSemesterTypeId,
}: CourseConfigFormModalProps) {
  const token = useToken();
  const { state, actions, form, courses, levels, isLevelsLoading, semesterTypes, isSemesterTypesLoading, prerequisiteOptions } = useCourseConfigFormModal(
    target,
    open,
    onClose,
    prefillLevelId,
    prefillSemesterTypeId,
  );
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel, handleCourseChange } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Configuration" : "Add Course"}
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
        <ErrorAlert error={formError} />
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={() => {
            if (programId !== undefined && versionId !== undefined) {
              handleSubmit(programId, versionId);
            }
          }}
        >
          {/* Course — editable in create, disabled in edit */}
          <Form.Item
            name="courseId"
            label={
              <span>
                Course <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Course is required" }]}
          >
            <Select
              placeholder="Select course"
              disabled={isEditMode}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={courses.map((c) => ({ value: c.id, label: `${c.code} ${c.title}` }))}
              onChange={!isEditMode ? handleCourseChange : undefined}
            />
          </Form.Item>

          <Form.Item
            name="levelId"
            label={
              <span>
                Level <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Level is required" }]}
          >
            <Select
              placeholder="Select level"
              loading={isLevelsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={levels.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>

          <Form.Item
            name="semesterTypeId"
            label={
              <span>
                Semester Type <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Semester type is required" }]}
          >
            <Select
              placeholder="Select semester type"
              loading={isSemesterTypesLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={semesterTypes.map((s) => ({ value: s.id, label: s.name }))}
            />
          </Form.Item>

          <Form.Item
            name="courseStatus"
            label={
              <span>
                Course Status <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={courseStatusRules}
          >
            <Select
              placeholder="Select course status"
              style={{ height: 40 }}
              options={COURSE_STATUS_OPTIONS}
            />
          </Form.Item>

          <Form.Item
            name="creditUnit"
            label={
              <span>
                Credit Units <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={creditUnitRules}
          >
            <InputNumber min={1} precision={0} style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <Form.Item
            name="prerequisiteIds"
            label="Prerequisites"
            style={{ marginBottom: 0 }}
          >
            <Select
              mode="multiple"
              placeholder="Select prerequisites (optional)"
              showSearch
              optionFilterProp="label"
              style={{ minHeight: 40 }}
              options={prerequisiteOptions}
            />
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
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Add Course"}
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
