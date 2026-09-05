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
import { useMemo } from "react";
import { AcademicStandingBoundaryFormModal } from "./AcademicStandingBoundaryFormModal";
import { AcademicStandingSelector } from "./AcademicStandingSelector";
import { BoundaryCard } from "./BoundaryCard";
import { CgpaCoverageIndicator } from "./CgpaCoverageIndicator";
import { CgpaSimulatorCard } from "./CgpaSimulatorCard";
import { DeleteAcademicStandingBoundaryModal } from "./DeleteAcademicStandingBoundaryModal";
import { useAcademicStandingBoundaryTab } from "../hooks/useAcademicStandingBoundaryTab";

export function AcademicStandingBoundaryTab() {
  const token = useToken();
  const { state, actions, flags } = useAcademicStandingBoundaryTab();
  const {
    selectedPolicyId,
    policyMaxCgpa,
    boundaries,
    derivation,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    isLoading,
    isError,
  } = state;
  const {
    handleSelectPolicy,
    handleOpenUpsert,
    handleCloseUpsert,
    handleOpenDelete,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasBoundaries, hasPolicies } = flags;

  const segmentMap = useMemo(() => {
    const segments = derivation?.segments ?? [];
    return new Map(segments.map((seg) => [seg.boundaryId, seg]));
  }, [derivation?.segments]);

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Policy Selector */}
      <AcademicStandingSelector
        selectedPolicyId={selectedPolicyId}
        onSelectPolicy={handleSelectPolicy}
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
          No academic standing policies exist yet. Create a standing policy first before adding tier boundaries.
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer
        when={hasPolicies && selectedPolicyId === null}
        wrapper={centeredBox({
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
        })}
      >
        <Typography.Text type="secondary">
          Select an academic standing policy above to view and configure its CGPA boundaries.
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer when={hasPolicies && selectedPolicyId !== null}>
        <>
          {/* Continuous Coverage Indicator Bar */}
          <CgpaCoverageIndicator
            boundaries={boundaries}
            policyMaxCgpa={policyMaxCgpa}
          />

          {/* Interactive CGPA Simulator */}
          <CgpaSimulatorCard
            boundaries={boundaries}
            policyMaxCgpa={policyMaxCgpa}
          />

          {/* Toolbar */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Configured Tier Boundaries ({boundaries.length})
            </Typography.Title>

            <PermissionGuard permission={Permission.AcademicStandingsCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenUpsert(null)}
                style={{ fontWeight: 600 }}
              >
                Add Tier Boundary
              </Button>
            </PermissionGuard>
          </Flex>

          {/* Content Area */}
          <DataLoader loading={isLoading} loader={<SkeletonRows count={3} />}>
            <ConditionalRenderer when={isError}>
              <ErrorAlert
                variant="section"
                error="Failed to load academic standing boundaries"
                onRetry={refetch}
              />
            </ConditionalRenderer>

            <ConditionalRenderer when={!isError}>
              <ConditionalRenderer
                when={!hasBoundaries}
                wrapper={centeredBox({
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorBgContainer,
                })}
              >
                <Typography.Text type="secondary">
                  No tier boundaries have been configured for this policy yet. Add a boundary starting at 0.00 to anchor the policy.
                </Typography.Text>
              </ConditionalRenderer>

              <ConditionalRenderer when={hasBoundaries}>
                <Flex vertical gap={16}>
                  {boundaries.map((boundary) => {
                    const segment = segmentMap.get(boundary.id);
                    const intervalText =
                      segment?.intervalText ??
                      `≥ ${Number(boundary.minCgpa).toFixed(2)} CGPA`;
                    const isBaseTier = Number(boundary.minCgpa) === 0;

                    return (
                      <BoundaryCard
                        key={boundary.id}
                        boundary={boundary}
                        policyId={selectedPolicyId!}
                        intervalText={intervalText}
                        isBaseTier={isBaseTier}
                        onEdit={handleOpenUpsert}
                        onDelete={handleOpenDelete}
                      />
                    );
                  })}
                </Flex>
              </ConditionalRenderer>
            </ConditionalRenderer>
          </DataLoader>

          {/* Upsert Modal */}
          {selectedPolicyId !== null && (
            <AcademicStandingBoundaryFormModal
              policyId={selectedPolicyId}
              policyMaxCgpa={policyMaxCgpa}
              open={upsertOpen}
              target={upsertTarget}
              onClose={handleCloseUpsert}
            />
          )}

          {/* Delete Modal */}
          <DeleteAcademicStandingBoundaryModal
            open={deleteOpen}
            target={deleteTarget}
            onClose={handleCloseDelete}
          />
        </>
      </ConditionalRenderer>
    </Flex>
  );
}
