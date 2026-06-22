import { ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Card, Flex, InputNumber, List, Select, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAssignmentPanel } from "../hooks/useAssignmentPanel";

export function AssignmentPanel() {
  const { state, actions } = useAssignmentPanel();
  const {
    publishedForms,
    cycles,
    selectedFormId,
    selectedCycleIds,
    priority,
    globalAssignment,
    cycleAssignments,
    slotConflict,
    conflictingAssignments,
    cycleNameById,
    isAssigning,
    isDeleting,
  } = state;

  const formOptions = publishedForms.map((f) => ({
    value: f.id,
    label: `${f.name} (v${f.version})`,
  }));

  const cycleOptions = cycles.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const columns: ColumnsType<(typeof cycles)[number]> = [
    { title: "Cycle", dataIndex: "name", key: "name" },
    {
      title: "Active form",
      key: "assignment",
      render: (_, record) => {
        const assignment = cycleAssignments.get(record.id);
        if (!assignment) return <Typography.Text type="secondary">—</Typography.Text>;
        const form = publishedForms.find((f) => f.id === assignment.formId);
        return (
          <Flex gap={8} align="center" wrap="wrap">
            <span>{form?.name ?? `Form #${assignment.formId}`}</span>
            <Tag color={assignment.isActive ? "green" : "default"}>
              {assignment.isActive ? "Active" : "Inactive"}
            </Tag>
            <PermissionGuard
              permission={[
                Permission.DynamicFormAssignmentsUpdate,
                Permission.DynamicFormAssignmentsManage,
              ]}
            >
              {assignment.isActive ? (
                <Button
                  size="small"
                  danger
                  type="link"
                  onClick={() => actions.handleDeactivate(assignment.id)}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  size="small"
                  type="link"
                  onClick={() => actions.handleActivate(assignment.id)}
                >
                  Activate
                </Button>
              )}
            </PermissionGuard>
            <PermissionGuard
              permission={[
                Permission.DynamicFormAssignmentsDelete,
                Permission.DynamicFormAssignmentsManage,
              ]}
            >
              <Button
                size="small"
                danger
                type="link"
                loading={isDeleting}
                onClick={() => actions.handleDelete(assignment)}
              >
                Delete
              </Button>
            </PermissionGuard>
          </Flex>
        );
      },
    },
  ];

  return (
    <div>
      {slotConflict && (
        <ErrorAlert
          variant="section"
          error={slotConflict}
          action={
            conflictingAssignments.length > 0 ? (
              <Button size="small" type="primary" onClick={actions.handleRetryAssign}>
                Retry assignment
              </Button>
            ) : undefined
          }
        />
      )}

      {slotConflict && conflictingAssignments.length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <List
            size="small"
            header={
              <Typography.Text strong>
                Deactivate the conflicting active assignment(s), then retry
              </Typography.Text>
            }
            dataSource={conflictingAssignments}
            renderItem={(assignment) => {
              const form = publishedForms.find((f) => f.id === assignment.formId);
              const scopeLabel =
                assignment.assignmentScope === "GLOBAL"
                  ? "GLOBAL"
                  : (cycleNameById.get(assignment.assignmentReferenceId ?? -1) ??
                    `Cycle #${assignment.assignmentReferenceId}`);
              return (
                <List.Item
                  actions={[
                    <PermissionGuard
                      key="deactivate"
                      permission={[
                        Permission.DynamicFormAssignmentsUpdate,
                        Permission.DynamicFormAssignmentsManage,
                      ]}
                    >
                      <Button
                        size="small"
                        danger
                        onClick={() => actions.handleDeactivate(assignment.id)}
                      >
                        Deactivate
                      </Button>
                    </PermissionGuard>,
                    <PermissionGuard
                      key="delete"
                      permission={[
                        Permission.DynamicFormAssignmentsDelete,
                        Permission.DynamicFormAssignmentsManage,
                      ]}
                    >
                      <Button
                        size="small"
                        danger
                        loading={isDeleting}
                        onClick={() => actions.handleDelete(assignment)}
                      >
                        Delete
                      </Button>
                    </PermissionGuard>,
                  ]}
                >
                  <span>
                    {form?.name ?? `Form #${assignment.formId}`}{" "}
                    <Tag>{scopeLabel}</Tag>
                  </span>
                </List.Item>
              );
            }}
          />
        </Card>
      )}

      <ExplainerCallout
        intent="info"
        title="Form assignments"
        body="Assign a published template to admission cycles. A GLOBAL fallback applies when no cycle-specific assignment exists."
        style={{ marginBottom: 16 }}
      />

      <Card style={{ marginBottom: 16 }}>
        <Flex vertical gap={12}>
          <div>
            <Typography.Text strong>Published template</Typography.Text>
            <Select
              value={selectedFormId ?? undefined}
              onChange={actions.setSelectedFormId}
              options={formOptions}
              placeholder="Select a published form"
              style={{ width: "100%", marginTop: 8 }}
              allowClear
            />
          </div>
          <div>
            <Typography.Text strong>Admission cycles</Typography.Text>
            <Select
              mode="multiple"
              value={selectedCycleIds}
              onChange={actions.setSelectedCycleIds}
              options={cycleOptions}
              placeholder="Select cycles"
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
          <div>
            <Typography.Text strong>Priority</Typography.Text>
            <InputNumber
              value={priority}
              onChange={(v) => actions.setPriority(v ?? 100)}
              min={1}
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
          <PermissionGuard
            permission={[
              Permission.DynamicFormAssignmentsCreate,
              Permission.DynamicFormAssignmentsManage,
            ]}
          >
            <Flex gap={8}>
              <Button
                type="primary"
                loading={isAssigning}
                disabled={!selectedFormId || selectedCycleIds.length === 0}
                onClick={actions.handleBulkAssign}
              >
                Assign to cycles
              </Button>
              <Button
                loading={isAssigning}
                disabled={!selectedFormId}
                onClick={actions.handleAssignGlobal}
              >
                Set GLOBAL fallback
              </Button>
            </Flex>
          </PermissionGuard>
        </Flex>
      </Card>

      <Card title="GLOBAL fallback" style={{ marginBottom: 16 }}>
        {globalAssignment ? (
          <Flex justify="space-between" align="center">
            <span>
              Form #{globalAssignment.formId}{" "}
              <Tag color={globalAssignment.isActive ? "green" : "default"}>
                {globalAssignment.isActive ? "Active" : "Inactive"}
              </Tag>
            </span>
            <Flex gap={8}>
              <PermissionGuard
                permission={[
                  Permission.DynamicFormAssignmentsUpdate,
                  Permission.DynamicFormAssignmentsManage,
                ]}
              >
                {globalAssignment.isActive ? (
                  <Button
                    danger
                    size="small"
                    onClick={() => actions.handleDeactivate(globalAssignment.id)}
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="small"
                    onClick={() => actions.handleActivate(globalAssignment.id)}
                  >
                    Activate
                  </Button>
                )}
              </PermissionGuard>
              <PermissionGuard
                permission={[
                  Permission.DynamicFormAssignmentsDelete,
                  Permission.DynamicFormAssignmentsManage,
                ]}
              >
                <Button
                  danger
                  size="small"
                  loading={isDeleting}
                  onClick={() => actions.handleDelete(globalAssignment)}
                >
                  Delete
                </Button>
              </PermissionGuard>
            </Flex>
          </Flex>
        ) : (
          <Typography.Text type="secondary">No global assignment configured.</Typography.Text>
        )}
      </Card>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={cycles}
        pagination={false}
        size="small"
      />
    </div>
  );
}
