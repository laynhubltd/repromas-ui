import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  arrearsModeRules,
  occurrenceModeRules,
  paymentTimingRules,
  periodTypeRules,
} from "@/features/billing/tabs/fee-policies/utils/validators";
import {
  FEE_EVENT_TOOLTIPS,
  FEE_EVENT_UI_COPY,
} from "@/shared/constants/feeEventOptions";
import {
  MISSING_FEE_CHARGE_POLICY_OPTIONS,
  PAYMENT_TIMING_OPTIONS,
} from "@/shared/constants/billableEventOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Steps,
  Switch,
  Typography,
} from "antd";
import type { OccurrenceMode } from "../../types/billable-event";
import type { BillableEventCatalogEntry } from "../../types/billable-event";
import { useFeeEventCreateWizard } from "../../hooks/useFeeEventCreateWizard";
import {
  codeRules,
  feeChargeTriggerEventRules,
  fulfilledStatusesRules,
  guardWorkflowStepRules,
  missingFeeChargePolicyRules,
  nameRules,
} from "../../utils/validators";

type FeeEventCreateWizardProps = {
  open: boolean;
  onClose: () => void;
  catalogEntries: BillableEventCatalogEntry[];
  configuredCodes: Set<string>;
  onCreatedWithoutPolicy?: (eventId: number) => void;
};

export function FeeEventCreateWizard({
  open,
  onClose,
  catalogEntries,
  configuredCodes,
  onCreatedWithoutPolicy,
}: FeeEventCreateWizardProps) {
  const token = useToken();
  const {
    state: { step, formError, isSubmitting, catalogEntry },
    actions: {
      handleNext,
      handleBack,
      handleSubmit,
      handleCancel,
      handleCodeChange,
      handlePaymentTimingChange,
      handleOccurrenceModeChange,
      isCodeDisabled,
    },
    form,
  } = useFeeEventCreateWizard(open, onClose, {
    configuredCodes,
    onCreatedWithoutPolicy,
  });

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
      title={FEE_EVENT_UI_COPY.addCustomFee}
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
        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 24 }}
          items={[
            { title: "Fee type" },
            { title: "Details" },
            { title: "Initial policy" },
          ]}
        />

        <ErrorAlert variant="form" error={formError} />

        <Form form={form} layout="vertical" requiredMark={false}>
          {step === 0 ? (
            <Form.Item
              name="code"
              label="Fee type"
              tooltip={FEE_EVENT_TOOLTIPS.feeType}
              rules={codeRules}
            >
              <Select
                placeholder={FEE_EVENT_UI_COPY.selectFeeTypePlaceholder}
                options={codeOptions}
                showSearch
                optionFilterProp="label"
                onChange={handleCodeChange}
              />
            </Form.Item>
          ) : null}

          {step === 1 ? (
            <>
              <Form.Item
                name="name"
                label="Name shown to staff"
                tooltip={FEE_EVENT_TOOLTIPS.displayName}
                rules={nameRules}
              >
                <Input placeholder="Application Fee" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Description"
                tooltip={FEE_EVENT_TOOLTIPS.description}
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
                tooltip={FEE_EVENT_TOOLTIPS.activeStatus}
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          ) : null}

          {step === 2 ? (
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
              <Alert
                type="info"
                showIcon
                message="You can skip and publish the policy later on the Fee Policy tab."
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                name="paymentTiming"
                label="Payment timing"
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
                label="When fee is recorded"
                rules={feeChargeTriggerEventRules}
              >
                <Select
                  options={triggerOptions}
                  disabled={triggerOptions.length === 0}
                />
              </Form.Item>

              <Form.Item
                name="guardWorkflowStep"
                label="Step blocked until paid"
                rules={guardWorkflowStepRules}
              >
                <Select
                  options={guardStepOptions}
                  disabled={guardStepOptions.length === 0}
                />
              </Form.Item>

              <Form.Item name="guardRequired" valuePropName="checked">
                <Switch checkedChildren="Guard on" unCheckedChildren="Guard off" />
              </Form.Item>

              <Form.Item
                name="missingFeeChargePolicy"
                rules={missingFeeChargePolicyRules}
              >
                <Select options={MISSING_FEE_CHARGE_POLICY_OPTIONS} />
              </Form.Item>

              <Form.Item
                name="fulfilledStatuses"
                rules={fulfilledStatusesRules}
              >
                <Select mode="multiple" options={fulfilledStatusOptions} />
              </Form.Item>

              <Form.Item
                name="occurrenceMode"
                rules={occurrenceModeRules}
              >
                <Select
                  options={occurrenceOptions}
                  onChange={(value: OccurrenceMode) =>
                    handleOccurrenceModeChange(value)
                  }
                />
              </Form.Item>

              <Form.Item name="periodType" rules={periodTypeRules}>
                <Select options={periodOptions} disabled />
              </Form.Item>

              <Form.Item name="arrearsMode" rules={arrearsModeRules}>
                <Select options={arrearsOptions} />
              </Form.Item>
            </>
          ) : null}
        </Form>

        <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
          <Button onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          {step > 0 ? (
            <Button onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          ) : null}
          {step < 2 ? (
            <Button type="primary" onClick={() => void handleNext()}>
              Next
            </Button>
          ) : (
            <PermissionGuard
              permission={Permission.BillingBillableEventsCreate}
            >
              <Button
                onClick={() => void handleSubmit(true)}
                disabled={isSubmitting}
              >
                Create without policy
              </Button>
              <Button
                type="primary"
                loading={isSubmitting}
                onClick={() => void handleSubmit(false)}
              >
                Create & publish policy
              </Button>
            </PermissionGuard>
          )}
        </Flex>
      </div>
    </Modal>
  );
}
