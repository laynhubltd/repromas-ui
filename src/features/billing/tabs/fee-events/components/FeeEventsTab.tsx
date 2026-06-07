import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { SeedFromCatalogSummaryModal } from "./modals/SeedFromCatalogSummaryModal";
import {
  ACTIVE_FILTER_OPTIONS,
  FEE_EVENT_ITEMS_PER_PAGE,
  FEE_EVENT_POLICY_STATUS_OPTIONS,
  FEE_EVENT_TOOLTIPS,
  FEE_EVENT_UI_COPY,
} from "@/shared/constants/feeEventOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
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
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { useFeeEventsTab } from "../hooks/useFeeEventsTab";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { FeeEventCard } from "./FeeEventCard";
import { DeleteBillableEventModal } from "./modals/DeleteBillableEventModal";
import { FeeEventCreateWizard } from "./modals/FeeEventCreateWizard";
import { FeeEventMetadataModal } from "./modals/FeeEventMetadataModal";

import type { ConfigurePricingParams } from "@/features/billing/types/configure-pricing";

type FeeEventsTabProps = {
  onViewPolicy?: (eventId: number) => void;
  onConfigurePricing?: (params: ConfigurePricingParams) => void;
};

export function FeeEventsTab({
  onViewPolicy,
  onConfigurePricing,
}: FeeEventsTabProps) {
  const token = useToken();
  const { state, actions, flags } = useFeeEventsTab();
  const {
    billableEvents,
    totalItems,
    catalogEntries,
    configuredCodes,
    labelMaps,
    isLoading,
    isError,
    sectionError,
    search,
    page,
    isActiveFilter,
    policyStatusFilter,
    metadataTarget,
    metadataOpen,
    createWizardOpen,
    deleteTarget,
    deleteOpen,
    seedResult,
    seedSummaryOpen,
    activeFilterCount,
    isSeeding,
  } = state;
  const {
    handleSearchChange,
    handlePageChange,
    handleIsActiveFilterChange,
    handlePolicyStatusFilterChange,
    clearAllFilters,
    handleOpenCreate,
    handleCloseCreate,
    handleOpenEdit,
    handleCloseMetadata,
    handleOpenDelete,
    handleCloseDelete,
    handleSeedFromCatalog,
    handleCloseSeedSummary,
    refetch,
  } = actions;
  const {
    showOnboardingEmpty,
    showToolbarSeed,
    activeCount,
    withPolicyCount,
    isSearchActive,
    isFilterActive,
    listHasRows,
  } = flags;

  const [filterOpen, setFilterOpen] = useState(false);
  const cardState = isLoading ? "loading" : "default";

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item
          label="Shell status"
          tooltip={FEE_EVENT_TOOLTIPS.filterStatus}
          style={{ marginBottom: 12 }}
        >
          <Select
            placeholder="Any status"
            allowClear
            value={isActiveFilter}
            onChange={handleIsActiveFilterChange}
            style={{ width: "100%" }}
            options={ACTIVE_FILTER_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Policy status"
          tooltip={FEE_EVENT_TOOLTIPS.filterPolicyStatus}
          style={{ marginBottom: 0 }}
        >
          <Select
            value={policyStatusFilter}
            onChange={handlePolicyStatusFilterChange}
            style={{ width: "100%" }}
            options={FEE_EVENT_POLICY_STATUS_OPTIONS}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={clearAllFilters}
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
        title={FEE_EVENT_UI_COPY.explainerTitle}
        body={FEE_EVENT_UI_COPY.explainerBody}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title={
              <LabelWithTooltip
                label="Total configured"
                tooltip={FEE_EVENT_TOOLTIPS.totalConfigured}
                variant="default"
              />
            }
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title={
              <LabelWithTooltip
                label="Active (this page)"
                tooltip={FEE_EVENT_TOOLTIPS.activeOnPage}
                variant="default"
              />
            }
            value={activeCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title={
              <LabelWithTooltip
                label="With policy (this page)"
                tooltip={FEE_EVENT_TOOLTIPS.withPolicyOnPage}
                variant="default"
              />
            }
            value={withPolicyCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" style={{ flex: 1 }}>
          <Input
            placeholder="Search by name…"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            allowClear
            style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
          />

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
        </Flex>

        <Flex gap={8} wrap="wrap">
          <ConditionalRenderer when={showToolbarSeed}>
            <PermissionGuard permission={Permission.BillingBillableEventsCreate}>
              <Tooltip title={FEE_EVENT_TOOLTIPS.addMissingFromCatalog}>
                <Button
                  icon={<ThunderboltOutlined />}
                  loading={isSeeding}
                  onClick={handleSeedFromCatalog}
                >
                  {FEE_EVENT_UI_COPY.addMissingFromCatalog}
                </Button>
              </Tooltip>
            </PermissionGuard>
          </ConditionalRenderer>
          <PermissionGuard permission={Permission.BillingBillableEventsCreate}>
            <Tooltip title={FEE_EVENT_TOOLTIPS.addCustomFee}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ fontWeight: 600 }}
              >
                {FEE_EVENT_UI_COPY.addCustomFee}
              </Button>
            </Tooltip>
          </PermissionGuard>
        </Flex>
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={6} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error={sectionError ?? FEE_EVENT_UI_COPY.loadFeesError}
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={showOnboardingEmpty && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Title level={5} style={{ margin: 0, textAlign: "center" }}>
            {FEE_EVENT_UI_COPY.emptyStateTitle}
          </Typography.Title>
          <Typography.Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 12,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {FEE_EVENT_UI_COPY.emptyStateDescription}
          </Typography.Text>
          <Flex gap={8} wrap="wrap" justify="center" align="center">
            <PermissionGuard permission={Permission.BillingBillableEventsCreate}>
              <Tooltip title={FEE_EVENT_TOOLTIPS.initializeFromCatalog}>
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  loading={isSeeding}
                  onClick={handleSeedFromCatalog}
                >
                  {FEE_EVENT_UI_COPY.initializeFromCatalog}
                </Button>
              </Tooltip>
            </PermissionGuard>
          </Flex>
          <PermissionGuard permission={Permission.BillingBillableEventsCreate}>
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginTop: 16, textAlign: "center" }}
            >
              {FEE_EVENT_UI_COPY.emptyStateManualHint}{" "}
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ padding: 0, height: "auto" }}
              >
                {FEE_EVENT_UI_COPY.addFeeManually}
              </Button>
            </Typography.Text>
          </PermissionGuard>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={
            !listHasRows &&
            (isSearchActive || isFilterActive) &&
            !isError &&
            !showOnboardingEmpty
          }
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            {FEE_EVENT_UI_COPY.noSearchResults}
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && listHasRows}>
          <Flex vertical gap={16}>
            <Row gutter={[16, 16]}>
              {billableEvents.map((billableEvent) => (
                <Col key={billableEvent.id} xs={24} sm={12} lg={8}>
                  <FeeEventCard
                    billableEvent={billableEvent}
                    labelMaps={labelMaps}
                    onEdit={handleOpenEdit}
                    onViewPolicy={
                      onViewPolicy
                        ? () => onViewPolicy(billableEvent.id)
                        : undefined
                    }
                    onConfigurePricing={
                      onConfigurePricing
                        ? () =>
                            onConfigurePricing({
                              eventCode: billableEvent.code,
                              billableEventPolicyId:
                                billableEvent.currentPolicy?.id,
                            })
                        : undefined
                    }
                    onDelete={handleOpenDelete}
                  />
                </Col>
              ))}
            </Row>

            <ConditionalRenderer
              when={
                totalItems > FEE_EVENT_ITEMS_PER_PAGE &&
                policyStatusFilter === "all"
              }
            >
              <Flex justify="flex-end">
                <Pagination
                  current={page}
                  pageSize={FEE_EVENT_ITEMS_PER_PAGE}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </Flex>
            </ConditionalRenderer>
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <FeeEventMetadataModal
        open={metadataOpen}
        target={metadataTarget}
        onClose={handleCloseMetadata}
      />
      <FeeEventCreateWizard
        open={createWizardOpen}
        onClose={handleCloseCreate}
        catalogEntries={catalogEntries}
        configuredCodes={configuredCodes}
        onCreatedWithoutPolicy={onViewPolicy}
      />
      <DeleteBillableEventModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
      <SeedFromCatalogSummaryModal
        open={seedSummaryOpen}
        result={seedResult}
        labelMaps={labelMaps}
        onClose={handleCloseSeedSummary}
        onConfigurePricing={onConfigurePricing}
      />
    </Flex>
  );
}
