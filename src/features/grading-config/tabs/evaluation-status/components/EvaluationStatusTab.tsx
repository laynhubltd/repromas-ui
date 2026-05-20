// Feature: grading-config
import { DashCard } from "@/components/ui-kit";
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
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import {
    Badge,
    Button,
    Col,
    Flex,
    Input,
    Pagination,
    Popover,
    Radio,
    Row,
    Space,
    Typography,
} from "antd";
import { useState } from "react";
import { useEvaluationStatusTab } from "../hooks/useEvaluationStatusTab";
import { DeleteEvaluationStatusModal } from "./DeleteEvaluationStatusModal";
import { EvaluationStatusBanner } from "./EvaluationStatusBanner";
import { EvaluationStatusCard } from "./EvaluationStatusCard";
import { EvaluationStatusFormModal } from "./EvaluationStatusFormModal";

// ─── Filter Popover ───────────────────────────────────────────────────────────

type FilterPopoverProps = {
  isDefaultFilter: boolean | undefined;
  isStandardGradedFilter: boolean | undefined;
  onIsDefaultChange: (value: boolean | undefined) => void;
  onIsStandardGradedChange: (value: boolean | undefined) => void;
  isActive: boolean;
};

function FilterPopover({
  isDefaultFilter,
  isStandardGradedFilter,
  onIsDefaultChange,
  onIsStandardGradedChange,
  isActive,
}: FilterPopoverProps) {
  const token = useToken();
  const [open, setOpen] = useState(false);

  const content = (
    <div style={{ minWidth: 220 }}>
      {/* Default Status filter */}
      <div style={{ marginBottom: 16 }}>
        <Typography.Text
          strong
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: token.fontSizeSM,
            color: token.colorTextSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Default Status
        </Typography.Text>
        <Radio.Group
          value={
            isDefaultFilter === undefined ? "any" : String(isDefaultFilter)
          }
          onChange={(e) => {
            const val = e.target.value;
            onIsDefaultChange(val === "any" ? undefined : val === "true");
          }}
        >
          <Space direction="vertical" size={4}>
            <Radio value="any">Any</Radio>
            <Radio value="true">Default Only</Radio>
            <Radio value="false">Non-Default</Radio>
          </Space>
        </Radio.Group>
      </div>

      {/* Grading Type filter */}
      <div>
        <Typography.Text
          strong
          style={{
            display: "block",
            marginBottom: 8,
            fontSize: token.fontSizeSM,
            color: token.colorTextSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Grading Type
        </Typography.Text>
        <Radio.Group
          value={
            isStandardGradedFilter === undefined
              ? "any"
              : String(isStandardGradedFilter)
          }
          onChange={(e) => {
            const val = e.target.value;
            onIsStandardGradedChange(
              val === "any" ? undefined : val === "true",
            );
          }}
        >
          <Space direction="vertical" size={4}>
            <Radio value="any">Any</Radio>
            <Radio value="true">Standard Graded</Radio>
            <Radio value="false">Non-Standard</Radio>
          </Space>
        </Radio.Group>
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      title="Filters"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge dot={isActive} offset={[-4, 4]}>
        <Button
          icon={<FilterOutlined />}
          style={
            isActive
              ? {
                  borderColor: token.colorPrimary,
                  color: token.colorPrimary,
                }
              : undefined
          }
        >
          Filters
        </Button>
      </Badge>
    </Popover>
  );
}

// ─── EvaluationStatusTab ──────────────────────────────────────────────────────

export function EvaluationStatusTab() {
  const token = useToken();
  const { state, actions, flags } = useEvaluationStatusTab();
  const {
    searchInput,
    isDefaultFilter,
    isStandardGradedFilter,
    page,
    itemsPerPage,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    statuses,
    totalItems,
    isLoading,
    isError,
  } = state;
  const {
    handleSearchChange,
    handleIsDefaultFilterChange,
    handleIsStandardGradedFilterChange,
    handlePageChange,
    handleOpenUpsert,
    handleCloseUpsert,
    handleOpenDelete,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasData, isSearchOrFilterActive } = flags;

  const cardState = isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Banner */}
      <EvaluationStatusBanner />

      {/* Metrics row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Evaluation Statuses"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      {/* Toolbar: search + filter + create button */}
      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by name or code…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 280 }}
          />
          <FilterPopover
            isDefaultFilter={isDefaultFilter}
            isStandardGradedFilter={isStandardGradedFilter}
            onIsDefaultChange={handleIsDefaultFilterChange}
            onIsStandardGradedChange={handleIsStandardGradedFilterChange}
            isActive={isSearchOrFilterActive}
          />
        </Flex>
        <PermissionGuard permission={Permission.ScoreEvaluationStatusesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenUpsert()}
            style={{ fontWeight: 600 }}
          >
            Create Evaluation Status
          </Button>
        </PermissionGuard>
      </Flex>

      {/* Content area */}
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        {/* Error state */}
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load evaluation statuses"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        {/* Empty state — no search or filter active */}
        <ConditionalRenderer
          when={!isError && !hasData && !isSearchOrFilterActive}
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
            No evaluation statuses yet. Create your first status to get started.
          </Typography.Text>
          <PermissionGuard
            permission={Permission.ScoreEvaluationStatusesCreate}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenUpsert()}
              style={{ fontWeight: 600 }}
            >
              Create Evaluation Status
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* Empty state — search or filter active but no results */}
        <ConditionalRenderer
          when={!isError && !hasData && isSearchOrFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 8 }}
          >
            No results found matching your search or filter.
          </Typography.Text>
          <Button
            type="link"
            onClick={() => {
              handleSearchChange("");
              handleIsDefaultFilterChange(undefined);
              handleIsStandardGradedFilterChange(undefined);
            }}
          >
            Clear filters
          </Button>
        </ConditionalRenderer>

        {/* Evaluation status card list */}
        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={8}>
            {statuses.map((status) => (
              <EvaluationStatusCard
                key={status.id}
                status={status}
                onEdit={handleOpenUpsert}
                onDelete={handleOpenDelete}
              />
            ))}
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      {/* Pagination */}
      <ConditionalRenderer when={!isError}>
        <Flex justify="flex-end">
          <Pagination
            current={page}
            pageSize={itemsPerPage}
            total={totalItems}
            showSizeChanger
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </Flex>
      </ConditionalRenderer>

      {/* Modals */}
      <EvaluationStatusFormModal
        open={upsertOpen}
        target={upsertTarget}
        onClose={handleCloseUpsert}
      />
      <DeleteEvaluationStatusModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
