import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { SCOPE_OPTIONS, LANE_FILTER_OPTIONS, SCORING_STRATEGY_LIST_ITEMS_PER_PAGE } from "@/shared/constants/scoringStrategyOptions";
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
  Form,
  Input,
  Pagination,
  Popover,
  Row,
  Select,
  Typography,
} from "antd";
import { useState } from "react";
import { useScoringStrategyTab } from "../hooks/useScoringStrategyTab";
import { ScoringStrategyCard } from "./ScoringStrategyCard";
import { ScoringStrategyDrawer } from "./ScoringStrategyDrawer";
import { DeleteScoringStrategyModal } from "./modals/DeleteScoringStrategyModal";
import { ScoringStrategyFormModal } from "./modals/ScoringStrategyFormModal";

export function ScoringStrategyTab() {
  const token = useToken();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const { state, actions, flags } = useScoringStrategyTab();
  const {
    strategies,
    totalItems,
    globalStrategyCount,
    isLoading,
    isError,
    scopeFilter,
    laneFilter,
    search,
    page,
    formTarget,
    formOpen,
    deleteTarget,
    deleteOpen,
    viewTarget,
    canEdit,
    canDelete,
  } = state;
  const {
    handleScopeFilterChange,
    handleLaneFilterChange,
    handleSearchChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    handleOpenView,
    handleCloseView,
    clearAllFilters,
    refetch,
  } = actions;
  const { hasData, isFilterActive, activeFilterCount, hasGlobalFallback } = flags;

  const cardState = isLoading ? "loading" : "default";

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Scope" style={{ marginBottom: 16 }}>
          <Select
            placeholder="Any scope"
            allowClear
            value={scopeFilter}
            onChange={handleScopeFilterChange}
            options={SCOPE_OPTIONS}
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item label="Lane" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any lane"
            allowClear
            value={laneFilter}
            onChange={handleLaneFilterChange}
            options={LANE_FILTER_OPTIONS}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={() => {
            clearAllFilters();
            setFilterPopoverOpen(false);
          }}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title="Scoring Strategy Resolution Cascade"
        body="Strategies are resolved in order of specificity: Program → Department → Faculty → Global. The most specific match wins. At least one GLOBAL strategy is required as a fallback — without it, candidates with no specific rule will fail scoring."
      />

      <ConditionalRenderer when={!hasGlobalFallback && !isLoading && !isError}>
        <ExplainerCallout
          intent="warning"
          collapsible
          title="Missing global fallback strategy"
          body="No GLOBAL scoring strategy is configured. Create one first so candidates without a specific program, department, or faculty rule can still be scored."
        />
      </ConditionalRenderer>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Strategies"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Global Fallbacks"
            value={globalStrategyCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Current Page Results"
            value={strategies.length}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by description…"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            allowClear
            style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
          />

          <Popover
            content={filterPopoverContent}
            title={
              <span>
                <FilterOutlined /> Filters
              </span>
            }
            trigger="click"
            arrow={false}
            placement="bottomLeft"
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
          >
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                type={activeFilterCount > 0 ? "primary" : "default"}
              >
                Filters
              </Button>
            </Badge>
          </Popover>
        </Flex>

        <PermissionGuard permission={Permission.AdmissionScoringStrategiesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Strategy
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load scoring strategies."
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && !isFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16, textAlign: "center" }}
          >
            No scoring strategies configured yet. Create a GLOBAL fallback strategy
            first to ensure all candidates can be scored.
          </Typography.Text>
          <PermissionGuard permission={Permission.AdmissionScoringStrategiesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Strategy
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !hasData && isFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            No results match your search or filters.
          </Typography.Text>
          <Button type="link" onClick={clearAllFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={8}>
            {strategies.map((strategy) => (
              <ScoringStrategyCard
                key={strategy.id}
                strategy={strategy}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={handleOpenView}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <ConditionalRenderer when={!isError && totalItems > SCORING_STRATEGY_LIST_ITEMS_PER_PAGE}>
        <Flex justify="flex-end">
          <Pagination
            current={page}
            pageSize={SCORING_STRATEGY_LIST_ITEMS_PER_PAGE}
            total={totalItems}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </Flex>
      </ConditionalRenderer>

      <ScoringStrategyFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteScoringStrategyModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <ScoringStrategyDrawer
        strategy={viewTarget}
        open={viewTarget !== null}
        onClose={handleCloseView}
        onEdit={(strategy) => {
          handleCloseView();
          handleOpenEdit(strategy);
        }}
        onDelete={(strategy) => {
          handleCloseView();
          handleOpenDelete(strategy);
        }}
      />
    </Flex>
  );
}
