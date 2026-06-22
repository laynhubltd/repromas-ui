import { appPaths } from "@/app/routing/app-path";
import { STUDENT_PAYMENT_UI_COPY } from "@/shared/constants/billingPaymentOptions";
import { Alert, Button, Flex, Spin } from "antd";
import { generatePath, Link } from "react-router-dom";
import type { usePaymentReturnPolling } from "../hooks/usePaymentReturnPolling";

type PaymentReturnAlertProps = {
  polling: ReturnType<typeof usePaymentReturnPolling>;
};

export function PaymentReturnAlert({ polling }: PaymentReturnAlertProps) {
  const { ui, flags, actions } = polling;

  if (!ui.isActive) return null;

  const alertType =
    ui.state === "success"
      ? "success"
      : ui.state === "processing" || flags.isPolling
        ? "info"
        : ui.state === "failed"
          ? "error"
          : "warning";

  return (
    <Alert
      type={alertType}
      showIcon
      message={
        <Flex align="center" gap={8}>
          {ui.state === "processing" || flags.isPolling ? <Spin size="small" /> : null}
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
            {ui.state === "processing" || ui.state === "timeout" ? (
              <Button size="small" onClick={actions.handleRetryPoll}>
                {STUDENT_PAYMENT_UI_COPY.retryPoll}
              </Button>
            ) : null}
            {ui.state === "success" ? (
              <Link to={ui.continueApplicationUrl}>
                <Button type="primary" size="small">
                  {STUDENT_PAYMENT_UI_COPY.continueApplicationCta}
                </Button>
              </Link>
            ) : null}
            {ui.state === "success" && ui.paymentId ? (
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
              <Button size="small">{STUDENT_PAYMENT_UI_COPY.viewPaymentHistory}</Button>
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
