import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import {
  MISSING_FEE_CHARGE_POLICY_OPTIONS,
  PAYMENT_TIMING_OPTIONS,
} from "@/shared/constants/billableEventOptions";
import { BILLING_POLICY_UI_COPY } from "@/shared/constants/billingPolicyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Form, Modal, Radio, Select, Switch, Typography } from "antd";
import type { PublishedPolicyHandoff } from "@/features/billing/types/configure-pricing";
import type { BillableEventPolicy } from "../../types/billable-event-policy";
import { usePublishPolicyModal } from "../../hooks/usePublishPolicyModal";
import {
  arrearsModeRules,
  feeChargeTriggerEventRules,
  fulfilledStatusesRules,
  guardWorkflowStepRules,
  missingFeeChargePolicyRules,
  occurrenceModeRules,
  paymentTimingRules,
  periodTypeRules,
} from "../../utils/validators";
import type { OccurrenceMode } from "@/features/billing/tabs/fee-events/types/billable-event";

type PublishPolicyModalProps = {
  open: boolean;
  event: BillableEvent | null;
  draftPolicy: BillableEventPolicy | null;
  bindEventId: number | null;
  reviseFromPolicyId: number | null;
  activePolicy: BillableEventPolicy | null;
  onClose: () => void;
  onPublished?: (handoff: PublishedPolicyHandoff) => void;
};

export function PublishPolicyModal({
  open,
  event,
  draftPolicy,
  bindEventId,
  reviseFromPolicyId,
  activePolicy,
  onClose,
  onPublished,
}: PublishPolicyModalProps) {
  const token = useToken();
  const {
    state: {
      formError,
      isSubmitting,
      catalogEntry,
      isReviseMode,
      hasNoChanges,
      eventCode,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handlePaymentTimingChange,
      handleOccurrenceModeChange,
    },
    form,
  } = usePublishPolicyModal({
    event,
    draftPolicy,
    bindEventId,
    reviseFromPolicyId,
    activePolicy,
    open,
    onClose,
    onPublished,
  });

  const triggerOptions =
    catalogEntry?.allowedTriggers.map((o) => ({
      value: o.value,
      label: o.label,
    })) ?? [];

  const guardStepOptions =
    catalogEntry?.allowedGuardSteps.map((o) => ({
      value: o.value,
      label: o.label,
    })) ?? [];

  const fulfilledStatusOptions =
    catalogEntry?.allowedFulfilledStatuses.map((o) => ({
      value: o.value,
      label: o.label,
    })) ?? [];

  const occurrenceOptions =
    catalogEntry?.allowedOccurrenceModes.map((o) => ({
      value: o.value,
      label: o.label,
    })) ?? [];

  const periodOptions =
    catalogEntry?.allowedPeriodTypes.map((o) => ({
      value: o.value,
      label: o.label,
    })) ?? [];

  const arrearsOptions =
    catalogEntry?.allowedArrearsModes.map((o) => ({
      value: o.value,
      label: o.label,
    })) ?? [];

  const title = isReviseMode
    ? BILLING_POLICY_UI_COPY.publishRevision
    : BILLING_POLICY_UI_COPY.publishVersion;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={720}
      destroyOnHidden
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <ErrorAlert variant="form" error={formError} />

        {eventCode ? (
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16 }}
          >
            Fee type: {event?.name ?? eventCode} ({eventCode})
          </Typography.Text>
        ) : null}

        <Alert
          type="info"
          showIcon
          message={BILLING_POLICY_UI_COPY.postPublishPricingReminder}
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="paymentTiming"
            label="Payment timing"
            rules={paymentTimingRules}
          >
            <Radio.Group
              options={PAYMENT_TIMING_OPTIONS}
              onChange={(e) => handlePaymentTimingChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="feeChargeTriggerEvent"
            label="When should the fee be recorded?"
            rules={feeChargeTriggerEventRules}
          >
            <Select options={triggerOptions} disabled={triggerOptions.length === 0} />
          </Form.Item>

          <Form.Item
            name="guardWorkflowStep"
            label="Which step requires payment first?"
            rules={guardWorkflowStepRules}
          >
            <Select options={guardStepOptions} disabled={guardStepOptions.length === 0} />
          </Form.Item>

          <Form.Item
            name="guardRequired"
            label="Enforce payment verification"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="missingFeeChargePolicy"
            label="If no fee has been generated yet"
            rules={missingFeeChargePolicyRules}
          >
            <Select options={MISSING_FEE_CHARGE_POLICY_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="fulfilledStatuses"
            label="When is payment considered complete?"
            rules={fulfilledStatusesRules}
          >
            <Select
              mode="multiple"
              options={fulfilledStatusOptions}
              disabled={fulfilledStatusOptions.length === 0}
            />
          </Form.Item>

          <Form.Item
            name="occurrenceMode"
            label="How often can this fee be charged?"
            rules={occurrenceModeRules}
          >
            <Select
              options={occurrenceOptions}
              onChange={(value: OccurrenceMode) => handleOccurrenceModeChange(value)}
            />
          </Form.Item>

          <Form.Item name="periodType" label="Billing period" rules={periodTypeRules}>
            <Select options={periodOptions} disabled />
          </Form.Item>

          <Form.Item name="arrearsMode" label="Arrears behaviour" rules={arrearsModeRules}>
            <Select options={arrearsOptions} />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 8,
            }}
          >
            <Button onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <PermissionGuard permission={Permission.BillingBillableEventsUpdate}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={hasNoChanges}
              >
                {title}
              </Button>
            </PermissionGuard>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
