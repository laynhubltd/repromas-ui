// Feature: settings/tabs/approval-workflows
import { useToken } from "@/shared/hooks/useToken";
import { Form, Input, Modal, Select, Typography } from "antd";
import { useWorkflowFormModal } from "../../hooks/useWorkflowModal";
import type { WorkflowDefinitionDto } from "../../types/workflow-config";
import {
  codeRules,
  nameRules,
  targetEntityRules,
} from "../../utils/validators";

type WorkflowFormModalProps = {
  open: boolean;
  target: WorkflowDefinitionDto | null;
  onClose: () => void;
};

export function WorkflowFormModal({
  open,
  target,
  onClose,
}: WorkflowFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useWorkflowFormModal(target, open, onClose);
  const { isEditMode, isSaving } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      open={open}
      title={
        <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
          {isEditMode ? "Edit Workflow Definition" : "Create Workflow Definition"}
        </Typography.Text>
      }
      okText={isEditMode ? "Save Changes" : "Create Workflow"}
      okButtonProps={{ loading: isSaving }}
      cancelButtonProps={{ disabled: isSaving }}
      onOk={handleSubmit}
      onCancel={handleCancel}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: token.marginMD }}
      >
        <Form.Item name="name" label="Workflow Name" rules={nameRules}>
          <Input placeholder="e.g. Standard Undergraduate Examination Workflow" />
        </Form.Item>

        <Form.Item
          name="code"
          label="Workflow Code"
          rules={codeRules}
          tooltip="Unique identifier code for this workflow"
        >
          <Input
            placeholder="e.g. SCORE_SHEET_UNDERGRADUATE"
            disabled={isEditMode}
            style={{ textTransform: "uppercase" }}
          />
        </Form.Item>

        <Form.Item
          name="targetEntity"
          label="Target Entity"
          rules={targetEntityRules}
        >
          <Select
            disabled={isEditMode}
            options={[
              {
                value: "COURSE_SCORE_SHEET",
                label: "Course Score Sheet (Continuous Assessment & Exam Marks)",
              },
              {
                value: "COHORT_BROADSHEET",
                label: "Cohort Broadsheet (Semester & Session Results)",
              },
            ]}
          />
        </Form.Item>

        <Form.Item name="description" label="Description (Optional)">
          <Input.TextArea
            rows={3}
            placeholder="Brief explanation of this workflow's review and approval lifecycle..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
