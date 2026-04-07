// Feature: program-graduation-config
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { useProgramFormModal } from "../../hooks/useProgramModal";
import type { Program } from "../../types/program";
import {
    degreeTitleRules,
    durationRules,
    maxResidencyRules,
    nameRules,
} from "../../utils/validators";

export type ProgramFormModalProps = {
  open: boolean;
  /** null = create mode, Program = edit mode */
  target: Program | null;
  onClose: () => void;
  /** Optional pre-filled departmentId (used when opening from Accordion "Add Program") */
  defaultDepartmentId?: number;
};

export function ProgramFormModal({ open, target, onClose, defaultDepartmentId }: ProgramFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useProgramFormModal(target, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  // Track durationInYears for dynamic maxResidency helper text and rules
  const [durationInYears, setDurationInYears] = useState<number>(1);

  // Sync durationInYears from form when editing
  useEffect(() => {
    if (open && target) {
      setDurationInYears(target.durationInYears ?? 1);
    }
    if (!open) {
      setDurationInYears(1);
    }
  }, [open, target]);

  // Pre-fill defaultDepartmentId in create mode
  useEffect(() => {
    if (open && !target && defaultDepartmentId !== undefined) {
      form.setFieldValue("departmentId", defaultDepartmentId);
    }
  }, [open, target, defaultDepartmentId, form]);

  const { data: departmentsData, isLoading: isDepartmentsLoading } = useGetDepartmentsQuery({
    itemsPerPage: 200,
  });
  const departments = departmentsData?.member ?? [];

  const maxResidencyCeiling = Math.floor(durationInYears * 1.5 + 1);
  const maxResidencyHelperText = `Max residency must be between ${durationInYears + 1} and ${maxResidencyCeiling} years`;

  return (
    <Modal
      title={isEditMode ? "Edit Program" : "Create Program"}
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

          <Form.Item
            name="name"
            label={
              <span>
                Name <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={nameRules}
          >
            <Input placeholder="e.g. B.Sc Computer Science" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="degreeTitle"
            label={
              <span>
                Degree Title <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={degreeTitleRules}
          >
            <Input placeholder="e.g. Bachelor of Science" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="durationInYears"
            label={
              <span>
                Duration (years) <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={durationRules}
          >
            <InputNumber
              min={1}
              max={10}
              precision={0}
              style={{ width: "100%", height: 40 }}
              placeholder="e.g. 4"
              onChange={(val) => {
                if (typeof val === "number") {
                  setDurationInYears(val);
                  // Re-validate maxResidencyYears when duration changes
                  form.validateFields(["maxResidencyYears"]).catch(() => {});
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="maxResidencyYears"
            label={
              <span>
                Max Residency (years) <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={maxResidencyRules(durationInYears)}
            extra={maxResidencyHelperText}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              min={1}
              precision={0}
              style={{ width: "100%", height: 40 }}
              placeholder={`e.g. ${durationInYears + 1}`}
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
          {isEditMode ? "Save Changes" : "Create Program"}
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
