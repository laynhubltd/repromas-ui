import { useIsMobile } from "@/hooks/useBreakpoint";
import { BILLING_WORKFLOW_UI_COPY } from "@/shared/constants/billingWorkflowOptions";
import { Alert, Button, Flex } from "antd";
import type { WorkflowPayNowPayload } from "../types/workflow-step-decision";
import type { WorkflowBlockingUi } from "../utils/workflowStepDecisionDisplay";

type BillingWorkflowBlockingBannerProps = {
  blockingUi: WorkflowBlockingUi;
  onPayNow: (payload: WorkflowPayNowPayload) => void;
  onRetry?: () => void;
};

type BannerCtaProps = {
  blockingUi: WorkflowBlockingUi;
  onPayNow: (payload: WorkflowPayNowPayload) => void;
  onRetry?: () => void;
  isMobile: boolean;
};

function BannerCta({
  blockingUi,
  onPayNow,
  onRetry,
  isMobile,
}: BannerCtaProps) {
  if (blockingUi.variant === "preparing" && onRetry) {
    return (
      <Button
        type="primary"
        block={isMobile}
        onClick={onRetry}
        data-testid="billing-workflow-retry-button"
      >
        {BILLING_WORKFLOW_UI_COPY.retry}
      </Button>
    );
  }

  if (!blockingUi.canPayNow) {
    return null;
  }

  const payLabel = blockingUi.payAmountDisplay
    ? `${BILLING_WORKFLOW_UI_COPY.payNow} (${blockingUi.payAmountDisplay})`
    : BILLING_WORKFLOW_UI_COPY.payNow;

  const handlePayNow = () => {
    const { primaryItem } = blockingUi;
    if (!primaryItem || primaryItem.feeChargeId === null) {
      return;
    }
    onPayNow({
      feeChargeId: primaryItem.feeChargeId,
      eventCode: primaryItem.eventCode,
      amountOutstandingRequired: primaryItem.amountOutstandingRequired,
    });
  };

  return (
    <Button
      type="primary"
      block={isMobile}
      onClick={handlePayNow}
      data-testid="billing-workflow-pay-now-button"
    >
      {payLabel}
    </Button>
  );
}

export function BillingWorkflowBlockingBanner({
  blockingUi,
  onPayNow,
  onRetry,
}: BillingWorkflowBlockingBannerProps) {
  const isMobile = useIsMobile();

  if (blockingUi.variant === "pass") {
    return null;
  }

  const alertType =
    blockingUi.variant === "preparing"
      ? "info"
      : blockingUi.variant === "cutover"
        ? "warning"
        : "warning";
  const title =
    blockingUi.variant === "preparing"
      ? BILLING_WORKFLOW_UI_COPY.preparingFee
      : blockingUi.variant === "cutover"
        ? BILLING_WORKFLOW_UI_COPY.billingSetupBlocked
        : BILLING_WORKFLOW_UI_COPY.paymentRequired;

  const cta = (
    <BannerCta
      blockingUi={blockingUi}
      onPayNow={onPayNow}
      onRetry={onRetry}
      isMobile={isMobile}
    />
  );

  const hasCta =
    (blockingUi.variant === "preparing" && onRetry) || blockingUi.canPayNow;

  return (
    <Alert
      type={alertType}
      showIcon
      message={title}
      description={
        <Flex vertical gap={12} style={{ width: "100%" }}>
          <span>{blockingUi.message}</span>
          {hasCta ? (
            <Flex style={{ width: "100%", maxWidth: isMobile ? undefined : 320 }}>
              {cta}
            </Flex>
          ) : null}
        </Flex>
      }
      style={{ marginBottom: 16, width: "100%" }}
      data-testid="billing-workflow-blocking-banner"
    />
  );
}
