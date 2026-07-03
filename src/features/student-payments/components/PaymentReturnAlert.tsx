import { appPaths } from "@/app/routing/app-path";
import {
  HANDOFF_UI_COPY,
  STUDENT_PAYMENT_UI_COPY,
} from "@/shared/constants/billingPaymentOptions";
import { Alert, Button, Flex, Spin } from "antd";
import { generatePath, Link } from "react-router-dom";
import type { usePaymentReturnOrchestrator } from "../hooks/usePaymentReturnOrchestrator";

type PaymentReturnAlertProps = {
  polling: ReturnType<typeof usePaymentReturnOrchestrator>;
};

export function PaymentReturnAlert({ polling }: PaymentReturnAlertProps) {
  const { ui, flags, actions } = polling;

  if (!ui.isActive) return null;

  const { phase } = ui;

  const alertType =
    phase === "complete" || phase === "payment_confirmed"
      ? "success"
      : phase === "confirming_payment" ||
          phase === "matriculating" ||
          phase === "handoff" ||
          flags.isPolling
        ? "info"
        : phase === "failed"
          ? "error"
          : "warning";

  const showSpinner =
    phase === "confirming_payment" ||
    phase === "matriculating" ||
    phase === "handoff" ||
    flags.isPolling;

  const showRetry =
    phase === "confirming_payment" ||
    phase === "payment_pending" ||
    phase === "error";

  const showContinue =
    phase === "payment_confirmed" || phase === "complete";

  const showReceipt = phase === "payment_confirmed" && ui.paymentId;

  return (
    <Alert
      type={alertType}
      showIcon
      message={
        <Flex align="center" gap={8}>
          {showSpinner ? <Spin size="small" /> : null}
          <span>{ui.title}</span>
        </Flex>
      }
      description={
        <Flex vertical gap={12}>
          <span>{ui.description}</span>
          {ui.providerReference ? (
            <span style={{ fontSize: 12, opacity: 0.85 }}>
              {STUDENT_PAYMENT_UI_COPY.providerReference}: {ui.providerReference}
            </span>
          ) : null}
          <Flex gap={8} wrap="wrap">
            {showRetry ? (
              <Button size="small" onClick={actions.handleRetryPoll}>
                {STUDENT_PAYMENT_UI_COPY.retryPoll}
              </Button>
            ) : null}
            {showContinue ? (
              <Link
                to={
                  phase === "complete"
                    ? appPaths.studentHome
                    : ui.continueApplicationUrl
                }
              >
                <Button type="primary" size="small">
                  {phase === "complete"
                    ? HANDOFF_UI_COPY.goToHome
                    : STUDENT_PAYMENT_UI_COPY.continueApplicationCta}
                </Button>
              </Link>
            ) : null}
            {showReceipt ? (
              <Link
                to={generatePath(appPaths.studentPaymentReceipt, {
                  paymentId: String(ui.paymentId),
                })}
              >
                <Button type="primary" size="small">
                  {STUDENT_PAYMENT_UI_COPY.viewReceiptCta}
                </Button>
              </Link>
            ) : null}
            <Link to={appPaths.StudentPayments}>
              <Button size="small">
                {STUDENT_PAYMENT_UI_COPY.viewPaymentHistory}
              </Button>
            </Link>
            <Button size="small" onClick={actions.handleDismiss}>
              Dismiss
            </Button>
          </Flex>
        </Flex>
      }
    />
  );
}
