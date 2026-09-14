// Feature: settings/tabs/approval-workflows
import { useToken } from "@/shared/hooks/useToken";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import type {
  UpsertWorkflowStepRequest,
  WorkflowStepConfigDto,
} from "../types/workflow-config";
import { stateCodeRules, stepNameRules } from "../utils/validators";

type WorkflowStepsEditorProps = {
  steps: WorkflowStepConfigDto[];
  isSaving: boolean;
  onSaveStep: (step: Omit<UpsertWorkflowStepRequest, "definitionId">) => Promise<void>;
  onDeleteStep: (stepId: number) => Promise<void>;
};

export function WorkflowStepsEditor({
  steps,
  isSaving,
  onSaveStep,
  onDeleteStep,
}: WorkflowStepsEditorProps) {
  const token = useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WorkflowStepConfigDto | null>(null);
  const [form] = Form.useForm();

  const handleOpenAdd = () => {
    setEditingStep(null);
    form.resetFields();
    form.setFieldsValue({
      name: "",
      stateCode: "",
      sequenceOrder: steps.length + 1,
      isInitial: steps.length === 0,
      isTerminal: false,
      isEditable: steps.length === 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (step: WorkflowStepConfigDto) => {
    setEditingStep(step);
    form.setFieldsValue({
      name: step.label || step.name || step.stateCode || "",
      stateCode: step.stateCode || "",
      sequenceOrder: step.sortOrder ?? step.sequenceOrder ?? 1,
      isInitial: Boolean(step.isInitial),
      isTerminal: Boolean(step.isTerminal),
      isEditable: Boolean(step.isEditable),
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSaveStep({
        id: editingStep?.id,
        name: values.name,
        label: values.name,
        stateCode: values.stateCode?.trim().toUpperCase(),
        sequenceOrder: values.sequenceOrder,
        sortOrder: values.sequenceOrder,
        isInitial: Boolean(values.isInitial),
        isTerminal: Boolean(values.isTerminal),
        isEditable: Boolean(values.isEditable),
      });
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      // Form validation error
    }
  };

  const columns = [
    {
      title: "Order",
      key: "order",
      width: 95,
      align: "center" as const,
      render: (_: unknown, record: WorkflowStepConfigDto) => {
        const order = record.sortOrder ?? record.sequenceOrder ?? 1;
        return (
          <Tag color="blue" style={{ fontWeight: 600 }}>
            Step {order}
          </Tag>
        );
      },
    },
    {
      title: "Step Name",
      key: "name",
      render: (_: unknown, record: WorkflowStepConfigDto) => {
        const displayName =
          record.label || record.name || record.stateCode || `Step ${record.id}`;
        return (
          <Flex vertical gap={2}>
            <Typography.Text strong>{displayName}</Typography.Text>
            {record.stateCode && (
              <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                <code>{record.stateCode}</code>
              </Typography.Text>
            )}
            {record.inUseCount && record.inUseCount > 0 ? (
              <Tag color="orange" style={{ width: "fit-content" }}>
                {record.inUseCount} records currently in this step
              </Tag>
            ) : null}
          </Flex>
        );
      },
    },
    {
      title: "Attributes",
      key: "attributes",
      render: (_: unknown, record: WorkflowStepConfigDto) => (
        <Flex gap={4} wrap="wrap">
          {record.isInitial && <Tag color="cyan">Initial</Tag>}
          {record.isTerminal && <Tag color="green">Terminal</Tag>}
          {record.isEditable ? (
            <Tag color="purple">Score Editable</Tag>
          ) : (
            <Tag>Score Locked</Tag>
          )}
        </Flex>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 110,
      align: "right" as const,
      render: (_: unknown, record: WorkflowStepConfigDto) => (
        <Flex justify="flex-end" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Delete step?"
            description="Are you sure you want to delete this step?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDeleteStep(record.id)}
            disabled={Boolean(record.inUseCount && record.inUseCount > 0)}
          >
            <Tooltip
              title={
                record.inUseCount && record.inUseCount > 0
                  ? "Cannot delete: active records are in this step"
                  : undefined
              }
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                disabled={Boolean(record.inUseCount && record.inUseCount > 0)}
              />
            </Tooltip>
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: token.paddingMD,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: token.marginMD }}>
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Workflow Steps
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Define sequential review stages from initial submission to terminal publication.
          </Typography.Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
        >
          Add Step
        </Button>
      </Flex>

      <Table
        rowKey="id"
        dataSource={steps}
        columns={columns}
        pagination={false}
        size="small"
      />

      {/* Step Upsert Modal */}
      <Modal
        open={isModalOpen}
        title={editingStep ? `Edit Step: ${editingStep.name}` : "Add Workflow Step"}
        okText={editingStep ? "Save Changes" : "Add Step"}
        okButtonProps={{ loading: isSaving }}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: token.marginMD }}>
          <Form.Item name="name" label="Step Name" rules={stepNameRules}>
            <Input placeholder="e.g. Department Board Review" />
          </Form.Item>

          <Form.Item
            name="stateCode"
            label="State Code"
            rules={stateCodeRules}
            extra="Unique state identifier used for transitions and tracking (e.g. SUBMITTED, HOD_APPROVED)"
          >
            <Input
              placeholder="e.g. HOD_APPROVED"
              style={{ textTransform: "uppercase" }}
              onChange={(e) => {
                form.setFieldValue("stateCode", e.target.value.toUpperCase());
              }}
            />
          </Form.Item>

          <Form.Item
            name="sequenceOrder"
            label="Sequence Order"
            rules={[{ required: true, message: "Sequence order is required" }]}
          >
            <InputNumber min={1} max={50} style={{ width: "100%" }} />
          </Form.Item>

          <Flex vertical gap={token.marginXS} style={{ marginTop: token.marginSM }}>
            <Form.Item name="isInitial" valuePropName="checked" style={{ marginBottom: 4 }}>
              <Checkbox>Initial Step (Entry point where submissions start)</Checkbox>
            </Form.Item>

            <Form.Item name="isTerminal" valuePropName="checked" style={{ marginBottom: 4 }}>
              <Checkbox>Terminal Step (Final published approval state)</Checkbox>
            </Form.Item>

            <Form.Item name="isEditable" valuePropName="checked" style={{ marginBottom: 0 }}>
              <Checkbox>Score Editable (Allows lecturers to edit marks while in this step)</Checkbox>
            </Form.Item>
          </Flex>
        </Form>
      </Modal>
    </div>
  );
}
