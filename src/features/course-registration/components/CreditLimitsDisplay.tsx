import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Alert, Progress, Typography } from "antd";
import { useCreditLimitsDisplay } from "../hooks/useCreditLimitsDisplay";
import type { CreditLimits } from "../types/course-registration";

export type CreditLimitsDisplayProps = {
  creditLimits: CreditLimits;
  selectedCredits: number;
  registeredCredits: number;
};

/**
 * Displays credit limits, running totals, and validation state.
 *
 * View-only component — all business logic lives in useCreditLimitsDisplay.
 *
 * Responsibilities:
 * - Show minimum and maximum credit limits (with "No upper limit" for max = -1)
 * - Display registered credits (already locked in) and current selection total
 * - Show combined total credit units
 * - Render a progress bar toward the maximum (hidden when unlimited)
 * - Show validation error/warning messages when limits are violated
 *
 * Requirements: 5.4, 5.5, 5.6
 */
export function CreditLimitsDisplay({
  creditLimits,
  selectedCredits,
  registeredCredits,
}: CreditLimitsDisplayProps) {
  const token = useToken();

  console.log({ creditLimits, selectedCredits, registeredCredits });

  const {
    totalCredits,
    isUnlimited,
    validationState,
    validationMessage,
    progressPercent,
    minCredits,
    maxCredits,
  } = useCreditLimitsDisplay(creditLimits, selectedCredits, registeredCredits);

  // ─── Derive progress bar status ───────────────────────────────────────────
  const progressStatus =
    validationState === "above_maximum"
      ? "exception"
      : validationState === "valid"
        ? "success"
        : "normal";

  // ─── Derive row highlight color for total ─────────────────────────────────
  const totalColor =
    validationState === "valid"
      ? token.colorSuccess
      : validationState === "above_maximum" ||
          validationState === "below_minimum"
        ? token.colorError
        : token.colorText;

  return (
    <div
      data-testid="credit-limits-display"
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        padding: "12px 16px",
        background: token.colorBgContainer,
      }}
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <Typography.Text
        strong
        style={{
          display: "block",
          marginBottom: 12,
          fontSize: token.fontSizeSM,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: token.colorTextSecondary,
        }}
      >
        Credit Units
      </Typography.Text>

      {/* ─── Credit limit range ───────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        {/* Minimum */}
        <div data-testid="credit-min">
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, display: "block" }}
          >
            Minimum
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            {minCredits}
          </Typography.Text>
        </div>

        {/* Maximum */}
        <div style={{ textAlign: "right" }} data-testid="credit-max">
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, display: "block" }}
          >
            Maximum
          </Typography.Text>
          {/* Requirement 5.6: display "No upper limit" when max = -1 */}
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            {isUnlimited ? "No upper limit" : maxCredits}
          </Typography.Text>
        </div>
      </div>

      {/* ─── Progress bar (hidden when unlimited) ────────────────────────── */}
      <ConditionalRenderer when={!isUnlimited}>
        <Progress
          percent={progressPercent ?? 0}
          status={progressStatus}
          size="small"
          style={{ marginBottom: 12 }}
          data-testid="credit-progress-bar"
        />
      </ConditionalRenderer>

      {/* ─── Credit breakdown ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          marginBottom: 8,
        }}
      >
        {/* Registered credits */}
        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          data-testid="credit-registered-row"
        >
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            Already registered
          </Typography.Text>
          <Typography.Text
            style={{ fontSize: token.fontSizeSM }}
            data-testid="credit-registered-value"
          >
            {registeredCredits} cr
          </Typography.Text>
        </div>

        {/* Selected credits */}
        <div
          style={{ display: "flex", justifyContent: "space-between" }}
          data-testid="credit-selected-row"
        >
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            Current selection
          </Typography.Text>
          <Typography.Text
            style={{ fontSize: token.fontSizeSM }}
            data-testid="credit-selected-value"
          >
            {selectedCredits} cr
          </Typography.Text>
        </div>

        {/* Divider */}
        <div
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            marginTop: 4,
            paddingTop: 4,
            display: "flex",
            justifyContent: "space-between",
          }}
          data-testid="credit-total-row"
        >
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            Total
          </Typography.Text>
          {/* Requirement 5.4: running total of selected credit units */}
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeSM, color: totalColor }}
            data-testid="credit-total-value"
          >
            {totalCredits} cr
          </Typography.Text>
        </div>
      </div>

      {/* ─── Validation message ───────────────────────────────────────────── */}
      {/* Requirement 5.5: enforce credit limit validation */}
      <ConditionalRenderer when={validationMessage !== null}>
        <Alert
          type="error"
          showIcon
          message={validationMessage}
          style={{ marginTop: 8 }}
          data-testid="credit-validation-error"
        />
      </ConditionalRenderer>
    </div>
  );
}
