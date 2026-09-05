// Feature: grading-config
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { BoundarySelector } from "./BoundarySelector";
import { DeleteEscalationStepModal } from "./DeleteEscalationStepModal";
import { EscalationLadderSteps } from "./EscalationLadderSteps";
import { EscalationStepFormModal } from "./EscalationStepFormModal";
import { useAcademicStandingEscalationTab } from "../hooks/useAcademicStandingEscalationTab";

export function AcademicStandingEscalationTab() {
  const token = useToken();
  const { state, actions, flags } = useAcademicStandingEscalationTab();
  const {
    selectedPolicyId,
    selectedBoundaryId,
    selectedBoundary,
    steps,
    defaultStepNumber,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    isLoading,
    isError,
  } = state;
  const {
    handleSelectPolicy,
    handleSelectBoundary,
    handleOpenUpsert,
    handleCloseUpsert,
    handleOpenDelete,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasPolicies, hasLadderBoundaries, hasSelectedBoundary } = flags;

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Boundary Selector */}
      <BoundarySelector
        selectedPolicyId={selectedPolicyId}
        selectedBoundaryId={selectedBoundaryId}
        onSelectPolicy={handleSelectPolicy}
        onSelectBoundary={handleSelectBoundary}
      />

      <ConditionalRenderer
        when={!hasPolicies}
        wrapper={centeredBox({
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
        })}
      >
        <Typography.Text type="secondary">
          No academic standing policies exist yet. Create a policy and enable escalation on a boundary to configure ladder steps.
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer
        when={hasPolicies && !hasLadderBoundaries}
        wrapper={centeredBox({
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
        })}
      >
        <Typography.Text type="secondary">
          The selected policy has no ladder-enabled tier boundaries. Enable "Escalation Ladder" on a boundary (such as Probation) in the CGPA Boundaries tab.
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer
        when={hasPolicies && hasLadderBoundaries && !hasSelectedBoundary}
        wrapper={centeredBox({
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
        })}
      >
        <Typography.Text type="secondary">
          Select a ladder-enabled boundary tier above to view and configure its sequential escalation ladder steps.
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer when={hasPolicies && hasLadderBoundaries && hasSelectedBoundary}>
        <>
          {/* Header & Add Action */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
            <div>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Escalation Ladder: {selectedBoundary?.name}
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Sequential progression of disciplinary statuses for repeated terms in this academic standing.
              </Typography.Text>
            </div>

            <PermissionGuard permission={Permission.AcademicStandingsCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenUpsert(null)}
                style={{ fontWeight: 600 }}
              >
                Add Step
              </Button>
            </PermissionGuard>
          </Flex>

          {/* Content Area */}
          <DataLoader loading={isLoading} loader={<SkeletonRows count={3} />}>
            <ConditionalRenderer when={isError}>
              <ErrorAlert
                variant="section"
                error="Failed to load escalation ladder steps"
                onRetry={refetch}
              />
            </ConditionalRenderer>

            <ConditionalRenderer when={!isError}>
              <ConditionalRenderer
                when={steps.length === 0}
                wrapper={centeredBox({
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorBgContainer,
                })}
              >
                <Flex vertical gap={12} align="center">
                  <Typography.Text type="secondary">
                    No escalation steps have been configured for this tier yet. Add Step 1 to begin the ladder sequence.
                  </Typography.Text>
                  <PermissionGuard permission={Permission.AcademicStandingsCreate}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => handleOpenUpsert(null, 1)}
                    >
                      Add Step 1
                    </Button>
                  </PermissionGuard>
                </Flex>
              </ConditionalRenderer>

              <ConditionalRenderer when={steps.length > 0}>
                <EscalationLadderSteps
                  steps={steps}
                  onAddStep={(nextStepNum) => handleOpenUpsert(null, nextStepNum)}
                  onEditStep={handleOpenUpsert}
                  onDeleteStep={handleOpenDelete}
                />
              </ConditionalRenderer>
            </ConditionalRenderer>
          </DataLoader>

          {/* Upsert Modal */}
          {selectedBoundaryId && (
            <EscalationStepFormModal
              boundaryId={selectedBoundaryId}
              defaultStepNumber={defaultStepNumber}
              open={upsertOpen}
              target={upsertTarget}
              onClose={handleCloseUpsert}
            />
          )}

          {/* Delete Modal */}
          <DeleteEscalationStepModal
            open={deleteOpen}
            target={deleteTarget}
            onClose={handleCloseDelete}
          />
        </>
      </ConditionalRenderer>
    </Flex>
  );
}
