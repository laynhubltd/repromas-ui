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
import {
  DownOutlined,
  PlusOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Empty, Flex, type MenuProps, Typography } from "antd";
import { AcademicStandingSelector } from "../../academic-standing-boundary/components/AcademicStandingSelector";
import { useDegreeClassificationTab } from "../hooks/useDegreeClassificationTab";
import { DegreeClassificationCard } from "./DegreeClassificationCard";
import { DegreeClassificationExplainer } from "./DegreeClassificationExplainer";
import { DegreeClassificationFormModal } from "./DegreeClassificationFormModal";
import { DegreeClassificationSimulatorCard } from "./DegreeClassificationSimulatorCard";
import { DegreeCoverageIndicator } from "./DegreeCoverageIndicator";
import { DeleteDegreeClassificationModal } from "./DeleteDegreeClassificationModal";

export function AcademicStandingDegreeClassificationTab() {
  const token = useToken();
  const { state, actions, flags } = useDegreeClassificationTab();
  const {
    selectedPolicyId,
    selectedPolicy,
    policyMaxCgpa,
    classifications,
    derivation,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    isLoading,
    isError,
    isApplyingPreset,
    presetTemplates,
  } = state;

  const {
    handleSelectPolicy,
    handleOpenUpsert,
    handleCloseUpsert,
    handleOpenDelete,
    handleCloseDelete,
    handleApplyPreset,
    refetch,
  } = actions;

  const { hasClassifications, hasPolicies } = flags;

  const presetMenuItems: MenuProps["items"] = presetTemplates.map((preset) => ({
    key: preset.key,
    label: (
      <div>
        <Typography.Text strong style={{ display: "block" }}>
          {preset.label}
        </Typography.Text>
        <Typography.Text type="secondary" style={{ fontSize: 11 }}>
          {preset.description} ({preset.bands.length} bands)
        </Typography.Text>
      </div>
    ),
    onClick: () => handleApplyPreset(preset),
  }));

  return (
    <PermissionGuard
      permission={Permission.AcademicStandingsRead}
      fallback={
        <Typography.Text type="danger">
          You do not have permission to view degree classification configurations.
        </Typography.Text>
      }
    >
      <Flex vertical gap={24} style={{ width: "100%" }}>
        {/* Explainer Banner */}
        <DegreeClassificationExplainer />

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
            No academic standing policies exist yet. Create a standing policy first before configuring degree classification bands.
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
            Select an academic standing policy above to view and configure its degree classification bands.
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={hasPolicies && selectedPolicyId !== null}>
          <>
            {/* Visual Coverage Bar */}
            <DegreeCoverageIndicator
              derivation={derivation}
              policyMaxCgpa={policyMaxCgpa}
            />

            {/* Live Interactive Simulator */}
            <DegreeClassificationSimulatorCard
              bands={classifications}
              policyMaxCgpa={policyMaxCgpa}
              policyName={selectedPolicy?.name}
            />

            {/* Action Bar */}
            <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
              <div>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  Configured Classification Bands ({classifications.length})
                </Typography.Title>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Ordered by rank hierarchy (Rank 1 represents the highest award honor).
                </Typography.Text>
              </div>

              <Flex gap={12} align="center" wrap="wrap">
                {classifications.length === 0 && (
                  <Dropdown menu={{ items: presetMenuItems }} trigger={["click"]}>
                    <Button
                      icon={<ThunderboltOutlined />}
                      loading={isApplyingPreset}
                    >
                      Load Benchmark Template <DownOutlined style={{ fontSize: 10 }} />
                    </Button>
                  </Dropdown>
                )}

                <PermissionGuard permission={Permission.AcademicStandingsCreate}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenUpsert(null)}
                  >
                    Add Degree Band
                  </Button>
                </PermissionGuard>
              </Flex>
            </Flex>

            {/* Classification Bands List */}
            <DataLoader
              loading={isLoading}
              loader={<SkeletonRows count={4} />}
            >
              <ConditionalRenderer when={isError}>
                <ErrorAlert
                  variant="section"
                  error="Failed to load degree classification bands for this policy."
                  onRetry={refetch}
                />
              </ConditionalRenderer>

              <ConditionalRenderer when={!isError && !hasClassifications}>
                <Flex
                  vertical
                  align="center"
                  justify="center"
                  style={{
                    padding: "36px 16px",
                    background: token.colorBgContainer,
                    borderRadius: token.borderRadiusLG,
                    border: `1px dashed ${token.colorBorder}`,
                  }}
                >
                  <Empty
                    description={
                      <div style={{ maxWidth: 440 }}>
                        <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
                          Zero Custom Bands Defined
                        </Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                          When a policy has no custom bands, the classification engine automatically falls back to standard national benchmark tables (NBTE 4.0 / NUC 5.0).
                        </Typography.Text>
                      </div>
                    }
                  >
                    <Flex gap={12} justify="center" style={{ marginTop: 12 }}>
                      <Dropdown menu={{ items: presetMenuItems }} trigger={["click"]}>
                        <Button
                          icon={<ThunderboltOutlined />}
                          loading={isApplyingPreset}
                        >
                          Load Template Presets <DownOutlined style={{ fontSize: 10 }} />
                        </Button>
                      </Dropdown>

                      <PermissionGuard permission={Permission.AcademicStandingsCreate}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => handleOpenUpsert(null)}
                        >
                          Add Custom Band
                        </Button>
                      </PermissionGuard>
                    </Flex>
                  </Empty>
                </Flex>
              </ConditionalRenderer>

              <ConditionalRenderer when={!isError && hasClassifications}>
                <Flex vertical gap={12} style={{ width: "100%" }}>
                  {classifications.map((band) => (
                    <DegreeClassificationCard
                      key={band.id}
                      band={band}
                      policyMaxCgpa={policyMaxCgpa}
                      onEdit={handleOpenUpsert}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </Flex>
              </ConditionalRenderer>
            </DataLoader>
          </>
        </ConditionalRenderer>

        {/* Create / Edit Modal */}
        {selectedPolicyId !== null && (
          <DegreeClassificationFormModal
            open={upsertOpen}
            academicStandingId={selectedPolicyId}
            policyMaxCgpa={policyMaxCgpa}
            target={upsertTarget}
            onClose={handleCloseUpsert}
            onSuccess={refetch}
          />
        )}

        {/* Delete Modal */}
        <DeleteDegreeClassificationModal
          open={deleteOpen}
          target={deleteTarget}
          onClose={handleCloseDelete}
          onSuccess={refetch}
        />
      </Flex>
    </PermissionGuard>
  );
}
