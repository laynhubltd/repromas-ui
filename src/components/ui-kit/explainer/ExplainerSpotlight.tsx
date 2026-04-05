/**
 * ExplainerSpotlight
 *
 * A step-by-step walkthrough card. Renders one step at a time with
 * prev/next navigation and a progress indicator.
 *
 * Controlled or uncontrolled:
 *   - Uncontrolled: omit `step` / `onStepChange` — manages its own index.
 *   - Controlled:   provide both `step` and `onStepChange`.
 *
 * Usage:
 *   <ExplainerSpotlight
 *     steps={[
 *       { key: "1", title: "Welcome", body: "Here's how to get started." },
 *       { key: "2", title: "Permissions", body: "Assign roles to control access." },
 *     ]}
 *     onFinish={() => setVisible(false)}
 *   />
 */
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import { useState, type ReactNode } from "react";
import { mergeUIKitStyles, type UIComponentSize, type UIKitCommonProps } from "../foundation";
import { getIntentIcon } from "./ExplainerIcon";
import { INTENT_META } from "./shared";
import type { ExplainerIntent, ExplainerStep } from "./types";

export interface ExplainerSpotlightProps extends UIKitCommonProps {
  steps: ExplainerStep[];
  intent?: ExplainerIntent;
  size?: UIComponentSize;
  /** Controlled active step index (0-based). */
  step?: number;
  onStepChange?: (index: number) => void;
  /** Called when the user clicks "Done" on the last step. */
  onFinish?: () => void;
  /** Label for the finish button. Defaults to "Done". */
  finishLabel?: ReactNode;
  /** Show step counter (e.g. "2 of 4"). */
  showCounter?: boolean;
}

export function ExplainerSpotlight({
  steps,
  intent = "info",
  size = "md",
  step: controlledStep,
  onStepChange,
  onFinish,
  finishLabel = "Done",
  showCounter = true,
  className,
  style,
  "data-testid": dataTestId,
}: ExplainerSpotlightProps) {
  const [internalStep, setInternalStep] = useState(0);
  const isControlled = controlledStep !== undefined;
  const activeIndex = isControlled ? controlledStep : internalStep;
  const total = steps.length;
  const current = steps[activeIndex];
  const meta = INTENT_META[intent];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === total - 1;

  const go = (next: number) => {
    if (!isControlled) setInternalStep(next);
    onStepChange?.(next);
  };

  const titleLevel = size === "sm" ? 5 : size === "lg" ? 3 : 4;
  const bodySize = size === "sm" ? 12 : size === "lg" ? 16 : 14;
  const padding = size === "sm" ? 16 : size === "lg" ? 28 : 20;

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={`Walkthrough step ${activeIndex + 1} of ${total}`}
      className={className}
      data-testid={dataTestId}
      style={mergeUIKitStyles(
        {
          background: "#fff",
          border: `1px solid ${meta.border}`,
          borderRadius: 12,
          padding,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          maxWidth: 480,
        },
        style,
      )}
    >
      {/* media slot */}
      {current.media ? (
        <div style={{ marginBottom: 16, textAlign: "center" }}>{current.media}</div>
      ) : null}

      {/* intent icon + step counter */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <span style={{ color: meta.color, fontSize: size === "lg" ? 24 : 18 }}>
          {getIntentIcon(intent)}
        </span>
        {showCounter && total > 1 ? (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {activeIndex + 1} of {total}
          </Typography.Text>
        ) : null}
      </Flex>

      {/* title */}
      {typeof current.title === "string" ? (
        <Typography.Title level={titleLevel} style={{ margin: "0 0 8px", color: meta.color }}>
          {current.title}
        </Typography.Title>
      ) : (
        current.title
      )}

      {/* body */}
      {typeof current.body === "string" ? (
        <Typography.Text style={{ fontSize: bodySize, display: "block", marginBottom: 20 }}>
          {current.body}
        </Typography.Text>
      ) : (
        <div style={{ marginBottom: 20 }}>{current.body}</div>
      )}

      {/* dot progress */}
      {total > 1 ? (
        <Flex gap={6} justify="center" style={{ marginBottom: 16 }}>
          {steps.map((s, i) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === activeIndex ? "step" : undefined}
              onClick={() => go(i)}
              style={{
                width: i === activeIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                padding: 0,
                background: i === activeIndex ? meta.color : "#d9d9d9",
                transition: "width 0.2s, background 0.2s",
              }}
            />
          ))}
        </Flex>
      ) : null}

      {/* navigation */}
      <Flex justify="space-between" align="center">
        <Button
          size="small"
          icon={<LeftOutlined />}
          disabled={isFirst}
          onClick={() => go(activeIndex - 1)}
          aria-label="Previous step"
        >
          Back
        </Button>

        {isLast ? (
          <Button
            type="primary"
            size="small"
            onClick={onFinish}
            style={{ background: meta.color, borderColor: meta.color }}
          >
            {finishLabel}
          </Button>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<RightOutlined />}
            iconPosition="end"
            onClick={() => go(activeIndex + 1)}
            aria-label="Next step"
            style={{ background: meta.color, borderColor: meta.color }}
          >
            Next
          </Button>
        )}
      </Flex>
    </div>
  );
}
