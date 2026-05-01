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
import { useGradingSystemBoundaryTab } from "../hooks/useGradingSystemBoundaryTab";
import { BoundaryCard } from "./BoundaryCard";
import { DeleteGradingSystemBoundaryModal } from "./DeleteGradingSystemBoundaryModal";
import { GradingSystemBoundaryFormModal } from "./GradingSystemBoundaryFormModal";
import { GradingSystemSelector } from "./GradingSystemSelector";
import { ScoreCoverageIndicator } from "./ScoreCoverageIndicator";

export function GradingSystemBoundaryTab() {
  const token = useToken();
  const { state, actions, flags } = useGradingSystemBoundaryTab();
  const {
    gradingSystemId,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    boundaries,
    isLoading,
    isError,
  } = state;
  const {
    handleSystemChange,
    handleOpenUpsert,
    handleCloseUpsert,
    handleOpenDelete,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasSystemSelected, hasData } = flags;

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* System selector */}
      <Flex align="center" gap={12} wrap="wrap">
        <Typography.Text strong>Grading System:</Typography.Text>
        <GradingSystemSelector
          value={gradingSystemId}
          onChange={handleSystemChange}
        />
      </Flex>

      {/* No system selected state */}
      <ConditionalRenderer
        when={!hasSystemSelected}
        wrapper={centeredBox({
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          background: token.colorBgContainer,
        })}
      >
        <Typography.Text type="secondary">
          Select a grading system above to view its grade boundaries.
        </Typography.Text>
      </ConditionalRenderer>

      {/* Content when a system is selected */}
      <ConditionalRenderer when={hasSystemSelected}>
        <Flex vertical gap={16}>
          {/* Score coverage indicator */}
          <div>
            <Typography.Text
              type="secondary"
              style={{
                fontSize: token.fontSizeSM,
                display: "block",
                marginBottom: 8,
              }}
            >
              Score Coverage (0–100)
            </Typography.Text>
            <ScoreCoverageIndicator boundaries={boundaries} />
          </div>

          {/* Add Boundary button */}
          <Flex justify="flex-end">
            <PermissionGuard permission={Permission.GradingSchemaConfigsCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenUpsert()}
                style={{ fontWeight: 600 }}
              >
                Add Boundary
              </Button>
            </PermissionGuard>
          </Flex>

          {/* Boundary list */}
          <DataLoader
            loading={isLoading}
            loader={<SkeletonRows count={4} variant="card" />}
          >
            {/* Error state */}
            <ConditionalRenderer when={isError}>
              <ErrorAlert
                variant="section"
                error="Failed to load grade boundaries"
                onRetry={refetch}
              />
            </ConditionalRenderer>

            {/* Empty state */}
            <ConditionalRenderer
              when={!isError && !hasData}
              wrapper={centeredBox({
                border: `1px dashed ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                background: token.colorBgContainer,
              })}
            >
              <Typography.Text
                type="secondary"
                style={{ display: "block", marginBottom: 16 }}
              >
                No grade boundaries yet. Add your first boundary to define the
                grading scale.
              </Typography.Text>
              <PermissionGuard
                permission={Permission.GradingSchemaConfigsCreate}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenUpsert()}
                  style={{ fontWeight: 600 }}
                >
                  Add Boundary
                </Button>
              </PermissionGuard>
            </ConditionalRenderer>

            {/* Boundary card list */}
            <ConditionalRenderer when={!isError && hasData}>
              <Flex vertical gap={8}>
                {boundaries.map((boundary) => (
                  <BoundaryCard
                    key={boundary.id}
                    boundary={boundary}
                    onEdit={handleOpenUpsert}
                    onDelete={handleOpenDelete}
                  />
                ))}
              </Flex>
            </ConditionalRenderer>
          </DataLoader>
        </Flex>
      </ConditionalRenderer>

      {/* Modals */}
      <GradingSystemBoundaryFormModal
        open={upsertOpen}
        target={upsertTarget}
        gradingSystemId={gradingSystemId}
        onClose={handleCloseUpsert}
        existingBoundaries={boundaries}
      />
      <DeleteGradingSystemBoundaryModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
