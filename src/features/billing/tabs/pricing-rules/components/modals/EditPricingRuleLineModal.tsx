import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  Button,
  Flex,
  Form,
  InputNumber,
  Modal,
  Select,
  Switch,
  Typography,
} from "antd";
import { useEditPricingRuleLineModal } from "../../hooks/usePricingRuleLineItemModal";
import type { PricingRule, PricingRuleItemRead } from "../../types/pricing-rule";
import { amountRules, feeItemIdRules } from "../../utils/validators";

type EditPricingRuleLineModalProps = {
  open: boolean;
  rule: PricingRule | null;
  line: PricingRuleItemRead | null;
  onClose: () => void;
  onRuleLocked?: (ruleId: number) => void;
};

export function EditPricingRuleLineModal({
  open,
  rule,
  line,
  onClose,
  onRuleLocked,
}: EditPricingRuleLineModalProps) {
  const token = useToken();

  const {
    form,
    state: { isSubmitting, isFeeItemsLoading, feeItemOptions },
    actions: { handleSubmit, handleCancel },
  } = useEditPricingRuleLineModal({
    rule,
    line,
    open,
    onClose,
    onRuleLocked,
  });

  return (
    <Modal
      title={PRICING_RULE_UI_COPY.editLineTitle}
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
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="feeItemId" label="Fee item" rules={feeItemIdRules}>
            <Select
              placeholder="Select fee item"
              options={feeItemOptions}
              loading={isFeeItemsLoading}
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
          disabled={isSubmitting}
          block
          onClick={handleSubmit}
          style={{ height: 48, fontWeight: 600, marginTop: 8 }}
        >
          Save changes
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
          {rule && line ? (
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Rule #{rule.id} · {line.feeItemName}
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
