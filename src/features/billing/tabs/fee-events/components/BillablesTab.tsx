import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  ACTIVE_FILTER_OPTIONS,
  BILLABLE_EVENT_ITEMS_PER_PAGE,
  BILLABLE_EVENT_TOOLTIPS,
  BILLABLE_EVENT_UI_COPY,
  PAYMENT_TIMING_OPTIONS,
} from "@/shared/constants/billableEventOptions";
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
import { useBillablesTab } from "../hooks/useBillablesTab";
import { BillableEventCard } from "./BillableEventCard";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { BillableEventFormModal } from "./modals/BillableEventFormModal";
import { DeleteBillableEventModal } from "./modals/DeleteBillableEventModal";

type BillablesTabProps = {
  onEditPolicy?: (eventId: number) => void;
};

export function BillablesTab({ onEditPolicy }: BillablesTabProps) {
  const token = useToken();
  const { state, actions, flags } = useBillablesTab();
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
    paymentTimingFilter,
    formTarget,
    formOpen,
    deleteTarget,
    deleteOpen,
    activeFilterCount,
  } = state;
  const {
    handleSearchChange,
    handlePageChange,
    handleIsActiveFilterChange,
    handlePaymentTimingFilterChange,
    clearAllFilters,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    refetch,
  } = actions;
  const {
    hasData,
    isSearchActive,
    isFilterActive,
    showOnboardingEmpty,
    activeCount,
    payBeforeCount,
  } = flags;

  const [filterOpen, setFilterOpen] = useState(false);
  const cardState = isLoading ? "loading" : "default";

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item
          label="Status"
          tooltip={BILLABLE_EVENT_TOOLTIPS.filterStatus}
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
          label="Payment timing"
          tooltip={BILLABLE_EVENT_TOOLTIPS.filterPaymentTiming}
          style={{ marginBottom: 0 }}
        >
          <Select
            placeholder="Any timing"
            allowClear
            value={paymentTimingFilter}
            onChange={handlePaymentTimingFilterChange}
            style={{ width: "100%" }}
            options={PAYMENT_TIMING_OPTIONS}
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
        title={BILLABLE_EVENT_UI_COPY.explainerTitle}
        body={BILLABLE_EVENT_UI_COPY.explainerBody}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title={
              <LabelWithTooltip
                label="Total configured"
                tooltip={BILLABLE_EVENT_TOOLTIPS.totalConfigured}
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
                tooltip={BILLABLE_EVENT_TOOLTIPS.activeOnPage}
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
                label="Pay before (this page)"
                tooltip={BILLABLE_EVENT_TOOLTIPS.payBeforeOnPage}
                variant="default"
              />
            }
            value={payBeforeCount}
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
          <PermissionGuard permission={Permission.BillingBillableEventsCreate}>
            <Tooltip title={BILLABLE_EVENT_TOOLTIPS.addCustomFee}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ fontWeight: 600 }}
              >
                {BILLABLE_EVENT_UI_COPY.addCustomFee}
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
            error={sectionError ?? BILLABLE_EVENT_UI_COPY.loadFeesError}
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
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16, textAlign: "center" }}
          >
            {BILLABLE_EVENT_UI_COPY.emptyStateDescription}
          </Typography.Text>
          <Flex gap={8} wrap="wrap" justify="center">
            <PermissionGuard permission={Permission.BillingBillableEventsCreate}>
              <Tooltip title={BILLABLE_EVENT_TOOLTIPS.addCustomFee}>
                <Button icon={<PlusOutlined />} onClick={handleOpenCreate}>
                  {BILLABLE_EVENT_UI_COPY.addFeeManually}
                </Button>
              </Tooltip>
            </PermissionGuard>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && (isSearchActive || isFilterActive) && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            {BILLABLE_EVENT_UI_COPY.noSearchResults}
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={16}>
            <Row gutter={[16, 16]}>
              {billableEvents.map((billableEvent) => (
                <Col key={billableEvent.id} xs={24} sm={12} lg={8}>
                  <BillableEventCard
                    billableEvent={billableEvent}
                    labelMaps={labelMaps}
                    onEdit={handleOpenEdit}
                    onEditPolicy={
                      onEditPolicy
                        ? () => onEditPolicy(billableEvent.id)
                        : undefined
                    }
                    onDelete={handleOpenDelete}
                  />
                </Col>
              ))}
            </Row>

            <ConditionalRenderer
              when={totalItems > BILLABLE_EVENT_ITEMS_PER_PAGE}
            >
              <Flex justify="flex-end">
                <Pagination
                  current={page}
                  pageSize={BILLABLE_EVENT_ITEMS_PER_PAGE}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </Flex>
            </ConditionalRenderer>
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <BillableEventFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
        catalogEntries={catalogEntries}
        configuredCodes={configuredCodes}
      />
      <DeleteBillableEventModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
