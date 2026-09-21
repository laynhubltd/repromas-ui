// Feature: settings/tabs/approval-workflows
import { useGetRolesQuery } from "@/features/role/api/rolesApi";
import type { RoleScope } from "@/features/settings/tabs/rbac-settings/types/rbac";
import { useToken } from "@/shared/hooks/useToken";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
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
  Modal,
  Popconfirm,
  Radio,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import type {
  UpsertWorkflowTransitionRequest,
  WorkflowStepConfigDto,
  WorkflowTransitionConfigDto,
} from "../types/workflow-config";
import { actionLabelRules } from "../utils/validators";

type WorkflowTransitionsEditorProps = {
  steps: WorkflowStepConfigDto[];
  transitions: WorkflowTransitionConfigDto[];
  isSaving: boolean;
  onSaveTransition: (
    transition: Omit<UpsertWorkflowTransitionRequest, "definitionId">,
  ) => Promise<void>;
  onDeleteTransition: (transitionId: number) => Promise<void>;
};

export function WorkflowTransitionsEditor({
  steps,
  transitions,
  isSaving,
  onSaveTransition,
  onDeleteTransition,
}: WorkflowTransitionsEditorProps) {
  const token = useToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransition, setEditingTransition] =
    useState<WorkflowTransitionConfigDto | null>(null);
  const [form] = Form.useForm();

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({
    itemsPerPage: 100,
  });
  const roleOptions =
    rolesData?.member.map((r) => ({
      value: r.id,
      label: r.name,
      scope: r.scope as RoleScope,
    })) ?? [];

  const stepOptions = steps.map((s) => {
    const order = s.sortOrder ?? s.sequenceOrder ?? 1;
    const name = s.label || s.name || s.stateCode || `Step ${s.id}`;
    return {
      value: s.id,
      label: `Step ${order} — ${name}`,
    };
  });

  const stepMap = new Map<number, string>(
    steps.map((s) => [
      s.id,
      s.label || s.name || s.stateCode || `Step ${s.id}`,
    ]),
  );

  const handleOpenAdd = () => {
    setEditingTransition(null);
    form.resetFields();
    form.setFieldsValue({
      actionName: "",
      direction: "FORWARD",
      requiresComment: false,
      preventSelfApproval: true,
      fromStepId: steps[0]?.id,
      toStepId: steps[1]?.id,
      allowedRoleIds: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: WorkflowTransitionConfigDto) => {
    setEditingTransition(t);
    const roleIds =
      t.allowedRoleIds ??
      (t.roleBindings ? t.roleBindings.map((r) => r.roleId) : []);

    form.setFieldsValue({
      actionName: t.actionName || t.actionLabel || t.name || "",
      direction: t.direction,
      fromStepId: t.fromStepId,
      toStepId: t.toStepId,
      allowedRoleIds: roleIds,
      requiresComment: Boolean(t.requiresComment),
      preventSelfApproval: Boolean(
        t.preventSelfTransition ?? t.preventSelfApproval,
      ),
      systemActionCode: t.systemActionCode,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const isReverse = values.direction === "REVERSE";
      const actionName = values.actionName || "Transition";
      const allowedRoleIds: number[] = values.allowedRoleIds ?? [];

      // Auto-derive requiredScope silently from selected role(s)
      const selectedRoles = roleOptions.filter((r) => allowedRoleIds.includes(r.value));
      const uniqueScopes = Array.from(
        new Set(selectedRoles.map((r) => r.scope).filter(Boolean)),
      );
      const derivedScope = uniqueScopes.length === 1 ? uniqueScopes[0] : undefined;

      await onSaveTransition({
        id: editingTransition?.id,
        actionName,
        name: actionName,
        actionLabel: actionName,
        direction: values.direction,
        fromStepId: values.fromStepId,
        toStepId: values.toStepId,
        allowedRoleIds,
        roleBindings: allowedRoleIds.map((roleId: number) => ({
          roleId,
        })),
        requiredScope: derivedScope,
        requiresComment: isReverse ? true : Boolean(values.requiresComment),
        preventSelfTransition: Boolean(values.preventSelfApproval),
        preventSelfApproval: Boolean(values.preventSelfApproval),
        systemActionCode: values.systemActionCode || undefined,
      });
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      // Form validation error
    }
  };

  const columns = [
    {
      title: "Action / Label",
      key: "action",
      render: (_: unknown, record: WorkflowTransitionConfigDto) => {
        const actionTitle =
          record.actionName || record.actionLabel || record.name;
        return (
          <Flex vertical gap={2}>
            <Typography.Text strong>{actionTitle}</Typography.Text>
            {record.systemActionCode && (
              <Typography.Text
                type="secondary"
                style={{ fontSize: 11, fontFamily: "monospace" }}
              >
                [{record.systemActionCode}]
              </Typography.Text>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Direction & Path",
      key: "path",
      render: (_: unknown, record: WorkflowTransitionConfigDto) => {
        const isReverse = record.direction === "REVERSE";
        return (
          <Flex align="center" gap={6} wrap="wrap">
            <Tag
              color={isReverse ? "volcano" : "blue"}
              icon={isReverse ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
            >
              {record.direction}
            </Tag>
            <Tag>{stepMap.get(record.fromStepId) ?? `Step ${record.fromStepId}`}</Tag>
            <ArrowRightOutlined style={{ fontSize: 10, color: token.colorTextTertiary }} />
            <Tag color={isReverse ? "orange" : "green"}>
              {stepMap.get(record.toStepId) ?? `Step ${record.toStepId}`}
            </Tag>
          </Flex>
        );
      },
    },
    {
      title: "Allowed Roles & Scope",
      key: "allowedRoles",
      render: (_: unknown, record: WorkflowTransitionConfigDto) => {
        const roleIds = record.allowedRoleIds ?? [];
        return (
          <Flex vertical gap={4}>
            {roleIds.length === 0 ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Any authenticated actor
              </Typography.Text>
            ) : (
              <Flex gap={4} wrap="wrap">
                {roleIds.map((id) => {
                  const role = roleOptions.find((r) => r.value === id);
                  return (
                    <Tag key={id} color="purple" style={{ margin: 0, fontSize: 11 }}>
                      {role?.label ?? `Role #${id}`}
                    </Tag>
                  );
                })}
              </Flex>
            )}
            {record.requiredScope && (
              <div>
                <Tag color="cyan" style={{ margin: 0, fontSize: 10, fontWeight: 600 }}>
                  Scope: {record.requiredScope}
                </Tag>
              </div>
            )}
          </Flex>
        );
      },
    },
    {
      title: "Rules",
      key: "rules",
      render: (_: unknown, record: WorkflowTransitionConfigDto) => (
        <Flex gap={4} wrap="wrap">
          {record.requiresComment && <Tag color="gold">Mandatory Remark</Tag>}
          {record.preventSelfApproval && <Tag color="cyan">No Self-Approval</Tag>}
        </Flex>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "right" as const,
      render: (_: unknown, record: WorkflowTransitionConfigDto) => (
        <Flex justify="flex-end" gap={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record)}
          />
          <Popconfirm
            title="Delete transition?"
            description="Are you sure you want to delete this transition edge?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => onDeleteTransition(record.id)}
          >
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
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
            Workflow Transitions
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Define directional actions between stages, assigned roles, and review constraints.
          </Typography.Text>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenAdd}
          disabled={steps.length < 2}
        >
          Add Transition
        </Button>
      </Flex>

      <Table
        rowKey="id"
        dataSource={transitions}
        columns={columns}
        pagination={false}
        size="small"
      />

      {/* Transition Upsert Modal */}
      <Modal
        open={isModalOpen}
        title={editingTransition ? "Edit Transition" : "Add Workflow Transition"}
        okText={editingTransition ? "Save Changes" : "Add Transition"}
        okButtonProps={{ loading: isSaving }}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: token.marginMD }}>
          <Form.Item
            name="actionName"
            label="Action Name / Button Label"
            rules={actionLabelRules}
            tooltip="The human-readable label shown on the action button during workflow execution (e.g. Recommend for Approval, Return to Lecturer)"
          >
            <Input placeholder="e.g. Recommend for Approval, Return to Lecturer" />
          </Form.Item>

          <Form.Item name="direction" label="Direction" required>
            <Radio.Group
              onChange={(e) => {
                if (e.target.value === "REVERSE") {
                  form.setFieldsValue({ requiresComment: true });
                }
              }}
            >
              <Radio.Button value="FORWARD">FORWARD (Advance)</Radio.Button>
              <Radio.Button value="REVERSE">REVERSE (Return / Reject)</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Flex gap={token.marginMD}>
            <Form.Item
              name="fromStepId"
              label="From Step"
              rules={[{ required: true, message: "From step is required" }]}
              style={{ flex: 1 }}
            >
              <Select options={stepOptions} placeholder="Select source step" />
            </Form.Item>

            <Form.Item
              name="toStepId"
              label="To Step"
              rules={[{ required: true, message: "To step is required" }]}
              style={{ flex: 1 }}
            >
              <Select options={stepOptions} placeholder="Select destination step" />
            </Form.Item>
          </Flex>

          <Form.Item
            name="allowedRoleIds"
            label="Authorized Roles"
            tooltip="Select roles authorized to trigger this transition. Jurisdiction scope is automatically enforced based on the selected roles."
          >
            <Select
              mode="multiple"
              options={roleOptions}
              loading={isLoadingRoles}
              placeholder="Select roles authorized to trigger this transition..."
              optionRender={(option) => {
                const scope = option.data.scope;
                return (
                  <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                    <Typography.Text>{option.data.label}</Typography.Text>
                    {scope && (
                      <Tag color="cyan" style={{ margin: 0, fontSize: 10, fontWeight: 600 }}>
                        {scope}
                      </Tag>
                    )}
                  </Flex>
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="systemActionCode"
            label="System Action Hook (Optional)"
            tooltip="Automated system side-effect triggered upon transition"
          >
            <Select
              allowClear
              placeholder="Select system action hook (optional)..."
              options={[
                {
                  value: "LOCK_SCORE_SHEET",
                  label: "LOCK_SCORE_SHEET — Lock score sheet against further score edits",
                },
                {
                  value: "VALIDATE_SCORE_COMPLETENESS",
                  label: "VALIDATE_SCORE_COMPLETENESS — Enforce 100% score submission before advancing",
                },
                {
                  value: "PUBLISH_RESULTS",
                  label: "PUBLISH_RESULTS — Publish results and create immutable official snapshot",
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.direction !== curr.direction}
          >
            {({ getFieldValue }) => {
              const isReverse = getFieldValue("direction") === "REVERSE";

              return (
                <Flex vertical gap={token.marginXS}>
                  <Form.Item
                    name="requiresComment"
                    valuePropName="checked"
                    style={{ marginBottom: 4 }}
                  >
                    <Checkbox disabled={isReverse}>
                      Requires Mandatory Remark {isReverse && "(Forced ON for Return/Reject)"}
                    </Checkbox>
                  </Form.Item>

                  <Form.Item
                    name="preventSelfApproval"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Checkbox>
                      Prevent Self-Approval (Actor who submitted cannot approve own submission)
                    </Checkbox>
                  </Form.Item>
                </Flex>
              );
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
