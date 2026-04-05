/**
 * ExplainerBadge
 *
 * A compact inline label for surfacing feature status next to headings,
 * menu items, or buttons. Think "New", "Beta", "Tip", "Updated", "Coming soon".
 *
 * Usage:
 *   <ExplainerBadge variant="new" />
 *   <ExplainerBadge variant="beta" />
 *   <ExplainerBadge label="Preview" intent="warning" />
 */
import { Tag } from "antd";
import type { UIKitCommonProps } from "../foundation";
import { BADGE_VARIANT_META, INTENT_META } from "./shared";
import type { ExplainerBadgeVariant, ExplainerIntent } from "./types";

export interface ExplainerBadgeProps extends UIKitCommonProps {
  /** Preset variant — sets label + intent automatically. */
  variant?: ExplainerBadgeVariant;
  /** Override the displayed label. */
  label?: string;
  /** Override the colour intent. */
  intent?: ExplainerIntent;
  /** Render as a dot-only badge (no text). */
  dot?: boolean;
}

export function ExplainerBadge({
  variant,
  label,
  intent,
  dot = false,
  className,
  style,
  "data-testid": dataTestId,
}: ExplainerBadgeProps) {
  const preset = variant ? BADGE_VARIANT_META[variant] : null;
  const resolvedIntent: ExplainerIntent = intent ?? preset?.intent ?? "info";
  const resolvedLabel = label ?? preset?.label ?? "Info";
  const meta = INTENT_META[resolvedIntent];

  if (dot) {
    return (
      <span
        aria-label={resolvedLabel}
        className={className}
        data-testid={dataTestId}
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: meta.color,
          ...style,
        }}
      />
    );
  }

  return (
    <Tag
      className={className}
      data-testid={dataTestId}
      color={meta.badgeColor}
      style={{
        fontSize: 11,
        lineHeight: "18px",
        padding: "0 6px",
        borderRadius: 4,
        fontWeight: 600,
        letterSpacing: "0.02em",
        ...style,
      }}
    >
      {resolvedLabel}
    </Tag>
  );
}
