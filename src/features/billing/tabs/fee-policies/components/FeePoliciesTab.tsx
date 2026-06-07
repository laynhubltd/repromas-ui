import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  FEE_POLICY_ITEMS_PER_PAGE,
  FEE_POLICY_OCCURRENCE_FILTER_OPTIONS,
  FEE_POLICY_PAYMENT_TIMING_FILTER_OPTIONS,
  FEE_POLICY_UI_COPY,
  FEE_POLICY_VERSION_STATUS_FILTER_OPTIONS,
} from "@/shared/constants/feePolicyOptions";
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
  Descriptions,
  Drawer,
  Flex,
  Form,
  Pagination,
  Popover,
  Row,
  Select,
  Typography,
} from "antd";
import type { PublishedPolicyHandoff } from "@/features/billing/types/configure-pricing";
import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { useMemo, useState } from "react";
import type { FeePoliciesTabProps } from "../hooks/useFeePoliciesTab";
import { useFeePoliciesTab } from "../hooks/useFeePoliciesTab";
import { PolicyVersionCard } from "./PolicyVersionCard";
import { getPolicyVersionDrawerDisplay } from "../utils/policyVersionDisplay";
import { DeletePolicyVersionModal } from "./modals/DeletePolicyVersionModal";
import { PublishPolicyModal } from "./modals/PublishPolicyModal";

export function FeePoliciesTab({
  initialEventId = null,
  onConfigurePricing,
  onViewFeeCharges,
}: FeePoliciesTabProps) {
  const token = useToken();
  const [publishHandoff, setPublishHandoff] =
    useState<PublishedPolicyHandoff | null>(null);
  const { state, actions, flags } = useFeePoliciesTab({ initialEventId });
  const {
    selectedEvent,
    policies,
    totalItems,
    activePolicy,
    eventsLoading,
    eventsSectionError,
    policiesSectionError,
    eventOptions,
    labelMaps,
    page,
    publishOpen,
    publishDraftPolicy,
    publishBindEventId,
    publishReviseFromPolicyId,
    publishEvent,
    publishActivePolicy,
    viewPolicy,
    viewOpen,
    deleteTarget,
    deleteOpen,
    paymentTimingFilter,
    occurrenceModeFilter,
    isActiveFilter,
    activeFilterCount,
    currentVersionNo,
    historicalCount,
  } = state;
  const {
    handleSelectedEventChange,
    handlePageChange,
    handlePaymentTimingFilterChange,
    handleOccurrenceModeFilterChange,
    handleIsActiveFilterChange,
    clearAllFilters,
    handleOpenPublish,
    handleClosePublish,
    handleOpenView,
    handleCloseView,
    handleOpenDelete,
    handleCloseDelete,
    refetchPolicies,
    refetchEvents,
  } = actions;
  const {
    hasEvents,
    hasSelectedEvent,
    isPoliciesLoading,
    hasPolicyRows,
    isFilterActive: isPolicyFilterActive,
  } = flags;

  const [filterOpen, setFilterOpen] = useState(false);
  const cardState = isPoliciesLoading ? "loading" : "default";

  const viewPolicyDisplay = useMemo(
    () =>
      viewPolicy ? getPolicyVersionDrawerDisplay(viewPolicy, labelMaps) : null,
    [viewPolicy, labelMaps],
  );

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item
          label="Fee type (optional)"
          style={{ marginBottom: 12 }}
        >
          <Select
            allowClear
            placeholder={FEE_POLICY_UI_COPY.allFeeTypesLabel}
            value={state.selectedEventId}
            onChange={(value) => handleSelectedEventChange(value ?? null)}
            style={{ width: "100%" }}
            options={eventOptions}
          />
        </Form.Item>
        <Form.Item label="Payment timing (optional)" style={{ marginBottom: 12 }}>
          <Select
            value={paymentTimingFilter}
            onChange={handlePaymentTimingFilterChange}
            style={{ width: "100%" }}
            options={FEE_POLICY_PAYMENT_TIMING_FILTER_OPTIONS}
          />
        </Form.Item>
        <Form.Item label="Occurrence (optional)" style={{ marginBottom: 12 }}>
          <Select
            value={occurrenceModeFilter}
            onChange={handleOccurrenceModeFilterChange}
            style={{ width: "100%" }}
            options={FEE_POLICY_OCCURRENCE_FILTER_OPTIONS}
          />
        </Form.Item>
        <Form.Item label="Version status (optional)" style={{ marginBottom: 0 }}>
          <Select
            value={isActiveFilter}
            onChange={handleIsActiveFilterChange}
            style={{ width: "100%" }}
            options={FEE_POLICY_VERSION_STATUS_FILTER_OPTIONS}
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

  const handlePublished = (handoff: PublishedPolicyHandoff) => {
    setPublishHandoff(handoff);
  };

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {publishHandoff && onConfigurePricing ? (
        <Alert
          type="success"
          showIcon
          closable
          onClose={() => setPublishHandoff(null)}
          title={`Policy v${publishHandoff.versionNo} published`}
          description={PRICING_RULE_UI_COPY.configurePricingAfterPublish}
          action={
            <Flex gap={8} wrap="wrap">
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  onConfigurePricing({
                    eventCode: publishHandoff.eventCode,
                    billableEventPolicyId: publishHandoff.policyId,
                  });
                  setPublishHandoff(null);
                }}
              >
                {PRICING_RULE_UI_COPY.configurePricingCta}
              </Button>
              {publishHandoff.priorActivePolicyId ? (
                <Button
                  size="small"
                  onClick={() => {
                    onConfigurePricing({
                      eventCode: publishHandoff.eventCode,
                      billableEventPolicyId: publishHandoff.policyId,
                      cloneFromPolicyId: publishHandoff.priorActivePolicyId,
                    });
                    setPublishHandoff(null);
                  }}
                >
                  {PRICING_RULE_UI_COPY.copyFromPriorPolicy}
                </Button>
              ) : null}
              {onViewFeeCharges ? (
                <Button
                  size="small"
                  onClick={() => {
                    onViewFeeCharges(publishHandoff.eventCode);
                    setPublishHandoff(null);
                  }}
                >
                  View fee charges
                </Button>
              ) : null}
            </Flex>
          }
        />
      ) : null}

      <ExplainerCallout
        intent="info"
        collapsible
        title={FEE_POLICY_UI_COPY.explainerTitle}
        body={FEE_POLICY_UI_COPY.explainerBody}
      />

      <ConditionalRenderer when={!!eventsSectionError}>
        <ErrorAlert
          variant="section"
          error={eventsSectionError ?? FEE_POLICY_UI_COPY.loadEventsError}
          onRetry={refetchEvents}
        />
      </ConditionalRenderer>

      <ConditionalRenderer
        when={!hasEvents && !eventsLoading && !eventsSectionError}
      >
        <Typography.Text type="secondary">
          {FEE_POLICY_UI_COPY.noEventsConfigured}
        </Typography.Text>
      </ConditionalRenderer>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <DashCard
            title={FEE_POLICY_UI_COPY.totalVersions}
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title={FEE_POLICY_UI_COPY.currentVersion}
            value={currentVersionNo}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title={FEE_POLICY_UI_COPY.historicalVersions}
            value={historicalCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" style={{ flex: 1 }}>
          <Select
            allowClear
            style={{ minWidth: 280, flex: 1, maxWidth: 400 }}
            placeholder={FEE_POLICY_UI_COPY.allFeeTypesLabel}
            value={state.selectedEventId ?? undefined}
            options={eventOptions}
            onChange={(value) => handleSelectedEventChange(value ?? null)}
            loading={eventsLoading}
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

        {hasSelectedEvent ? (
          <PermissionGuard permission={Permission.BillingBillableEventsUpdate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                handleOpenPublish({
                  bindEventId: selectedEvent?.id ?? null,
                  reviseFromPolicyId: activePolicy?.id ?? null,
                })
              }
            >
              {FEE_POLICY_UI_COPY.publishVersion}
            </Button>
          </PermissionGuard>
        ) : null}
      </Flex>

      <DataLoader
        loading={isPoliciesLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer when={!!policiesSectionError}>
          <ErrorAlert
            variant="section"
            error={
              policiesSectionError ?? FEE_POLICY_UI_COPY.loadPoliciesError
            }
            onRetry={refetchPolicies}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={
            !hasPolicyRows &&
            isPolicyFilterActive &&
            !policiesSectionError &&
            !isPoliciesLoading
          }
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            {FEE_POLICY_UI_COPY.noSearchResults}
          </Typography.Text>
          <Button type="link" onClick={clearAllFilters} style={{ padding: 0 }}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={
            !hasPolicyRows &&
            !isPolicyFilterActive &&
            !policiesSectionError &&
            !isPoliciesLoading
          }
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            {FEE_POLICY_UI_COPY.noVersions}
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={hasPolicyRows && !policiesSectionError}>
          <Row gutter={[16, 16]}>
            {policies.map((policy) => (
              <Col key={policy.id} xs={24} sm={12} lg={8}>
                <PolicyVersionCard
                  policy={policy}
                  labelMaps={labelMaps}
                  showFeeType={!hasSelectedEvent}
                  onView={handleOpenView}
                  onPublishRevision={(record) =>
                    handleOpenPublish({
                      reviseFromPolicyId: record.id,
                      sourcePolicy: record,
                    })
                  }
                  onUseAsDraft={(record) =>
                    handleOpenPublish({
                      draftPolicy: record,
                      sourcePolicy: record,
                    })
                  }
                  onDelete={handleOpenDelete}
                />
              </Col>
            ))}
          </Row>

          <ConditionalRenderer when={totalItems > FEE_POLICY_ITEMS_PER_PAGE}>
            <Flex justify="flex-end" style={{ marginTop: 16 }}>
              <Pagination
                current={page}
                pageSize={FEE_POLICY_ITEMS_PER_PAGE}
                total={totalItems}
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </Flex>
          </ConditionalRenderer>
        </ConditionalRenderer>
      </DataLoader>

      <PublishPolicyModal
        open={publishOpen}
        event={publishEvent}
        draftPolicy={publishDraftPolicy}
        bindEventId={publishBindEventId}
        reviseFromPolicyId={publishReviseFromPolicyId}
        activePolicy={publishActivePolicy}
        onClose={handleClosePublish}
        onPublished={handlePublished}
      />

      <DeletePolicyVersionModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />

      <Drawer
        title={
          viewPolicy && viewPolicyDisplay
            ? `${viewPolicyDisplay.feeTypeLabel} — v${viewPolicy.versionNo}`
            : "Policy version"
        }
        open={viewOpen}
        onClose={handleCloseView}
        width={480}
      >
        {viewPolicy && viewPolicyDisplay ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Fee type">
              {viewPolicyDisplay.feeTypeLabel}
            </Descriptions.Item>
            <Descriptions.Item label="Fee code">
              {viewPolicyDisplay.code}
            </Descriptions.Item>
            <Descriptions.Item label="Version">
              {viewPolicy.versionNo}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {viewPolicy.isActive
                ? FEE_POLICY_UI_COPY.currentBadge
                : "Historical"}
            </Descriptions.Item>
            <Descriptions.Item label="Effective from">
              {viewPolicyDisplay.effectiveFrom}
            </Descriptions.Item>
            <Descriptions.Item label="Effective to">
              {viewPolicyDisplay.effectiveTo}
            </Descriptions.Item>
            <Descriptions.Item label="Payment timing">
              {viewPolicyDisplay.paymentTiming}
            </Descriptions.Item>
            <Descriptions.Item label="When fee is recorded">
              {viewPolicyDisplay.trigger}
            </Descriptions.Item>
            <Descriptions.Item label="Step blocked until paid">
              {viewPolicyDisplay.guardStep}
            </Descriptions.Item>
            <Descriptions.Item label="Guard required">
              {viewPolicy.guardRequired ? "Yes" : "No"}
            </Descriptions.Item>
            <Descriptions.Item label="If no fee on file yet">
              {viewPolicyDisplay.missingFeeChargePolicy}
            </Descriptions.Item>
            <Descriptions.Item label="Counts as paid">
              {viewPolicyDisplay.fulfilledStatuses}
            </Descriptions.Item>
            <Descriptions.Item label="Billing frequency">
              {viewPolicyDisplay.occurrence}
            </Descriptions.Item>
            <Descriptions.Item label="Billing period">
              {viewPolicyDisplay.period}
            </Descriptions.Item>
            <Descriptions.Item label="Arrears behaviour">
              {viewPolicyDisplay.arrears}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </Flex>
  );
}
