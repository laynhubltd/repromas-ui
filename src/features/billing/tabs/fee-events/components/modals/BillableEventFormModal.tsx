import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  BILLABLE_EVENT_TOOLTIPS,
  BILLABLE_EVENT_UI_COPY,
  MISSING_FEE_CHARGE_POLICY_OPTIONS,
  PAYMENT_TIMING_OPTIONS,
} from "@/shared/constants/billableEventOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Switch,
  Typography,
} from "antd";
import type { OccurrenceMode } from "../../types/billable-event";
import { useBillableEventFormModal } from "../../hooks/useBillableEventModal";
import type { BillableEventCatalogEntry } from "../../types/billable-event";
import {
  codeRules,
  feeChargeTriggerEventRules,
  fulfilledStatusesRules,
  guardWorkflowStepRules,
  missingFeeChargePolicyRules,
  nameRules,
  paymentTimingRules,
} from "../../utils/validators";
import {
  arrearsModeRules,
  occurrenceModeRules,
  periodTypeRules,
} from "@/features/billing/tabs/fee-policies/utils/validators";
import type { BillableEvent } from "../../types/billable-event";
import { formatEnumAsLabel } from "../../utils/billableEventDisplay";

type BillableEventFormModalProps = {
  open: boolean;
  target: BillableEvent | null;
  onClose: () => void;
  catalogEntries: BillableEventCatalogEntry[];
  configuredCodes: Set<string>;
};

export function BillableEventFormModal({
  open,
  target,
  onClose,
  catalogEntries,
  configuredCodes,
}: BillableEventFormModalProps) {
  const token = useToken();

  const {
    state: { isEditMode, formError, isSubmitting, catalogEntry, composedPolicy },
    actions: {
      handleSubmit,
      handleCancel,
      handleCodeChange,
      handlePaymentTimingChange,
      handleOccurrenceModeChange,
      isCodeDisabled,
    },
    form,
  } = useBillableEventFormModal(target, open, onClose, { configuredCodes });

  const triggerOptions =
    catalogEntry?.allowedTriggers.map((option) => ({
      value: option.value,
      label: option.label,
    })) ?? [];

  const guardStepOptions =
    catalogEntry?.allowedGuardSteps.map((option) => ({
      value: option.value,
      label: option.label,
    })) ?? [];

  const fulfilledStatusOptions =
    catalogEntry?.allowedFulfilledStatuses.map((option) => ({
      value: option.value,
      label: option.label,
    })) ?? [];

  const occurrenceOptions =
    catalogEntry?.allowedOccurrenceModes.map((option) => ({
      value: option.value,
      label: option.label,
    })) ?? [];

  const periodOptions =
    catalogEntry?.allowedPeriodTypes.map((option) => ({
      value: option.value,
      label: option.label,
    })) ?? [];

  const arrearsOptions =
    catalogEntry?.allowedArrearsModes.map((option) => ({
      value: option.value,
      label: option.label,
    })) ?? [];

  const codeOptions = catalogEntries.map((entry) => ({
    value: entry.code,
    label: `${entry.defaultName} (${entry.code})`,
    disabled: isCodeDisabled(entry.code),
  }));

  return (
    <Modal
      title={isEditMode ? "Edit fee setup" : "Add custom fee"}
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

        {isEditMode ? (
          <Alert
            type="info"
            showIcon
            message="Name and status only. To change payment rules, use the Fee Policy tab."
            style={{ marginBottom: 16 }}
          />
        ) : (
          <Alert
            type="info"
            showIcon
            message={BILLABLE_EVENT_UI_COPY.configChangeNotice}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          {!isEditMode ? (
            <Form.Item
              name="code"
              label="Fee type"
              tooltip={BILLABLE_EVENT_TOOLTIPS.feeType}
              rules={codeRules}
            >
              <Select
                placeholder={BILLABLE_EVENT_UI_COPY.selectFeeTypePlaceholder}
                options={codeOptions}
                showSearch
                optionFilterProp="label"
                onChange={handleCodeChange}
              />
            </Form.Item>
          ) : (
            <Form.Item label="Fee type" tooltip={BILLABLE_EVENT_TOOLTIPS.feeType}>
              <Input value={composedPolicy?.code ?? target?.code} disabled />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label="Name shown to staff"
            tooltip={BILLABLE_EVENT_TOOLTIPS.displayName}
            rules={nameRules}
          >
            <Input placeholder="Application Fee" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            tooltip={BILLABLE_EVENT_TOOLTIPS.description}
          >
            <Input.TextArea
              rows={2}
              placeholder="Optional admin note"
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            tooltip={BILLABLE_EVENT_TOOLTIPS.isActive}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {isEditMode && composedPolicy ? (
            <Descriptions
              title="Current policy (read-only)"
              column={1}
              size="small"
              bordered
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label="Version">
                {composedPolicy.currentPolicy?.id
                  ? `Policy #${composedPolicy.currentPolicy.id}`
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Payment timing">
                {composedPolicy.currentPolicy?.paymentTiming ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Occurrence">
                {formatEnumAsLabel(composedPolicy.currentPolicy?.occurrenceMode)}
              </Descriptions.Item>
              <Descriptions.Item label="Period">
                {formatEnumAsLabel(composedPolicy.currentPolicy?.periodType)}
              </Descriptions.Item>
              <Descriptions.Item label="Arrears">
                {formatEnumAsLabel(composedPolicy.currentPolicy?.arrearsMode)}
              </Descriptions.Item>
            </Descriptions>
          ) : null}

          {!isEditMode ? (
            <>
              <Typography.Text
                strong
                style={{
                  display: "block",
                  marginBottom: 12,
                  fontSize: token.fontSize,
                }}
              >
                Initial billing policy
              </Typography.Text>

              <Form.Item
                name="paymentTiming"
                label="Should students pay before or after an action?"
                tooltip={BILLABLE_EVENT_TOOLTIPS.paymentTiming}
                rules={paymentTimingRules}
              >
                <Radio.Group
                  options={PAYMENT_TIMING_OPTIONS}
                  onChange={(event) =>
                    handlePaymentTimingChange(event.target.value)
                  }
                />
              </Form.Item>

              <Form.Item
                name="feeChargeTriggerEvent"
                label="When should the fee be recorded?"
                tooltip={BILLABLE_EVENT_TOOLTIPS.feeRecordedWhen}
                rules={feeChargeTriggerEventRules}
              >
                <Select
                  placeholder="Select when the fee appears on the account"
                  options={triggerOptions}
                  disabled={triggerOptions.length === 0}
                />
              </Form.Item>

              <Form.Item
                name="guardWorkflowStep"
                label="Which step requires payment first?"
                tooltip={BILLABLE_EVENT_TOOLTIPS.paymentStep}
                rules={guardWorkflowStepRules}
              >
                <Select
                  placeholder="Select the step blocked until payment"
                  options={guardStepOptions}
                  disabled={guardStepOptions.length === 0}
                />
              </Form.Item>

              <Form.Item
                name="guardRequired"
                label="Enforce payment verification"
                tooltip={BILLABLE_EVENT_TOOLTIPS.enforceVerification}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="missingFeeChargePolicy"
                label="If no fee has been generated yet"
                tooltip={BILLABLE_EVENT_TOOLTIPS.noFeeGenerated}
                rules={missingFeeChargePolicyRules}
              >
                <Select options={MISSING_FEE_CHARGE_POLICY_OPTIONS} />
              </Form.Item>

              <Form.Item
                name="fulfilledStatuses"
                label="When is payment considered complete?"
                tooltip={BILLABLE_EVENT_TOOLTIPS.fulfilledStatuses}
                rules={fulfilledStatusesRules}
              >
                <Select
                  mode="multiple"
                  placeholder="Select statuses that count as paid"
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
                  onChange={(value: OccurrenceMode) =>
                    handleOccurrenceModeChange(value)
                  }
                />
              </Form.Item>

              <Form.Item
                name="periodType"
                label="Billing period"
                rules={periodTypeRules}
              >
                <Select options={periodOptions} disabled />
              </Form.Item>

              <Form.Item
                name="arrearsMode"
                label="Arrears behaviour"
                rules={arrearsModeRules}
              >
                <Select options={arrearsOptions} />
              </Form.Item>
            </>
          ) : null}

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
            <PermissionGuard
              permission={
                isEditMode
                  ? Permission.BillingBillableEventsUpdate
                  : Permission.BillingBillableEventsCreate
              }
            >
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isEditMode ? "Save changes" : "Create"}
              </Button>
            </PermissionGuard>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
