import { ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { AdmissionCycle } from "@/features/admission-config/tabs/admission-cycle/types/admission-cycle";
import type { FormAssignment } from "@/features/dynamic-form/types";
import {
  CANDIDATE_ENTRY_MODE_OPTIONS,
  getCandidateEntryModeLabel,
} from "@/shared/constants/admissionCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import type { AdmissionEntryMode } from "@/shared/types/admission-lane";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { EyeOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  InputNumber,
  List,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAssignmentPanel } from "../hooks/useAssignmentPanel";
import {
  formatAssignmentSlotLabel,
  resolveEffectiveCycleLaneForm,
  type GlobalFormSlot,
} from "../utils/resolveEffectiveFormSlots";

const SHARED_FALLBACK_OPTION = {
  value: "__SHARED__",
  label: "All entry modes (shared fallback)",
};

export function AssignmentPanel() {
  const token = useToken();
  const { state, actions } = useAssignmentPanel();
  const {
    publishedForms,
    formsById,
    cycles,
    assignments,
    selectedFormId,
    selectedEntryMode,
    selectedCycleIds,
    priority,
    globalSlots,
    cycleAssignmentsByCycle,
    slotConflict,
    conflictingAssignments,
    cycleNameById,
    isLoading,
    sectionError,
    isAssigning,
    isDeleting,
    previewTarget,
    previewPackage,
    isPreviewLoading,
    previewErrorMessage,
  } = state;

  const formOptions = publishedForms.map((f) => ({
    value: f.id,
    label: `${f.name} (v${f.version})`,
  }));

  const entryModeSlotOptions = [
    SHARED_FALLBACK_OPTION,
    ...CANDIDATE_ENTRY_MODE_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  ];

  const cycleOptions = cycles.map((cycle) => {
    const isEligible =
      selectedEntryMode === null ||
      Boolean(cycle.entryModes?.some((l) => l.entryMode === selectedEntryMode));

    return {
      value: cycle.id,
      disabled: !isEligible,
      label: isEligible ? cycle.name : `${cycle.name} — lane not configured`,
    };
  });

  const renderAssignmentControls = (assignment: FormAssignment) => (
    <Flex gap={4} align="center" wrap="wrap">
      <PermissionGuard
        permission={[
          Permission.DynamicFormAssignmentsUpdate,
          Permission.DynamicFormAssignmentsManage,
        ]}
      >
        <ConditionalRenderer when={assignment.isActive}>
          <Button
            size="small"
            danger
            type="link"
            onClick={() => actions.handleDeactivate(assignment.id)}
          >
            Deactivate
          </Button>
        </ConditionalRenderer>
        <ConditionalRenderer when={!assignment.isActive}>
          <Button
            size="small"
            type="link"
            onClick={() => actions.handleActivate(assignment.id)}
          >
            Activate
          </Button>
        </ConditionalRenderer>
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

  const globalColumns: ColumnsType<GlobalFormSlot> = [
    {
      title: "Slot",
      dataIndex: "slotLabel",
      key: "slotLabel",
      width: 220,
      render: (label: string) => <Typography.Text strong>{label}</Typography.Text>,
    },
    {
      title: "Assigned form",
      key: "assignedForm",
      render: (_, record) => {
        if (!record.assignment) {
          return (
            <Typography.Text type="secondary">
              No global assignment configured.
            </Typography.Text>
          );
        }
        const form = formsById.get(record.assignment.formId);
        return (
          <Flex gap={8} align="center" wrap="wrap">
            <span>
              {form?.name ?? `Form #${record.assignment.formId}`}
            </span>
            <Tag color={record.assignment.isActive ? "green" : "default"}>
              {record.assignment.isActive ? "Active" : "Inactive"}
            </Tag>
          </Flex>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) =>
        record.assignment ? renderAssignmentControls(record.assignment) : null,
    },
  ];

  const cycleColumns: ColumnsType<AdmissionCycle> = [
    {
      title: "Cycle",
      dataIndex: "name",
      key: "name",
      width: 220,
    },
    {
      title: "Assigned slots",
      key: "assignments",
      render: (_, record) => {
        const list = cycleAssignmentsByCycle.get(record.id) ?? [];
        if (list.length === 0) {
          return (
            <Typography.Text type="secondary">
              Uses GLOBAL defaults
            </Typography.Text>
          );
        }

        return (
          <Flex vertical gap={6}>
            {list.map((assignment) => {
              const form = formsById.get(assignment.formId);
              return (
                <Flex
                  key={assignment.id}
                  gap={8}
                  align="center"
                  wrap="wrap"
                >
                  <Tag>{formatAssignmentSlotLabel(assignment.entryMode)}</Tag>
                  <span>{form?.name ?? `Form #${assignment.formId}`}</span>
                  <Tag color={assignment.isActive ? "green" : "default"}>
                    {assignment.isActive ? "Active" : "Inactive"}
                  </Tag>
                  {renderAssignmentControls(assignment)}
                </Flex>
              );
            })}
          </Flex>
        );
      },
    },
    {
      title: "Effective lane resolution",
      key: "effectiveResolution",
      render: (_, record) => {
        const lanes = record.entryModes ?? [];
        if (lanes.length === 0) {
          return <Typography.Text type="secondary">No lanes</Typography.Text>;
        }

        return (
          <Flex vertical gap={6}>
            {lanes.map((lane) => {
              const resolved = resolveEffectiveCycleLaneForm(
                record.id,
                lane,
                assignments,
                formsById,
              );
              return (
                <Flex
                  key={lane.entryMode}
                  gap={8}
                  align="center"
                  wrap="wrap"
                >
                  <Tag color="blue">
                    {getCandidateEntryModeLabel(lane.entryMode)}
                  </Tag>
                  <ConditionalRenderer when={resolved.winningStep !== null}>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Step {resolved.winningStep}: {resolved.formName}
                    </Typography.Text>
                  </ConditionalRenderer>
                  <ConditionalRenderer when={resolved.isMissingWhileEnabled}>
                    <Tag color="error">Missing form</Tag>
                  </ConditionalRenderer>
                  <ConditionalRenderer
                    when={!resolved.isMissingWhileEnabled && resolved.winningStep === null}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      Paused (no form)
                    </Typography.Text>
                  </ConditionalRenderer>
                  <Button
                    size="small"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      actions.handleOpenPreview(
                        record.id,
                        record.name,
                        lane.entryMode,
                      )
                    }
                  >
                    Preview
                  </Button>
                </Flex>
              );
            })}
          </Flex>
        );
      },
    },
  ];

  return (
    <div>
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        <ConditionalRenderer when={Boolean(sectionError)}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? "Failed to load dynamic form assignments"}
            onRetry={actions.refetchAssignments}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={Boolean(slotConflict)}>
          <ErrorAlert
            variant="section"
            error={slotConflict ?? ""}
            action={
              conflictingAssignments.length > 0 ? (
                <Button
                  size="small"
                  type="primary"
                  onClick={actions.handleRetryAssign}
                >
                  Retry assignment
                </Button>
              ) : undefined
            }
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={Boolean(slotConflict) && conflictingAssignments.length > 0}
        >
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
                const form = formsById.get(assignment.formId);
                const scopeLabel =
                  assignment.assignmentScope === "GLOBAL"
                    ? "GLOBAL"
                    : (cycleNameById.get(
                        assignment.assignmentReferenceId ?? -1,
                      ) ?? `Cycle #${assignment.assignmentReferenceId}`);
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
                      <Tag>{formatAssignmentSlotLabel(assignment.entryMode)}</Tag>
                    </span>
                  </List.Item>
                );
              }}
            />
          </Card>
        </ConditionalRenderer>

        <ExplainerCallout
          intent="info"
          title="Form assignments"
          body="Assign a published template globally or per admission cycle, optionally scoped to UTME, Direct Entry, or Transfer. Resolution checks cycle+mode → cycle shared fallback → global+mode → global shared fallback."
          style={{ marginBottom: 16 }}
        />

        <Card style={{ marginBottom: 16 }}>
          <Flex vertical gap={12}>
            <div>
              <Typography.Text strong>Published template</Typography.Text>
              <Select
                value={selectedFormId ?? undefined}
                onChange={(val) => actions.setSelectedFormId(val ?? null)}
                options={formOptions}
                placeholder="Select a published form"
                style={{ width: "100%", marginTop: 8 }}
                allowClear
              />
            </div>
            <div>
              <Typography.Text strong>Entry mode slot</Typography.Text>
              <Select
                value={selectedEntryMode ?? "__SHARED__"}
                onChange={(val) =>
                  actions.setSelectedEntryMode(
                    val === "__SHARED__"
                      ? null
                      : (val as AdmissionEntryMode),
                  )
                }
                options={entryModeSlotOptions}
                style={{ width: "100%", marginTop: 8 }}
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

        <Card
          title="GLOBAL defaults (by entry mode)"
          style={{ marginBottom: 16 }}
        >
          <Table<GlobalFormSlot>
            rowKey={(row) => row.entryMode ?? "SHARED"}
            columns={globalColumns}
            dataSource={globalSlots}
            pagination={false}
            size="small"
          />
        </Card>

        <Table<AdmissionCycle>
          rowKey="id"
          columns={cycleColumns}
          dataSource={cycles}
          pagination={false}
          size="small"
        />
      </DataLoader>

      <Modal
        open={previewTarget !== null}
        onCancel={actions.handleClosePreview}
        footer={null}
        width={640}
        destroyOnHidden
        title={
          previewTarget
            ? `Lane Runtime Preview — ${previewTarget.cycleName} (${getCandidateEntryModeLabel(previewTarget.entryMode)})`
            : "Lane Runtime Preview"
        }
      >
        <DataLoader
          loading={isPreviewLoading}
          loader={<SkeletonRows count={3} />}
        >
          <ConditionalRenderer when={Boolean(previewErrorMessage)}>
            <ErrorAlert
              variant="section"
              error={previewErrorMessage ?? "No form resolved for this lane."}
            />
          </ConditionalRenderer>
          <ConditionalRenderer
            when={!previewErrorMessage && Boolean(previewPackage)}
          >
            <Flex vertical gap={12}>
              <Flex gap={8} align="center" wrap="wrap">
                <Tag color="blue">
                  Resolved slot:{" "}
                  {formatAssignmentSlotLabel(
                    previewPackage?.assignment.entryMode ?? null,
                  )}
                </Tag>
                <Tag>
                  Scope: {previewPackage?.assignment.assignmentScope}
                </Tag>
                <Typography.Text strong>
                  {previewPackage?.form.name} (v{previewPackage?.form.version})
                </Typography.Text>
              </Flex>
              <List
                size="small"
                bordered
                dataSource={previewPackage?.sections ?? []}
                renderItem={(section) => (
                  <List.Item>
                    <Flex vertical gap={2}>
                      <Typography.Text strong>
                        Step {section.stepOrder}: {section.title}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                      >
                        {section.fields.length} field
                        {section.fields.length === 1 ? "" : "s"}
                      </Typography.Text>
                    </Flex>
                  </List.Item>
                )}
              />
            </Flex>
          </ConditionalRenderer>
        </DataLoader>
      </Modal>
    </div>
  );
}
