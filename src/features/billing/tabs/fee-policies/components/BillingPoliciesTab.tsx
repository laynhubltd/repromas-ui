import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  BILLING_POLICY_ITEMS_PER_PAGE,
  BILLING_POLICY_UI_COPY,
} from "@/shared/constants/billingPolicyOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined, ThunderboltOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Drawer,
  Flex,
  Pagination,
  Select,
  Typography,
} from "antd";
import type { BillingPoliciesTabProps } from "../hooks/useBillingPoliciesTab";
import { useBillingPoliciesTab } from "../hooks/useBillingPoliciesTab";
import { PolicyVersionTable } from "./PolicyVersionTable";
import { DeletePolicyVersionModal } from "./modals/DeletePolicyVersionModal";
import { PublishPolicyModal } from "./modals/PublishPolicyModal";
import { SeedPoliciesSummaryModal } from "./modals/SeedPoliciesSummaryModal";

export function BillingPoliciesTab({
  initialEventId = null,
}: BillingPoliciesTabProps) {
  const token = useToken();
  const { state, actions, flags } = useBillingPoliciesTab({ initialEventId });
  const {
    selectedEvent,
    policies,
    totalItems,
    activePolicy,
    eventsLoading,
    eventsSectionError,
    policiesSectionError,
    isSeeding,
    eventOptions,
    page,
    publishOpen,
    publishDraftPolicy,
    publishBindEventId,
    publishReviseFromPolicyId,
    viewPolicy,
    viewOpen,
    deleteTarget,
    deleteOpen,
    seedResult,
    seedSummaryOpen,
  } = state;
  const {
    handleSelectedEventChange,
    handlePageChange,
    handleOpenPublish,
    handleClosePublish,
    handleOpenView,
    handleCloseView,
    handleOpenDelete,
    handleCloseDelete,
    handleSeedFromCatalog,
    handleCloseSeedSummary,
    refetchPolicies,
  } = actions;
  const { hasEvents, hasSelectedEvent, isPoliciesLoading } = flags;

  return (
    <Flex vertical gap={token.marginLG}>
      <ExplainerCallout
        title={BILLING_POLICY_UI_COPY.explainerTitle}
        body={BILLING_POLICY_UI_COPY.explainerBody}
      />

      <Flex gap={token.marginSM} wrap="wrap">
        <PermissionGuard permission={Permission.BillingBillableEventsCreate}>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={isSeeding}
            onClick={() => void handleSeedFromCatalog()}
          >
            {BILLING_POLICY_UI_COPY.setupStandardFees}
          </Button>
        </PermissionGuard>

        {hasSelectedEvent ? (
          <PermissionGuard permission={Permission.BillingBillableEventsUpdate}>
            <Button
              icon={<PlusOutlined />}
              onClick={() =>
                handleOpenPublish({
                  bindEventId: selectedEvent?.id ?? null,
                  reviseFromPolicyId: activePolicy?.id ?? null,
                })
              }
            >
              {BILLING_POLICY_UI_COPY.publishVersion}
            </Button>
          </PermissionGuard>
        ) : null}
      </Flex>

      <DataLoader
        loading={eventsLoading}
        loader={<SkeletonRows count={2} variant="card" />}
      >
        <ConditionalRenderer when={!!eventsSectionError}>
          <ErrorAlert
            variant="section"
            error={eventsSectionError ?? BILLING_POLICY_UI_COPY.loadEventsError}
            onRetry={actions.refetchEvents}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasEvents && !eventsSectionError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            {BILLING_POLICY_UI_COPY.noEventsConfigured}
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={hasEvents && !eventsSectionError}>
          <DashCard title="Policy versions" value={totalItems}>
            <Flex vertical gap={token.marginMD}>
              <Flex align="center" gap={token.marginSM} wrap="wrap">
                <Typography.Text strong>Fee type</Typography.Text>
                <Select
                  style={{ minWidth: 280 }}
                  placeholder={BILLING_POLICY_UI_COPY.selectEventPlaceholder}
                  value={state.selectedEventId ?? undefined}
                  options={eventOptions}
                  onChange={(value) => handleSelectedEventChange(value ?? null)}
                />
              </Flex>

              <DataLoader
                loading={isPoliciesLoading}
                loader={<SkeletonRows count={4} />}
              >
                <ConditionalRenderer when={!!policiesSectionError}>
                  <ErrorAlert
                    variant="section"
                    error={
                      policiesSectionError ??
                      BILLING_POLICY_UI_COPY.loadPoliciesError
                    }
                    onRetry={refetchPolicies}
                  />
                </ConditionalRenderer>

                <ConditionalRenderer
                  when={
                    policies.length === 0 &&
                    !policiesSectionError &&
                    !isPoliciesLoading
                  }
                  wrapper={centeredBox()}
                >
                  <Typography.Text type="secondary">
                    {BILLING_POLICY_UI_COPY.noVersions}
                  </Typography.Text>
                  <PermissionGuard
                    permission={Permission.BillingBillableEventsUpdate}
                  >
                    <Button
                      type="link"
                      onClick={() =>
                        handleOpenPublish({
                          bindEventId: selectedEvent?.id ?? null,
                        })
                      }
                    >
                      {BILLING_POLICY_UI_COPY.publishVersion}
                    </Button>
                  </PermissionGuard>
                </ConditionalRenderer>

                <ConditionalRenderer
                  when={policies.length > 0 && !policiesSectionError}
                >
                  <PolicyVersionTable
                    policies={policies}
                    loading={false}
                    onView={handleOpenView}
                    onPublishRevision={(policy) =>
                      handleOpenPublish({ reviseFromPolicyId: policy.id })
                    }
                    onUseAsDraft={(policy) =>
                      handleOpenPublish({ draftPolicy: policy })
                    }
                    onDelete={handleOpenDelete}
                  />

                  <ConditionalRenderer
                    when={totalItems > BILLING_POLICY_ITEMS_PER_PAGE}
                  >
                    <Pagination
                      current={page}
                      pageSize={BILLING_POLICY_ITEMS_PER_PAGE}
                      total={totalItems}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      style={{ marginTop: token.marginMD }}
                    />
                  </ConditionalRenderer>
                </ConditionalRenderer>
              </DataLoader>
            </Flex>
          </DashCard>
        </ConditionalRenderer>
      </DataLoader>

      <PublishPolicyModal
        open={publishOpen}
        event={selectedEvent}
        draftPolicy={publishDraftPolicy}
        bindEventId={publishBindEventId}
        reviseFromPolicyId={publishReviseFromPolicyId}
        activePolicy={activePolicy}
        onClose={handleClosePublish}
      />

      <DeletePolicyVersionModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />

      <SeedPoliciesSummaryModal
        open={seedSummaryOpen}
        result={seedResult}
        onClose={handleCloseSeedSummary}
      />

      <Drawer
        title={
          viewPolicy
            ? `Policy ${viewPolicy.versionNo} — ${viewPolicy.code}`
            : "Policy version"
        }
        open={viewOpen}
        onClose={handleCloseView}
        width={480}
      >
        {viewPolicy ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Version">
              {viewPolicy.versionNo}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {viewPolicy.isActive
                ? BILLING_POLICY_UI_COPY.currentBadge
                : "Historical"}
            </Descriptions.Item>
            <Descriptions.Item label="Effective from">
              {viewPolicy.effectiveFrom}
            </Descriptions.Item>
            <Descriptions.Item label="Effective to">
              {viewPolicy.effectiveTo ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Payment timing">
              {viewPolicy.paymentTiming}
            </Descriptions.Item>
            <Descriptions.Item label="Trigger">
              {viewPolicy.feeChargeTriggerEvent}
            </Descriptions.Item>
            <Descriptions.Item label="Guard step">
              {viewPolicy.guardWorkflowStep}
            </Descriptions.Item>
            <Descriptions.Item label="Guard required">
              {viewPolicy.guardRequired ? "Yes" : "No"}
            </Descriptions.Item>
            <Descriptions.Item label="Missing fee policy">
              {viewPolicy.missingFeeChargePolicy}
            </Descriptions.Item>
            <Descriptions.Item label="Fulfilled statuses">
              {viewPolicy.fulfilledStatuses.join(", ")}
            </Descriptions.Item>
            <Descriptions.Item label="Occurrence">
              {viewPolicy.occurrenceMode}
            </Descriptions.Item>
            <Descriptions.Item label="Period">
              {viewPolicy.periodType}
            </Descriptions.Item>
            <Descriptions.Item label="Arrears">
              {viewPolicy.arrearsMode}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </Flex>
  );
}
