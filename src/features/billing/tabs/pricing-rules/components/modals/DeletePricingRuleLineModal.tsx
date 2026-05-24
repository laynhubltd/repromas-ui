import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Modal, Typography } from "antd";
import { useDeletePricingRuleLineModal } from "../../hooks/usePricingRuleLineItemModal";
import type { PricingRule, PricingRuleItemRead } from "../../types/pricing-rule";
import { formatCurrencyDisplay } from "../../utils/computeGrossPreview";

type DeletePricingRuleLineModalProps = {
  open: boolean;
  rule: PricingRule | null;
  line: PricingRuleItemRead | null;
  onClose: () => void;
  onRuleLocked?: (ruleId: number) => void;
};

export function DeletePricingRuleLineModal({
  open,
  rule,
  line,
  onClose,
  onRuleLocked,
}: DeletePricingRuleLineModalProps) {
  const token = useToken();

  const {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  } = useDeletePricingRuleLineModal({
    rule,
    line,
    open,
    onClose,
    onRuleLocked,
  });

  return (
    <Modal
      title={PRICING_RULE_UI_COPY.deleteLineTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
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
        <Typography.Paragraph>
          Remove{" "}
          <Typography.Text strong>{line?.feeItemName}</Typography.Text>
          {line ? (
            <>
              {" "}
              (<Typography.Text type="secondary">
                {formatCurrencyDisplay(line.amount)}
              </Typography.Text>
              ) from this pricing rule?
            </>
          ) : null}
        </Typography.Paragraph>

        {rule && line && rule.items.length <= 1 ? (
          <Alert
            type="warning"
            showIcon
            message="This is the only fee line on the rule. Removing it may leave the rule without prices."
            style={{ marginTop: 16 }}
          />
        ) : null}

        <Button
          type="primary"
          danger
          loading={isDeleting}
          disabled={isDeleting}
          block
          onClick={handleConfirm}
          style={{ height: 48, fontWeight: 600, marginTop: 24 }}
        >
          Remove line
        </Button>
      </div>

      <div
        style={{
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isDeleting}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
