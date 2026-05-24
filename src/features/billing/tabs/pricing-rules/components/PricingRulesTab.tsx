import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  PRICING_RULE_ITEMS_PER_PAGE,
  PRICING_RULE_UI_COPY,
} from "@/shared/constants/pricingRuleOptions";
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
  Alert,
  Badge,
  Button,
  Col,
  Flex,
  Form,
  Pagination,
  Popover,
  Row,
  Select,
  Typography,
} from "antd";
import { useState } from "react";
import { usePricingRulesTab } from "../hooks/usePricingRulesTab";
import { PricingRuleCard } from "./PricingRuleCard";
import { AddPricingRuleLineModal } from "./modals/AddPricingRuleLineModal";
import { DeletePricingRuleLineModal } from "./modals/DeletePricingRuleLineModal";
import { EditPricingRuleLineModal } from "./modals/EditPricingRuleLineModal";
import { DeletePricingRuleModal } from "./modals/DeletePricingRuleModal";
import { PricingRuleFormModal } from "./modals/PricingRuleFormModal";

export function PricingRulesTab() {
  const token = useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const { state, actions, flags } = usePricingRulesTab();
  const {
    pricingRules,
    totalItems,
    isLoading,
    isError,
    page,
    eventCodeFilter,
    indigeneFilter,
    scopeFilter,
    isActiveFilter,
    formTarget,
    formOpen,
    deleteTarget,
    deleteOpen,
    activeFilterCount,
    eventNameMap,
    referenceNameMap,
    eventCodeOptions,
    lockedRuleIdSet,
    expandedRuleIds,
    addLineTarget,
    addLineOpen,
    editLineTarget,
    editLineItem,
    editLineOpen,
    deleteLineTarget,
    deleteLineItem,
    deleteLineOpen,
    scopeOptions,
    indigeneOptions,
    activeFilterOptions,
    hasBillableEvents,
    hasFeeItems,
  } = state;
  const {
    handlePageChange,
    handleEventCodeFilterChange,
    handleIndigeneFilterChange,
    handleScopeFilterChange,
    handleIsActiveFilterChange,
    clearAllFilters,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    markRuleLocked,
    handleExpandToggle,
    handleOpenAddLine,
    handleCloseAddLine,
    handleOpenEditLine,
    handleCloseEditLine,
    handleOpenDeleteLine,
    handleCloseDeleteLine,
    refetch,
  } = actions;
  const { hasData, isFilterActive } = flags;

  const cardState = isLoading ? "loading" : "default";
  const canCreate = hasBillableEvents && hasFeeItems;

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Fee event" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any event"
            allowClear
            showSearch
            optionFilterProp="label"
            value={eventCodeFilter}
            onChange={handleEventCodeFilterChange}
            style={{ width: "100%" }}
            options={eventCodeOptions}
          />
        </Form.Item>
        <Form.Item label="Indigene status" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={indigeneFilter}
            onChange={handleIndigeneFilterChange}
            style={{ width: "100%" }}
            options={indigeneOptions}
          />
        </Form.Item>
        <Form.Item label="Scope" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any scope"
            allowClear
            value={scopeFilter}
            onChange={handleScopeFilterChange}
            style={{ width: "100%" }}
            options={scopeOptions}
          />
        </Form.Item>
        <Form.Item label="Status" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={isActiveFilter}
            onChange={handleIsActiveFilterChange}
            style={{ width: "100%" }}
            options={activeFilterOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />
        </Form.Item>
      </Form>
      {activeFilterCount > 0 ? (
        <Button
          type="link"
          size="small"
          onClick={clearAllFilters}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      ) : null}
    </Flex>
  );

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title={PRICING_RULE_UI_COPY.explainerTitle}
        body={PRICING_RULE_UI_COPY.explainerBody}
      />

      <ConditionalRenderer when={!hasBillableEvents}>
        <Alert
          type="warning"
          showIcon
          message="Configure fees first"
          description="Add billable fees on the Fees tab before creating pricing rules."
        />
      </ConditionalRenderer>

      <ConditionalRenderer when={hasBillableEvents && !hasFeeItems}>
        <Alert
          type="warning"
          showIcon
          message="Create fee items first"
          description="Add at least one active fee item on the Fee Items tab before setting prices."
        />
      </ConditionalRenderer>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Rules"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Active on Page"
            value={pricingRules.filter((r) => r.isActive).length}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="On This Page"
            value={pricingRules.length}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Popover
          content={filterContent}
          title={
            <span>
              <FilterOutlined /> Filters
            </span>
          }
          trigger="click"
          open={filterOpen}
          onOpenChange={setFilterOpen}
          placement="bottomLeft"
          arrow={false}
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

        <PermissionGuard permission={Permission.BillingPricingRulesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            disabled={!canCreate}
            style={{ fontWeight: 600 }}
          >
            Create Pricing Rule
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={4} variant="inline" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load pricing rules."
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && !isFilterActive && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Title level={5} style={{ margin: 0, textAlign: "center" }}>
            {PRICING_RULE_UI_COPY.emptyTitle}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{ display: "block", margin: "8px 0 16px", textAlign: "center" }}
          >
            {PRICING_RULE_UI_COPY.emptyBody}
          </Typography.Text>
          <PermissionGuard permission={Permission.BillingPricingRulesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              disabled={!canCreate}
              style={{ fontWeight: 600 }}
            >
              Create Pricing Rule
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && isFilterActive && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            No pricing rules match your filters.
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={16}>
            <Row gutter={[16, 16]}>
              {pricingRules.map((rule) => (
                <Col key={rule.id} span={24}>
                  <PricingRuleCard
                    rule={rule}
                    eventNames={eventNameMap}
                    referenceNames={referenceNameMap}
                    isLocked={lockedRuleIdSet.has(rule.id)}
                    isExpanded={expandedRuleIds.has(rule.id)}
                    onExpandToggle={() => handleExpandToggle(rule.id)}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onAddLine={handleOpenAddLine}
                    onEditLine={handleOpenEditLine}
                    onDeleteLine={handleOpenDeleteLine}
                  />
                </Col>
              ))}
            </Row>

            <Flex justify="flex-end">
              <Pagination
                current={page}
                pageSize={PRICING_RULE_ITEMS_PER_PAGE}
                total={totalItems}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} rules`
                }
              />
            </Flex>
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <PricingRuleFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
        eventCodeOptions={eventCodeOptions}
        configuredEventCodes={
          new Set(eventCodeOptions.map((opt) => opt.value))
        }
        initialLocked={formTarget ? lockedRuleIdSet.has(formTarget.id) : false}
        onRuleLocked={markRuleLocked}
      />
      <DeletePricingRuleModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
        isLocked={deleteTarget ? lockedRuleIdSet.has(deleteTarget.id) : false}
        onRuleLocked={markRuleLocked}
      />
      <AddPricingRuleLineModal
        open={addLineOpen}
        rule={addLineTarget}
        onClose={handleCloseAddLine}
        onRuleLocked={markRuleLocked}
      />
      <EditPricingRuleLineModal
        open={editLineOpen}
        rule={editLineTarget}
        line={editLineItem}
        onClose={handleCloseEditLine}
        onRuleLocked={markRuleLocked}
      />
      <DeletePricingRuleLineModal
        open={deleteLineOpen}
        rule={deleteLineTarget}
        line={deleteLineItem}
        onClose={handleCloseDeleteLine}
        onRuleLocked={markRuleLocked}
      />
    </Flex>
  );
}
