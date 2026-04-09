// Feature: course-management
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useAccessControl } from "@/features/access-control";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import { useCourseFormModal } from "../../hooks/useCourseModal";
import type { Course } from "../../types/course";
import { codeRules, creditUnitsRules, titleRules } from "../../utils/validators";

export type CourseFormModalProps = {
  open: boolean;
  /** null = create mode, Course = edit mode */
  target: Course | null;
  onClose: () => void;
};

export function CourseFormModal({ open, target, onClose }: CourseFormModalProps) {
  const token = useToken();
  const { activeRole } = useAccessControl();
  const showDepartmentField = activeRole?.scope === "GLOBAL" || activeRole?.scope === "FACULTY";
  const { state, actions, form } = useCourseFormModal(target, open, onClose, showDepartmentField);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  const { data: departmentsData, isLoading: isDepartmentsLoading } = useGetDepartmentsQuery(
    { sort: "name:asc", itemsPerPage: 100 },
    { skip: !open || !showDepartmentField },
  );
  const departments = departmentsData?.member ?? [];

  return (
    <Modal
      title={isEditMode ? "Edit Course" : "Create Course"}
      open={open}
      onCancel={handleCancel}
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
        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <ConditionalRenderer when={showDepartmentField}>
            <Form.Item
              name="departmentId"
              label={
                <span>
                  Department <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Department is required" }]}
            >
              <Select
                placeholder="Select department"
                loading={isDepartmentsLoading}
                showSearch
                optionFilterProp="label"
                style={{ height: 40 }}
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
              />
            </Form.Item>
          </ConditionalRenderer>

          <Form.Item
            name="code"
            label={
              <span>
                Code <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={codeRules}
          >
            <Input placeholder="e.g. CSC 101" maxLength={20} style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="title"
            label={
              <span>
                Title <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={titleRules}
          >
            <Input
              placeholder="e.g. Introduction to Computer Science"
              maxLength={150}
              style={{ height: 40 }}
            />
          </Form.Item>

          <Form.Item
            name="creditUnits"
            label={
              <span>
                Credit Units <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={creditUnitsRules}
          >
            <InputNumber min={1} max={6} precision={0} style={{ width: "100%", height: 40 }} />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Is Active"
            valuePropName="checked"
            initialValue={true}
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
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Create Course"}
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
