// Feature: settings/tabs/approval-workflows
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Tag,
  Typography,
} from "antd";
import { useMemo, useReducer } from "react";
import { useGetWorkflowDefinitionsQuery } from "../api/workflowConfigApi";
import { useWorkflowDefinitionEditor } from "../hooks/useWorkflowDefinitionEditor";
import {
  initialWorkflowFormState,
  WorkflowFormActionType,
  workflowFormReducer,
} from "../state/workflowFormState";
import type { WorkflowDefinitionDto } from "../types/workflow-config";
import { ActivationChecklist } from "./ActivationChecklist";
import { DeleteWorkflowModal } from "./modals/DeleteWorkflowModal";
import { WorkflowFormModal } from "./modals/WorkflowFormModal";
import { WorkflowPreviewLadder } from "./WorkflowPreviewLadder";
import { WorkflowStepsEditor } from "./WorkflowStepsEditor";
import { WorkflowTransitionsEditor } from "./WorkflowTransitionsEditor";

export function WorkflowDefinitionsTab() {
  const token = useToken();
  const [state, dispatch] = useReducer(
    workflowFormReducer,
    initialWorkflowFormState,
  );

  const { data: rawDefinitions, isLoading: isLoadingList } =
    useGetWorkflowDefinitionsQuery();

  const definitions: WorkflowDefinitionDto[] = useMemo(() => {
    if (!rawDefinitions) return [];
    if (Array.isArray(rawDefinitions)) return rawDefinitions;
    const obj = rawDefinitions as unknown as Record<string, unknown>;
    const member = obj.member ?? obj["hydra:member"] ?? obj.data ?? [];
    return Array.isArray(member) ? (member as WorkflowDefinitionDto[]) : [];
  }, [rawDefinitions]);

  const handleSelectDefinition = (id: number | null) => {
    dispatch({ type: WorkflowFormActionType.SelectDefinition, id });
  };

  const handleOpenCreate = () => {
    dispatch({
      type: WorkflowFormActionType.OpenHeaderModal,
      target: null,
    });
  };

  const handleOpenEdit = (def: WorkflowDefinitionDto) => {
    dispatch({
      type: WorkflowFormActionType.OpenHeaderModal,
      target: def,
    });
  };

  const handleOpenDelete = (def: WorkflowDefinitionDto) => {
    dispatch({
      type: WorkflowFormActionType.OpenDeleteModal,
      target: def,
    });
  };

  const handleCloseHeaderModal = () => {
    dispatch({ type: WorkflowFormActionType.CloseHeaderModal });
  };

  const handleCloseDeleteModal = () => {
    dispatch({ type: WorkflowFormActionType.CloseDeleteModal });
  };

  const editor = useWorkflowDefinitionEditor({
    definitionId: state.selectedDefinitionId,
    onSetActivationViolations: (violations) => {
      dispatch({
        type: WorkflowFormActionType.SetActivationViolations,
        violations,
      });
    },
  });

  const selectedDef = definitions.find(
    (d) => d.id === state.selectedDefinitionId,
  );

  return (
    <div style={{ width: "100%" }}>
      {/* ── Level 1: Workflow Cards List ── */}
      <ConditionalRenderer when={state.selectedDefinitionId === null}>
        <Flex vertical gap={token.marginMD}>
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
            <div>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Approval Workflows
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Configure review stages, allowed transitions, and approval authority for examination score sheets and cohort broadsheets.
              </Typography.Text>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
            >
              Create Workflow
            </Button>
          </Flex>

          <DataLoader loading={isLoadingList} loader={<SkeletonRows count={4} />}>
            <Row gutter={[16, 16]}>
              {definitions.map((def) => {
                return (
                  <Col xs={24} md={12} lg={8} key={def.id}>
                    <Card
                      hoverable
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        border: `1px solid ${def.isActive ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                      }}
                      styles={{
                        body: {
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: token.paddingMD,
                        },
                      }}
                      onClick={() => handleSelectDefinition(def.id)}
                    >
                      <div>
                        <Flex justify="space-between" align="flex-start" style={{ marginBottom: token.marginXS }}>
                          <Flex align="center" gap={6}>
                            <BranchesOutlined style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }} />
                            <Typography.Text strong style={{ fontSize: token.fontSize }}>
                              {def.name}
                            </Typography.Text>
                          </Flex>

                          {def.isActive ? (
                            <Badge status="success" text={<strong style={{ color: token.colorSuccess }}>Active</strong>} />
                          ) : (
                            <Badge status="default" text="Draft" />
                          )}
                        </Flex>

                        <div style={{ marginBottom: token.marginSM }}>
                          <Tag color={def.targetEntity === "SCORE_SHEET" ? "blue" : "purple"}>
                            {def.targetEntity === "SCORE_SHEET" ? "Score Sheet" : "Cohort Broadsheet"}
                          </Tag>
                          <Tag style={{ fontFamily: "monospace" }}>{def.code}</Tag>
                          {def.isDefault && <Tag color="gold">Default</Tag>}
                        </div>

                        {def.description && (
                          <Typography.Paragraph
                            type="secondary"
                            ellipsis={{ rows: 2 }}
                            style={{ fontSize: token.fontSizeSM, marginBottom: token.marginSM }}
                          >
                            {def.description}
                          </Typography.Paragraph>
                        )}
                      </div>

                      <Flex justify="space-between" align="center" style={{ marginTop: token.marginSM, paddingTop: token.marginSM, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
                        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                          {def.stepsCount} {def.stepsCount === 1 ? "step" : "steps"} · {def.transitionsCount} transitions
                        </Typography.Text>

                        <Flex gap={4} onClick={(e) => e.stopPropagation()}>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenEdit(def)}
                          />
                          {!def.isDefault && (
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleOpenDelete(def)}
                            />
                          )}
                        </Flex>
                      </Flex>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </DataLoader>
        </Flex>
      </ConditionalRenderer>

      {/* ── Level 2: Workflow Inline Builder ── */}
      <ConditionalRenderer when={state.selectedDefinitionId !== null}>
        <Flex vertical gap={token.marginMD}>
          {/* Builder Top Bar */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
            <Flex align="center" gap={token.marginSM}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => handleSelectDefinition(null)}
              >
                All Workflows
              </Button>

              <Flex vertical gap={0}>
                <Flex align="center" gap={token.marginXS}>
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    {selectedDef?.name ?? "Workflow Builder"}
                  </Typography.Title>
                  {selectedDef?.isActive ? (
                    <Tag color="green" icon={<CheckCircleFilled />}>
                      Active
                    </Tag>
                  ) : (
                    <Tag color="orange">Draft (Inactive)</Tag>
                  )}
                </Flex>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  <code>{selectedDef?.code}</code> · Target:{" "}
                  {selectedDef?.targetEntity === "SCORE_SHEET"
                    ? "Course Score Sheet"
                    : "Cohort Broadsheet"}
                </Typography.Text>
              </Flex>
            </Flex>

            <Flex align="center" gap={token.marginSM}>
              <Button
                icon={<EditOutlined />}
                onClick={() => selectedDef && handleOpenEdit(selectedDef)}
              >
                Edit Details
              </Button>

              {!selectedDef?.isActive && (
                <Button
                  type="primary"
                  icon={<ThunderboltFilled />}
                  loading={editor.state.isActivating}
                  onClick={editor.actions.handleActivate}
                >
                  Activate Workflow
                </Button>
              )}
            </Flex>
          </Flex>

          {/* Activation Checklist (if 422 violations exist) */}
          <ActivationChecklist
            violations={state.activationViolations}
            onDismiss={() =>
              dispatch({
                type: WorkflowFormActionType.ClearActivationViolations,
              })
            }
          />

          {/* Live Steps Preview */}
          <WorkflowPreviewLadder steps={editor.state.steps} />

          {/* Steps Editor */}
          <WorkflowStepsEditor
            steps={editor.state.steps}
            isSaving={editor.state.isSavingStep}
            onSaveStep={editor.actions.handleSaveStep}
            onDeleteStep={editor.actions.handleDeleteStep}
          />

          {/* Transitions Editor */}
          <WorkflowTransitionsEditor
            steps={editor.state.steps}
            transitions={editor.state.transitions}
            isSaving={editor.state.isSavingTransition}
            onSaveTransition={editor.actions.handleSaveTransition}
            onDeleteTransition={editor.actions.handleDeleteTransition}
          />
        </Flex>
      </ConditionalRenderer>

      {/* Header Modal (Upsert) */}
      <WorkflowFormModal
        open={state.isHeaderModalOpen}
        target={state.headerModalTarget}
        onClose={handleCloseHeaderModal}
      />

      {/* Delete Modal */}
      <DeleteWorkflowModal
        open={state.isDeleteModalOpen}
        target={state.deleteModalTarget}
        onClose={handleCloseDeleteModal}
      />
    </div>
  );
}
