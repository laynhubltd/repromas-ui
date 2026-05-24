import { PRICING_RULE_UI_COPY } from "@/shared/constants/pricingRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Modal, Typography } from "antd";
import { useDeletePricingRuleModal } from "../../hooks/usePricingRuleModal";
import type { PricingRule } from "../../types/pricing-rule";

type DeletePricingRuleModalProps = {
  open: boolean;
  target: PricingRule | null;
  onClose: () => void;
  isLocked?: boolean;
  onRuleLocked?: (id: number) => void;
};

export function DeletePricingRuleModal({
  open,
  target,
  onClose,
  isLocked = false,
  onRuleLocked,
}: DeletePricingRuleModalProps) {
  const token = useToken();

  const {
    state: { error, isDeleting, isRetire },
    actions: { handleConfirm, handleCancel },
  } = useDeletePricingRuleModal(target, open, onClose, {
    isLocked,
    onRuleLocked,
  });

  return (
    <Modal
      title={isRetire ? "Retire Pricing Rule" : "Delete Pricing Rule"}
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
        <ErrorAlert variant="form" error={error} />

        <Typography.Paragraph>
          {isRetire ? (
            <>
              This rule has been used to bill candidates. Retiring will deactivate
              it and set the end date to yesterday. Existing candidate balances will
              not change.
            </>
          ) : (
            <>
              Are you sure you want to permanently delete this pricing rule for{" "}
              <Typography.Text strong>{target?.eventCode}</Typography.Text>?
              This only works if the rule has never been used.
            </>
          )}
        </Typography.Paragraph>

        <Button
          type="primary"
          danger
          loading={isDeleting}
          disabled={isDeleting}
          block
          onClick={handleConfirm}
          style={{ height: 48, fontWeight: 600, marginTop: 24 }}
        >
          {isRetire ? "Retire Rule" : "Delete Rule"}
        </Button>
      </div>

      <div
        style={{
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {PRICING_RULE_UI_COPY.balanceWarning}
        </Typography.Text>
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
            marginTop: 12,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
