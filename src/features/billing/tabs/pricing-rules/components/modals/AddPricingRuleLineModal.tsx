import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Flex, Form, InputNumber, Modal, Select, Switch, Typography } from "antd";
import { useAddPricingRuleLineModal } from "../../hooks/usePricingRuleLineItemModal";
import type { PricingRule } from "../../types/pricing-rule";
import { amountRules, feeItemIdRules } from "../../utils/validators";

type AddPricingRuleLineModalProps = {
  open: boolean;
  rule: PricingRule | null;
  onClose: () => void;
  onRuleLocked?: (ruleId: number) => void;
};

export function AddPricingRuleLineModal({
  open,
  rule,
  onClose,
  onRuleLocked,
}: AddPricingRuleLineModalProps) {
  const token = useToken();

  const {
    form,
    state: {
      formError,
      isSubmitting,
      isFeeItemsLoading,
      feeItemOptions,
      hasAvailableFeeItems,
      allFeeItemsUsed,
    },
    actions: { handleSubmit, handleCancel },
  } = useAddPricingRuleLineModal({
    rule,
    open,
    onClose,
    onRuleLocked,
  });

  return (
    <Modal
      title={PRICING_RULE_UI_COPY.addLineTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
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

        {allFeeItemsUsed ? (
          <Alert
            type="info"
            showIcon
            message="All active fee items are already on this rule."
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="feeItemId"
            label="Fee item"
            rules={feeItemIdRules}
          >
            <Select
              placeholder="Select fee item"
              options={feeItemOptions}
              loading={isFeeItemsLoading}
              disabled={!hasAvailableFeeItems}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="amount" label="Amount (₦)" rules={amountRules}>
            <InputNumber
              min={0.01}
              precision={2}
              placeholder="0.00"
              style={{ width: "100%" }}
              prefix="₦"
            />
          </Form.Item>

          <Form.Item
            name="isMandatory"
            label="Mandatory"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>

        <Button
          type="primary"
          loading={isSubmitting}
          disabled={isSubmitting || !hasAvailableFeeItems}
          block
          onClick={handleSubmit}
          style={{ height: 48, fontWeight: 600, marginTop: 8 }}
        >
          Add line
        </Button>
      </div>

      <div
        style={{
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Flex vertical gap={4}>
          {rule ? (
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Rule #{rule.id} · {rule.eventCode}
            </Typography.Text>
          ) : null}
          <Button
            type="text"
            block
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              height: 40,
              color: token.colorTextSecondary,
              fontWeight: 500,
              fontSize: token.fontSizeSM,
            }}
          >
            Cancel
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
