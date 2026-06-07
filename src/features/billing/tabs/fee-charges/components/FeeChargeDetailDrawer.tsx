import { useGetBillableEventPolicyQuery } from "@/features/billing/tabs/fee-policies/api/billableEventPolicyApi";
import { getPolicyVersionDrawerDisplay } from "@/features/billing/tabs/fee-policies/utils/policyVersionDisplay";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import { FEE_CHARGE_UI_COPY } from "@/shared/constants/feeChargeOptions";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Descriptions, Drawer, Tabs, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useGetFeeChargeQuery } from "../api/feeChargeApi";
import { formatEventCodeLabel } from "@/shared/constants/billingDisplayLabels";
import {
  formatFeeChargeStatus,
  isGrandfatheredFeeCharge,
} from "../utils/feeChargeDisplay";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import { FeeChargeInvoicePanel } from "./FeeChargeInvoicePanel";
import { FeeChargePaymentsPanel } from "./FeeChargePaymentsPanel";

type FeeChargeDetailDrawerProps = {
  chargeId: number | null;
  open: boolean;
  onClose: () => void;
  event: BillableEvent | null | undefined;
  labelMaps: FeeEventsTabLabelMaps;
};

function FeeChargeOverview({
  charge,
  event,
  policyLoading,
  policyDisplay,
  grandfathered,
}: {
  charge: NonNullable<ReturnType<typeof useGetFeeChargeQuery>["data"]>;
  event: BillableEvent | null | undefined;
  policyLoading: boolean;
  policyDisplay: ReturnType<typeof getPolicyVersionDrawerDisplay> | null;
  grandfathered: boolean;
}) {
  return (
    <>
      {grandfathered ? (
        <Tooltip title={FEE_CHARGE_UI_COPY.sessionLockInTooltip}>
          <Tag color="warning" style={{ marginBottom: 16 }}>
            {FEE_CHARGE_UI_COPY.grandfatheredBadge}
          </Tag>
        </Tooltip>
      ) : null}
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Fee type">
          {formatEventCodeLabel(charge.eventCode, { displayName: event?.name })}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {formatFeeChargeStatus(charge.status)}
        </Descriptions.Item>
        <Descriptions.Item label={FEE_CHARGE_UI_COPY.occurrenceKeyLabel}>
          <Typography.Text code>{charge.occurrenceKey}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={FEE_CHARGE_UI_COPY.policyVersionLabel}>
          {`Policy #${charge.billableEventPolicyId}`}
        </Descriptions.Item>
        {charge.grossAmount ? (
          <Descriptions.Item label="Gross amount">
            {charge.grossAmount}
          </Descriptions.Item>
        ) : null}
        {charge.amountDue ? (
          <Descriptions.Item label="Amount due">{charge.amountDue}</Descriptions.Item>
        ) : null}
      </Descriptions>

      {policyLoading ? (
        <Typography.Text type="secondary" style={{ marginTop: 16 }}>
          Loading policy details…
        </Typography.Text>
      ) : policyDisplay ? (
        <Descriptions
          column={1}
          size="small"
          bordered
          style={{ marginTop: 16 }}
          title="Stamped policy"
        >
          <Descriptions.Item label="Billing frequency">
            {policyDisplay.occurrence}
          </Descriptions.Item>
          <Descriptions.Item label="Billing period">
            {policyDisplay.period}
          </Descriptions.Item>
          <Descriptions.Item label="Payment timing">
            {policyDisplay.paymentTiming}
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </>
  );
}

export function FeeChargeDetailDrawer({
  chargeId,
  open,
  onClose,
  event,
  labelMaps,
}: FeeChargeDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: charge, isLoading, isError, refetch } =
    useGetFeeChargeQuery(chargeId ?? 0, { skip: !open || chargeId == null });

  const policyId = charge?.billableEventPolicyId;
  const { data: policy, isLoading: policyLoading } =
    useGetBillableEventPolicyQuery(policyId ?? 0, {
      skip: !open || policyId == null,
    });

  const policyDisplay = policy
    ? getPolicyVersionDrawerDisplay(policy, labelMaps)
    : null;
  const grandfathered =
    charge && isGrandfatheredFeeCharge(charge, event ?? null);

  return (
    <Drawer
      title={FEE_CHARGE_UI_COPY.detailTitle}
      open={open}
      onClose={onClose}
      width={640}
      destroyOnClose
    >
      <DataLoader loading={isLoading} loader={null}>
        {isError ? (
          <ErrorAlert
            variant="section"
            error="Failed to load fee charge."
            onRetry={refetch}
          />
        ) : charge ? (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: "overview",
                label: "Overview",
                children: (
                  <FeeChargeOverview
                    charge={charge}
                    event={event}
                    policyLoading={policyLoading}
                    policyDisplay={policyDisplay}
                    grandfathered={!!grandfathered}
                  />
                ),
              },
              {
                key: "payments",
                label: "Payments",
                children: <FeeChargePaymentsPanel feeChargeId={charge.id} />,
              },
              {
                key: "invoice",
                label: "Invoice",
                children: <FeeChargeInvoicePanel feeChargeId={charge.id} />,
              },
            ]}
          />
        ) : null}
      </DataLoader>
    </Drawer>
  );
}
