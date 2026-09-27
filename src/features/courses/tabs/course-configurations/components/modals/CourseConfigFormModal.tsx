// Feature: course-management
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Form, Input, InputNumber, Modal, Select } from "antd";
import { LevelSelect } from "@/components/ui-kit/data-entry/LevelSelect";
import { SelectNotFoundContent } from "@/shared/ui/SelectNotFoundContent";
import { useCourseConfigFormModal } from "../../hooks/useCourseConfigModal";
import type { CourseConfiguration } from "../../types/course-configuration";
import { courseStatusRules, creditUnitRules } from "../../utils/validators";
import { getOrdinalSemesterName } from "@/shared/utils/semesterOrdinal";
import { useMemo } from "react";

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
  const {
    state,
    actions,
    form,
    courseOptions,
    semesterTypes,
    levels,
    isSemesterTypesLoading,
    prerequisiteOptions,
  } = useCourseConfigFormModal(
    target,
    open,
    onClose,
    prefillLevelId,
    prefillSemesterTypeId,
  );
  const {
    isLoading,
    isEditMode,
    isScoreLocked,
    courseSearch,
    selectedCourse,
    isCoursesLoading,
  } = state;
  const { handleSubmit, handleCancel, handleCourseChange, handleCourseSearch } = actions;

  const watchedLevelId = Form.useWatch("levelId", form);
  const selectedLevel = levels.find((l) => l.id === watchedLevelId);

  const semesterTypeOptions = useMemo(
    () =>
      semesterTypes.map((s) => ({
        value: s.id,
        label: getOrdinalSemesterName(s.sortOrder, selectedLevel?.rankOrder),
      })),
    [semesterTypes, selectedLevel],
  );

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
        {isScoreLocked && (
          <Alert
            type="warning"
            showIcon
            title="Score Records Exist"
            description="This course configuration has recorded student scores or published score sheets. Academic parameters (Level, Semester, Status, Credit Units, Prerequisites) are locked. Only the title override can be updated."
            style={{ marginBottom: 16 }}
          />
        )}
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
              placeholder="Search and select course"
              disabled={isEditMode}
              showSearch
              filterOption={false}
              searchValue={courseSearch}
              onSearch={handleCourseSearch}
              loading={isCoursesLoading}
              options={courseOptions}
              onChange={!isEditMode ? handleCourseChange : undefined}
              notFoundContent={
                <SelectNotFoundContent
                  loading={isCoursesLoading}
                  emptyText="No courses match search"
                />
              }
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Course Title Override (Optional)"
            extra="Leave empty to use the master course title. Set a custom title if this program adapts/borrows this course."
          >
            <Input
              placeholder={
                selectedCourse?.title
                  ? `Defaults to: ${selectedCourse.title}`
                  : "Enter custom course title"
              }
              allowClear
              maxLength={255}
              showCount
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
            <LevelSelect
              placeholder="Select level"
              disabled={isScoreLocked}
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
              disabled={isScoreLocked}
              showSearch
              optionFilterProp="label"
              options={semesterTypeOptions}
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
              disabled={isScoreLocked}
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
            <InputNumber
              min={1}
              precision={0}
              disabled={isScoreLocked}
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            name="prerequisiteIds"
            label="Prerequisites"
            style={{ marginBottom: 0 }}
          >
            <Select
              mode="multiple"
              placeholder="Select prerequisites (optional)"
              disabled={isScoreLocked}
              showSearch
              optionFilterProp="label"
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
