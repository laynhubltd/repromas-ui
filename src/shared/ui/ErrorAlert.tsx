import { InlineStatus } from "@/components/ui-kit";
import { ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import type { ReactNode } from "react";

type ErrorAlertProps = {
  /**
   * The error message to display.
   * When null/undefined/empty, renders nothing.
   */
  error?: string | null;
  /**
   * "form"    — compact alert with marginBottom: 16, used inside modal/form bodies (default)
   * "section" — full-width alert with an optional retry action, used for section/page fetch errors
   */
  variant?: "form" | "section";
  /**
   * Optional retry callback. When provided in "section" variant, renders a Retry button.
   */
  onRetry?: () => void;
  /** Optional custom action node (overrides the default Retry button) */
  action?: ReactNode;
};

/**
 * ErrorAlert — reusable error alert for both form-level and section-level errors.
 *
 * Renders nothing when `error` is falsy.
 *
 * Form error (inside modal/form body):
 *   <ErrorAlert error={formError} />
 *
 * Section fetch error (with retry):
 *   <ErrorAlert variant="section" error="Failed to load items" onRetry={refetch} />
 */
export function ErrorAlert({ error, variant = "form", onRetry, action }: ErrorAlertProps) {
  if (!error) return null;

  if (variant === "section") {
    const sectionAction = action ?? (
      onRetry ? (
        <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
          Retry
        </Button>
      ) : undefined
    );

    return (
      <InlineStatus
        severity="error"
        title={error}
        closable
        action={sectionAction}
      />
    );
  }

  // form variant — compact, no retry action, marginBottom for spacing inside modal body
  return (
    <InlineStatus
      severity="error"
      title={error}
      closable
      style={{ marginBottom: 16 }}
    />
  );
}
